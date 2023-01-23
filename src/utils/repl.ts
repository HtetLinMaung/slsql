import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const histories = [];
let i = 0;

export default async function repl(
  question: string = "> ",
  cb = async (answer) => {
    return null;
  }
) {
  let rl = null;
  let answer = "";
  input.on("keypress", (c, k) => {
    if (k.name == "up") {
      rl.write(null, { ctrl: true, name: "u" });
      rl.write(histories[i] || "");
      if (i < histories.length - 1) {
        i++;
      }
    } else if (k.name == "down") {
      if (i > 0) {
        i--;
      }
      rl.write(null, { ctrl: true, name: "u" });
      rl.write(histories[i] || "");
    }
  });
  do {
    rl = readline.createInterface({ input, output });
    answer = await rl.question(question);
    histories.unshift(answer);
    i = 0;
    question = await cb(answer);
    rl.close();
  } while (answer != "exit" && answer != "\\q" && answer != "quit");
}
