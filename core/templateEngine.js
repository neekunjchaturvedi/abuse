import fs from "fs-extra";
import path from "path";

export class TemplateEngine {
  constructor(lang = "en", style = "sarcastic") {
    const file = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      "../data/insults",
      lang,
      `${style}.json`
    );

    this.insults = fs.existsSync(file)
      ? fs.readJSONSync(file)
      : ["You absolute genius, that's not even close."];
  }

  generateInsult(severity = "medium", style = "sarcastic") {
    const pool = this.insults;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
