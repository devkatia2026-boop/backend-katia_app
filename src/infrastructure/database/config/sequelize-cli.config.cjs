require('dotenv').config({
  path: require('path').resolve(__dirname, '..', '..', '..', '..', '.env'),
});

const dialect = 'postgres';

const development = {
  username: process.env.DB_USER_LOCAL,
  password: process.env.DB_PASSWORD_LOCAL,
  database: process.env.DB_NAME_LOCAL,
  host: process.env.DB_HOST_LOCAL,
  port: Number(process.env.DB_PORT_LOCAL || 5432),
  dialect,
  logging: false,
};

const production = {
  username: process.env.DB_USER_PROD,
  password: process.env.DB_PASSWORD_PROD,
  database: process.env.DB_NAME_PROD,
  host: process.env.DB_HOST_PROD,
  port: Number(process.env.DB_PORT_PROD || 5432),
  dialect,
  logging: false,
};

module.exports = {
  development,
  production,
  test: development,
};
