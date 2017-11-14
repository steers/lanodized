'use strict';

/**
 * Record all aspects of a chat user command interaction
 *
 * @param {Object} ctx Application context
 * @param {Object} ctx.db Database context
 * @param {Object} message Discord message
 * @param {Object} command Command object
 * @param {string} alias Command alias used
 * @param {Object} result Command result
 * @return {Promise} Created interaction
 */
async function executedCommand(ctx, message, command, alias, result) {
  return await ctx.db.sequelize.transaction(async (t) => {
    let guild = null;
    switch (message.channel.type) {
      case 'text': {
        guild = await ctx.db.DiscordGuild.findOne({
          transaction: t,
          where: {snowflake: message.guild.id},
        });
        if (!guild) {
          throw new Error(`Executed command in text channel of unknown guild ${message.guild.name}`);
        }
        break;
      }
    }
    const [user] = await ctx.db.DiscordUser.findOrCreate({
      transaction: t,
      where: {snowflake: message.author.id},
      defaults: {
        snowflake: message.author.id,
        name: message.author.username,
        properties: {
          discriminator: message.author.discriminator,
        },
      },
    });
    const [channel] = await ctx.db.DiscordChannel.findOrCreate({
      transaction: t,
      where: {snowflake: message.channel.id},
      defaults: {
        snowflake: message.channel.id,
        name: message.channel.name || null,
        type: message.channel.type,
        GuildId: guild ? guild.id : null,
      },
    });
    return await ctx.db.DiscordInteraction.create({
      command: command.help.name,
      alias: alias,
      properties: result || null,
      UserId: user.id,
      ChannelId: channel.id,
      GuildId: guild ? guild.id : null,
    }, {
      transaction: t,
    });
  });
}

module.exports = {
  executedCommand,
};
