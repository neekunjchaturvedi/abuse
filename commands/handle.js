import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import * as fuzz from "fuzzball";
import { TemplateEngine } from "../core/templateEngine.js";
import { LogManager } from "../core/logManager.js";
import { loadConfig } from "../core/configManager.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // --- Load custom typo map ---
    const commonCommandsPath = path.join(
      __dirname,
      "../data/common/commands.json"
    );

    let commonMap = {};
    if (fs.existsSync(commonCommandsPath)) {
      try {
        commonMap = JSON.parse(fs.readFileSync(commonCommandsPath, "utf8"));
      } catch {
        console.error(chalk.red("⚠️ Failed to parse commands.json"));
      }
    }

    // --- Collect system commands ---
    let allCommands = [];

    try {
      const compgen = execSync("compgen -c", { shell: "/bin/bash" }).toString();
      allCommands = compgen.split("\n").filter((cmd) => cmd.trim() !== "");
    } catch {
      console.error(chalk.red("⚠️ Failed to fetch system commands."));
    }

    // Add PATH binaries
    const pathDirs = process.env.PATH.split(":");
    for (const dir of pathDirs) {
      try {
        const files = fs.readdirSync(dir);
        allCommands.push(...files);
      } catch {}
    }

    allCommands = [...new Set(allCommands)];

    // --- Determine if command exists ---
    let commandExists = false;
    try {
      execSync(`which ${baseCommand}`, { stdio: "ignore" });
      commandExists = true;
    } catch {
      commandExists = false;
    }

    // --- Template insult ---
    const engine = new TemplateEngine(
      config.severity,
      config.insult_style,
      config.language
    );
    const insult = engine.generateInsult();

    // --- Custom suggestion (override priority) ---
    const customSuggestion = commonMap[baseCommand] || "";

    // --- System suggestion ---
    let systemSuggestion = "";
    if (allCommands.length > 0) {
      const results = fuzz.extract(baseCommand, allCommands, {
        scorer: fuzz.partial_ratio,
      });

      if (results.length > 0) {
        const [match, score] = results[0];
        const threshold = baseCommand.length <= 3 ? 40 : 60;

        if (score >= threshold && match) {
          systemSuggestion = match;
        }
      }
    }

    // --- Output ---
    if (!commandExists) {
      console.log(chalk.redBright(`💀 ${insult}`));
      console.log(
        chalk.redBright(`❌ Command "${baseCommand}" is not installed.`)
      );

      if (customSuggestion && systemSuggestion)
        console.log(
          chalk.greenBright(
            `💡 Maybe you meant: ${customSuggestion} or ${systemSuggestion} (system)`
          )
        );
      else if (customSuggestion)
        console.log(
          chalk.greenBright(`💡 Maybe you meant: ${customSuggestion}`)
        );
      else if (systemSuggestion)
        console.log(
          chalk.greenBright(`💡 Maybe you meant: ${systemSuggestion}`)
        );
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
    }

    // --- Logging ---
    LogManager.log({
      command: attempt,
      insult,
      suggestion: customSuggestion || systemSuggestion,
      severity: config.severity,
      language: config.language,
      installed: commandExists,
      timestamp: new Date().toISOString(),
    });
  });
