'use strict';

const {arrayify} = require('./parser');
const moment = require('moment-timezone');

const DEFAULT_TZ = process.env.DEFAULT_TZ || 'America/Toronto';

/**
 * Create or update the given party definition in the database
 * @param {Object} ctx Application context
 * @param {Object} ctx.db Database contex
 * @param {Object} definition Validated party definition to sync
 * @return {Promise}
 */
async function upsertParty(ctx, definition) {
  const toLocalTime = (timestamp) => {
    // Basically only to protect against definitions without explicit TZ
    return moment(timestamp).tz(DEFAULT_TZ);
  };
  const partyDefinition = {
    name: definition.name,
    iteration: definition.iteration,
    start: toLocalTime(definition.start),
    end: toLocalTime(definition.end),
    properties: definition.properties || null,
  };
  const events = await ctx.db.sequelize.transaction(async (t) => {
    try {
      const [party, created] = await ctx.db.Party.findOrCreate({
        transaction: t,
        where: partyDefinition,
        defaults: partyDefinition,
      });
      if (!created) {
        await ctx.db.Event.destroy({
          transaction: t,
          where: {
            PartyId: party.id,
          },
        });
      }
      const eventTypes = await ctx.db.EventType.findAll({transaction: t});
      return await Promise.all(definition.events.map((event) => {
        const eventType = eventTypes.find((type) => type.name === event.type);
        return ctx.db.Event.create({
          title: event.title,
          description: event.description,
          start: toLocalTime(event.start),
          end: toLocalTime(event.start).add(event.minutes, 'minutes'),
          properties: event.properties || null,
          EventTypeId: eventType.id,
          PartyId: party.id,
        }, {
          transaction: t,
        }).then((entity) => {
          return [entity, event.games];
        });
      }));
    } catch (err) {
      // RIP
      ctx.log(`A fatal error occurred in the upsert transaction for ${definition.name} ${definition.iteration}`, 'error', err);
      throw err;
    }
  });
  return await ctx.db.sequelize.transaction(async (t) => {
    for (const [event, gameAliases] of events) {
     const modes = [];
      for (const gameAlias of arrayify(gameAliases)) {
        const game = await ctx.db.Game.findOne({
          transaction: t,
          include: [{
            model: ctx.db.GameAlias,
            as: 'Aliases',
            where: {
              name: gameAlias,
            },
          }, {
            model: ctx.db.GameMode,
            as: 'Modes',
            required: true,
          }],
        });
        if (!game) {
          throw new Error(`Unknown game '${gameAlias}' scheduled in event ${event.title}`);
        }
        const gameModes = arrayify(game.Modes);
        const gameMode = gameModes.find((mode) => mode.short === gameAlias);
        if (gameMode) {
          modes.push(gameMode);
        } else {
          modes.push(...gameModes);
        }
      }
      if (modes.length > 0) {
        event.setGameModes(modes);
        await event.save();
      }
    }
  }).then(() => {
    ctx.log(`Upsert completed for ${definition.name} ${definition.iteration}`, 'info');
  }).catch((err) => {
    ctx.log(`An error occurred in the upsert transaction for ${definition.name} ${definition.iteration}`, 'error', err);
  });
}

module.exports = {
  upsertParty,
};
