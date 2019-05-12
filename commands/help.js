module.exports = function help(channel) {
  channel.send(
      "**Elrond** - Lord of the Rings: The Card Game sage bot - List of commands\n" +
      "!help - This help message\n" +
      "!rings <query> - Find and display card text from RingsDB\n" +
      "!ringsimg <query> - Find and display card image from RingsDB\n" +
      "!quest - Select a random quest\n" +
      "!hero - Select a random hero\n" +
      "!card - Select a random card (skipping heroes)\n" +
      "!faq <text> - Finds questions in FAQ containing <text>\n" +
      "!glossary <text> - Finds questions in Glossary containing <text>\n" +
      "!errata <cardname> - Finds errata for card with name <cardname>\n" +
      "!myrings - Display your links from RingsDB\n" +
      "**It is perilous to study too deeply the arts of the Enemy, for good or for ill. But such falls and betrayals, alas, have happened before.**"
  );
}