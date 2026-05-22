import 'dotenv/config';
import { sequelize } from './sequelize';
import { initModels, type DatabaseModels } from './models';

const models: DatabaseModels = initModels(sequelize);

export { sequelize, models, initModels };
export type { DatabaseModels };
