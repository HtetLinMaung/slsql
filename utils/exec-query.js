"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_table_printer_1 = require("console-table-printer");
function execQuery(sql, sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        const starttime = Date.now();
        const [results, meta] = yield sequelize.query(sql.replace(";", ""));
        const duration = (Date.now() - starttime) / 1000;
        if (sql.startsWith("select")) {
            if (results.length) {
                (0, console_table_printer_1.printTable)(results);
            }
        }
        else {
            let message = "Query Ok";
            if (typeof meta == "number") {
                message += `, ${meta} row${meta > 1 ? "s" : ""} affected`;
            }
            else if (meta.rowCount) {
                message += `, ${meta.rowCount} row${meta.rowCount > 1 ? "s" : ""} affected`;
            }
            message += ` (${duration})`;
            console.log(message);
        }
    });
}
exports.default = execQuery;
