
const { sequelize } = require('../models/index');
const Deck = require('../models/deck');
const Card = require('../models/card');
const {sampleDecks} = require('../data/sampledecks.js');
const {sampleCards } = require('../data/sampleCards.js');
const User = require('../models/user');
async function seed() {
  try {
    await sequelize.sync();
    // Map sampleDecks fields to Deck model fields
    const decksToCreate = sampleDecks.map(deck => ({
      name: deck.name,
      active: deck.active,
      image_url: deck.image,
      total_cards: deck.totalCards,
      major_arcana: deck.majorArcana,
      minor_arcana: deck.minorArcana,
      description: 'Testing sample Description..',
    }));
    const createdDecks = await Deck.bulkCreate(decksToCreate, { ignoreDuplicates: true, returning: true });
    // console.log('Sample decks seeded successfully.');

    // Dynamic card generation
    const majorArcanaNames = Array.from({ length: 22 }, (_, i) => `Major Arcana ${i + 1}`);
    const minorSuits = ['wands', 'cups', 'swords', 'pentacles'];
    const sampleImage = 'https://tarot-card.b-cdn.net/cards/card_1_1754133097332.jpg';
    let allCards = [];
    for (const deck of await Deck.findAll()) {
      // 22 major arcana
      const majorCards = majorArcanaNames.map(name => ({
        name,
        description: `Description for ${name}`,
        image_url: sampleImage,
        category: 'major',
        deck_id: deck.id,
      }));
      // 56 minor arcana
      const minorCards = minorSuits.flatMap(suit =>
        Array.from({ length: 14 }, (_, i) => ({
          name: `Minor Arcana ${suit} ${i + 1}`,
          description: `Description for Minor Arcana ${suit} ${i + 1}`,
          image_url: sampleImage,
          category: `minor.arcana.${suit}`,
          deck_id: deck.id,
        }))
      );
      allCards = allCards.concat(majorCards, minorCards);
    }
    await Card.bulkCreate(allCards, { ignoreDuplicates: true });

    await User.create({
      username: 'admin',
      password:'$2a$12$2ORfKoqcbX0L5LUshJQYLOb.gLmcTyDLrQBWNcpryj9a9jWSWoX4m'
    })
    console.log('Sample cards seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
