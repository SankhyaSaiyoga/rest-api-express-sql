require('dotenv').config();

const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PORT,
  MYSQL_PASSWORD,
  MYSQL_DBNAME,
  MYSQL_DIALECT
} = process.env;

module.exports = {
  "development": {
    "username": MYSQL_USER,
    "password": MYSQL_PASSWORD,
    "database": MYSQL_DBNAME,
    "host": MYSQL_HOST,
    "dialect": MYSQL_DIALECT,
    "port": MYSQL_PORT
  },
  "test": {
    "username": MYSQL_USER,
    "password": MYSQL_PASSWORD,
    "database": MYSQL_DBNAME,
    "host": MYSQL_HOST,
    "dialect": MYSQL_DIALECT,
    "port": MYSQL_PORT
  },
  "production": {
    "username": MYSQL_USER,
    "password": MYSQL_PASSWORD,
    "database": MYSQL_DBNAME,
    "host": MYSQL_HOST,
    "dialect": MYSQL_DIALECT,
    "port": MYSQL_PORT
  }
}
