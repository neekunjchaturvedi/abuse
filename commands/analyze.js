import { Command } from "commander";

export const analyzeCommand = new Command("analyze")
  .description("🔍 Analyze data or text and return sarcastic feedback.")
  .argument("<text>", "Text to analyze")
  .action((text) => {
    const length = text.length;
    if (length < 5) {
      console.log(`😂 That’s it? "${text}" barely counts as input.`);
    } else if (length < 20) {
      console.log(`🤔 "${text}"... nice try, but could use more brain cells.`);
    } else {
      console.log(`🔥 "${text}" — wow, someone’s feeling poetic today!`);
    }
  });
