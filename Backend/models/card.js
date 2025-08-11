const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const Deck = require('./deck');

const Card = sequelize.define('Card', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  image_url: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING, allowNull: false },
  deck_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Deck, key: 'id' } },
}, {
  tableName: 'cards',
  timestamps: false,
});

Card.belongsTo(Deck, { foreignKey: 'deck_id' });
Deck.hasMany(Card, { foreignKey: 'deck_id' });

module.exports = Card;
