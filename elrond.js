const fetch = require("node-fetch");
const Discord = require("discord.js");
const Winston = require("winston");
const getCommandList = require("./commands");

const logger = Winston.createLogger({
  level: "debug",
  format: Winston.format.json(),
  transports: [new Winston.transports.Console()],
});

async function getCardIndex() {
  logger.info("Retrieving player cards");
  try {
    return fetch(
      "http://ringsdb.com/api/public/cards/?_format=json"
    ).then((res) => res.json());
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
}

/**
 * QC format =
 * {
 *   quests: {
 *      cycle: {
 *        @attributes: {
 *          name
 *        },
 *        url,
 *        hoburl
 *      }
 *    }
 * }
 *
 * This function extracts the name, QC url and hall of beorn url.
 */
async function getQCData() {
  logger.info("Retrieving data from QC");
  try {
    return fetch(
      "http://lotr-lcg-quest-companion.gamersdungeon.net/api.php?format=json&parse=discord"
    ).then((res) => res.json());
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
}

function getNameAndFilters(args) {
  return args.reduce(
    (acc, arg) => {
      if (arg.indexOf(":") > -1) {
        const [filterKey, value] = arg.split(":");
        return {
          ...acc,
          filters: [...acc.filters, { filterKey, value }],
        };
      }
      const name = arg
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
      return {
        ...acc,
        name: `${acc.name} ${name}`.trim(),
      };
    },
    {
      name: "",
      filters: [],
    }
  );
}

function parseQCData(qcData) {
  const {
    quests: { cycle },
    faq: { entry: faqEntries },
    glossary: { entry: glossaryEntries },
    carderratas: { card: cardErratas },
  } = qcData;

  const scenarios = cycle.reduce((acc, { quest }) => {
    if (quest) {
      return [
        ...acc,
        ...(Array.isArray(quest)
          ? quest.map(({ "@attributes": { name }, url, hoburl }) => ({
              name,
              url,
              hoburl,
            }))
          : [
              {
                name: quest["@attributes"].name,
                url: quest.url,
                hoburl: quest.hoburl,
              },
            ]),
      ];
    }
    return acc;
  }, []);
  const faq = faqEntries.map(({ "@attributes": { title, id }, ruletext }) => ({
    title,
    id,
    ruletext,
  }));
  const glossary = glossaryEntries.map(
    ({ "@attributes": { title, id }, ruletext }) => ({
      title,
      id,
      ruletext,
    })
  );
  const erratas = cardErratas.map(
    ({ "@attributes": { title, id }, ruling, qa, errata }) => ({
      title,
      id,
      ruling,
      qa,
      errata,
    })
  );
  return {
    scenarios,
    faq,
    glossary,
    erratas,
  };
}

// Initialize Discord Bot
Promise.all([getCardIndex(), getQCData()])
  .then(([cardList, qcData]) => {
    return [cardList, parseQCData(qcData)];
  })
  .then(([cardList, { scenarios, ...rulesRef }]) => {
    const bot = new Discord.Client();
    const emojiNames = [
      "lore",
      "spirit",
      "leadership",
      "tactics",
      "neutral",
      "fellowship",
      "attack",
      "defense",
      "willpower",
      "threat",
      "hitpoints",
      "attackblack",
      "defenseblack",
      "willpowerblack",
      "threatblack",
      "hitpointsblack",
    ];
    let emojiSymbols;

    bot.once("ready", (evt) => {
      logger.info("Connected");
      logger.info("Logged in as: ");
      logger.info(bot.user.username + " - (" + bot.user.tag + ")");
      emojiSymbols = bot.emojis.cache.reduce((acc, emoji) => {
        if (
          emoji.guild.name === "COTR" &&
          emojiNames.indexOf(emoji.name) > -1
        ) {
          return {
            ...acc,
            [emoji.name]: emoji,
          };
        }
        return acc;
      }, {});
    });

    bot.on("message", ({ author, content, channel }) => {
      // Our bot needs to know if it will execute a command
      // It will listen for messages that will start with `!`
      if (content.startsWith("!")) {
        let args = content.substring(1).split(" ");
        const cmd = args[0];

        args = args.splice(1);

        const query = getNameAndFilters(args);
        const commandConfig = {
          author,
          cardList,
          scenarios,
          rulesRef,
          emojiSymbols,
          bot,
          channel,
          logger,
        };
        const commands = getCommandList(commandConfig);
        switch (cmd) {
          case "help":
            return commands.help();
          case "rings":
            return commands.rings(query);
          case "ringsimg":
            return commands.ringsimg(query);
          case "quest":
            return commands.quest();
          case "hero":
            return commands.hero(query);
          case "card":
            return commands.card(query);
          case "faq":
            return commands.rr({
              ...query,
              type: "faq",
            });
          case "glossary":
            return commands.rr({
              ...query,
              type: "glossary",
            });
          case "errata":
            return commands.rr({
              ...query,
              type: "errata",
            });
          case "myrings":
            return commands.myrings();
          default:
            return null;
        }
      }
    });

    bot.on("error", (e) => console.error(e));
    bot.on("warn", (e) => console.warn(e));
    bot.on("debug", (e) => console.debug(e));

    bot.login(process.env.DISCORD_TOKEN);
  })
  .catch((err) => {
    logger.error(`Error getting indexes: ${err}`);
    logger.error(err.stack);
  });

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught exception: ${err}`);
  logger.error(err.stack);
  process.exit(1);
});
