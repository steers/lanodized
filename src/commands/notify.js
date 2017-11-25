'use strict';

const {parseArgs, arrayify} = require('../lib/parser');
const chat = require('../lib/chat');
const notification = require('../lib/notification');
const Template = require('../lib/template');

const definition = {
  name: 'notify',
  aliases: ['notification'],
  description: 'Modify bot notification configuration for this guild',
  usage: '[options] <trigger>... <target>...',
  options: {
    list: {
      type: 'boolean',
      alias: 'l',
      description: 'list available triggers and configured bot notifications',
    },
    delete: {
      type: 'boolean',
      alias: 'd',
      description: 'delete the specified configuration instead of adding it',
    },
    channel: {
      type: 'string',
      alias: 'c',
      description: 'target channel to notify',
    },
    role: {
      type: 'string',
      alias: 'r',
      description: 'target role to notify (must be mentionable)',
    },
    user: {
      type: 'string',
      alias: 'u',
      description: 'target username to notify',
    },
  },
};

const configuration = {
  enabled: true,
  guild: true,
  privileged: true,
};

const template = {};
template.list = Template.compile([
  '{{#if operation}}{{operation}} {{/if}}Here are the notifications enabled for {{guild}}:',
  '{{#if notifications.length}}{{#each notifications}}\t`{{Trigger.name}}` => {{#with target}}{{#if channel}}<#{{channel}}>{{else if role}}<@&{{role}}>{{else if user}}<@{{user}}>{{/if}}{{/with}}',
  '{{/each}}{{else}}**Bupkis!**{{/if}}',
].join('\n'), {noEscape: true});
template.error = Template.compile([
  `<@{{author.id}}>, Sorry, I couldn't configure your notifications.`,
  'Command: [ **{{command}}** ]',
  'Error: `{{error}}`',
].join('\n'), {noEscape: true});

/**
 * Execute the notify command in response to an incoming chat message.
 * @param  {Object} ctx Application context
 * @param  {Bot} bot Chat bot instance
 * @param  {Object} message Chat message
 * @param  {string[]} argv Tokenized arguments
 * @return {Object} Result metadata from command execution.
 */
async function run(ctx, bot, message, argv) {
  const args = parseArgs(argv, definition.options);
  const channels = arrayify(args.channel);
  const roles = arrayify(args.role);
  const users = arrayify(args.user);
  let triggers = args._;

  const guild = message.channel.guild;
  try {
    if (!guild) {
      throw new Error('Must configure notifications from a Guild text channel');
    }
    const author = guild.members.get(message.author.id);
    if (!author.hasPermission('ADMINISTRATOR')) {
      throw new Error('Only administrators can configure notifications.');
    }
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

  // Notifiable entities uniquely identified by snowflake (besides @everyone)
  const notifiable = {
    everyone: false,
    channels: new Set(),
    roles: new Set(),
    users: new Set(),
  };

  // Requested entities that were nonexistant or otherwise unmentionable
  const missed = {
    channels: [],
    roles: [],
    users: [],
  };

  // Detect whether a given string is a mention of the specified type
  const mentioned = {
    everyone: (s) => bot.api.MessageMentions.EVERYONE_PATTERN.test(s),
    channel: (s) => bot.api.MessageMentions.CHANNELS_PATTERN.test(s),
    role: (s) => bot.api.MessageMentions.ROLES_PATTERN.test(s),
    user: (s) => bot.api.MessageMentions.USERS_PATTERN.test(s),
  };

  let mentionedEveryone = false;
  if (message.mentions) {
    mentionedEveryone = message.mentions.everyone;

    // Since mentions are allowed outside of options, filter them from the triggers
    triggers = args._.filter((arg) => {
      return !mentioned.user(arg)
        && !mentioned.role(arg)
        && !mentioned.channel(arg)
        && !mentioned.everyone(arg);
    });

    // If tagged by mention, entities are guaranteed to be notifiable
    message.mentions.channels.forEach((channel) => notifiable.channels.add(channel.id));
    message.mentions.roles.forEach((role) => notifiable.roles.add(role.id));
    message.mentions.users.forEach((user) => notifiable.users.add(user.id));
  }

  for (const channel of channels) {
    // #mentioned channels have already been processed
    if (mentioned.channel(channel)) continue;

    if (mentionedEveryone && channel === '@here') {
      // @here refers to the channel this message was sent from
      if (message.channel.type === 'text') {
        notifiable.channels.add(message.channel.id);
      } else {
        missed.channels.push(channel);
      }
    } else {
      const guildChannel = guild.channels.find((c) => c.name === channel);
      if (guildChannel) {
        notifiable.channels.add(guildChannel.id);
      } else {
        missed.channels.push(channel);
      }
    }
  }

  for (const role of roles) {
    // @mentioned roles have already been processed
    if (mentioned.role(role)) continue;

    const guildRole = guild.roles.find((r) => r.name === role);
    if (guildRole) {
      notifiable.roles.add(guildRole.id);
    } else {
      missed.roles.push(role);
    }
  }

  for (const user of users) {
    // @mentioned users have already been processed
    if (mentioned.user(user)) continue;

    if (mentionedEveryone && user === '@everyone') {
      // @everyone might not be mentionable
      if (!guild.suppressEveryone) {
        notifiable.everyone = true;
      } else {
        missed.users.push(user);
      }
    } else {
      const guildMember = guild.members.find((m) => m.user.username === user);
      if (guildMember) {
        notifiable.users.add(guildMember.id);
      } else {
        missed.users.push(user);
      }
    }
  }

  const result = {};
  const actions = [];
  try {
    if (args.list) {
      const notifications = await notification.listNotifications(ctx, {
        guild: guild.id,
        triggers: triggers,
        targets: notifiable,
      });
      await chat.respond(message, template.list({
        guild: guild.name,
        notifications: notifications,
      }));
      actions.push('listed notifications');
    } else if (args.delete) {
      await notification.deleteNotifications(ctx, guild.id, triggers, notifiable);
      actions.push('deleted notifications');
      const notifications = await notification.listNotifications(ctx, {
        guild: guild.id,
      });
      await chat.respond(message, template.list({
        operation: '**BALEETED!**',
        guild: guild.name,
        notifications: notifications,
      }));
      actions.push('listed notifications');
    } else {
      await notification.addNotifications(ctx, guild.id, message.author.id, triggers, notifiable);
      actions.push('added notifications');
      const notifications = await notification.listNotifications(ctx, {
        guild: guild.id,
        triggers: triggers,
      });
      await chat.respond(message, template.list({
        operation: '**ADDED!**',
        guild: guild.name,
        notifications: notifications,
      }));
      actions.push('listed notifications');
    }
  } catch (err) {
    const errorDescription = template.error({
      author: message.author,
      command: message.content.trim(),
      error: err.message,
    });
    ctx.log(`@${message.author.username} configuring notifications in ${message.guild.name} #${message.channel.name} generated an error.`, 'info', err);
    await chat.respondDirect(message, errorDescription);
    result.error = err.toString().slice(0, 255);
  }
  result.actions = actions;
  return result;
}

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};
