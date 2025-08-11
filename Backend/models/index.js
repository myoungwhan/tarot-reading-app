const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' }); // Adjust path if needed

console.log(process.env.MYSQL_USER,"Username");
const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
});

module.exports = { sequelize };
