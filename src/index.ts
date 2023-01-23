#!/usr/bin/env node

import { QueryTypes } from "sequelize";
import connectDb from "./utils/connect-db";
import parseOptions from "./utils/parse-options";
import repl from "./utils/repl";
import { printTable } from "console-table-printer";
import promptInput from "./utils/prompt-input";

async function main() {
  try {
    const args = process.argv.slice(2);
    const options = parseOptions(args);
    let database = args[args.length - 1];
    const dialect = options["--dialect"] || options["-d"];
    const username = options["--username"] || options["-u"];
    const password =
      options["--password"] ||
      options["-p"] ||
      (await promptInput("Enter password: "));
    const port = options["--port"] ? parseInt(options["--port"]) : 0;
    const host = options["--host"] || options["-h"] || "localhost";

    let sequelize = await connectDb({
      database,
      username,
      password,
      dialect,
      port,
      host,
    });
    let sql = "";
    await repl(`${database} > `, async (answer: string) => {
      try {
        const sqlOrCmd = answer.toLowerCase().trim();
        if (sqlOrCmd == "show databases" || sqlOrCmd == "show database") {
          if (dialect == "postgres") {
            const results = await sequelize.query(
              `select datname database_name from pg_database`,
              {
                type: QueryTypes.SELECT,
              }
            );
            printTable(results);
          } else if (dialect == "mssql") {
            const results = await sequelize.query(
              `select name database_name from sys.databases`,
              {
                type: QueryTypes.SELECT,
              }
            );
            printTable(results);
          }
        } else if (sqlOrCmd == "show tables" || sqlOrCmd == "show table") {
          if (dialect == "postgres") {
            const results = await sequelize.query(
              `select schemaname schema_name, tablename table_name from pg_catalog.pg_tables`,
              {
                type: QueryTypes.SELECT,
              }
            );
            printTable(results);
          } else if (dialect == "mssql") {
            const results = await sequelize.query(
              `select schema_name(schema_id) as schema_name, name table_name from sys.tables`,
              {
                type: QueryTypes.SELECT,
              }
            );
            printTable(results);
          }
        } else if (sqlOrCmd.startsWith("use") || sqlOrCmd.startsWith("\\c")) {
          database = sqlOrCmd
            .replace("use ", "")
            .replace("\\c ", "")
            .split(" ")
            .filter((t) => t)[0];
          await sequelize.close();
          sequelize = await connectDb({
            database,
            username,
            password,
            dialect,
            port,
            host,
          });
        } else if (sqlOrCmd == "exit" || sqlOrCmd == "\\q") {
          await sequelize.close();
        } else {
          sql += sqlOrCmd;
          if (sql.endsWith(";")) {
            const starttime = Date.now();
            const [results, meta] = await sequelize.query(sql.replace(";", ""));
            if (sql.startsWith("select")) {
              if (results.length) {
                printTable(results);
              }
            } else {
              let message = "Query Ok";

              if (typeof meta == "number") {
                message += `, ${meta} row${meta > 1 ? "s" : ""} affected`;
              } else if ((meta as any).rowCount) {
                message += `, ${(meta as any).rowCount} row${
                  (meta as any).rowCount > 1 ? "s" : ""
                } affected`;
              }
              message += ` (${(Date.now() - starttime) / 1000})`;
              console.log(message);
            }
            sql = "";
          }
        }
      } catch (err) {
        sql = "";
        console.error(err.message);
      }
      return `${database} > `;
    });
  } catch (err) {
    console.error(err.message);
  }
}

main();
