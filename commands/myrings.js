module.exports = function myrings(user, userID, bot, channelID, logger) {
  bot.sendMessage({
    to: channelID,
    message: `You can see <@${userID}>'s decklists and fellowships at RingsDB:\n` +
    `http://ringsdb.com/d/${user} and\n` +
    `http://ringsdb.com/f/${user}`
  });
}