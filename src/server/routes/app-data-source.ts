import "reflect-metadata"
// import { DataSource } from "typeorm"
// import { CopiaBroker } from "../entities/copia-broker.entity";


//const nodeUrl = 'bouquet.claro.amx:1521/ARNEWS.WORLD'
//const nodeUrl = process.env.DBCP_NEWS_NOTMGR_URL;
//bouquet.claro.amx:1521/ARNEWS.WORLD

const nodeUrl = process.env.DBCP_NEWS_NOTMGR_URL || 'bouquet.claro.amx:1521/ARNEWS.WORLD';

// export const dataSource = new DataSource({
//   host: nodeUrl!.split(':')[0],
//   port: Number(nodeUrl!.split(':')[1].split('/')[0]),
//   type: 'oracle',
//   username: process.env.DBCP_NEWS_NOTMGR_USERNAME,
//   password: process.env.DBCP_NEWS_NOTMGR_PASSWORD,
//   schema: process.env.DBCP_NEWS_NOTMGR_SCHEMA,
//   entities: [CopiaBroker],
//   migrations: [],
//   subscribers: [],
//   serviceName: nodeUrl!.split('/')[1],
// });
