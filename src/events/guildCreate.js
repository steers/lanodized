'use strict';

module.exports = async (ctx, bot, guild) => {
  await ctx.db.DiscordGuild.upsert({
    snowflake: guild.id,
    name: guild.name,
    connectedAt: new Date(),
  });
  ctx.log(`${bot.client.user.username} connected to guild ${guild.name}`);
};
