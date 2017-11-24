'use strict';

module.exports = async (ctx, bot) => {
  try {
    await ctx.db.sequelize.transaction(async (t) => {
      for (const guild of bot.client.guilds.values()) {
        await ctx.db.DiscordGuild.upsert({
          snowflake: guild.id,
          name: guild.name,
          connectedAt: new Date(),
        }, {
          transaction: t,
        });
      };
    });
  } catch (err) {
    ctx.log(`Unable to record information from all connected guilds.`, 'error', err);
  }
  ctx.log(`${bot.client.user.username} is online, connected to ${bot.client.guilds.size} guild(s)`, 'info');
};
