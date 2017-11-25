'use strict';

const {arrayify} = require('./parser');

/**
 * Add a notification for each trigger to the given group of targets.
 * @param {Object} ctx Application context
 * @param {Object} ctx.db Database context
 * @param {string} guildId Snowflake of guild to create the notifications on
 * @param {string} creatorId Snowflake of user to that is creating these notifications
 * @param {Array<string>} triggers Bot triggers to notify on
 * @param {Object} targets Group of targets to notify
 * @param {Array|Set<string>} targets.channels Channel IDs to notify
 * @param {Array|Set<string>} targets.roles Role IDs to notify
 * @param {Array|Set<string>} targets.users User Ids to notify
 */
async function addNotifications(ctx, guildId, creatorId, triggers, targets) {
  if (!triggers || triggers.length === 0) {
    throw new Error('Notification trigger(s) required');
  }
  if (!targets || typeof targets !== 'object') {
    throw new Error('Notification target(s) required, null provided');
  }
  const channels = Array.from(targets.channels || []);
  const roles = Array.from(targets.roles || []);
  const users = Array.from(targets.users || []);
  if (!(channels.length > 0 || roles.length > 0 || users.length > 0)) {
    throw new Error('Notification target(s) required, zero provided');
  }

  const requestedTriggers = new Set(triggers.map((trigger) => trigger.toLowerCase()));
  const validTriggers = await ctx.db.Trigger.findAll({
    attributes: ['id', 'name'],
    where: {
      name: {
        $in: Array.from(requestedTriggers),
      },
    },
  });
  if (validTriggers.length === 0) {
    throw new Error(`No valid triggers specified`);
  }

  const guild = await ctx.db.DiscordGuild.findOne({
    attributes: ['id'],
    where: {snowflake: guildId},
  });
  const creator = await ctx.db.DiscordUser.findOne({
    attributes: ['id'],
    where: {snowflake: creatorId},
  });

  for (const trigger of validTriggers) {
    requestedTriggers.delete(trigger.name);

    const adding = {
      channel: new Set(channels),
      role: new Set(roles),
      user: new Set(users),
    };

    await ctx.db.sequelize.transaction(async (t) => {
      const targetSearch = {$or: []};
      if (channels.length > 0) {
        targetSearch.$or.push({channel: {$in: channels}});
      }
      if (roles.length > 0) {
        targetSearch.$or.push({role: {$in: roles}});
      }
      if (users.length > 0) {
        targetSearch.$or.push({user: {$in: users}});
      }
      const notifications = await ctx.db.Notification.findAll({
        transaction: t,
        where: {
          TriggerId: trigger.id,
          GuildId: guild.id,
          target: targetSearch,
        },
      });
      for (const existing of notifications) {
        if (!existing.enabled) {
          await existing.update({enabled: true}, {transaction: t});
        }
        for (const kind of Object.keys(existing.target)) {
          if (!adding[kind]) continue;
          if (adding[kind].has(existing.target[kind])) {
            // Don't create notifications that already exist
            adding[kind].delete(existing.target[kind]);
          }
        }
      }
      for (const kind of Object.keys(adding)) {
        for (const target of adding[kind]) {
          const newTarget = {};
          newTarget[kind] = target;
          await ctx.db.Notification.create({
            TriggerId: trigger.id,
            GuildId: guild.id,
            CreatorId: creator.id,
            target: newTarget,
            enabled: true,
          }, {
            transaction: t,
          });
        }
      }
    });
  }

  const invalidTriggers = Array.from(requestedTriggers);
  if (invalidTriggers.length > 0) {
    throw new Error(`Some requested triggers were invalid: ${invalidTriggers.join(', ')}`);
  }
}

/**
 * Deletes (disables) notifications for the given group of targets, restricting to the given set
 * of targets (if any).
 * @param {Object} ctx Application context
 * @param {Object} ctx.db Database context
 * @param {string} guildId Snowflake of guild to create the notifications on
 * @param {Array<string>} triggers Bot triggers to notify on
 * @param {Object} targets Group of targets to notify
 * @param {Array|Set<string>} targets.channels Channel IDs to notify
 * @param {Array|Set<string>} targets.roles Role IDs to notify
 * @param {Array|Set<string>} targets.users User Ids to notify
 */
async function deleteNotifications(ctx, guildId, triggers, targets) {
  if (!targets || typeof targets !== 'object') {
    throw new Error('Notification target(s) required, null provided');
  }
  const channels = Array.from(targets.channels || []);
  const roles = Array.from(targets.roles || []);
  const users = Array.from(targets.users || []);
  if (!(channels.length > 0 || roles.length > 0 || users.length > 0)) {
    throw new Error('Notification target(s) required, zero provided');
  }

  await ctx.db.sequelize.transaction(async (t) => {
    const notifications = await listNotifications(ctx, {
      transaction: t,
      guild: guildId,
      triggers: triggers,
      targets: targets,
    });
    for (const notification of notifications) {
      await notification.update({enabled: false}, {transaction: t});
    }
  });
}

