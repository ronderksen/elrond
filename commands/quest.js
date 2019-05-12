const helpers = require("./command-helpers");

module.exports = function quest(scenarioIndex, userID, bot, channelID, logger) {
  const quest = helpers.getRandomItem(scenarioIndex);
  bot.sendMessage({
    to: channelID,
    message:
      `<@${userID}> ` + "Here's a quest for you: " + `**${quest.name}**\n${quest.url}\n${quest.hoburl}`
  });
}
