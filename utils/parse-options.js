"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseOptions(args) {
    const options = {};
    let i = 0;
    for (const arg of args) {
        if (arg.startsWith("-")) {
            if (args[i + 1] && !args[i + 1].startsWith("-")) {
                options[arg] = args[i + 1];
            }
            else {
                options[arg] = null;
            }
        }
        i++;
    }
    return options;
}
exports.default = parseOptions;
