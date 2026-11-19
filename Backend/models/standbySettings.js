const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const Deck = require('./deck');

const StandbySettings = sequelize.define('StandbySettings', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  deck_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Deck, key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'standby_settings',
  timestamps: false,
});

module.exports = StandbySettings;
