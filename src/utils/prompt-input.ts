import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// let i = 0;
// let histories = [];
// let alreadyListen = false;
export default async function promptInput(question: string) {
  let rl = readline.createInterface({ input, output });

  // if (!alreadyListen) {
  //   input.on("keypress", (c, k) => {
  //     if (k.name == "up") {
  //       if (i < histories.length - 1) {
  //         i++;
  //       }
  //       rl.write(null, { ctrl: true, name: "u" });
  //       rl.write(histories[i] || "");
  //     } else if (k.name == "down") {
  //       if (i > 0) {
  //         i--;
  //       }
  //       rl.write(null, { ctrl: true, name: "u" });
  //       rl.write(histories[i] || "");
  //     }
  //   });
  // }
  // alreadyListen = true;

  const answer = await rl.question(question);
  // histories.unshift(answer);
  rl.close();

  return answer;
}