/**
 * List the enabled notifications configured for the given guild
 * @param {Object} ctx Application context
 * @param {Object} ctx.db Database context
 * @param {Object} options Notification filter options
 * @param {boolean} options.enabled Enabled status of the notification (default: true)
 * @param {string} options.guild Snowflake of guild that notifications were configured for
 * @param {Object} options.targets Group of targets to filter
 * @param {Array|Set<string>} options.targets.channels Notified channel IDs
 * @param {Array|Set<string>} options.targets.roles Notified role IDs
 * @param {Array|Set<string>} options.targets.users Notified user IDs
 * @param {Array<string>} options.triggers Specific triggers to filter
 * @param {Transaction} options.transaction Optional transaction to query under
 * @return {Array<Notification>} Enabled notifications configured for this guild
 */
async function listNotifications(ctx, options = {}) {
  const guild = {
    model: ctx.db.DiscordGuild,
    as: 'Guild',
    required: true,
    attributes: ['snowflake'],
  };
  if (options.guild) {
    guild.where = {
      snowflake: options.guild,
    };
  }
  const trigger = {
    model: ctx.db.Trigger,
    required: true,
    attributes: ['name', 'properties'],
  };
  const triggers = arrayify(options.triggers);
  if (triggers.length > 0) {
    trigger.where = {
      name: {
        $in: triggers.map((trigger) => trigger.toLowerCase()),
      },
    };
  }
  const where = {
    enabled: options.hasOwnProperty('enabled') ? Boolean(options.enabled) : true,
  };
  if (options.targets) {
    console.log(`filtering on targets!`);
    for (const type of ['channels', 'roles', 'users']) {
      const targets = Array.from(options.targets[type] || []);
      const target = type.slice(0, -1); // strip the 's', notifications each have one target

      if (targets.length > 0) {
        console.log(`filtering on ${type}!`);
        if (!where.hasOwnProperty('target')) {
          where.target = {$or: []};
        }
        where.target.$or.push({
          [target]: {
            $in: targets,
          },
        });
      }
    }
  }

  console.log(`where: ${JSON.stringify(where)}`);

  return await ctx.db.Notification.findAll({
    transaction: options.transaction || null,
    include: [guild, trigger],
    where: where,
  });
}

/**
 * Send provided content to all notification targets configured for the given trigger.
 * @param  {Object} ctx Application context
 * @param  {Object} ctx.db Database context
 * @param  {Bot} bot Chat bot instance
 * @param  {string} trigger Trigger name
 * @param  {string} content Notification text
 * @return {Array<Message>} Messages sent as a result of resolving triggered notifications
 */
async function notify(ctx, bot, trigger, content) {
  const sent = [];
  const notifications = await listNotifications(ctx, {triggers: trigger});
  for (const notification of notifications) {
    const target = notification.target || {};
    const guildName = notification.Guild.name;
    const guild = bot.client.guilds.get(notification.Guild.snowflake);
    if (target.hasOwnProperty('channel')) {
      if (guild) {
        const channel = guild.channels.get(target.channel);
        if (channel) {
          sent.push(await channel.send(`@here, ${content}`));
        } else {
          ctx.log(`Attempted to notify <#${target.channel}>, but it didn't exist in guild ${guildName}`, 'error');
        }
      } else {
        ctx.log(`Attempted to notify <#${target.channel}>, but I couldn't find guild ${guildName}`, 'error');
      }
    } else if (target.hasOwnProperty('user')) {
      if (guild) {
        const member = guild.members.get(target.user);
        if (member) {
          sent.push(await member.send(content));
        } else {
          ctx.log(`Attempted to notify <@${target.user}>, but they weren't a member of guild ${guildName}`, 'error');
        }
      } else {
        ctx.log(`Attempted to notify <#${target.channel}>, but I couldn't find guild ${guildName}`, 'error');
      }
    } else if (target.hasOwnProperty('role')) {
      // TODO: What channel do we post in? Is there a configured channel for announcements?
    } else if (target.hasOwnProperty('everyone')) {
      // TODO: What channel do we post in? Is there a configured channel for announcements?
    } else {
      ctx.log(`Notification ${notification.id} contains no known targets`, 'error');
    }
  }
  return sent;
}

/**
 * Ensure all provided triggers exist in the database.
 * @param  {Object} ctx Application context
 * @param  {Array<string>} triggers Known triggers
 */
async function syncTriggers(ctx, triggers) {
  const uniqueTriggers = new Set(arrayify(triggers));
  if (uniqueTriggers.size === 0) return;

  await ctx.db.sequelize.transaction(async (t) => {
    for (const trigger of uniqueTriggers) {
      await ctx.db.Trigger.findOrCreate({
        transaction: t,
        where: {name: trigger.toLowerCase()},
        defaults: {name: trigger.toLowerCase()},
      });
    }
  });
}

module.exports = {
  addNotifications,
  deleteNotifications,
  listNotifications,
  notify,
  syncTriggers,
};
