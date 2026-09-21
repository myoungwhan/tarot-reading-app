# Add New Decks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Add New Deck" feature enabling admins to create new tarot decks with image upload / URL and optional automatic 78-card standard seeding across both Backend and Frontend.

**Architecture:** A RESTful `POST /api/decks` endpoint handling multipart/form-data via Multer and transactional database inserts with Sequelize, coupled with RTK Query API mutations and a modal form in the React frontend dashboard.

**Tech Stack:** Express, Node.js, Sequelize, Multer, MySQL/PostgreSQL, React 19, Redux Toolkit Query, Tailwind CSS, Vite.

**Spec:** `docs/superpowers/specs/2026-09-21-add-new-decks-design.md`

## Global Constraints
- Node / Express CommonJS for Backend (`routes/deck.js`, `models/`).
- TypeScript / React with Tailwind CSS for Frontend (`Frontend/src/` or `Frontend/`).
- Images saved to `Backend/images/` and served publicly via `/images/`.
- Maintain transaction safety: roll back database changes and delete saved disk images if deck creation fails.

---

### Task 1: Backend Deck Creation Endpoint with Image Upload and Transactional Card Seeding

**Files:**
- Modify: `Backend/routes/deck.js`
- Test: `Backend/scripts/testCreateDeck.js` (scratch verification script)

**Interfaces:**
- Consumes: `Deck` model from `../models/deck`, `Card` model from `../models/card`, `sequelize` instance from `../models/index`.
- Produces: `POST /api/decks` endpoint returning 201 with created `Deck` object or 400/500 error JSON.

- [ ] **Step 1: Write verification test script**

Create `Backend/scripts/testCreateDeck.js` to send a test request verifying deck creation, card count verification, and validation failure when name is missing.

```javascript
const axios = require('axios');

async function test() {
  const baseURL = 'http://localhost:5000/api/decks';
  console.log('Testing Deck Creation Endpoint...');

  // Test 1: Validation failure on missing name
  try {
    await axios.post(baseURL, { description: 'Missing name test' });
    console.error('Test 1 Failed: Expected 400 error for missing name');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('Test 1 Passed: Correctly returned 400 on missing name');
    } else {
      console.error('Test 1 Failed with unexpected error:', err.message);
    }
  }

  // Test 2: Create deck with card initialization
  try {
    const res = await axios.post(baseURL, {
      name: `Test Deck ${Date.now()}`,
      description: 'A test deck with 78 seeded cards',
      image_url: 'https://tarot-card.b-cdn.net/cards/card_1_1754133097332.jpg',
      initialize_cards: true
    });
    console.log('Test 2 Passed: Deck created with ID:', res.data.id);

    // Verify cards count
    const cardsRes = await axios.get(`http://localhost:5000/api/cards?deck_id=${res.data.id}&category=major`);
    console.log('Test 2 Verified: Major Arcana cards count =', cardsRes.data.length);
  } catch (err) {
    console.error('Test 2 Failed:', err.response ? err.response.data : err.message);
  }
}

