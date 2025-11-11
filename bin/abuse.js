#!/usr/bin/env node
import { Command } from "commander";
import { handleCommand } from "../commands/handle.js";
import { testCommand } from "../commands/test.js";
import { initCommand } from "../commands/init.js";
import { analyzeCommand } from "../commands/analyze.js";
import { configCommand } from "../commands/config.js";
import { logsCommand } from "../commands/logs.js";
import { execSync } from "child_process";

const program = new Command();

program
  .name("abuse")
  .description("💀 A terminal that roasts you and helps you.")
  .version("0.1.0");

program.addCommand(handleCommand);
program.addCommand(testCommand);
program.addCommand(initCommand);
program.addCommand(analyzeCommand);
program.addCommand(configCommand);
program.addCommand(logsCommand);

// 👇 Catch-all handler for unknown commands
program.arguments("<cmd>").action((cmd) => {
  try {
    execSync(`abuse handle ${cmd}`, { stdio: "inherit" });
  } catch (err) {
    console.error("⚠️ Failed to roast:", err.message);
  }
});

program.parse(process.argv);
