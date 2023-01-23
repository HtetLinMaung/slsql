import { Sequelize } from "sequelize";
export default function execQuery(sql: string, sequelize: Sequelize): Promise<void>;