test();
```

- [ ] **Step 2: Implement Multer upload and POST / endpoint in `Backend/routes/deck.js`**

Implement:
1. Multer diskStorage setup pointing to `../images`.
2. Move `module.exports = router;` to the bottom of the file.
3. Handle `POST /` with `upload.single('image_file')`:
   - Validate `name` (required, trimmed).
   - Set `image_url` from uploaded file or fallback URL.
   - Transactional creation with `Deck.create` and, if `initialize_cards !== false` and `initialize_cards !== 'false'`, bulk create 22 Major Arcana + 56 Minor Arcana cards.
   - Error handling with disk cleanup (`fs.unlinkSync`).

- [ ] **Step 3: Run test script to verify endpoint passes**

Run: `node scripts/testCreateDeck.js` (with backend server running).
Expected: Test 1 passes (400 on missing name), Test 2 passes (Deck created and 22 major cards returned).

- [ ] **Step 4: Commit**

```bash
git add Backend/routes/deck.js
git commit -m "feat(backend): implement POST /api/decks with image upload and card seeding"
```

---

### Task 2: Frontend RTK Query API Extension

**Files:**
- Modify: `Frontend/services/api.ts`

**Interfaces:**
- Consumes: Existing `tarotApi` in `Frontend/services/api.ts`.
- Produces: `useCreateDeckMutation` hook.

- [ ] **Step 1: Update `TarotDeck` interface and add `createDeck` endpoint**

In `Frontend/services/api.ts`:
- Ensure `TarotDeck` type includes `image_url`, `total_cards`, `major_arcana`, `minor_arcana`, `description`.
- Add `createDeck` mutation to `endpoints`:
```typescript
createDeck: builder.mutation<TarotDeck, FormData>({
  query: (formData) => ({
    url: 'decks/',
    method: 'POST',
    body: formData,
  }),
  invalidatesTags: ['Deck'],
}),
```
- Export `useCreateDeckMutation`.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm --prefix Frontend run build` or `npx --prefix Frontend tsc --noEmit`.
Expected: Successful compile with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add Frontend/services/api.ts
git commit -m "feat(frontend): add createDeck mutation to tarotApi"
```

---

### Task 3: Create AddDeckModal Component

**Files:**
- Create: `Frontend/components/AddDeckModal.tsx`

**Interfaces:**
- Consumes: `useCreateDeckMutation` from `@/services/api`.
- Produces: `AddDeckModal` React component with props `{ isOpen: boolean; onClose: () => void }`.

- [ ] **Step 1: Implement `AddDeckModal.tsx`**

Features:
- Modal backdrop with click-outside and escape key to close.
- Name input (required).
- Description textarea (optional).
- Image source toggle: "File Upload" (file input with preview) or "Image URL" (text input with preview).
- Active status toggle switch (default: true).
- "Initialize with standard 78 cards" checkbox (default: true).
- Form submission with `useCreateDeckMutation` using `FormData`.
- Loading spinner on submit button, error alert banner if creation fails.
- Clean reset on cancel or successful submission.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx --prefix Frontend tsc --noEmit`.
Expected: Successful compile with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add Frontend/components/AddDeckModal.tsx
git commit -m "feat(frontend): create AddDeckModal component"
```

---

### Task 4: Integrate AddDeckModal into AdminHome Dashboard

**Files:**
- Modify: `Frontend/pages/AdminHome.tsx`

**Interfaces:**
- Consumes: `AddDeckModal` from `@/components/AddDeckModal`.
- Produces: Updated AdminHome page with "+ Add New Deck" button and dynamic deck list update.

- [ ] **Step 1: Add modal state and trigger button to `AdminHome.tsx`**

- Add `const [isAddModalOpen, setIsAddModalOpen] = useState(false);`.
- In the header, add a styled "+ Add New Deck" button next to "Deck Management".
- Update subtext to "Manage the activation status and card information of the tarot decks."
- Render `<AddDeckModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />`.

- [ ] **Step 2: Verify TypeScript compilation and Vite build**

Run: `npm --prefix Frontend run build`.
Expected: Build succeeds cleanly.

- [ ] **Step 3: Commit**

```bash
git add Frontend/pages/AdminHome.tsx
git commit -m "feat(frontend): integrate AddDeckModal into AdminHome"
```

---

### Task 5: End-to-End Verification & Documentation

**Files:**
- Cleanup / Docs: `docs/superpowers/plans/2026-09-21-add-new-decks.md`

- [ ] **Step 1: End-to-End System Test**
- Verify deck creation via API and UI.
- Verify file uploads are stored in `Backend/images/` and accessible over HTTP.
- Verify seeded cards appear under `/admin/:deck_id` for both Major Arcana and Minor Arcana suits.
- Verify card initialization disabled creates a deck with 0 cards.

- [ ] **Step 2: Final commit**

```bash
git add .
git commit -m "feat: complete add new decks feature implementation"
```
