import fs from "fs-extra";
import path from "path";
import os from "os";

export class LogManager {
  static log(entry) {
    const dir = path.join(os.homedir(), ".abuse");
    const file = path.join(dir, "logs.jsonl");
    fs.ensureDirSync(dir);
    fs.appendFileSync(file, JSON.stringify(entry) + "\n");
  }
}
