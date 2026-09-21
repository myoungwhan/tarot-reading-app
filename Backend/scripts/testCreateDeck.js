const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function test() {
  const baseURL = 'http://localhost/api/decks';
  console.log('Testing Deck Creation Endpoint on', baseURL);

  // Test 1: Validation failure on missing name
  try {
    await axios.post(baseURL, { description: 'Missing name test' });
    console.error('Test 1 Failed: Expected 400 error for missing name');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('Test 1 Passed: Correctly returned 400 on missing name');
    } else {
      console.error('Test 1 Failed with unexpected error:', err.response ? err.response.data : err.message);
    }
  }

  // Test 2: Create deck with JSON & card initialization
  try {
    const deckName = `Test Deck ${Date.now()}`;
    const res = await axios.post(baseURL, {
      name: deckName,
      description: 'A test deck with 78 seeded cards',
      image_url: 'https://tarot-card.b-cdn.net/cards/card_1_1754133097332.jpg',
      initialize_cards: true
    });
    console.log('Test 2 Passed: Deck created with ID:', res.data.id, 'name:', res.data.name);

    // Verify cards count across all categories
    const majorCardsRes = await axios.get(`http://localhost/api/cards?deck_id=${res.data.id}&category=major`);
    const wandsRes = await axios.get(`http://localhost/api/cards?deck_id=${res.data.id}&category=minor.arcana.wands`);
    const cupsRes = await axios.get(`http://localhost/api/cards?deck_id=${res.data.id}&category=minor.arcana.cups`);
    const swordsRes = await axios.get(`http://localhost/api/cards?deck_id=${res.data.id}&category=minor.arcana.swords`);
    const pentaclesRes = await axios.get(`http://localhost/api/cards?deck_id=${res.data.id}&category=minor.arcana.pentacles`);

    console.log(`Test 2 Verified Counts: Major=${majorCardsRes.data.length} (expected 22), Wands=${wandsRes.data.length} (14), Cups=${cupsRes.data.length} (14), Swords=${swordsRes.data.length} (14), Pentacles=${pentaclesRes.data.length} (14)`);
    const total = majorCardsRes.data.length + wandsRes.data.length + cupsRes.data.length + swordsRes.data.length + pentaclesRes.data.length;
    console.log(`Test 2 Total Verified: ${total} cards (expected 78)`);
  } catch (err) {
    console.error('Test 2 Failed:', err.response ? err.response.data : err.message);
  }

  // Test 3: Multipart Form upload with an actual image file
  try {
    const dummyImagePath = path.join(__dirname, 'dummy.png');
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(dummyImagePath, pngBuffer);

    const formData = new FormData();
    formData.append('name', `Upload Deck ${Date.now()}`);
    formData.append('description', 'Deck created via multipart file upload');
    formData.append('initialize_cards', 'false');
    const blob = new Blob([pngBuffer], { type: 'image/png' });
    formData.append('image_file', blob, 'test_cover.png');

    const uploadRes = await axios.post(baseURL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Test 3 Passed: Upload deck created with ID:', uploadRes.data.id, 'image_url:', uploadRes.data.image_url);

    // Check if uploaded image is accessible
    const imgCheck = await axios.get(uploadRes.data.image_url);
    console.log('Test 3 Verified: Uploaded image served successfully with status', imgCheck.status);

    // Verify uninitialized deck has 0 cards
    const emptyCardsRes = await axios.get(`http://localhost/api/cards?deck_id=${uploadRes.data.id}`);
    console.log('Test 3 Verified: Cards count for uninitialized deck =', emptyCardsRes.data.length, '(expected 0)');

    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
  } catch (err) {
    console.error('Test 3 Failed:', err.response ? err.response.data : err.message);
  }
}

test();
