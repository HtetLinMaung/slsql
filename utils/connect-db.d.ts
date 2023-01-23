import { Dialect, Sequelize } from "sequelize";
export interface ConnectOptions {
    database: string;
    username: string;
    password: string;
    host?: string;
    port?: number;
    dialect: Dialect;
}
export default function connectDb(connectOptions: ConnectOptions): Promise<Sequelize>;
