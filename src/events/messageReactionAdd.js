'use strict';

module.exports = async (ctx, client, reaction, user) => {
  // ignore bot reactions
  if (user.bot) return;

  const poll = client.polls.get(reaction.message.id);
  if (poll && poll.open) {
    try {
      await poll.vote(reaction, user);
    } catch (err) {
      ctx.log(`Error occurred when ${user.username} voted on poll ${poll.id}`, 'error', err);
    }
  }
};
