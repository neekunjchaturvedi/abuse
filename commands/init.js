import { Command } from "commander";
import fs from "fs";
import path from "path";

export const initCommand = new Command("init")
  .description("🚀 Initialize a new abuse project in the current directory.")
  .action(() => {
    const configPath = path.join(process.cwd(), "abuse.config.json");
    if (fs.existsSync(configPath)) {
      console.log("⚠️ Project already initialized!");
      return;
    }

    fs.writeFileSync(
      configPath,
      JSON.stringify({ projectName: "my-abuse-app", version: "1.0.0" }, null, 2)
    );
    console.log("🎉 Abuse project initialized successfully!");
  });
