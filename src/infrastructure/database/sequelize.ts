import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from './config/database.config';

const cfg = getDatabaseConfig();

export const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
  host: cfg.host,
  port: cfg.port,
  dialect: cfg.dialect,
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
});
