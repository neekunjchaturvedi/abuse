#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { execSync } from "child_process";
import { handleCommand } from "../commands/handle.js";
import { testCommand } from "../commands/test.js";
import { configCommand } from "../commands/config.js";
import { logsCommand } from "../commands/logs.js";
import { shellCommand } from "../commands/shell.js";

const program = new Command();

program
  .name("abuse")
  .description("💀 A terminal that roasts you and helps you.")
  .version("0.1.0");

program.addCommand(handleCommand);
program.addCommand(testCommand);
program.addCommand(configCommand);
program.addCommand(logsCommand);
program.addCommand(shellCommand);

// 👇 Catch-all handler for unknown commands
program.arguments("<cmd...>").action((args) => {
  const cmd = args[0];

  try {
    // ✅ Step 1: Check if the command exists on the system
    execSync(`command -v ${cmd}`, { stdio: "ignore", shell: "/bin/bash" });

    // ✅ Step 2: If exists, forward to actual system command
    execSync(args.join(" "), { stdio: "inherit", shell: "/bin/bash" });
  } catch {
    // ❌ Step 3: If not found, roast it
    try {
      execSync(`abuse handle ${cmd}`, { stdio: "inherit" });
    } catch (err) {
      console.error(chalk.red("⚠️ Failed to roast:"), err.message);
    }
  }
});

// 👇 Default message (when no args)
if (!process.argv.slice(2).length) {
  console.log(`
${chalk.bold.red("💀 abuse")} ${chalk.gray("v0.1.0")}
${chalk.yellow("A terminal that roasts you and helps you.")}

${chalk.bold("Usage:")} ${chalk.cyan("abuse <command>")}

${chalk.bold("Try:")}
  ${chalk.cyan("abuse --help")}          ${chalk.gray(
    "Show all available commands"
  )}
  ${chalk.cyan("abuse handle <text>")}   ${chalk.gray("Roast something")}
  ${chalk.cyan("abuse init")}            ${chalk.gray(
    "Initialize a new project"
  )}
  ${chalk.cyan("abuse shell --install")} ${chalk.gray("Add abuse to your PATH")}
`);
  process.exit(0);
}

program.parse(process.argv);
