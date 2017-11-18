'use strict';

const Emoji = require('node-emoji');
const emojiRegex = require('emoji-regex');
const chat = require('../lib/chat');
const Template = require('../lib/template');

const template = {};
template.results = Template.compile([
  'It\'s a {{conclusion}}{{#if winners}} for: **{{#join winners delim="**, and **"}}{{this}}{{/join}}**{{else}}, try again later!{{/if}}',
  '{{#each votes}}',
  '\t{{@key}} = `{{this}}`',
  '{{/each}}',
].join('\n'), {noEscape: true});

/**
 * A BallotBox collects reactions to a message, interpreting them as votes as per the given
 * set of alternatives. Consult [](http://www.emoji-cheat-sheet.com/) for supported emoji options.
 */
class BallotBox {
  /**
   * Create a new BallotBox for the given message, voting on the given alternatives.
   * @param  {Object} ctx Application context
   * @param  {Object} ctx.db Database context
   * @param  {Client} client Chat client object
   * @param  {Message} message Chat message that will be collecting votes
   * @param  {User} pollster User that called the vote
   * @param  {Object} poll Definition of the poll being created
   * @param  {string} poll.subject Subject of the poll
   * @param  {Object} poll.alternatives Map of 0 or more options to accepted emoji(s)
   * @param  {Map} choices Map of emoji to vote option
   */
  constructor(ctx, client, message, pollster, poll, choices) {
    this.db = ctx.db;
    this.client = client;
    this.message = message;
    this.pollster = pollster;
    this.definition = poll;
    this.choices = choices;
    this.poll = null;
    this.timer = null;
  }

  /**
   * Determine whether the poll is open.
   * @return {boolean} True if the poll is accepting votes
   */
  get open() {
    return this.poll && this.poll.validTo.getTime() > Date.now();
  }

  /**
   * Get the entity ID of the created poll.
   * @return {number} Entity ID, or 0 if no poll has been created
   */
  get id() {
    return this.poll ? this.poll.id : 0;
  }

  /**
   * Open the vote for this ballot box for the given duration.
   * @param  {number} minutes How long the poll should last, in minutes
   */
  async start(minutes) {
    if (this.poll) return;

    const durations = {
      minimum: 0.25,
      default: 5,
      maximum: 60,
    };
    let duration = parseFloat(minutes);
    if (isNaN(duration)) {
      duration = defaultDuration;
    } else if (duration < durations.minimum) {
      duration = durations.minimum;
    } else if (duration > durations.maximum) {
      duration = durations.maximum;
    }

    if (this.choices instanceof Map) {
      for (const emoji of this.choices.keys()) {
        await this.message.react(emoji);
      }
    } else {
      const emoji = Emoji.random();
      await this.message.react(emoji.emoji);
    }
    await this.message.pin();

    const user = await this.db.DiscordUser.findOne({
      where: {snowflake: this.pollster.id},
    });
    const channel = await this.db.DiscordChannel.findOne({
      where: {snowflake: this.message.channel.id},
    });
    this.poll = await this.db.Poll.create({
      snowflake: this.message.id,
      subject: this.definition.subject,
      alternatives: this.definition.alternatives,
      opinion: this.definition.opinion,
      validTo: new Date(Date.now() + duration * 60000),
      UserId: user.id,
      ChannelId: channel.id,
    });
    this.client.polls.set(this.message.id, this);

    const self = this;
    this.timer = setTimeout(async () => {
      await self.stop(`Poll closed after ${duration} minutes.`);
    }, duration * 60000);
  }

