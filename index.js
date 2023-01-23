#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connect_db_1 = __importDefault(require("./utils/connect-db"));
const parse_options_1 = __importDefault(require("./utils/parse-options"));
const repl_1 = __importDefault(require("./utils/repl"));
const console_table_printer_1 = require("console-table-printer");
const prompt_input_1 = __importDefault(require("./utils/prompt-input"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const args = process.argv.slice(2);
            const options = (0, parse_options_1.default)(args);
            let database = args[args.length - 1];
            const decodePwd = "--decode-password" in options || false;
            const dialect = options["--dialect"] || options["-d"];
            const username = options["--username"] || options["-u"];
            let password = options["--password"] ||
                options["-p"] ||
                (yield (0, prompt_input_1.default)("Enter password: "));
            const port = options["--port"] ? parseInt(options["--port"]) : 0;
            const host = options["--host"] || options["-h"] || "localhost";
            if (decodePwd) {
                password = Buffer.from(password, "base64").toString("utf-8").trim();
            }
            let sequelize = yield (0, connect_db_1.default)({
                database,
                username,
                password,
                dialect,
                port,
                host,
            });
            let sql = "";
            yield (0, repl_1.default)(`${database} > `, (answer) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const sqlOrCmd = answer.toLowerCase().trim();
                    if (sqlOrCmd == "show databases" || sqlOrCmd == "show database") {
                        if (dialect == "postgres") {
                            const results = yield sequelize.query(`select datname database_name from pg_database`, {
                                type: sequelize_1.QueryTypes.SELECT,
                            });
                            (0, console_table_printer_1.printTable)(results);
                        }
                        else if (dialect == "mssql") {
                            const results = yield sequelize.query(`select name database_name from sys.databases`, {
                                type: sequelize_1.QueryTypes.SELECT,
                            });
                            (0, console_table_printer_1.printTable)(results);
                        }
                    }
                    else if (sqlOrCmd == "show tables" || sqlOrCmd == "show table") {
                        if (dialect == "postgres") {
                            const results = yield sequelize.query(`select schemaname schema_name, tablename table_name from pg_catalog.pg_tables`, {
                                type: sequelize_1.QueryTypes.SELECT,
                            });
                            (0, console_table_printer_1.printTable)(results);
                        }
                        else if (dialect == "mssql") {
                            const results = yield sequelize.query(`select schema_name(schema_id) as schema_name, name table_name from sys.tables`, {
                                type: sequelize_1.QueryTypes.SELECT,
                            });
                            (0, console_table_printer_1.printTable)(results);
                        }
                    }
                    else if (sqlOrCmd.startsWith("use") || sqlOrCmd.startsWith("\\c")) {
                        database = sqlOrCmd
                            .replace("use ", "")
                            .replace("\\c ", "")
                            .split(" ")
                            .filter((t) => t)[0];
                        yield sequelize.close();
                        sequelize = yield (0, connect_db_1.default)({
                            database,
                            username,
                            password,
                            dialect,
                            port,
                            host,
                        });
                    }
                    else if (sqlOrCmd == "exit" || sqlOrCmd == "\\q") {
                        yield sequelize.close();
                    }
                    else {
                        sql += sqlOrCmd;
                        if (sql.endsWith(";")) {
                            const starttime = Date.now();
                            const [results, meta] = yield sequelize.query(sql.replace(";", ""));
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
                                message += ` (${(Date.now() - starttime) / 1000})`;
                                console.log(message);
                            }
                            sql = "";
                        }
                    }
                }
                catch (err) {
                    sql = "";
                    console.error(err.message);
                }
                return `${database} > `;
            }));
        }
        catch (err) {
            console.error(err.message);
        }
    });
}
main();
