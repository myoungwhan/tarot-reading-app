const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Deck = sequelize.define('Deck', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  active : { type: DataTypes.BOOLEAN, defaultValue: true },
  image_url: { type: DataTypes.STRING },
  total_cards: { type: DataTypes.STRING },
  major_arcana: { type: DataTypes.STRING },
  minor_arcana: { type: DataTypes.STRING },
}, {
  tableName: 'decks',
  timestamps: false,
});

module.exports = Deck;
