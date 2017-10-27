'use strict';
const Database = require('./models');
const Bot = require('./chat');
const Games = require('./games');

const context = {};
context.log = console.log;

/**
 * Initialize the application, populating the provided context object.
 * @param {Object} ctx Application context
 * @return {undefined}
 */
async function initialize(ctx) {
  ctx.db = await Database.initialize();
  ctx.bot = await Bot.initialize(ctx);

  try {
    await Games.initialize(ctx);
  } catch (e) {
    ctx.log(`Encountered an error synchronizing games`, e);
  }
}

initialize(context);
