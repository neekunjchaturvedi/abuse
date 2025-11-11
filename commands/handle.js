import { Command } from "commander";
import chalk from "chalk";
import { TemplateEngine } from "../core/templateEngine.js";
import { LogManager } from "../core/logManager.js";
import stringSimilarity from "string-similarity";
import { execSync } from "child_process";
import fs from "fs";
import { loadConfig } from "../core/configManager.js";

export const handleCommand = new Command("handle")
  .argument("<attempt>", "The mistyped or failed command")
  .description("Handle a mistyped or failed command with humor and help.")
  .action(async (attempt) => {
    // 🧠 Step 1: Collect available commands
    let allCommands = [];
    try {
      const compgenOutput = execSync("compgen -c", {
        shell: "/bin/bash",
      }).toString();
      allCommands = compgenOutput.split("\n").filter(Boolean);
    } catch {
      console.error(
        chalk.red("⚠️  Failed to fetch system commands from shell.")
      );
    }

    // 🧠 Step 2: Also scan PATH for executables
    const pathDirs = process.env.PATH.split(":");
    for (const dir of pathDirs) {
      try {
        const files = fs.readdirSync(dir);
        allCommands.push(...files);
      } catch {}
    }
    allCommands = [...new Set(allCommands)]; // remove duplicates

    // ✅ Step 3: Check if valid command
    if (allCommands.includes(attempt)) {
      console.log(
        chalk.greenBright(
          `✅  "${attempt}" is a valid command. No roast today!`
        )
      );
      return;
    }
    const config = loadConfig();
    if (!config.enabled) {
      console.log("⚙️ Abuse is disabled in config.");
      return;
    }

    // 💀 Step 4: Roast
    const engine = new TemplateEngine();
    const insult = engine.generateInsult("medium", "sarcastic");

    // 🎯 Step 5: Fuzzy match for suggestions
    let suggestion = "";
    if (allCommands.length > 0) {
      const { bestMatch } = stringSimilarity.findBestMatch(
        attempt,
        allCommands
      );
      const threshold = attempt.length <= 3 ? 0.3 : 0.5;
      if (bestMatch.rating > threshold) suggestion = bestMatch.target;
    }

    // 💬 Step 6: Output roast
    console.log(chalk.redBright(`💀  ${insult}`));

    if (suggestion)
      console.log(chalk.greenBright(`💡  Maybe you meant: ${suggestion}`));
    else
      console.log(
        chalk.yellowBright(
          `🤷  Even Google couldn’t guess what that was supposed to be.`
        )
      );

    // 🧾 Step 7: Log event
    LogManager.log({
      command: attempt,
      insult,
      suggestion,
      timestamp: new Date().toISOString(),
    });
  });
