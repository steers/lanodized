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
  if (!targets) {
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
      const targetSearch = {$or: {}};
      if (channels.length > 0) {
        targetSearch.$or.channel = {$in: channels};
      }
      if (roles.length > 0) {
        targetSearch.$or.role = {$in: roles};
      }
      if (users.length > 0) {
        targetSearch.$or.user = {$in: users};
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
 * Send provided content to all notification targets configured for the given trigger.
 * @param  {Object} ctx Application context
 * @param  {Object} ctx.db Database context
 * @param  {Client} client Chat client object
 * @param  {string} trigger Trigger name
 * @param  {string} content Notification text
 * @return {Array} First element is map of arrays of notified entities, second is misses (if any)
 */
async function notify(ctx, client, trigger, content) {
  const notifications = await ctx.db.Notification.findAll({
    attributes: ['id', 'target'],
    include: [{
      model: ctx.db.Trigger,
      required: true,
      attributes: ['name', 'properties'],
      where: {
        name: trigger.toLowerCase(),
      },
    }, {
      model: ctx.db.DiscordGuild,
      as: 'Guild',
      required: true,
      attributes: ['snowflake'],
    }],
    where: {
      enabled: true,
    },
  });

  const notified = {
    channels: [],
    users: [],
    roles: [],
  };
  const missed = {
    channels: [],
    users: [],
    roles: [],
  };
  for (const notification of notifications) {
    const target = notification.target || {};
    const guildName = notification.Guild.name;
    const guild = client.guilds.get(notification.Guild.snowflake);
    if (target.hasOwnProperty('channel')) {
      if (guild) {
        const channel = guild.channels.get(target.channel);
        if (channel) {
          await channel.send(`@here, ${content}`);
          notified.channels.push(channel.id);
        } else {
          ctx.log(`Attempted to notify <#${target.channel}>, but it didn't exist in guild ${guildName}`, 'error');
          missed.channels.push(target.channel);
        }
      } else {
        ctx.log(`Attempted to notify <#${target.channel}>, but I couldn't find guild ${guildName}`, 'error');
        missed.channels.push(target.channel);
      }
    } else if (target.hasOwnProperty('user')) {
      if (guild) {
        const member = guild.members.get(target.user);
        if (member) {
          await member.send(content);
          notified.users.push(member.id);
        } else {
          ctx.log(`Attempted to notify <@${target.user}>, but they weren't a member of guild ${guildName}`, 'error');
          missed.users.push(target.user);
        }
      } else {
        ctx.log(`Attempted to notify <#${target.channel}>, but I couldn't find guild ${guildName}`, 'error');
        missed.users.push(target.user);
      }
    } else if (target.hasOwnProperty('role')) {
      // TODO: What channel do we post in? Is there a configured channel for announcements?
      missed.roles.push(target.role);
    } else if (target.hasOwnProperty('everyone')) {
      // TODO: What channel do we post in? Is there a configured channel for announcements?
    } else {
      ctx.log(`Notification ${notification.id} contains no known targets: ${JSON.stringify(notification.target)}`, 'error');
    }
  }
  const results = [notified];
  if (missed.channels.length > 0 || missed.users.length > 0 || missed.roles.length > 0) {
    results.push(missed);
  }
  return results;
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
  notify,
  syncTriggers,
};
