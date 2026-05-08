# Changelog
All notable changes to the Red Box RPG project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.1] - 2026-04-29

### Bug Fixes
- 🐛 **Fixed Combat Victory State Bug**: Resolved issue where combat victory message would get stuck on screen after defeating monsters in certain rooms
  - Root cause: Monster instances created inline in room definitions were not being registered in the module's instance lookup table
  - Solution: Moved inline monster instance creation to pre-defined MONSTERS object in level definition files
  - Affected: Quasqueton B1 Module (Room 34 Giant Lizard)
  - Impact: Combat now properly ends and returns to exploration for all monster encounters

### Added
- ✨ **Home Page Enhancement**: Added "Travel to Threshold" feature card
  - Allows players to visit the Town of Threshold from the home page
  - Character validation ensures player has created a character before accessing town
  - Improves navigation flow and player guidance
  - Includes MapPin icon and green ink styling to match UI theme

### Changed
- 📝 **Monster Instance Architecture**: Standardized monster instance registration in dungeon modules
  - All monster instances now pre-defined in MONSTERS object for consistency
  - Improved instance lookup reliability in combat system
  - Better pattern for future adventure module development

---

## [0.1.0] - 2026-02-23

### 🎉 Initial Beta Release - "Red Box Edition"

The first public beta release of Red Box RPG, featuring a faithful recreation of the classic 1980s Dungeons & Dragons Basic Set.

#### Added
- ✨ **Character Creation System**
  - 7 playable classes (Fighter, Cleric, Magic-User, Thief, Elf, Dwarf, Halfling)
  - Classic 3d6 ability score rolling
  - Automatic stat calculations (HP, AC, THAC0, saving throws)
  - Alignment selection (Lawful, Neutral, Chaotic)
  - Spell selection for spellcasters
  - Character naming and summary

- ⚔️ **Combat System**
  - Turn-based THAC0 combat
  - Initiative rolls (1d6)
  - Player actions: Attack, Cast Spell, Defend, Flee, Use Item
  - Enemy AI with morale checks
  - Critical hits (natural 20) and fumbles (natural 1)
  - Darkness penalties (-4 attack without light)

- 🔮 **Spell System**
  - 10 level 1 spells implemented
  - 8 fully functional spells (Cure Light Wounds, Detect Evil, Light, Protection from Evil, Magic Missile, Shield, Sleep, Detect Magic)
  - 2 spells pending future features (Charm Person, Read Magic)
  - Spell casting in both combat and exploration
  - Spell slot management and restoration

- 🗺️ **Adventure System**
  - 3 complete adventures:
    - Your First Adventure (Tutorial, 5 rooms)
    - The Goblin Warren (5 rooms)
    - The Haunted Crypt (4 rooms)
  - Room-based dungeon exploration
  - Grid-based dungeon maps
  - Directional movement system

- 🐉 **Monster Bestiary**
  - 10 unique monsters:
    - Goblin (1 HD)
    - Giant Rat (1/2 HD)
    - Skeleton (1 HD)
    - Zombie (2 HD)
    - Giant Snake (2 HD)
    - Orc (1 HD)
    - Rust Monster (5 HD)
    - Stirge (1 HD)
    - Kobold (1/2 HD)
    - Hobgoblin (1+1 HD)
  - Individual monster tactics and behaviors
  - Special abilities (sleep, rust metal)

- 🔦 **Light & Darkness System**
  - Light source tracking (torches, lanterns, Light spell)
  - Turn-based duration (6 turns per torch)
  - Infravision for Dwarves and Elves (60 feet)
  - Darkness penalties for combat and trap detection
  - Visual warnings when in darkness

- 🎒 **Item & Equipment System**
  - Class-specific starting equipment
  - Consumable items (healing potions, torches, rations)
  - Tool items (thieves' tools, rope, lanterns)
  - Item usage in combat and exploration
  - Inventory management

- 🛡️ **Trap System**
  - Hidden traps in rooms
  - Class-based detection (Thief 100%, Dwarf 100%, Others 16.7%)
  - Darkness penalties for detection (75% reduction)
  - Trap damage and descriptions

- 💾 **Save/Load System**
  - Auto-save to browser localStorage
  - Character persistence across sessions
  - Adventure state persistence
  - Version-checked data compatibility
  - Automatic migration for incompatible saves

- 🛌 **Rest Mechanic**
  - Rest once per adventure
  - HP restoration (1d4 + CON modifier)
  - Full spell slot restoration
  - Ration consumption

- 🔊 **Sound System**
  - Procedural sound effects (Web Audio API)
  - Hit, miss, spell, heal, victory, defeat sounds
  - Volume control
  - Enable/disable toggle

- 🎲 **Tools**
  - Dice roller (d4, d6, d8, d10, d12, d20)
  - Bestiary reference
  - Monster stat blocks

- 🖼️ **User Interface**
  - Three-panel adventure layout
  - Narration panel with DM text
  - Map display with room states
  - Action panel with available actions
  - Combat UI with turn tracking
  - Adventure selection menu
  - Character manager
  - Modal dialogs for items and spells

#### Technical
- React 18.2.0 component architecture
- React Router 6.x for navigation
- Context API for state management
- Vite 5.x build system
- Web Audio API for sounds
- localStorage for persistence
- Responsive CSS design
- No backend required

#### Documentation
- Complete user requirements
- System design document
- Technical architecture
- Testing documentation (35 manual test cases, all passing)
- Implementation roadmap
- README with installation guide
- .gitignore for version control

#### Known Limitations
- Level 1 characters only (no leveling)
- 2 spells not yet functional (Charm Person, Read Magic)
- No town hub (planned for v0.3.0)
- No NPC interactions (planned for v0.5.0)
- Desktop-focused (mobile optimization planned)
- 10 monsters only (expansion planned for v0.6.0)

#### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

#### Performance
- Initial load: < 3 seconds
- Runtime: 60fps UI
- Memory usage: < 100MB
- Auto-save: Instant

---

## Future Releases

### [0.2.0] - Planned for March 2026
**Trapper Keeper UI**
- Complete UI redesign with binder-style navigation
- Tabbed interface (Character, Adventures, Town, Tools, Settings)
- Page-flip animations
- Vintage 1980s aesthetic

### [0.3.0] - Planned for April 2026
**Town of Threshold**
- Town hub with 8 locations
- Shops (General Store, Blacksmith, Magic Shop)
- Services (Inn, Temple, Guild Hall)
- Economy system

### [0.4.0] - Planned for May 2026
**B1: In Search of the Unknown**
- 40+ room mega-dungeon
- Procedural elements
- Advanced exploration

### [1.0.0] - Planned for November 2026
**Full Version 1.0**
- Complete Basic D&D ruleset
- 5+ adventures (B1-B5)
- 50+ monsters
- Town hub
- NPC interactions
- Character leveling to level 3

---

## Development Team

**Project Lead**: Old School RPG Team  
**Development**: Claude AI (Anthropic) & User  
**Based On**: TSR Dungeons & Dragons Basic Set (1981)

---

## Links

- **Repository**: https://github.com/yourusername/red-box-rpg
- **Documentation**: See `/docs` folder
- **Issues**: https://github.com/yourusername/red-box-rpg/issues
- **Roadmap**: See `/docs/IMPLEMENTATION_ROADMAP_v0.1.0.md`

---

*D&D is a trademark of Wizards of the Coast LLC. This project is not affiliated with or endorsed by Wizards of the Coast.*
