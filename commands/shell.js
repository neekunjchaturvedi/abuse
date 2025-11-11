import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import chalk from "chalk";

export const shellCommand = new Command("shell")
  .description("Integrate Abuse into your shell (bash/zsh).")
  .option("--install", "Install the command-not-found handler")
  .option("--uninstall", "Remove the handler")
  .action((opts) => {
    const shell = process.env.SHELL || "";
    const home = os.homedir();

    let rcFile;
    if (shell.includes("bash")) rcFile = path.join(home, ".bashrc");
    else if (shell.includes("zsh")) rcFile = path.join(home, ".zshrc");
    else {
      console.log("⚠️ Unsupported shell. Please use bash or zsh.");
      return;
    }

    const hook = `
# --- Abuse++ command interception ---
command_not_found_handle() {
  abuse handle "$@"
}
# -----------------------------------
`;

    if (opts.install) {
      fs.appendFileSync(rcFile, `\n${hook}`);
      console.log(chalk.green(`✅ Abuse shell hook installed in ${rcFile}`));
      console.log(chalk.yellow("Restart your terminal to activate it."));
    } else if (opts.uninstall) {
      const rcContent = fs.readFileSync(rcFile, "utf8");
      const cleaned = rcContent.replace(hook, "");
      fs.writeFileSync(rcFile, cleaned);
      console.log(chalk.red(`❌ Abuse shell hook removed from ${rcFile}`));
    } else {
      console.log("ℹ️ Use --install or --uninstall");
    }
  });
