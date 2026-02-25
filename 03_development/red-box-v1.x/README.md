# Old School RPG Game 🎲⚔️

**A faithful recreation of the classic 1980s Dungeons & Dragons Basic Set**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/yourusername/old-school-rpg)
[![License](https://img.shields.io/badge/license-Educational-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Beta-yellow.svg)](https://github.com/yourusername/old-school-rpg)

---

## 📖 About

Old School RPG Game is a browser-based, single-player recreation of the legendary 1981 Dungeons & Dragons Basic Set. Experience authentic tabletop RPG gameplay with faithful implementations of THAC0 combat, spell casting, dungeon exploration, and character progression—all in a beautifully designed, nostalgic interface.

**Live Demo**: [Play Now](#) *(Coming Soon)*

---

## ✨ Features

### Character Creation
- 🎭 **7 Playable Classes**: Fighter, Cleric, Magic-User, Thief, Elf, Dwarf, Halfling
- 🎲 **Classic 3d6 Rolling**: Authentic ability score generation
- ⚡ **Instant Calculations**: Auto-computed HP, AC, THAC0, and saving throws
- 🧙 **Spell Selection**: Choose starting spells for spellcasters

### Adventure System
- 🏰 **3 Complete Adventures**: 
  - Your First Adventure (Tutorial)
  - The Goblin Warren
  - The Haunted Crypt
- 🗺️ **Dungeon Mapping**: Visual grid-based exploration
- 💬 **DM Narration**: Immersive storytelling throughout
- 🔦 **Light & Darkness**: Torches, lanterns, and infravision mechanics

### Combat
- ⚔️ **Turn-Based Combat**: Faithful THAC0 system
- 🎯 **Initiative Rolls**: D6-based combat order
- ✨ **Spell Casting**: Use spells in combat and exploration
- 🏃 **Tactical Options**: Attack, defend, flee, or use items
- 🎵 **Sound Effects**: Procedural audio for hits, spells, and victories

### Game Systems
- 🔮 **10 Level 1 Spells**: Magic Missile, Light, Cure Light Wounds, and more
- 🐉 **10 Unique Monsters**: From goblins to rust monsters
- 💰 **Treasure & Loot**: Gold, potions, and equipment
- 🛡️ **Equipment Management**: Track items and inventory
- 💾 **Auto-Save**: Progress automatically saved to browser storage

---

## 🎮 How to Play

### Quick Start

1. **Create Your Character**
   - Roll ability scores (3d6 in order)
   - Choose from 7 classic classes
   - Select alignment and starting spell (if applicable)
   - Name your hero

2. **Choose Your Adventure**
   - Start with the Tutorial for new players
   - Try The Goblin Warren for combat focus
   - Challenge The Haunted Crypt for undead encounters

3. **Explore the Dungeon**
   - Navigate room by room
   - Search for traps and treasure
   - Manage light sources
   - Rest to recover HP and spells

4. **Engage in Combat**
   - Roll initiative each round
   - Attack with weapons or spells
   - Tactical options: defend or flee
   - Defeat all monsters to win

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/old-school-rpg.git
cd old-school-rpg

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Production Build

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

### Deploy

The project is a static web application and can be deployed to:
- **Netlify**: Drop the `/dist` folder
- **Vercel**: Connect your repository
- **GitHub Pages**: Deploy from `/dist`
- **Any static host**: Upload `/dist` contents

---

## 🛠️ Technology Stack

**Frontend**:
- React 18.2.0
- React Router 6.x
- Vite 5.x (build tool)
- JavaScript ES2020+
- CSS3 with custom properties

**Game Systems**:
- Context API (state management)
- localStorage (persistence)
- Web Audio API (sound effects)

**No Backend Required**: Fully client-side application

---

## 📁 Project Structure

```
old-school-rpg/
├── src/
│   ├── components/          # React components
│   │   ├── adventure/       # Dungeon exploration
│   │   ├── character/       # Character creation
│   │   ├── combat/          # Combat system
│   │   ├── common/          # Reusable UI
│   │   ├── layout/          # Page layouts
│   │   └── tools/           # Dice roller, bestiary
│   ├── contexts/            # State management
│   │   ├── CharacterContext.jsx
│   │   └── AdventureContext.jsx
│   ├── data/                # Game data
│   │   ├── classes.js       # Character classes
│   │   ├── monsters.js      # Monster stats
│   │   ├── spells.js        # Spell definitions
│   │   └── *Adventure.js    # Adventure modules
│   ├── utils/               # Game logic
│   │   ├── combat.js
│   │   ├── dice.js
│   │   ├── spells.js
│   │   └── calculations.js
│   ├── styles/              # Global styles
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── docs/                    # Documentation
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎯 Game Mechanics

### Character Classes

| Class | Hit Die | Prime Requisite | Special Abilities |
|-------|---------|-----------------|-------------------|
| Fighter | d8 | Strength | Best attack progression |
| Cleric | d6 | Wisdom | Turn undead, divine spells |
| Magic-User | d4 | Intelligence | Arcane spells |
| Thief | d4 | Dexterity | Thief skills, backstab |
| Elf | d6 | INT & STR | Fighter/MU combo, infravision |
| Dwarf | d8 | Strength | Detect traps, infravision |
| Halfling | d6 | DEX & STR | Stealth, missile bonus |

### Combat System

**THAC0** (To Hit Armor Class 0):
- Level 1 characters: THAC0 19
- Roll 1d20 + bonuses ≥ (THAC0 - target AC)
- Natural 20 always hits
- Strength modifies melee damage
- Dexterity modifies AC

### Spell Casting

**Level 1 Spellcasters**:
- 1 spell slot per day
- Choose starting spell at creation
- Rest to restore spell slots
- Cast in combat or exploration

**Available Spells**:
- Cure Light Wounds, Detect Evil, Light, Protection from Evil
- Magic Missile, Shield, Sleep, Detect Magic
- *(Charm Person and Read Magic coming in future versions)*

---

## 📚 Documentation

- **[User Requirements](docs/USER_REQUIREMENTS_v0.1.0.md)** - Complete feature list
- **[System Design](docs/SYSTEM_DESIGN_v0.1.0.md)** - Architecture overview
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE_v0.1.0.md)** - Code structure
- **[Testing Documentation](docs/TESTING_DOCUMENTATION_v0.1.0.md)** - Test coverage
- **[Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP_v0.1.0.md)** - Future plans

---

## 🗺️ Roadmap

### Version 0.1.0 (Current) ✅
- ✅ 7 character classes
- ✅ 3 complete adventures
- ✅ 10 monsters
- ✅ Turn-based combat
- ✅ Spell system
- ✅ Save/load system

### Version 0.2.0 (March 2026) 🔜
- 📁 Trapper Keeper binder-style UI
- 📑 Tabbed navigation system
- 🎨 Enhanced vintage aesthetics

### Version 0.3.0 (April 2026)
- 🏘️ Town of Threshold hub
- 🛒 Shops and services
- 🏨 Inn for rest and recovery
- 💰 Economy system

### Version 0.4.0 (May 2026)
- 🏰 B1: In Search of the Unknown
- 🗺️ 40+ room mega-dungeon
- 🎲 Procedural elements

### Future Versions
- 🎮 B2-B9 classic adventure modules
- 👥 NPC interaction system
- 🐉 Expanded bestiary (50+ monsters)
- ⬆️ Character leveling (2-3)
- 🎪 More adventures and content

---

## 🤝 Contributing

Contributions are welcome! This is an educational project recreating classic D&D mechanics.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features (when testing framework is added)
- Update documentation
- Keep commits atomic and descriptive

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Browser and version

---

## 📝 Version History

### v0.1.0 (February 23, 2026) - Beta Release
- Initial public release
- 7 character classes
- 3 adventures
- Full combat and spell system
- Save/load functionality

---

## 📜 License

This project is for **educational purposes only**. It is a fan recreation of the classic Dungeons & Dragons Basic Set ruleset.

**Dungeons & Dragons** is a trademark of Wizards of the Coast LLC.

This project is not affiliated with, endorsed by, or sponsored by Wizards of the Coast.

**Educational Use License**:
- ✅ Use for learning and education
- ✅ Modify for personal projects
- ✅ Share with attribution
- ❌ Commercial use prohibited
- ❌ Not for resale or distribution

---

## 🙏 Acknowledgments

- **TSR/Wizards of the Coast** - Original D&D Basic Set
- **Tom Moldvay** - D&D Basic Rules (1981)
- **Gary Gygax & Dave Arneson** - Creating D&D
- Classic adventure module authors
- The OSR (Old School Renaissance) community

---

## 📧 Contact

**Project Maintainer**: [Your Name]  
**Email**: your.email@example.com  
**GitHub**: [@yourusername](https://github.com/yourusername)  
**Project Link**: https://github.com/yourusername/old-school-rpg

---

## ⭐ Show Your Support

If you enjoy this project, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code
- 📢 Sharing with friends

---

## 🎲 Roll for Initiative!

Ready to begin your adventure? Create a character and explore the dungeon!

```bash
npm install
npm run dev
# Visit http://localhost:5173
```

**May your dice roll high!** 🎲✨

---

*Built with ❤️ by fans of classic D&D*
