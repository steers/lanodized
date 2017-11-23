'use strict';

/**
 * Reply to the given message, mentioning its author.
 * @param  {Object} message Chat message
 * @param  {string} content Reply content
 * @return {string[]} List of actions taken, if any, for debugging.
 */
async function reply(message, content) {
  const actions = [];
  await message.reply(content);
  actions.push('replied');
  return actions;
}

/**
 * Respond to the given message in the same channel it was sent from.
 * @param  {Object} message Chat message
 * @param  {string} content Reply content
 * @return {string[]} List of actions taken, if any, for debugging.
 */
async function respond(message, content) {
  const actions = [];
  await message.channel.send(content);
  actions.push('responded');
  return actions;
}

/**
 * Respond to the given message in a direct channel.
 * @param  {Object} message Chat message
 * @param  {string} content Reply content
 * @return {string[]} List of actions taken, if any, for debugging.
 */
async function respondDirect(message, content) {
  const actions = [];
  switch (message.channel.type) {
    case 'dm':
    case 'group': {
      actions.push(...await respond(message, content));
      break;
    }
    default: {
      await message.author.send(content);
      actions.push('responded directly');
      if (message.deletable) {
        await message.delete();
        actions.push('deleted message');
      }
      break;
    }
  }
  return actions;
}

module.exports = {
  reply,
  respond,
  respondDirect,
};
