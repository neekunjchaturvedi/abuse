import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import * as fuzz from "fuzzball";
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

    // --- Load typo map ---
    const commonCommandsPath = path.resolve("./data/common/commands.json");
    let commonMap = {};
    if (fs.existsSync(commonCommandsPath)) {
      try {
        commonMap = JSON.parse(fs.readFileSync(commonCommandsPath, "utf8"));
      } catch {
        console.error(chalk.red("⚠️ Failed to parse commands.json"));
      }
    }

    // --- Collect all possible commands ---
    let allCommands = [];
    try {
      const compgen = execSync("compgen -c", { shell: "/bin/bash" }).toString();
      allCommands = compgen.split("\n").filter(Boolean);
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

    // --- Does command actually exist? ---
    let commandExists = false;
    try {
      execSync(`which ${baseCommand}`, { stdio: "ignore" });
      commandExists = true;
    } catch {
      commandExists = false;
    }

    // --- Generate insult ---
    const engine = new TemplateEngine(
      config.severity,
      config.insult_style,
      config.language
    );
    const insult = engine.generateInsult();

    // --- Suggest similar command ---
    let suggestion = "";

    if (commonMap[baseCommand]) {
      suggestion = commonMap[baseCommand];
    } else {
      const results = fuzz.extract(baseCommand, allCommands, {
        scorer: fuzz.partial_ratio,
      });

      if (results.length > 0) {
        const [match, score] = results[0];

        const threshold = baseCommand.length <= 3 ? 40 : 60;
        if (score >= threshold) suggestion = match;
      }
    }

    // --- Output ---
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
            `🤷 No idea what "${baseCommand}" was supposed to be.`
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

    // --- Logging ---
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
