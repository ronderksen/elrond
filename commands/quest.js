const helpers = require("./command-helpers");

module.exports = function quest(scenarioIndex, author, channel, logger) {
  const quest = helpers.getRandomItem(scenarioIndex);
  channel.send(`<@${author.id}> ` + "Here's a quest for you: " + `**${quest.name}**\n${quest.url}\n${quest.hoburl}`);
}
