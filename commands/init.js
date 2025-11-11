import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import os from "os";

export const initCommand = new Command("init") // <— name is required!
  .description("Initialize Abuse in your system")
  .action(() => {
    const abuseDir = path.join(os.homedir(), ".abuse");
    if (!fs.existsSync(abuseDir)) {
      fs.mkdirSync(abuseDir, { recursive: true });
      fs.writeFileSync(
        path.join(abuseDir, "config.json"),
        JSON.stringify(
          {
            language: "en",
            severity: "medium",
            enabled: true,
            insult_style: "sarcastic",
          },
          null,
          2
        )
      );
      console.log(chalk.green("🎉 Abuse project initialized successfully!"));
    } else {
      console.log(chalk.yellow("⚙️ Abuse is already initialized."));
    }
  });
