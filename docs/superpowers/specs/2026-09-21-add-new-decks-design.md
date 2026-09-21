# Add New Decks Feature Design Specification

## 1. Overview
The goal of this feature is to allow Tarot app administrators to create new Tarot decks from the Admin dashboard. A new deck can have custom metadata (name, description, active status, cover image) and can optionally be initialized with the standard 78 tarot cards (22 Major Arcana and 56 Minor Arcana across 4 suits) with default placeholder records so they are immediately accessible in the "Manage Cards" view and interactive readings.

---

## 2. Requirements & User Stories
- **User Story**: As an administrator, I want to create a new tarot deck with a custom name, description, and cover image (via file upload or image URL) so that I can expand the deck collection available in the system.
- **Card Initialization**: As an administrator, I want an option to automatically seed the 78 standard tarot cards for the newly created deck so that I can immediately manage cards and conduct readings with the new deck without manual card-by-card bootstrapping.
- **Dynamic Updates**: Once added, the deck should appear instantly in the Admin deck management grid and be factored into system statistics.

---

## 3. Architecture & Data Flow

```
[ Frontend: AdminHome.tsx ] 
       │ (Clicks "+ Add New Deck")
       ▼
[ AddDeckModal.tsx ] 
       │ (Submits FormData: name, description, image_file | image_url, initialize_cards, active)
       ▼
[ RTK Query: createDeck mutation ]
       │ POST /api/decks (multipart/form-data)
       ▼
[ Backend: routes/deck.js ]
       │ 1. Multer intercepts file upload -> stores in Backend/images/deck_<timestamp>.<ext>
       │ 2. Sequelize Transaction starts:
       │    ├── Insert Deck record into 'decks' table
       │    └── If initialize_cards is true:
       │         Bulk insert 78 cards into 'cards' table (deck_id = newDeck.id)
       │ 3. Commit transaction
       │    (On error: rollback transaction, unlink uploaded image file if any)
       ▼
[ Response: 201 Created (deck JSON) ]
       ▼
[ Frontend: RTK Query invalidates 'Deck' tag ]
       │ Automatically refetches GET /api/decks
       ▼
[ AdminHome updates deck list & closes modal ]
```

---

## 4. Backend Specification

### 4.1. File: `Backend/routes/deck.js`
- **Route**: `POST /`
- **Middleware**:
  - `multer` disk storage saving to `Backend/images/`:
    - Filename pattern: `deck_${Date.now()}_${path.extname(file.originalname)}`
- **Input Parameters**:
  - `name` (string, required): Deck title. Stripped of surrounding whitespace. If empty or missing, respond with `400 Bad Request` `{ error: 'Deck name is required' }`.
  - `description` (string, optional): Description of the deck.
  - `active` (boolean / string, optional): Default `true`. String `'true'` or `'false'` parsed appropriately.
  - `image_file` (file, optional): Uploaded cover image.
  - `image_url` (string, optional): External URL if no `image_file` is provided. If neither is provided, use default placeholder image URL (`https://tarot-card.b-cdn.net/cards/card_1_1754133097332.jpg`).
  - `initialize_cards` (boolean / string, optional): Default `true`.
- **Card Seeding Logic (when `initialize_cards` is true)**:
  - Total cards count string: `"Chapter 78"`
  - Major Arcana count string: `"Chapter XXII"`
  - Minor Arcana count string: `"Chapter fifty-six"`
  - 22 Major Arcana cards:
    - Names: `"Major Arcana 1"` through `"Major Arcana 22"`
    - Category: `"major"`
    - Description: `"Description for Major Arcana X"`
    - Image: Default sample card image
    - Deck ID: `newDeck.id`
  - 56 Minor Arcana cards:
    - 4 suits: `wands`, `cups`, `swords`, `pentacles`
    - 14 cards per suit: `"Minor Arcana [suit] 1"` through `"Minor Arcana [suit] 14"`
    - Category: `"minor.arcana.[suit]"`
    - Description: `"Description for Minor Arcana [suit] X"`
    - Image: Default sample card image
    - Deck ID: `newDeck.id`
  - When `initialize_cards` is false:
    - `total_cards`: `"0"`, `major_arcana`: `"0"`, `minor_arcana`: `"0"`.
- **Transaction & Rollback**:
  - `await sequelize.transaction(async (t) => { ... })`
  - If any error occurs:
    - If `req.file` was written, `fs.unlinkSync(req.file.path)` is invoked to delete the orphaned image.
    - Return `500 Internal Server Error` `{ error: 'Failed to create deck' }`.
- **Route Export Structure**:
  - Move `module.exports = router;` to the very bottom of `routes/deck.js` to ensure clean route ordering and export.

---

## 5. Frontend Specification

### 5.1. File: `Frontend/services/api.ts`
- Extend `tarotApi` with:
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

### 5.2. File: `Frontend/components/AddDeckModal.tsx`
- **Props**:
  - `isOpen: boolean`
  - `onClose: () => void`
- **Form Fields**:
  - `name`: Text input (required)
  - `description`: Textarea (optional)
  - `imageSourceType`: Toggle between `'file'` and `'url'` (default: `'file'`)
    - If `'file'`: `<input type="file" accept="image/*" />` with preview
    - If `'url'`: Text input for image URL with preview
  - `active`: Toggle switch (default: `true`)
  - `initializeCards`: Checkbox *"Initialize with standard 78 cards (22 Major & 56 Minor Arcana)"* (default: `true`)
- **Submission State**:
  - Disabled submit button with spinner when `isLoading` is true.
  - Error message alert box if submission errors.
  - On success: resets form fields and triggers `onClose()`.

### 5.3. File: `Frontend/pages/AdminHome.tsx`
- Add "+ Add New Deck" button in the header section.
- Mount `AddDeckModal` passing `isOpen={isAddModalOpen}` and `onClose={() => setIsAddModalOpen(false)}`.
- Update text from "of the five tarot decks" to "of the tarot decks".
- Decks grid and system stats automatically reflect the new deck via RTK Query tag invalidation.

---

## 6. Error Handling & Edge Cases
1. **Empty/Whitespace Deck Name**: Backend returns `400 Bad Request`. Frontend performs client-side validation before sending.
2. **Missing Image**: If neither a file nor a URL is provided, fallback to default placeholder image so deck display never breaks.
3. **Database Failure during Card Seeding**: The transaction rolls back completely; no partial deck is created and any uploaded image file is deleted from disk.
4. **Non-Image File Upload**: Multer or frontend file validation restricts accepted extensions to `.jpg, .jpeg, .png, .webp`.

---

## 7. Verification Plan
1. **Backend API Verification**:
   - `POST /api/decks` with valid JSON / URL only -> verifies 201 response, deck in DB.
   - `POST /api/decks` with multipart/form-data and file upload -> verifies file saved in `Backend/images/`, correct `image_url` returned.
   - `POST /api/decks` with `initialize_cards: true` -> verifies 78 cards created with correct categories.
   - `POST /api/decks` with missing name -> verifies 400 response.
2. **Frontend UI Verification**:
   - Open Admin Home, verify "+ Add New Deck" button is present.
   - Open modal, test switching between File Upload and Image URL.
   - Create a new deck with file upload and 78 cards enabled -> verify modal closes, deck card renders in grid with status active and 78 cards.
   - Click "Manage Cards" on new deck -> verify `/admin/:deck_id` loads with all 22 Major Arcana and Minor Arcana cards in their respective suits.
