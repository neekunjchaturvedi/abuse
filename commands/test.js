import { Command } from "commander";
import chalk from "chalk";
import { TemplateEngine } from "../core/templateEngine.js";

export const testCommand = new Command("test")
  .description("Run a test roast to check setup.")
  .action(() => {
    const engine = new TemplateEngine();
    console.log(chalk.redBright("💀  " + engine.generateInsult()));
  });
