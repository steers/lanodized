'use strict';

const {parseArgs} = require('../lib/parser');
const voting = require('../lib/voting');
const Template = require('../lib/template');

const DEFAULT_POLL_DURATION = 1;

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
      default: DEFAULT_POLL_DURATION,
      description: `Poll duration, in minutes (default: ${DEFAULT_POLL_DURATION})`,
    },
  },
};

const configuration = {
  enabled: true,
};

const template = {};
template.vote = Template.compile([
  '**{{subject}}**',
  '{{#each alternatives}}',
  '\t{{this}} => `{{@key}}`',
  '{{/each}}',
  '{{#if opinion}}What do you think? Cast your vote by reaction!{{/if}}',
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

  let outcomes = [];
  if (args.outcome) {
    outcomes = Array.isArray(args.outcome) ? args.outcome : [args.outcome];
  }
  let emojis = [];
  if (args.emoji) {
    emojis = Array.isArray(args.emoji) ? args.emoji : [args.emoji];
  }

  if (outcomes.length !== emojis.length) {
    throw new Error(`Need the same number of outcomes as emoji (${outcomes.length} != ${emoji.length})`);
  }

  if (subject.length === 0 && outcomes.length === 0) {
    throw new Error('Either a subject or a set of outcomes are required for a poll');
  }

  const alternatives = {};
  for (let i = 0; i < outcomes.length; i++) {
    alternatives[outcomes[i]] = emojis[i];
  }

  const poll = {
    subject: subject,
    alternatives: alternatives,
    opinion: outcomes.length === 0,
  };
  const content = `Poll time! ${message.author} has called a vote:\n${template.vote(poll)}`;

  const actions = [];
  const pollMessage = await message.channel.send(content);
  actions.push('created poll');
  const ballotBox = new voting.BallotBox(ctx, client, pollMessage, message.author, poll);
  await ballotBox.start(args.duration);
  actions.push('opened voting');

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
