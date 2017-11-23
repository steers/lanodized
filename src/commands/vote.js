'use strict';

const {parseArgs, arrayify} = require('../lib/parser');
const chat = require('../lib/chat');
const voting = require('../lib/voting');
const Template = require('../lib/template');

const definition = {
  name: 'vote',
  aliases: ['poll', 'rtv'],
  description: 'Create a reaction poll on a subject or set of alternatives',
  usage: '[options] [-o outcome -e emoji]... <subject>',
  options: {
    outcome: {
      type: 'string',
      alias: 'o',
      description: 'Poll alternative',
    },
    emoji: {
      type: 'string',
      alias: 'e',
      description: 'Emoji to consider a vote for the alternative',
    },
    duration: {
      type: 'integer',
      alias: 'd',
      default: voting.DEFAULT_POLL_DURATION,
      description: `Poll duration, in minutes (default: ${voting.DEFAULT_POLL_DURATION})`,
    },
  },
};

const configuration = {
  enabled: true,
};

const template = {};
template.vote = Template.compile([
  'Poll time! <@{{author.id}}> has called a vote:{{#with poll}}',
  '{{#if subject}}**{{subject}}**{{/if}}',
  '{{#each alternatives}}',
  '\t{{this}} => `{{@key}}`',
  '{{/each}}',
  '{{#if opinion}}What do you think? Cast your vote by reaction!{{/if}}',
  '*Hurry!* This poll will close at {{formatTime seconds "seconds"}}{{/with}}',
].join('\n'), {noEscape: true});
template.results = Template.compile([
  '<@{{author.id}}>, The results are in for {{#if subject}}**{{subject}}**{{else}}your poll{{/if}}:{{#with result}}',
  'It\'s a {{conclusion}}{{#if winners}} for: **{{#join winners delim="**, and **"}}{{this}}{{/join}}**{{else}}, try again later!{{/if}}',
  '{{#each votes}}',
  '\t{{@key}} => `{{this}}`',
  '{{/each}}{{/with}}',
].join('\n'), {noEscape: true});
template.error = Template.compile([
  `<@{{author.id}}>, Sorry, I couldn't create your poll.`,
  'Command: [ **{{command}}** ]',
  'Error: `{{error}}`',
].join('\n'), {noEscape: true});

/**
 * Execute the defined command in response to an incoming chat message.
 * @param  {Object} ctx Application context
 * @param  {Client} client Chat client object
 * @param  {Message} message Chat message
 * @param  {Array<string>} argv Tokenized arguments
 * @return {Object} Result metadata from command execution.
 */
async function run(ctx, client, message, argv) {
  const args = parseArgs(argv, definition.options);
  const subject = args._.join(' ');
  delete args._;
  const outcomes = arrayify(args.outcome);
  const emojis = arrayify(args.emoji);

  const poll = {
    subject: subject,
    opinion: outcomes.length === 0,
  };
  const actions = [];
  try {
    // Some commands make sense in a DM with the bot, but voting is not one of them
    if (message.channel.type === 'dm') {
      throw new Error(`It's just you and me in here, wouldn't you rather ask more people?`);
    }
    if (outcomes.length !== (new Set(outcomes)).size) {
      throw new Error('Each outcome needs to be unique');
    }
    if (emojis.length !== (new Set(emojis)).size) {
      throw new Error('Each emoji needs to be unique');
    }
    if (outcomes.length !== emojis.length) {
      throw new Error(`Need the same number of outcomes as emoji (${outcomes.length} != ${emojis.length})`);
    }
    if (subject.length === 0 && outcomes.length === 0) {
      throw new Error('Either a subject or a set of outcomes are required for a poll');
    }
    const alternatives = {};
    for (let i = 0; i < outcomes.length; i++) {
      alternatives[outcomes[i]] = emojis[i];
    }
    poll.alternatives = alternatives;
    const choices = voting.buildVoteMap(alternatives);
    const seconds = voting.clampDuration(args.duration);
    poll.seconds = seconds;
    actions.push('validated options');

    const existing = await voting.findOpenUserPolls(ctx, message.author, message.channel);
    if (existing.length > 0) {
      throw new Error('Users may only have one poll per channel open at a time');
    }

    const content = template.vote({
      author: message.author,
      poll: poll,
    });
    const pollMessage = await message.channel.send(content);
    actions.push('created poll');

    const callback = async (result) => {
      const response = template.results({
        author: message.author,
        subject: subject,
        result: result,
      });
      await chat.respond(message, response);
    };

    const vote =
        new voting.BallotBox(ctx, client, pollMessage, message.author, poll, choices, callback);

    await vote.start(seconds);
    actions.push('opened voting');
  } catch (err) {
    const errorDescription = template.error({
      author: message.author,
      command: message.content.trim(),
      error: err.message,
    });
    chat.respondDirect(message, errorDescription);
    ctx.log(`@${message.author.username}'s poll in ${message.guild.name} #${message.channel.name} generated an error.`, 'info', err);
    actions.push(`handled ${err.name}`);
  }

  return {
    poll: poll,
    actions: actions,
  };
}

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};
