#!/usr/bin/env node

import { QueryTypes } from "sequelize";
import connectDb from "./utils/connect-db";
import parseOptions from "./utils/parse-options";
import repl from "./utils/repl";
import { printTable } from "console-table-printer";
import promptInput from "./utils/prompt-input";
import execQuery from "./utils/exec-query";

async function main() {
  try {
    const args = process.argv.slice(2);
    const options = parseOptions(args);
    let database = args[args.length - 1];
    const decodePwd = "--decode-password" in options || false;
    const dialect = options["--dialect"] || options["-d"];
    const username = options["--username"] || options["-u"];
    let password =
      options["--password"] ||
      options["-p"] ||
      (await promptInput("Enter password: "));
    const port = options["--port"] ? parseInt(options["--port"]) : 0;
    const host = options["--host"] || options["-h"] || "localhost";

    if (decodePwd) {
      password = Buffer.from(password, "base64").toString("utf-8").trim();
    }

    let sequelize = await connectDb({
      database,
      username,
      password,
      dialect,
      port,
      host,
    });

    if ("--raw-sql" in options || "-r" in options) {
      let rawSql = (options["--raw-sql"] || options["-r"]).trim();
      await execQuery(rawSql, sequelize);
      await sequelize.close();
    } else {
      await repl(`${database} > `, async (answer: string) => {
        let sql = "";
        try {
          const sqlOrCmd = answer.toLowerCase().trim();
          if (sqlOrCmd == "show databases" || sqlOrCmd == "show database") {
            let showDatabaseSql = "";
            if (dialect == "postgres") {
              showDatabaseSql = "select datname database_name from pg_database";
            } else if (dialect == "mssql") {
              showDatabaseSql = "select name database_name from sys.databases";
            }
            const results = await sequelize.query(showDatabaseSql, {
              type: QueryTypes.SELECT,
            });
            printTable(results);
          } else if (sqlOrCmd == "show tables" || sqlOrCmd == "show table") {
            let showTableSql = "";
            if (dialect == "postgres") {
              showTableSql =
                "select schemaname schema_name, tablename table_name from pg_catalog.pg_tables";
            } else if (dialect == "mssql") {
              showTableSql =
                "select schema_name(schema_id) as schema_name, name table_name from sys.tables";
            }
            const results = await sequelize.query(showTableSql, {
              type: QueryTypes.SELECT,
            });
            printTable(results);
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
          } else if (
            sqlOrCmd == "exit" ||
            sqlOrCmd == "\\q" ||
            sqlOrCmd == "quit"
          ) {
            await sequelize.close();
          } else {
            sql += sqlOrCmd;
            if (sql.endsWith(";")) {
              await execQuery(sql, sequelize);
              sql = "";
            }
          }
        } catch (err) {
          sql = "";
          console.error(err.message);
        }
        return `${database} > `;
      });
    }
  } catch (err) {
    console.error(err.message);
  }
}

main();
