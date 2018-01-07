const fetch = require("node-fetch");
const helpers = require("./helpers");

function rings(
  { name, filters },
  cardList,
  emojiSymbols,
  bot,
  channelID,
  logger
) {
  logger.info(`Searching for ${name.trim()}`);
  const matches = cardList
    .filter(c => c.name.toLowerCase().indexOf(name.trim()) > -1)
    .filter(c => helpers.checkFilters(c, filters));

  logger.info(`found ${matches.length} cards, sending response`);
  const message = matches.reduce((acc, card) => {
    acc += helpers.createCardMessage(emojiSymbols, card);
    return acc;
  }, "");
  bot.sendMessage({
    to: channelID,
    message
  });
}

function ringsimg({ name, filters }, cardList, bot, channelID, logger) {
  logger.info(`Searching for ${name.trim()}`);
  const imgMatches = cardList
    .filter(c => c.name.toLowerCase().indexOf(name.trim()) > -1)
    .filter(c => helpers.checkFilters(c, filters));

  logger.info(`found ${imgMatches.length} cards, sending response`);
  bot.sendMessage({
    to: channelID,
    message: `Cards found: ${imgMatches.length}\n\n`
  });
  imgMatches.forEach(async card => {
    let img;
    try {
      img = await fetch(`http://ringsdb.com/${card.imagesrc}`).then(res =>
        res.buffer()
      );
    } catch (err) {
      logger.error(err);
    }

    if (img) {
      bot.uploadFile(
        {
          to: channelID,
          file: img,
          filename: `${card.name}.png`
        },
        (err, res) => {
          if (err) {
            logger.error(err);
          }
        }
      );
    } else {
      bot.sendMessage({
        to: channelID,
        message: "Unable to retrieve image"
      });
    }
  });
}

function quest(questIndex, userID, bot, channelID, logger) {
  const quest = helpers.getRandomItem(questIndex);
  const questUrlPath = quest.replace(/\s/g, "-");
  const url = `http://hallofbeorn.com/Cards/Scenarios/${questUrlPath}`;
  bot.sendMessage({
    to: channelID,
    message:
      `<@${userID}> ` + "Here's a quest for you: " + `**${quest}**\n${url}`
  });
}

function hero({ filters }, cardList, emoji, bot, channelID, logger) {
  const heroes = cardList
    .filter(card => card.type_code === "hero")
    .filter(card => helpers.checkFilters(card, filters));
  const hero = helpers.getRandomItem(heroes);

  bot.sendMessage({
    to: channelID,
    message: helpers.createCardMessage(emoji, hero)
  });
}

function card(bot, channelID, logger) {
  const heroes = cardList
  .filter(card => card.type_code !== "hero")
  .filter(card => helpers.checkFilters(card, filters));
const hero = helpers.getRandomItem(heroes);

  bot.sendMessage({
    to: channelID,
    message: "Not implemented yet"
  });
}

function faq(query, bot, channelID, logger) {
  bot.sendMessage({
    to: channelID,
    message: "Not implemented yet"
  });
}

function myrings(user, userID, bot, channelID, logger) {
  bot.sendMessage({
    to: channelID,
    message: `You can see <@${userID}>'s decklists and fellowships at RingsDB:\n` +
    `http://ringsdb.com/d/${user} and\n` +
    `http://ringsdb.com/f/${user}`
  });
}

function help(bot, channelID) {
  bot.sendMessage({
    to: channelID,
    message:
      "**Elrond** - Lord of the Rings: The Card Game sage bot - List of commands\n" +
      "!help - This help message\n" +
      "!rings <query> - Find and display card text from RingsDB\n" +
      "!ringsimg <query> - Find and display card image from RingsDB\n" +
      "!quest - Select a random quest\n" +
      "!hero - Select a random hero\n" +
      "!card - Select a random card (skipping heroes)\n" +
      "!faq <text> - Finds questions in FAQ containing <text> (Not yet implemented)\n" +
      "!myrings - Display your links from RingsDB\n" +
      "**It is perilous to study too deeply the arts of the Enemy, for good or for ill. But such falls and betrayals, alas, have happened before.**"
  });
}

module.exports = function({
  user,
  userID,
  cardList,
  questIndex,
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
    quest: () => quest(questIndex, userID, bot, channelID, logger),
    hero: query => hero(query, cardList, emojiSymbols, bot, channelID, logger),
    card: () => card(bot, channelID, logger),
    faq: query => faq(query, bot, channelID, logger),
    myrings: () => myrings(user, userID, bot, channelID, logger)
  };
};
