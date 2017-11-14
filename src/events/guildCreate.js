'use strict';

module.exports = async (ctx, client, guild) => {
  await ctx.db.DiscordGuild.upsert({
    snowflake: guild.id,
    name: guild.name,
    connectedAt: new Date(),
  });
  ctx.log(`${client.user.username} connected to guild ${guild.name}`);
};
