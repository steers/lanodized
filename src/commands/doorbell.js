'use strict';

const {parseArgs} = require('../lib/parser');
const chat = require('../lib/chat');
const notification = require('../lib/notification');
const Help = require('../lib/help');
const Template = require('../lib/template');
const Emoji = require('node-emoji');

const definition = {
  name: 'doorbell',
  aliases: ['door', 'ring', 'letmein'],
  description: 'Let staff know you are at the venue and need help getting in',
  usage: '[options]',
  options: {
    help: {
      type: 'boolean',
      alias: 'h',
      description: 'print command usage',
    },
  },
};

const configuration = {
  enabled: true,
  guild: true,
  live: true,
  triggers: ['doorbell'],
};

// Templates are defined in the concise Handlebars format
const template = {};
// TODO: Work in a welcome to the specific event, once defined
template.doorbell = Template.compile([
  'Hello {{user}}, and welcome to the event! 🎮🎉',
  'Someone should be coming to let you in shortly, so hang tight.',
].join('\n'), {noEscape: true});
template.notify = Template.compile([
  'Ding Dong! 🛎🎶',
  '{{user}} is waiting at the door for you to let them in!',
  'They rang the doorbell at {{formatTime now}}',
  'Before you take off, leave a reaction to let others know you\'ve got it.',
].join('\n'), {noEscape: true});
template.ack = Template.compile([
  '{{responder}} has gone to let {{user}} in, after {{minutes}} minutes',
].join('\n'), {noEscape: true});
template.response = Template.compile([
  'Never fear! {{responder}} is on their way to you now 🏃',
].join('\n'), {noEscape: true});

/**
 * Execute the doorbell command in response to an incoming chat message.
 * @param  {Object} ctx Application context
 * @param  {Object} client Chat client object
 * @param  {Object} message Chat message
 * @param  {string[]} argv Tokenized arguments
 * @return {Object} Result metadata from command execution.
 */
async function run(ctx, client, message, argv) {
  const args = parseArgs(argv, definition.options);
  if (args.help) {
    const content = Help.usage(definition, {prefix: client.config.prefix, detailed: true});
    await chat.respondDirect(message, content);
    return {
      actions: ['provided help'],
    };
  }

  const guild = message.channel.guild;
  try {
    if (!guild) {
      throw new Error('Must ring the doorbell from a Guild text channel');
    }
    // TODO: only allow if there's an event active for this guild!
  } catch (err) {
    const errorDescription = template.error({
      author: message.author,
      command: message.content.trim(),
      error: err.message,
    });
    await chat.respondDirect(message, errorDescription);
    return {
      error: err.toString().slice(0, 255),
    };
  }

  const rangAt = new Date();
  const greeting = template.doorbell({
    user: message.author.username,
  });
  const greetingMessage = await chat.respondDirect(message, greeting);

  // TODO: rate limit of some sort, to avoid users spamming the command?

  const ringaling = template.notify({
    user: message.author.username,
    now: rangAt,
  });
  const triggered = await notification.notify(ctx, client, 'doorbell', ringaling);
  if (triggered.length === 0) {
    ctx.log(`@${message.author.username} rang the doorbell, but no one could hear it!`, 'error');
    return {
      error: `No notifications enabled for trigger: 'doorbell'`,
    };
  }

  let acknowledgement = false;
  const handlers = new Map();
  const reactFilter = (reaction, user) => {
    return !user.bot && !acknowledgement;
  };
  for (const sent of triggered) {
    await sent.react(Emoji.get(':door:'));
    handlers.set(sent.id, sent.createReactionCollector(reactFilter, {time: 300000}));
  }
  const reactHandle = async (reaction) => {
    const responder = reaction.users.filter((user) => !user.bot).first();
    if (responder) {
      acknowledgement = true;
      // Stop handling new reactions first, before sending out messages
      handlers.forEach((handler) => handler.stop('Doorbell was answered'));

      const ack = template.ack({
        responder: responder.username,
        user: message.author.username,
        minutes: ((Date.now() - rangAt.getTime()) / 60000).toFixed(1),
      });
      for (const sent of triggered) {
        await chat.respond(sent, ack);
      }
      const response = template.response({
        responder: responder.username,
      });
      await chat.respond(greetingMessage, response);
    }
  };
  handlers.forEach((handler) => handler.on('collect', reactHandle));

  const result = {};
  const actions = [];
  result.actions = actions;
  return result;
}

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};
