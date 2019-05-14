const striptags = require('striptags');

function sendAnswer(channel, { ruletext = '', id, title, qa = '', ruling = '' }) {
  const body = striptags(`${ruletext}${ruling}${qa}`).replace('\n', '');
  const url = `http://lotr-lcg-quest-companion.gamersdungeon.net/#Rule${id}`;
  channel.send(`**${title}**\n\n${body}\n\n${url}`);
}

function sendErrata(channel, { errata, id, title }) {
  const body = striptags(errata).replace(/\\/g, "");
  const url = `http://lotr-lcg-quest-companion.gamersdungeon.net/#Card${id}`;
  channel.send(`**${title}**\n\n${body}\n\n${url}`);
}

function sendMultiple(channel, author, answers, sendMethod) {
  channel.send(`Found ${answers.length} results, reply with the number of the one you want:`);
  channel.send(answers.map(({ title }, index) => `${index + 1}. ${title}`).join('\n'));
  channel.awaitMessages(fromUser(author), { max: 1, time: 30000, errors: ['time']})
  .then(collected => {
    const response = parseInt(collected.first().content, 10) - 1;
    if (response > 0 && response < answers.length) {
      sendMethod(channel, answers[response]);
    } else {
      channel.send("Invalid response received");
    }
  })
  .catch(collected => console.log('No reply received within 30 seconds'));

}

function fromUser(author) {
  return (message) => message.author.id === author.id
}

module.exports = function rulesRef({ name, type }, { faq, glossary, erratas, cardFAQ }, channel, author, logger) {
  const queryRegEx = new RegExp(name, 'i');
  switch (type) {
    case 'faq':
      logger.info(`searching FAQ matching ${name}`);
      const answers = faq
        .filter(({ title }) => queryRegEx.test(title))
        .concat(
          erratas.filter(({ title, qa, ruling }) => (qa || ruling) && queryRegEx.test(title))
        );
      if (answers.length === 1) {
        sendAnswer(channel, answers[0]);
        return;
      } else if (answers.length > 1) {
        sendMultiple(channel, author, answers, sendAnswer);
        return;
      }
      channel.send('No matching FAQ entry found.');
      break;
      case 'glossary':
      logger.info(`searching Glossary matching ${name}`);
      const glossaryAnswers = glossary.filter(({ title }) => {
        return queryRegEx.test(title);
      });
      if (glossaryAnswers.length === 1) {
        sendAnswer(channel, glossaryAnswer);
        return;
      } else if (glossaryAnswers.length > 1) {
        sendMultiple(channel, author, glossaryAnswers, sendAnswer);
        return;
      }
      channel.send('No matching Glossary entry found.');
      break;
    case 'errata':
      logger.info(`searching errata for card ${name}`);
      const errata = erratas.filter(({ title, errata }) => {
        return errata && queryRegEx.test(title);
      });
      if (errata.length === 1) {
        sendErrata(channel, errata);
        return;
      } else if (errata.length > 1) {
        sendMultiple(channel, author, errata, sendErrata);
        return;
      }
      channel.send(`No matching errata found for card ${name}.`);      
  }
};
