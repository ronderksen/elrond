const help = require("./help");
const rings = require("./rings");
const ringsimg = require("./ringsimg");
const quest = require("./quest");
const hero = require("./hero");
const card = require("./card");
const faq = require("./faq");
const myrings = require("./myrings");

module.exports = function({
  user,
  userID,
  cardList,
  scenarioIndex,
  emojiSymbols,
  bot,
  channelID,
  logger
}) {
  return {
    help: () => help(bot, channelID),
    rings: query =>
      rings(query, cardList, emojiSymbols, bot, channelID, logger),
    ringsimg: query => ringsimg(query, cardList, bot, channelID, logger),
    quest: () => quest(scenarioIndex, userID, bot, channelID, logger),
    hero: query => hero(query, cardList, emojiSymbols, bot, channelID, logger),
    card: query => card(query, cardList, emojiSymbols, bot, channelID, logger),
    faq: query => faq(query, bot, channelID, logger),
    myrings: () => myrings(user, userID, bot, channelID, logger)
  };
};
