'use strict';

module.exports = async (ctx, bot, reaction, user) => {
  // ignore bot reactions
  if (user.bot) return;

  const poll = bot.polls.get(reaction.message.id);
  if (poll && poll.open) {
    try {
      await poll.revoke(reaction, user);
    } catch (err) {
      ctx.log(`Error occurred when ${user.username} revoked a vote on poll ${poll.id}`, 'error', err);
    }
  }
};
