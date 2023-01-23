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
const sequelize_1 = require("sequelize");
function connectDb(connectOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const { database, username, password, host, dialect } = connectOptions;
        let port = 0;
        if (!connectOptions.port) {
            switch (dialect) {
                case "postgres":
                    port = 5432;
                    break;
                case "mssql":
                    port = 1433;
                    break;
                case "mysql":
                case "mariadb":
                    port = 3306;
                    break;
            }
        }
        else {
            port = connectOptions.port;
        }
        const sequelize = new sequelize_1.Sequelize(database, username, password, {
            host: host || "localhost",
            port,
            dialect,
            logging: false,
        });
        yield sequelize.authenticate();
        return sequelize;
    });
}
exports.default = connectDb;
