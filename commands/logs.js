import { Command } from "commander";
import fs from "fs";
import path from "path";

export const logsCommand = new Command("logs")
  .description("🪵 Show or clear abuse CLI logs.")
  .option("--clear", "Clear the logs")
  .action((options) => {
    const logFile = path.join(process.cwd(), "abuse.log");

    if (options.clear) {
      if (fs.existsSync(logFile)) {
        fs.unlinkSync(logFile);
        console.log("🧹 Logs cleared!");
      } else {
        console.log("⚠️ No logs to clear.");
      }
      return;
    }

    if (!fs.existsSync(logFile)) {
      console.log("📭 No logs found.");
      return;
    }

    const logs = fs.readFileSync(logFile, "utf-8");
    console.log("📜 Logs:\n", logs);
  });