  /**
   * Close voting for this ballot box.
   * @param  {string} reason Reason for closing the vote
   */
  async stop(reason) {
    if (!this.poll) return;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.client.polls.delete(this.message.id);

    const results = await this.db.DiscordUser.findAll({
      attributes: ['snowflake'],
      include: [{
        model: this.db.PollVote,
        as: 'Votes',
        attributes: ['vote', 'createdAt'],
        where: {
          PollId: this.poll.id,
          revoked: false,
        },
      }],
    });

    const votes = results.map((voter) => {
      const [latest] = voter.Votes.sort((a, b) => {
        // Sort in descending order by vote creation time
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      return latest.vote;
    }).reduce((tally, vote) => {
      const outcome = this.choices.get(vote);
      if (!tally.hasOwnProperty(outcome)) {
        tally[outcome] = 0;
      }
      tally[outcome]++;
      return tally;
    }, {});

    let winners = [];
    for (const outcome of Object.keys(votes)) {
      if (winners.length == 0) {
        winners.push(outcome);
      } else {
        const [winner] = winners;
        if (votes[winner] < votes[outcome]) {
          winners = [outcome];
        } else if (votes[winner] === votes[outcome]) {
          winners.push(outcome);
        }
      }
    }
    let conclusion = 'WIN';
    if (winners.length > 1) {
      conclusion = 'TIE';
    } else if (winners.length === 0) {
      conclusion = 'MISS';
      winners = null;
    }
    const result = {
      conclusion: conclusion,
      winners: winners,
      votes: votes,
      end: reason,
    };
    await this.poll.update({outcome: result});

    const response = `${this.pollster}, The results are in for **${this.definition.subject}**:\n${template.results(result)}`;
    await this.message.unpin();
    await chat.respond(this.message, response);

    this.poll = null;
  }

  /**
   * Place a vote on the poll.
   * @param  {MessageReaction} reaction Reaction to the message
   * @param  {User} voter User that made the reaction
   * @return {Promise<PollVote>} Database entity representing the vote
   */
  async vote(reaction, voter) {
    if (!this.open || !this.choices.has(reaction.emoji.name)) return;

    const ballot = reaction.emoji.name;
    const outcome = this.choices.get(ballot);
    return await this.db.sequelize.transaction(async (t) => {
      const [user] = await this.db.DiscordUser.findOrCreate({
        transaction: t,
        where: {snowflake: voter.id},
        defaults: {
          snowflake: voter.id,
          name: voter.username,
          properties: {
            discriminator: voter.discriminator,
          },
        },
      });
      return await this.db.PollVote.create({
        vote: ballot,
        outcome: outcome,
        PollId: this.poll.id,
        UserId: user.id,
      }, {
        transaction: t,
      });
    });
  }

  /**
   * Revoke a vote on the poll.
   * @param  {MessageReaction} reaction Reaction to the message
   * @param  {User} voter User that revoked the reaction
   * @return {Promise<PollVote>} Database entity representing the vote
   */
  async revoke(reaction, voter) {
    if (!this.open || !this.choices.has(reaction.emoji.name)) return;

    const ballot = reaction.emoji.name;
    return await this.db.sequelize.transaction(async (t) => {
      const user = await this.db.DiscordUser.findOne({
        transaction: t,
        where: {snowflake: voter.id},
      });
      const vote = await this.db.PollVote.findOne({
        transaction: t,
        where: {
          PollId: this.poll.id,
          UserId: user.id,
          vote: ballot,
          revoked: false,
        },
        order: [['createdAt', 'DESC']],
      });
      if (vote) {
        return await vote.update({revoked: true}, {transaction: t});
      }
    });
  }
}

/**
 * Create a map from emoji (reaction/ballot) to its corresponding voting alternative.
 * @param  {Object} alternatives Map of 0 or more names to accepted ballot(s) (emoji)
 * @return {Object|Map<string, string>} Map from emoji to string.
 */
function buildVoteMap(alternatives) {
  if (!alternatives || typeof alternatives !== 'object') {
    throw new Error('Must provide an object mapping 0 or more options to emoji');
  }
  let voteMap = new Map();
  const regex = emojiRegex();
  for (const alternative of Object.keys(alternatives)) {
    let ballots = alternatives[alternative];
    if (ballots === null || ballots === undefined) {
      ballots = [];
    } else {
      ballots = Array.isArray(ballots) ? ballots : [ballots];
    }
    if (ballots.length === 0) {
      throw new Error(`One or more ballots required per alternative, none defined for ${alternative}`);
    }
    for (const ballot of ballots) {
      let emoji;
      const match = regex.exec(ballot);
      if (match) {
        // The emoji ballot was in its unicode form
        emoji = match[0];
      } else {
        // Otherwise check if the emoji is given by name
        const definition = Emoji.find(ballot);
        if (definition) {
          emoji = definition.emoji;
        } else {
          const results = Emoji.search(ballot);
          if (results.length === 0) {
            // Be a little cheeky if search results turned up nothing 😉
            results.push(Emoji.random());
          }
          const search = results.map((result) => {
            return `${result.key} (${result.emoji})`;
          }).join(', or ');
          throw new Error(`Unsupported emoji '${ballot}' defined for alternative ${alternative}. Did you mean: ${search}?`);
        }
      }
      if (voteMap.has(emoji)) {
        throw new Error(`Same emoji defined for \`${ballot}\` as \`${voteMap.get(emoji)}\` (${emoji})`);
      }
      voteMap.set(emoji, alternative);
    }
  }
  if (voteMap.size === 0) {
    voteMap = {
      has: () => true,
      get: (emoji) => emoji,
      set: () => {},
      size: 0,
    };
  }
  return voteMap;
}

module.exports = {
  BallotBox,
  buildVoteMap,
};
