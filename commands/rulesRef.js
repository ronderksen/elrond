const striptags = require('striptags');

module.exports = function rulesRef({ name, type }, { faq, glossary }, channel, logger) {
  switch (type) {
    case 'faq':
      logger.info(`searching FAQ matching ${name}`);
      const faqAnswer = faq.find(({ title }) => {
        const queryRegEx = new RegExp(name, 'i');
        return queryRegEx.test(title);
      });
      if (faqAnswer) {
        const body = striptags(faqAnswer.ruletext).replace('\n', '');
        channel.send(`**${faqAnswer.title}**\n\n${body}`);
        return;
      }
      channel.send('No matching FAQ entry found.');
      break;
    case 'glossary':
      logger.info(`searching Glossary matching ${name}`);
      const glossaryAnswer = glossary.find(({ title }) => {
        const queryRegEx = new RegExp(name, 'i');
        return queryRegEx.test(title);
      });
      if (glossaryAnswer) {
        const body = striptags(glossaryAnswer.ruletext).replace('\n', '');
        channel.send(`**${glossaryAnswer.title}**\n\n${body}`);
        return;
      }
      channel.send('No matching FAQ entry found.');
      break;
  }
};
