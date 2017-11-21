'use strict';

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

  const requestedTriggers = new Set(triggers);
  const validTriggers = await ctx.db.Trigger.findAll({
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
    where: {snowflake: guildId},
  });
  const creator = await ctx.db.DiscordUser.findOne({
    where: {snowflake: creatorId},
  });

  for (const trigger of validTriggers) {
    requestedTriggers.delete(trigger.name);

    const adding = {
      channels: new Set(channels),
      roles: new Set(roles),
      users: new Set(users),
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

module.exports = {
  addNotifications,
};
