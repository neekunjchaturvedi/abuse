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
  .allowUnknownOption(true)
  .passThroughOptions(true)
  .argument("<attempt...>", "The mistyped or failed command")
  .description("Handle a mistyped or failed command with humor and help.")
  .action(async (attemptParts) => {
    const attempt = attemptParts.join(" ");
    const config = loadConfig();

    if (!config.enabled) {
      console.log(chalk.gray("⚙️ Abuse is disabled in config."));
      return;
    }

    const baseCommand = attempt.split(" ")[0];

    if (config.exempt_commands.includes(baseCommand)) {
      console.log(
        chalk.gray(`🚫 Command '${baseCommand}' is exempted from roasting.`)
      );
      return;
    }

    // Load common typo map
    const commonCommandsPath = path.resolve("./data/common/commands.json");
    let commonMap = {};
    if (fs.existsSync(commonCommandsPath)) {
      try {
        commonMap = JSON.parse(fs.readFileSync(commonCommandsPath, "utf8"));
      } catch {
        console.error(chalk.red("⚠️ Failed to parse commands.json"));
      }
    }

    // All system commands
    let allCommands = [];
    try {
      const compgenOutput = execSync("compgen -c", {
        shell: "/bin/bash",
      }).toString();
      allCommands = compgenOutput.split("\n").filter(Boolean);
    } catch {
      console.error(chalk.red("⚠️ Failed to fetch system commands."));
    }

    // PATH executables
    const pathDirs = process.env.PATH.split(":");
    for (const dir of pathDirs) {
      try {
        const files = fs.readdirSync(dir);
        allCommands.push(...files);
      } catch {}
    }
    allCommands = [...new Set(allCommands)];

    // Check if command exists (ignoring args)
    let commandExists = false;
    try {
      execSync(`which ${baseCommand}`, { stdio: "ignore" });
      commandExists = true;
    } catch {
      commandExists = false;
    }

    // Generate insult
    const engine = new TemplateEngine(
      config.severity,
      config.insult_style,
      config.language
    );
    const insult = engine.generateInsult();

    // Suggestion logic
    let suggestion = "";

    if (commonMap[baseCommand]) {
      suggestion = commonMap[baseCommand];
    } else {
      const { bestMatch } = stringSimilarity.findBestMatch(
        baseCommand,
        allCommands
      );

      const threshold = baseCommand.length <= 3 ? 0.3 : 0.5;

      if (bestMatch.rating > threshold) {
        suggestion = bestMatch.target;
      }
    }

    // Output
    if (!commandExists) {
      console.log(chalk.redBright(`💀 ${insult}`));
      console.log(
        chalk.redBright(`❌ Command "${baseCommand}" is not installed.`)
      );

      if (suggestion)
        console.log(chalk.greenBright(`💡 Maybe you meant: ${suggestion}`));
      else
        console.log(
          chalk.yellowBright(
            `🤷 No clue what "${baseCommand}" was supposed to be.`
          )
        );
    } else {
      console.log(
        chalk.greenBright(
          `🔍 Command "${baseCommand}" exists — but something went wrong.`
        )
      );
      console.log(chalk.redBright(`💀 ${insult}`));

      if (suggestion && suggestion !== baseCommand)
        console.log(chalk.greenBright(`💡 Did you mean: ${suggestion}?`));
    }

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
