const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost/api';

async function runTests() {
  console.log('Testing Deck Edit & Delete Endpoint on', API_BASE);

  // 1. Get all decks to find a built-in deck
  const decksRes = await axios.get(`${API_BASE}/decks/`);
  const decks = decksRes.data;
  const builtInDeck = decks.find(d => d.name === 'Universal Waite');

  if (builtInDeck) {
    console.log(`Found built-in deck: ID ${builtInDeck.id} (${builtInDeck.name})`);
    try {
      await axios.delete(`${API_BASE}/decks/${builtInDeck.id}`);
      console.error('Test 1 Failed: Expected 403 on deleting built-in deck, but it succeeded!');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('Test 1 Passed: Correctly returned 403 on deleting built-in deck:', err.response.data.error);
      } else {
        console.error('Test 1 Failed with unexpected status:', err.response ? err.response.status : err.message);
        process.exit(1);
      }
    }
  }

  // 2. Create a temporary deck with file upload and 78 cards
  const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const form1 = new FormData();
  const deckName = `EditDelete Test Deck ${Date.now()}`;
  form1.append('name', deckName);
  form1.append('description', 'Deck to be edited and deleted');
  form1.append('active', 'true');
  form1.append('initialize_cards', 'true');
  form1.append('image_file', new Blob([pngBuffer], { type: 'image/png' }), 'cover1.png');

  const createRes = await axios.post(`${API_BASE}/decks/`, form1, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  const createdDeck = createRes.data;
  console.log(`Created test deck: ID ${createdDeck.id}, name: ${createdDeck.name}, image: ${createdDeck.image_url}`);

  // Check cards count
  const cardsRes1 = await axios.get(`${API_BASE}/cards?deck_id=${createdDeck.id}`);
  console.log(`Test deck initialized cards count: ${cardsRes1.data.length} (expected 78)`);
  if (cardsRes1.data.length !== 78) {
    console.error('Test deck did not initialize 78 cards!');
    process.exit(1);
  }

  // 3. Edit the deck: update name, description, active status, and upload new image
  const form2 = new FormData();
  form2.append('name', `${deckName} (Updated)`);
  form2.append('description', 'Updated description');
  form2.append('active', 'false');
  form2.append('image_file', new Blob([pngBuffer], { type: 'image/png' }), 'cover2.png');

  const updateRes = await axios.put(`${API_BASE}/decks/${createdDeck.id}`, form2, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  const updatedDeck = updateRes.data;
  console.log(`Updated test deck: ID ${updatedDeck.id}, name: ${updatedDeck.name}, active: ${updatedDeck.active}, image: ${updatedDeck.image_url}`);
  if (updatedDeck.name !== `${deckName} (Updated)` || updatedDeck.active !== false) {
    console.error('Test 2 Failed: Deck update did not match expected values!');
    process.exit(1);
  }
  console.log('Test 2 Passed: Deck successfully updated via PUT with new image');

  // 4. Delete the test deck
  const deleteRes = await axios.delete(`${API_BASE}/decks/${createdDeck.id}`);
  console.log('Delete response:', deleteRes.data);

  // Verify deck is deleted
  const checkDeckRes = await axios.get(`${API_BASE}/decks/`);
  const found = checkDeckRes.data.find(d => d.id === createdDeck.id);
  if (found) {
    console.error('Test 3 Failed: Deck still exists in database!');
    process.exit(1);
  }

  // Verify associated cards are deleted
  const cardsRes2 = await axios.get(`${API_BASE}/cards?deck_id=${createdDeck.id}`);
  console.log(`Remaining cards for deleted deck: ${cardsRes2.data.length} (expected 0)`);
  if (cardsRes2.data.length !== 0) {
    console.error('Test 3 Failed: Associated cards were not cascade deleted!');
    process.exit(1);
  }

  console.log('Test 3 Passed: Deck and all associated cards were cascade deleted!');
  console.log('All Deck Edit & Delete tests passed successfully!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err.response ? err.response.data : err.message);
  process.exit(1);
});
