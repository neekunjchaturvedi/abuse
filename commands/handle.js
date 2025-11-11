import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import stringSimilarity from "string-similarity";
import { TemplateEngine } from "../core/templateEngine.js";
import { LogManager } from "../core/logManager.js";
import { loadConfig } from "../core/configManager.js";

export const handleCommand = new Command("handle")
  .argument("<attempt>", "The mistyped or failed command")
  .description("Handle a mistyped or failed command with humor and help.")
  .action(async (attempt) => {
    const config = loadConfig();

    // 🧱 1️⃣ Respect config
    if (!config.enabled) {
      console.log(chalk.gray("⚙️ Abuse is disabled in config."));
      return;
    }

    if (config.exempt_commands.includes(attempt)) {
      console.log(
        chalk.gray(`🚫 Command '${attempt}' is exempted from roasting.`)
      );
      return;
    }

    // 📂 2️⃣ Load typo map
    const commonCommandsPath = path.resolve("./data/common/commands.json");
    let commonMap = {};
    if (fs.existsSync(commonCommandsPath)) {
      try {
        commonMap = JSON.parse(fs.readFileSync(commonCommandsPath, "utf8"));
      } catch {
        console.error(chalk.red("⚠️ Failed to parse common-commands.json"));
      }
    }

    // 🧠 3️⃣ Collect all system commands
    let allCommands = [];
    try {
      const compgenOutput = execSync("compgen -c", {
        shell: "/bin/bash",
      }).toString();
      allCommands = compgenOutput.split("\n").filter(Boolean);
    } catch {
      console.error(chalk.red("⚠️ Failed to fetch system commands."));
    }

    // 🧩 4️⃣ Add executables from PATH
    const pathDirs = process.env.PATH.split(":");
    for (const dir of pathDirs) {
      try {
        const files = fs.readdirSync(dir);
        allCommands.push(...files);
      } catch {}
    }
    allCommands = [...new Set(allCommands)];

    // 🧰 5️⃣ Check if the command exists in system PATH
    let commandExists = false;
    try {
      execSync(`which ${attempt}`, { stdio: "ignore" });
      commandExists = true;
    } catch {
      commandExists = false;
    }

    // 💀 6️⃣ Generate insult
    const engine = new TemplateEngine();
    const insult = engine.generateInsult(
      config.severity,
      config.insult_style,
      config.language
    );

    // 🎯 7️⃣ Suggestion logic
    let suggestion = "";
    if (commonMap[attempt]) {
      suggestion = commonMap[attempt];
    } else if (allCommands.length > 0) {
      const { bestMatch } = stringSimilarity.findBestMatch(
        attempt,
        allCommands
      );
      const threshold = attempt.length <= 3 ? 0.3 : 0.5;
      if (bestMatch.rating > threshold) suggestion = bestMatch.target;
    }

    // 🧾 8️⃣ Output section
    if (!commandExists) {
      // console.log(chalk.redBright(`❌ Command "${attempt}" is not installed.`));
      console.log(chalk.redBright(`💀 ${insult}`));
      if (suggestion)
        console.log(chalk.greenBright(`💡 Maybe you meant: ${suggestion}`));
      else
        console.log(
          chalk.yellowBright(`🤷 No clue what "${attempt}" was supposed to be.`)
        );
    } else {
      console.log(
        chalk.greenBright(
          `✅ Command "${attempt}" exists — but maybe broken or misconfigured.`
        )
      );
      console.log(chalk.redBright(`💀 ${insult}`));
    }

    // 🪵 9️⃣ Log
    LogManager.log({
      command: attempt,
      insult,
      suggestion,
      severity: config.severity,
      language: config.language,
      installed: commandExists,
      timestamp: new Date().toISOString(),
    });
  });
