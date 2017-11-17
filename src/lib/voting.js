'use strict';

const Emoji = require('node-emoji');

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
   * @param  {Object} alternatives Map of 0 or more names to accepted ballot(s) (emoji)
   */
  constructor(ctx, client, message, pollster, alternatives) {
    this.db = ctx.db;
    this.me = client.user;
    this.message = message;
    this.pollster = pollster;
    this.voteMap = this.buildVoteMap(alternatives);
    this.collector = null;
  }

  /**
   * Open the vote for this ballot box for the given duration.
   * @param  {number} duration How long the poll should last, in milliseconds
   */
  async open(duration) {
    if (this.voteMap instanceof Map) {
      for (const emoji of this.voteMap.keys()) {
        await this.message.react(emoji);
      }
    } else {
      const emoji = Emoji.random();
      await this.message.react(emoji.emoji);
    }

    const self = this;
    const voteFilter = (reaction, user) => {
      return self.voteMap.has(reaction.emoji.name)
        && !self.me.equals(user);
    };
    const voteCounter = (reaction) => {
      const outcome = self.voteMap.get(reaction.emoji.name);
      console.log(`Got a vote for ${reaction.emoji.name} (${outcome})`);
      reaction.users.forEach((user, snowflake) => {
        console.log(`${user.username} has voted ${reaction.emoji.name}`);
      });
    };
    const voteEnded = (collected, reason) => {
      console.log(`Vote is over, collected ${collected.size} reactions`);
    };
    this.collector = this.message.createReactionCollector(voteFilter, {time: duration});
    this.collector.on('collect', voteCounter);
    this.collector.on('end', voteEnded);
  }

  /**
   * Close voting for this ballot box.
   * @param  {string} reason Reason for closing the vote
   */
  async close(reason) {
    if (this.collector) {
      this.collector.stop(reason);
    }
  }

  /**
   * Create a map from emoji (reaction/ballot) to its corresponding voting alternative.
   * @param  {Object} alternatives Map of 0 or more names to accepted ballot(s) (emoji)
   * @return {Object|Map<string, string>} Map from emoji to string.
   */
  buildVoteMap(alternatives) {
    if (!alternatives || typeof alternatives !== 'object') {
      throw new Error('Must provide an object mapping 0 or more options to emoji');
    }
    let voteMap = new Map();
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
        const emoji = Emoji.find(ballot);
        if (!emoji) {
          throw new Error(`Unsupported emoji '${ballot}' defined for alternative ${alternative}`);
        }
        voteMap.set(emoji.emoji, alternative);
      }
    }
    if (voteMap.size === 0) {
      voteMap = {
        has: () => true,
        get: (emoji) => emoji,
      };
    }
    return voteMap;
  }
}

module.exports = {
  BallotBox,
};
