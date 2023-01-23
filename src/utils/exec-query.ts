import { printTable } from "console-table-printer";
import { Sequelize } from "sequelize";

export default async function execQuery(sql: string, sequelize: Sequelize) {
  const starttime = Date.now();
  const [results, meta] = await sequelize.query(sql.replace(";", ""));
  const duration = (Date.now() - starttime) / 1000;
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
    message += ` (${duration})`;
    console.log(message);
  }
}
