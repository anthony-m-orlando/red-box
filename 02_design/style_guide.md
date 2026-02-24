# Red Box: Visual Style Guide & UI Specifications (v1.0)

This style guide defines the aesthetic and functional design language for **Red Box**, focusing on the "Tactile Folder" interface. The goal is to blend 1980s tabletop nostalgia with modern, responsive web fidelity.

---

## 1. The Core Aesthetic: "Trapper Keeper"
The UI must feel like a physical object. Every element should appear as if it is made of paper, cardboard, or plastic tucked into a weathered binder.

### Primary Color Palette
* **Aged Parchment:** `#FDF8F0` (Main page backgrounds)
* **Graph Paper Blue:** `#D1D5DB` (Grid lines and subtle borders)
* **Ink Black:** `#1A1A1A` (Primary text and heavy "Foundation" walls)
* **Faded Red:** `#B91C1C` (Header accents and critical HP alerts)
* **Binder Plastic:** `#374151` (The outer folder shell and tab background)

---

## 2. Typography
Use a combination of "Typewriter" styles for data and "Fantasy" styles for headers.

* **Headers (Tab Titles):** `Cormorant Garamond` or `Spectral` (Serif, Bold)
* **Body/Data:** `Courier Prime` or `JetBrains Mono` (Monospace, mimicking a typewriter)
* **Handwritten Notes:** `Indie Flower` (Used for "Journal" entries and "Penciled-in" inventory changes)

---

## 3. The N-Tab System Architecture
The application layout is centered around a persistent binder shell with interactive tabs.

### Tab Navigation Design
* **Inactive Tabs:** Dark gray, slightly offset to the side.
* **Active Tab:** Shifts forward, matching the color of the "Page" background (`#FDF8F0`).
* **Animation:** Use a slight `transition: transform 0.2s` to simulate a tab being pulled forward.



---

## 4. Map Rendering Fidelity (Sprint 3 Requirements)
To achieve the "Enriched State" for Module B1, the map engine must follow these specific CSS border and texture rules.

### Wall Weighting
* **Foundation Walls (Outer Boundaries):**
    * `border: 4px solid #1A1A1A`
    * Used for the perimeter of the dungeon and major structural pillars.
* **Partition Walls (Interior Room Dividers):**
    * `border: 1px solid #4A4A4A`
    * Used for doors, internal dividers, and corridors.

### Environmental Texturing
* **Stippled Earth:** Apply a noise-filter mask to the area outside of explored corridors to represent solid rock.
* **Grid Scale:** 1 unit (10') = 40px.



---

## 5. UI Components & Elements

### The "Paged" View (Characters Tab)
Within the Characters tab, utilize a horizontal pagination system:
1.  **Page 1 (The Sheet):** 2-column layout. Left for stats, right for saving throws.
2.  **Page 2 (Inventory):** A list with a "Hand-written" font for item names.
3.  **Page 3 (Spells):** Grid-based icons mimicking a classic spellbook.

### Interactive Buttons
Buttons should avoid modern "glossy" looks.
* **Style:** Flat, bordered boxes.
* **Hover:** Background color shifts to a light yellow (`#FEF3C7`) to mimic a highlighter.
* **Click:** Slight `translate-y-1` to simulate physical pressure.

### Fog of War & Lighting
* **Visibility Mask:** Use a `radial-gradient` mask.
* **Center:** Player current coordinates.
* **Falloff:** * `stop-1 (100% opacity)`: 0px to 80px (20ft)
    * `stop-2 (40% opacity)`: 80px to 120px (30ft)
    * `stop-3 (0% opacity)`: 120px+ (Beyond torchlight)

---

## 6. Icons & Imagery
* **Monsters:** High-contrast black and white "ink sketch" style line art for the Bestiary.
* **Items:** Small, pixel-art style icons that fit within the grid of the inventory page.
* **Dice:** Simple 2D geometric shapes (Triangle for d4, Hexagon for d20).

---

## 7. Responsive Breakpoints
* **Desktop:** Full binder view (Tabs on the right).
* **Tablet:** Binder view with tabs collapsed into a "Index" page.
* **Mobile:** Single "Page" view with a bottom-navigation bar mimicking the tab colors.