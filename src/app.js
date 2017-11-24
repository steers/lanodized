'use strict';
const project = require('../package.json');
const Database = require('./models');
const Bot = require('./chat').Bot;
const data = require('./lib/data');
const Validator = require('./lib/validator').DataFileValidator;
const games = require('./lib/games');
const schedule = require('./lib/schedule');

// Directory is relative to the project root
const DATA_DIR = process.env.DATA_DIR || './data';

const context = {};
context.log = console.log;

/**
 * Initialize the application, populating the provided context object.
 * @param {Object} ctx Application context
 */
async function initialize(ctx) {
  ctx.db = await Database.initialize();
  ctx.bot = new Bot();
  await ctx.bot.initialize(ctx);
}

/**
 * Load application data files.
 * @param {Object} ctx Application context
 */
async function load(ctx) {
  const validator = new Validator();
  await validator.load(ctx);

  const modules = await data.readFilenames(DATA_DIR);
  if (modules.hasOwnProperty('games')) {
    const gameFiles = await data.readFiles(modules.games);
    const validate = (defn) => validator.validateGame(defn);
    const gameDefinitions = data.validateFiles(ctx, gameFiles, validate);
    for (const definition of gameDefinitions) {
      if (await data.hasChanged(ctx, definition)) {
        await games.upsertGame(ctx, definition.parsed);
        await data.fileChange(ctx, definition);
      }
    }
  }
  if (modules.hasOwnProperty('events')) {
    const partyFiles = await data.readFiles(modules.events);
    const validate = (defn) => validator.validateParty(defn);
    const partyDefinitions = data.validateFiles(ctx, partyFiles, validate);
    for (const definition of partyDefinitions) {
      if (await data.hasChanged(ctx, definition)) {
        await schedule.upsertParty(ctx, definition.parsed);
        await data.fileChange(ctx, definition);
      }
    }
  }
}

initialize(context).then(async () => {
  await load(context);
  await context.bot.login();
}).then(() => {
  context.log(`${project.name} ${project.version} has started.`, 'info');
}).catch((err) => {
  context.log(`Fatal error initializing ${project.name} ${project.version}`, 'error', err);
});
