'use strict';

/**
 * Reply to the given message, mentioning its author.
 * @param  {Object} message Chat message
 * @param  {string} content Reply content
 * @return {Message} Message sent in reply
 */
async function reply(message, content) {
  return await message.reply(content);
}

/**
 * Respond to the given message in the same channel it was sent from.
 * @param  {Object} message Chat message
 * @param  {string} content Reply content
 * @return {Message} Message sent in response
 */
async function respond(message, content) {
  return await message.channel.send(content);
}

/**
 * Respond to the given message in a direct channel.
 * @param  {Object} message Chat message
 * @param  {string} content Reply content
 * @return {Message} Message sent in response
 */
async function respondDirect(message, content) {
  switch (message.channel.type) {
    case 'dm':
    case 'group': {
      return await respond(message, content);
    }
    default: {
      const response = await message.author.send(content);
      if (message.deletable) {
        await message.delete();
      }
      return response;
    }
  }
}

module.exports = {
  reply,
  respond,
  respondDirect,
};
