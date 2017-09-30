'use strict';
const DB = require('./models');
const Bot = require('./chat');

const context = {};
context.log = console.log;

async function initialize(ctx) {
  ctx.db = await DB.initialize();
  ctx.bot = await Bot.initialize(ctx);
}

initialize(context);
