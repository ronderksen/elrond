const help = require("./help");
const rings = require("./rings");
const ringsimg = require("./ringsimg");
const quest = require("./quest");
const hero = require("./hero");
const card = require("./card");
const rr = require("./rulesRef");
const myrings = require("./myrings");

module.exports = function({
  author,
  cardList,
  scenarioIndex,
  rulesRef,
  emojiSymbols,
  channel,
  logger
}) {
  return {
    help: () => help(channel),
    rings: query =>
      rings(query, cardList, emojiSymbols, channel, logger),
    ringsimg: query => ringsimg(query, cardList, channel, logger),
    quest: () => quest(scenarioIndex, author, channel, logger),
    hero: query => hero(query, cardList, emojiSymbols, channel, logger),
    card: query => card(query, cardList, emojiSymbols, channel, logger),
    rr: query => rr(query, rulesRef, channel, logger),
    myrings: () => myrings(author, channel, logger)
  };
};
