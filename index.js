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
const exec_query_1 = __importDefault(require("./utils/exec-query"));
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
            if ("--raw-sql" in options || "-r" in options) {
                let rawSql = (options["--raw-sql"] || options["-r"]).trim();
                yield (0, exec_query_1.default)(rawSql, sequelize);
                yield sequelize.close();
            }
            else {
                yield (0, repl_1.default)(`${database} > `, (answer) => __awaiter(this, void 0, void 0, function* () {
                    let sql = "";
                    try {
                        const sqlOrCmd = answer.toLowerCase().trim();
                        if (sqlOrCmd == "show databases" || sqlOrCmd == "show database") {
                            let showDatabaseSql = "";
                            if (dialect == "postgres") {
                                showDatabaseSql = "select datname database_name from pg_database";
                            }
                            else if (dialect == "mssql") {
                                showDatabaseSql = "select name database_name from sys.databases";
                            }
                            const results = yield sequelize.query(showDatabaseSql, {
                                type: sequelize_1.QueryTypes.SELECT,
                            });
                            (0, console_table_printer_1.printTable)(results);
                        }
                        else if (sqlOrCmd == "show tables" || sqlOrCmd == "show table") {
                            let showTableSql = "";
                            if (dialect == "postgres") {
                                showTableSql =
                                    "select schemaname schema_name, tablename table_name from pg_catalog.pg_tables";
                            }
                            else if (dialect == "mssql") {
                                showTableSql =
                                    "select schema_name(schema_id) as schema_name, name table_name from sys.tables";
                            }
                            const results = yield sequelize.query(showTableSql, {
                                type: sequelize_1.QueryTypes.SELECT,
                            });
                            (0, console_table_printer_1.printTable)(results);
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
                        else if (sqlOrCmd == "exit" ||
                            sqlOrCmd == "\\q" ||
                            sqlOrCmd == "quit") {
                            yield sequelize.close();
                        }
                        else {
                            sql += sqlOrCmd;
                            if (sql.endsWith(";")) {
                                yield (0, exec_query_1.default)(sql, sequelize);
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
        }
        catch (err) {
            console.error(err.message);
        }
    });
}
main();
