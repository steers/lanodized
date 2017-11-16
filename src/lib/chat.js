'use strict';

/**
 * Reply to the given message in a direct channel.
 * @param  {Object} message Chat message
 * @param  {string} content Reply content
 * @return {string[]} List of actions taken, if any, for debugging.
 */
async function replyDirect(message, content) {
  const actions = [];
  switch (message.channel.type) {
    case 'dm':
    case 'group': {
      await message.channel.send(content);
      actions.push('replied');
      break;
    }
    default: {
      const channel = await message.author.createDM();
      await channel.send(content);
      actions.push('replied');
      await channel.delete();
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
  replyDirect,
};
