const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const AppSettings = sequelize.define('AppSettings', {
  id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
  consultant_youtube_url: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  consultant_youtube_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  querent_youtube_url: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  querent_youtube_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'app_settings',
  timestamps: false,
});

module.exports = AppSettings;
