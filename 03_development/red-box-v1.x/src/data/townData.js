/**
 * townData.js
 * Town of Threshold — NPC definitions, dialogue trees, and location metadata.
 *
 * DIALOGUE TREE FORMAT
 * --------------------
 * Each node: {
 *   id:       string     — unique node identifier
 *   npc:      string     — NPC key (matches npcRoster key)
 *   text:     string     — what the NPC says
 *   options:  Array<{
 *     label:    string   — button text shown to player
 *     requires: object   — optional gate: { gold, attitude, class, visitCount, hasRumors }
 *     effect:   object   — optional side effect: { type, ...params }
 *     next:     string   — next node id, or null to close dialogue
 *   }>
 * }
 *
 * ATTITUDE SYSTEM
 * ---------------
 * Starts at 'neutral' for all NPCs. Shifts to 'friendly' or 'hostile'
 * based on player choices. Persists in TownContext.npcAttitudes.
 * Friendly NPCs give discounts or bonus options; hostile NPCs refuse service.
 */

// ---------------------------------------------------------------------------
// LOCATION DEFINITIONS
// ---------------------------------------------------------------------------
// Used by TownScreen.jsx to render the SVG map and LocationCard components.
// `coords` are relative positions within the 600×500 SVG town map canvas.

export const townLocations = [
  {
    id: 'threshold_arms',
    name: 'The Threshold Arms',
    shortName: 'The Inn',
    icon: '🏨',
    description: 'A sprawling two-storey inn with a sign showing a red dragon ' +
                 'curled around a tankard. The common room smells of woodsmoke ' +
                 'and roasted meat.',
    npcId: 'innkeeper',
    services: ['rest', 'rumors', 'hirelings'],
    coords: { x: 300, y: 420 },  // bottom-center of map
    mapLabel: 'INN'
  },
  {
    id: 'general_store',
    name: 'Threshold Provisioners',
    shortName: 'General Store',
    icon: '🛒',
    description: 'A cluttered but well-stocked shop with sacks of provisions, ' +
                 'coils of rope, and bundles of torches hanging from the rafters.',
    npcId: 'shopkeeper',
    services: ['shop'],
    shopId: 'general_store',
    coords: { x: 110, y: 340 },
    mapLabel: 'STORE'
  },
  {
    id: 'blacksmith',
    name: 'Halvard\'s Forge',
    shortName: 'Blacksmith',
    icon: '⚔️',
    description: 'The rhythmic clang of hammer on iron echoes into the street. ' +
                 'Halvard\'s workshop is hot, smoky, and full of fine weapons.',
    npcId: 'blacksmith',
    services: ['shop', 'repair'],
    shopId: 'blacksmith',
    coords: { x: 120, y: 200 },
    mapLabel: 'SMITH'
  },
  {
    id: 'mages_tower',
    name: 'The Arcanist\'s Tower',
    shortName: 'Mage\'s Tower',
    icon: '🔮',
    description: 'A narrow stone tower leaning slightly to one side. ' +
                 'Faint blue light flickers behind a shuttered upper window.',
    npcId: 'wizard',
    services: ['shop', 'identify'],
    shopId: 'mages_tower',
    coords: { x: 480, y: 180 },
    mapLabel: 'TOWER'
  },
  {
    id: 'temple',
    name: 'Temple of the Light',
    shortName: 'Temple',
    icon: '⛪',
    description: 'A modest stone temple with a carved sunburst above the door. ' +
                 'The smell of incense drifts through the open doors.',
    npcId: 'priest',
    services: ['healing', 'bless', 'resurrection'],
    coords: { x: 380, y: 340 },
    mapLabel: 'TEMPLE',
    isResurrectionPoint: true,
    resurrectionCoords: { x: 10, y: 10 }   // B1 grid coordinates
  },
  {
    id: 'town_hall',
    name: 'Threshold Town Hall',
    shortName: 'Town Hall',
    icon: '📜',
    description: 'A sturdy building flying the town banner. Inside, a clerk ' +
                 'manages the adventure board, banking, and character registrations.',
    npcId: 'clerk',
    services: ['adventure_board', 'bank', 'registration'],
    coords: { x: 490, y: 340 },
    mapLabel: 'HALL'
  },
  {
    id: 'guild_hall',
    name: 'The Adventurers\' Guild',
    shortName: 'Guild Hall',
    icon: '🏛️',
    description: 'A building marked with the crossed-sword-and-staff emblem ' +
                 'of the Adventurers\' Guild. Members receive special benefits.',
    npcId: 'guild_master',
    services: ['class_quests', 'guild_membership'],
    coords: { x: 480, y: 50 },
    mapLabel: 'GUILD'
  }
];

/**
 * Get a location definition by id.
 */
export function getTownLocation(id) {
  return townLocations.find(l => l.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// NPC ROSTER
// ---------------------------------------------------------------------------

export const npcRoster = {
  innkeeper: {
    id: 'innkeeper',
    name: 'Marta Ashford',
    title: 'Innkeeper',
    description: 'A broad-shouldered woman in her fifties with calloused hands ' +
                 'and a no-nonsense expression that softens when you spend money.',
    portrait: '👩',
    location: 'threshold_arms',
    defaultAttitude: 'neutral',
    attitudeShifts: {
      // Actions that shift attitude
      tipped_well:       +1,   // internal point system; 2 = friendly, -2 = hostile
      underpaid:         -1,
      rude_dialogue:     -1,
      returned_alive:    +1,   // +1 each time you come back from a successful run
    }
  },
  shopkeeper: {
    id: 'shopkeeper',
    name: 'Oswin Burrows',
    title: 'Merchant',
    description: 'A cheerful halfling with ink-stained fingers who seems to ' +
                 'have a price memorized for everything in the shop.',
    portrait: '🧑',
    location: 'general_store',
    defaultAttitude: 'neutral',
    attitudeShifts: {
      large_purchase:    +1,
      haggled_too_hard:  -1,
      returned_alive:    +1
    }
  },
  blacksmith: {
    id: 'blacksmith',
    name: 'Halvard Ironhand',
    title: 'Master Blacksmith',
    description: 'A towering dwarf with a singed beard and arms like tree trunks. ' +
                 'He speaks rarely but judges everyone by what they carry.',
    portrait: '👨',
    location: 'blacksmith',
    defaultAttitude: 'neutral',
    attitudeShifts: {
      bought_quality_gear: +1,
      bought_silver:       +1,
      returned_alive:      +1
    }
  },
  wizard: {
    id: 'wizard',
    name: 'Vethara',
    title: 'Arcanist',
    description: 'A lean elf woman of indeterminate age, with silver-streaked ' +
                 'hair and an unsettling habit of finishing your sentences.',
    portrait: '🧝',
    location: 'mages_tower',
    defaultAttitude: 'neutral',
    attitudeShifts: {
      shared_knowledge:    +1,
      disrespected_magic:  -1,
      identified_item:     +1
    }
  },
  priest: {
    id: 'priest',
    name: 'Brother Ealdric',
    title: 'Temple Priest',
    description: 'A gentle but resolute man who has tended this temple for ' +
                 'twenty years. He asks no questions about where your wounds came from.',
    portrait: '👴',
    location: 'temple',
    defaultAttitude: 'friendly',   // starts friendly — the temple is a refuge
    attitudeShifts: {
      generous_donation:   +1,
      minimum_donation:    -1,
      resurrection_tithe:   0    // neutral — he expected it
    }
  },
  clerk: {
    id: 'clerk',
    name: 'Aldous Fenwick',
    title: 'Town Clerk',
    description: 'A meticulous man with small spectacles and a large ledger. ' +
                 'Clearly wishes adventurers would make appointments.',
    portrait: '🧑',
    location: 'town_hall',
    defaultAttitude: 'neutral',
    attitudeShifts: {
      registered_on_return: +1,
      made_deposit:          +1
    }
  },
  guild_master: {
    id: 'guild_master',
    name: 'Commander Thyra',
    title: 'Guild Master',
    description: 'A scarred veteran fighter who runs the guild with military ' +
                 'efficiency. She has seen a hundred adventurers come and go — ' +
                 'most of them in boxes.',
    portrait: '⚔️',
    location: 'guild_hall',
    defaultAttitude: 'neutral',
    attitudeShifts: {
      completed_quest:   +2,
      failed_quest:      -1,
      joined_guild:      +1
    }
  }
};

// ---------------------------------------------------------------------------
// DIALOGUE TREES
// ---------------------------------------------------------------------------
// Organized by NPC. NPCDialogue.jsx traverses these by node id.
// `requires` gates are evaluated against:
//   { character, townState, attitude }
// `effect` objects are handled by TownContext dispatch or navigation.

export const dialogueTrees = {

  // -------------------------------------------------------------------------
  // INNKEEPER — Marta Ashford
  // -------------------------------------------------------------------------
  innkeeper: {
    entry: 'innkeeper_greeting',
    nodes: {
      innkeeper_greeting: {
        id: 'innkeeper_greeting',
        text: (attitude) => attitude === 'friendly'
          ? 'Back again! The usual room? I\'ve kept it warm for you.'
          : attitude === 'hostile'
          ? 'What do you want. Make it quick.'
          : 'Welcome to the Threshold Arms. What can I do for you, traveller?',
        options: [
          {
            label: 'I need a room for the night (5 GP)',
            requires: { gold: 5 },
            effect: { type: 'rest', cost: 5, location: 'threshold_arms' },
            next: 'innkeeper_rested'
          },
          {
            label: 'Have you heard any rumors lately?',
            requires: { hasRumors: true },
            next: 'innkeeper_rumors'
          },
          {
            label: 'I\'m looking to hire some help.',
            next: 'innkeeper_hirelings'
          },
          {
            label: 'I\'d like to store some items.',
            next: 'innkeeper_storage'
          },
          {
            label: 'Nothing for now. Goodbye.',
            next: null
          }
        ]
      },

      innkeeper_rested: {
        id: 'innkeeper_rested',
        text: 'I\'ll have Aldric show you to your room. Hot water and fresh ' +
              'straw — best sleep you\'ll have this side of Quasqueton.',
        effect: { type: 'attitude_shift', npc: 'innkeeper', delta: 0 },
        options: [
          { label: 'Thank you. Goodnight.', next: null }
        ]
      },

      innkeeper_no_gold: {
        id: 'innkeeper_no_gold',
        text: 'Five gold pieces for the room. I run an inn, not a charity.',
        options: [
          { label: 'I\'ll come back when I have the coin.', next: null }
        ]
      },

      innkeeper_rumors: {
        id: 'innkeeper_rumors',
        text: 'Aye, there\'s always talk around here. Sit down — I\'ll tell ' +
              'you what I\'ve heard about that fortress to the north.',
        effect: { type: 'deliver_rumors' },  // TownContext renders activeRumors
        options: [
          {
            label: 'Tell me more about Rogahn and Zelligar.',
            next: 'innkeeper_lore_rogahn'
          },
          {
            label: 'Thank you. That\'s useful.',
            effect: { type: 'attitude_shift', npc: 'innkeeper', delta: 1 },
            next: null
          }
        ]
      },

      innkeeper_lore_rogahn: {
        id: 'innkeeper_lore_rogahn',
        text: 'Rogahn was a fighter of great renown — never lost a duel, ' +
              'they say. Zelligar was his companion, a wizard of some power. ' +
              'They built that stronghold in the hills and used it as a base ' +
              'for years. Then one day they marched north to fight in some war ' +
              '— and neither one came back. That was... fifteen years ago, perhaps.',
        options: [
          {
            label: 'And no one has explored it since?',
            next: 'innkeeper_lore_explored'
          },
          {
            label: 'Interesting. Thank you.',
            next: null
          }
        ]
      },

      innkeeper_lore_explored: {
        id: 'innkeeper_lore_explored',
        text: 'Oh, plenty have tried. Few came back. Those that did were ' +
              'either raving mad or suspiciously wealthy — and not talking. ' +
              'I\'d say it\'s full of monsters now, and whatever those two ' +
              'left behind is still down there waiting.',
        options: [
          { label: 'That\'s all I needed to know.', next: null }
        ]
      },

      innkeeper_hirelings: {
        id: 'innkeeper_hirelings',
        text: 'Aye, there\'s always folk looking for work in a town like this. ' +
              'Some are reliable, some aren\'t. What sort of help are you after?',
        options: [
          {
            label: 'Show me who\'s available.',
            effect: { type: 'open_hireling_panel' },
            next: null
          },
          {
            label: 'Never mind.',
            next: null
          }
        ]
      },

      innkeeper_storage: {
        id: 'innkeeper_storage',
        text: 'I keep a locked strongbox in the back. Five copper a day ' +
              'per item — and I\'m not responsible for anything left more ' +
              'than a month.',
        options: [
          {
            label: 'Open my strongbox.',
            effect: { type: 'open_storage' },
            next: null
          },
          {
            label: 'No thanks.',
            next: null
          }
        ]
      }
    }
  },

  // -------------------------------------------------------------------------
  // SHOPKEEPER — Oswin Burrows
  // -------------------------------------------------------------------------
  shopkeeper: {
    entry: 'shopkeeper_greeting',
    nodes: {
      shopkeeper_greeting: {
        id: 'shopkeeper_greeting',
        text: (attitude) => attitude === 'friendly'
          ? 'Ah, my favourite customer! Come to restock? I\'ve got everything you need.'
          : attitude === 'hostile'
          ? 'I remember you. Pay upfront this time.'
          : 'Good day! Looking for supplies? I\'ve got the best prices in Threshold — ' +
            'and probably the only prices, come to think of it.',
        options: [
          {
            label: 'Let me see what you have.',
            effect: { type: 'open_shop', shopId: 'general_store' },
            next: null
          },
          {
            label: 'Do you have healing potions?',
            next: 'shopkeeper_potions'
          },
          {
            label: 'Just browsing.',
            next: null
          }
        ]
      },

      shopkeeper_potions: {
        id: 'shopkeeper_potions',
        text: 'Ruby-red vials, genuine article — one hundred gold pieces each. ' +
              'I know that sounds like a lot, but when you\'re bleeding out in ' +
              'a dungeon corridor, you\'ll wish you\'d bought two.',
        options: [
          {
            label: 'I\'ll take a look at your full stock.',
            effect: { type: 'open_shop', shopId: 'general_store' },
            next: null
          },
          {
            label: 'Too rich for my blood.',
            next: null
          }
        ]
      }
    }
  },

  // -------------------------------------------------------------------------
  // BLACKSMITH — Halvard Ironhand
  // -------------------------------------------------------------------------
  blacksmith: {
    entry: 'blacksmith_greeting',
    nodes: {
      blacksmith_greeting: {
        id: 'blacksmith_greeting',
        text: (attitude) => attitude === 'friendly'
          ? 'You\'re back. In one piece, too. What do you need?'
          : attitude === 'hostile'
          ? '...'
          : 'Halvard grunts without looking up from the anvil. After a moment ' +
            'he sets down his hammer and eyes your equipment with professional disdain.',
        options: [
          {
            label: 'I\'d like to buy some equipment.',
            effect: { type: 'open_shop', shopId: 'blacksmith' },
            next: null
          },
          {
            label: 'I need my armor repaired.',
            next: 'blacksmith_repair'
          },
          {
            label: 'I\'m looking for a silver weapon.',
            next: 'blacksmith_silver'
          },
          {
            label: 'Just looking.',
            next: null
          }
        ]
      },

      blacksmith_repair: {
        id: 'blacksmith_repair',
        text: 'Let me see it. ... Aye, this will need work. I can have it ' +
              'ready before dawn. Cost depends on the damage.',
        options: [
          {
            label: 'Repair my armor (10 GP)',
            requires: { gold: 10 },
            effect: { type: 'repair_armor', cost: 10 },
            next: 'blacksmith_repair_done'
          },
          {
            label: 'That\'s too expensive.',
            next: null
          }
        ]
      },

      blacksmith_repair_done: {
        id: 'blacksmith_repair_done',
        text: 'Come back at dawn. It\'ll be ready.',
        options: [
          { label: 'Thank you.', next: null }
        ]
      },

      blacksmith_silver: {
        id: 'blacksmith_silver',
        text: 'Silver weapons. Aye, I can do that — costs more than iron, ' +
              'of course. You\'re going after something specific, are you? ' +
              'Lycanthrope, maybe. Or undead that can\'t be touched by common steel.',
        options: [
          {
            label: 'Show me your silver stock.',
            effect: { type: 'open_shop', shopId: 'blacksmith', filter: 'silver' },
            next: null
          },
          {
            label: 'Just a precaution.',
            next: null
          }
        ]
      }
    }
  },

  // -------------------------------------------------------------------------
  // WIZARD — Vethara
  // -------------------------------------------------------------------------
  wizard: {
    entry: 'wizard_greeting',
    nodes: {
      wizard_greeting: {
        id: 'wizard_greeting',
        text: (attitude, character) => {
          const isArcane = ['magic-user', 'elf'].includes(character?.class);
          if (attitude === 'friendly') {
            return isArcane
              ? 'Ah. You again. I\'ve been expecting you — not that I\'m prescient, ' +
                'it\'s simply that you have the look of someone who needs something.'
              : 'Back again. You have survived longer than most. That is... notable.';
          }
          if (attitude === 'hostile') {
            return 'I am very busy. State your business quickly.';
          }
          return isArcane
            ? 'Another practitioner of the Art. Unusual to see your kind in ' +
              'Threshold. The tower is my domain — but for a colleague, I can ' +
              'make certain things available.'
            : 'The tower is not a market stall. However, I do make certain ' +
              'items available to those with... legitimate needs.';
        },
        options: [
          {
            label: 'I\'d like to browse your scrolls.',
            effect: { type: 'open_shop', shopId: 'mages_tower' },
            next: null
          },
          {
            label: 'I need an item identified.',
            next: 'wizard_identify'
          },
          {
            label: 'I\'d like to discuss magic.',
            requires: { classes: ['magic-user', 'elf'] },
            next: 'wizard_arcane_talk'
          },
          {
            label: 'Farewell.',
            next: null
          }
        ]
      },

      wizard_identify: {
        id: 'wizard_identify',
        text: 'Identification is not a trivial matter — it requires preparation ' +
              'and components. One hundred gold pieces per item, and I will have ' +
              'results for you by morning.',
        options: [
          {
            label: 'Identify an item (100 GP)',
            requires: { gold: 100 },
            effect: { type: 'open_identify', cost: 100 },
            next: 'wizard_identify_accepted'
          },
          {
            label: 'Too expensive for now.',
            next: null
          }
        ]
      },

      wizard_identify_accepted: {
        id: 'wizard_identify_accepted',
        text: 'Leave the item with me. I will send word to your inn when ' +
              'the reading is complete.',
        effect: { type: 'attitude_shift', npc: 'wizard', delta: 1 },
        options: [
          { label: 'Very well. Thank you.', next: null }
        ]
      },

      wizard_arcane_talk: {
        id: 'wizard_arcane_talk',
        text: 'Rogahn and Zelligar\'s stronghold? Yes, I knew of Zelligar. ' +
              'A capable conjurer, though his theories on dimensional binding ' +
              'were... adventurous. His workroom will still be intact, most ' +
              'likely. Whatever he left behind should be approached with caution.',
        effect: { type: 'attitude_shift', npc: 'wizard', delta: 1 },
        options: [
          {
            label: 'Do you know anything about the lower level?',
            next: 'wizard_lower_level'
          },
          {
            label: 'Thank you. That\'s useful.',
            next: null
          }
        ]
      },

      wizard_lower_level: {
        id: 'wizard_lower_level',
        text: 'The lower level was Zelligar\'s private sanctum. He experimented ' +
              'there — creature hybrids, mostly. Some of those experiments were ' +
              'still alive when he left. They will not be friendly.',
        options: [
          { label: 'Noted. I\'ll be careful.', next: null }
        ]
      }
    }
  },

  // -------------------------------------------------------------------------
  // PRIEST — Brother Ealdric
  // -------------------------------------------------------------------------
  priest: {
    entry: 'priest_greeting',
    nodes: {
      priest_greeting: {
        id: 'priest_greeting',
        text: (attitude, character, townState) =>
          townState?.templeResurrectionPending
            ? 'You have been returned to us. The Light was merciful. ' +
              'Your companion brought you here — at great cost to themselves, ' +
              'I am afraid. The tithe has been taken, as the Light requires.'
            : attitude === 'friendly'
            ? 'Welcome back, friend. The Light\'s blessing upon you. ' +
              'How may I serve?'
            : 'Welcome, traveller. The temple is open to all who seek healing ' +
              'or blessing. How may I help you?',
        effect: (townState) => townState?.templeResurrectionPending
          ? { type: 'resolve_resurrection' }
          : null,
        options: [
          {
            label: 'I need healing.',
            next: 'priest_healing'
          },
          {
            label: 'I seek a blessing before my journey.',
            next: 'priest_bless'
          },
          {
            label: 'Remove a curse from me.',
            next: 'priest_curse'
          },
          {
            label: 'I\'d like to make a donation.',
            next: 'priest_donation'
          },
          {
            label: 'Go in peace.',
            next: null
          }
        ]
      },

      priest_healing: {
        id: 'priest_healing',
        text: 'Sit here and let me tend to you. I ask only a donation to ' +
              'the temple — whatever you can spare. The Light heals freely; ' +
              'I merely suggest twenty-five gold as a reasonable offering.',
        options: [
          {
            label: 'Donate 25 GP (suggested)',
            requires: { gold: 25 },
            effect: { type: 'temple_service', service: 'cure_light_wounds', donation: 25 },
            next: 'priest_healed'
          },
          {
            label: 'Donate 10 GP',
            requires: { gold: 10 },
            effect: {
              type: 'temple_service',
              service: 'cure_light_wounds',
              donation: 10,
              attitudeShift: { npc: 'priest', delta: -1 }
            },
            next: 'priest_healed_small'
          },
          {
            label: 'I\'m afraid I cannot spare much. (1 GP)',
            requires: { gold: 1 },
            effect: {
              type: 'temple_service',
              service: 'cure_light_wounds',
              donation: 1,
              attitudeShift: { npc: 'priest', delta: -1 }
            },
            next: 'priest_healed_poor'
          },
          {
            label: 'Not right now.',
            next: null
          }
        ]
      },

      priest_healed: {
        id: 'priest_healed',
        text: 'The Light be with you. Your wounds have closed. Travel safely.',
        effect: { type: 'attitude_shift', npc: 'priest', delta: 1 },
        options: [{ label: 'Thank you, Brother.', next: null }]
      },

      priest_healed_small: {
        id: 'priest_healed_small',
        text: 'The Light gives freely, whatever you can offer. ' +
              'Go carefully out there.',
        options: [{ label: 'Thank you.', next: null }]
      },

      priest_healed_poor: {
        id: 'priest_healed_poor',
        text: 'The temple turns no one away. You are healed. ' +
              'Perhaps you might contribute more generously in future.',
        options: [{ label: 'I will. Thank you.', next: null }]
      },

      priest_bless: {
        id: 'priest_bless',
        text: 'A prayer of protection before a dangerous journey — a wise ' +
              'request. I ask a donation of fifty gold pieces to the temple.',
        options: [
          {
            label: 'Donate 50 GP',
            requires: { gold: 50 },
            effect: {
              type: 'temple_service',
              service: 'bless',
              donation: 50,
              attitudeShift: { npc: 'priest', delta: 1 }
            },
            next: 'priest_blessed'
          },
          {
            label: 'That\'s too much right now.',
            next: null
          }
        ]
      },

      priest_blessed: {
        id: 'priest_blessed',
        text: 'Close your eyes. ... The Light\'s protection goes with you. ' +
              'May you return to us safely.',
        options: [{ label: 'Thank you, Brother Ealdric.', next: null }]
      },

      priest_curse: {
        id: 'priest_curse',
        text: 'A curse is no small matter. Removing one requires significant ' +
              'preparation and prayer. I ask two hundred gold pieces — ' +
              'not for myself, but for the temple\'s needs.',
        options: [
          {
            label: 'Donate 200 GP',
            requires: { gold: 200 },
            effect: {
              type: 'temple_service',
              service: 'remove_curse',
              donation: 200,
              attitudeShift: { npc: 'priest', delta: 1 }
            },
            next: 'priest_curse_done'
          },
          {
            label: 'I don\'t have that much.',
            next: null
          }
        ]
      },

      priest_curse_done: {
        id: 'priest_curse_done',
        text: 'It is done. Whatever dark thing bound itself to you has been ' +
              'dispelled. The Light is stronger than any curse.',
        options: [{ label: 'I am grateful.', next: null }]
      },

      priest_donation: {
        id: 'priest_donation',
        text: 'Your generosity is appreciated. Every contribution helps us ' +
              'maintain the temple and serve those in need.',
        options: [
          {
            label: 'Donate 10 GP',
            requires: { gold: 10 },
            effect: { type: 'donation', amount: 10, npc: 'priest', attitudeDelta: 0 },
            next: 'priest_thanked'
          },
          {
            label: 'Donate 50 GP',
            requires: { gold: 50 },
            effect: { type: 'donation', amount: 50, npc: 'priest', attitudeDelta: 1 },
            next: 'priest_thanked_generous'
          },
          {
            label: 'On second thought, not today.',
            next: null
          }
        ]
      },

      priest_thanked: {
        id: 'priest_thanked',
        text: 'Thank you. The Light blesses those who give.',
        options: [{ label: 'Go in peace.', next: null }]
      },

      priest_thanked_generous: {
        id: 'priest_thanked_generous',
        text: 'This is most generous. The temple — and I personally — ' +
              'are grateful. You will always find a welcome here.',
        options: [{ label: 'Thank you, Brother.', next: null }]
      }
    }
  },

  // -------------------------------------------------------------------------
  // TOWN CLERK — Aldous Fenwick
  // -------------------------------------------------------------------------
  clerk: {
    entry: 'clerk_greeting',
    nodes: {
      clerk_greeting: {
        id: 'clerk_greeting',
        text: (attitude) => attitude === 'friendly'
          ? 'Ah, one of the registered adventurers. How can I help you today?'
          : 'This is the Town Hall of Threshold. I manage the adventure board, ' +
            'the public bank, and character registrations. What do you require?',
        options: [
          {
            label: 'Show me the adventure board.',
            effect: { type: 'open_adventure_board' },
            next: null
          },
          {
            label: 'I\'d like to access the bank.',
            next: 'clerk_bank'
          },
          {
            label: 'I\'d like to register as an adventurer.',
            next: 'clerk_register'
          },
          {
            label: 'Nothing today.',
            next: null
          }
        ]
      },

      clerk_bank: {
        id: 'clerk_bank',
        text: 'The public bank offers secure storage of coin. No fees for ' +
              'deposits; withdrawals available during office hours. ' +
              'Current balance will be shown.',
        options: [
          {
            label: 'Deposit gold',
            effect: { type: 'open_bank', mode: 'deposit' },
            next: null
          },
          {
            label: 'Withdraw gold',
            effect: { type: 'open_bank', mode: 'withdraw' },
            next: null
          },
          {
            label: 'Check balance',
            effect: { type: 'open_bank', mode: 'balance' },
            next: null
          },
          {
            label: 'Never mind.',
            next: null
          }
        ]
      },

      clerk_register: {
        id: 'clerk_register',
        text: (_, character) => character?.registeredAdventurer
          ? 'You are already registered. Next of kin on file, legal name recorded. ' +
            'Is there anything else?'
          : 'Registration records your legal name and next of kin. ' +
            'In the event of your death — which, statistically, is likely — ' +
            'it ensures your estate is handled properly.',
        options: [
          {
            label: 'Register me.',
            effect: { type: 'register_adventurer' },
            next: 'clerk_registered'
          },
          {
            label: 'That won\'t be necessary.',
            next: null
          }
        ]
      },

      clerk_registered: {
        id: 'clerk_registered',
        text: 'Done. You are now on record. Try not to make my job ' +
              'harder than it already is.',
        effect: { type: 'attitude_shift', npc: 'clerk', delta: 1 },
        options: [{ label: 'Charming. Goodbye.', next: null }]
      }
    }
  },

  // -------------------------------------------------------------------------
  // GUILD MASTER — Commander Thyra
  // -------------------------------------------------------------------------
  guild_master: {
    entry: 'guild_greeting',
    nodes: {
      guild_greeting: {
        id: 'guild_greeting',
        text: (attitude, character) => {
          if (attitude === 'friendly') {
            return 'Good to see you. You\'ve proven yourself — the guild ' +
                   'considers you an asset. What do you need?';
          }
          if (attitude === 'hostile') {
            return 'You\'ve made enemies here. Think carefully before asking ' +
                   'for favors.';
          }
          return `A ${character?.class ?? 'traveller'}. I\'ve seen your type ` +
                 `before. Most of them are dead now. What do you want?`;
        },
        options: [
          {
            label: 'What contracts are available?',
            next: 'guild_contracts'
          },
          {
            label: 'I\'d like to join the guild.',
            next: 'guild_join'
          },
          {
            label: 'Tell me about the guild.',
            next: 'guild_lore'
          },
          {
            label: 'Nothing. Goodbye.',
            next: null
          }
        ]
      },

      guild_contracts: {
        id: 'guild_contracts',
        text: 'We have one active contract of interest: exploration of the ' +
              'stronghold to the north — Quasqueton, they call it. Report back ' +
              'on what you find in the first ten rooms. Payment on delivery: ' +
              'two hundred gold pieces. Interested?',
        options: [
          {
            label: 'Accept the contract.',
            effect: { type: 'accept_contract', contractId: 'explore_quasqueton_10rooms' },
            next: 'guild_contract_accepted'
          },
          {
            label: 'I\'ll think about it.',
            next: null
          }
        ]
      },

      guild_contract_accepted: {
        id: 'guild_contract_accepted',
        text: 'Contract recorded. Report to me when you\'ve mapped the first ' +
              'ten rooms. Don\'t embellish the report — I know what a dungeon ' +
              'looks like.',
        effect: { type: 'attitude_shift', npc: 'guild_master', delta: 1 },
        options: [{ label: 'Understood.', next: null }]
      },

      guild_join: {
        id: 'guild_join',
        text: 'Guild membership costs twenty-five gold pieces annually. ' +
              'Members receive a ten percent discount at participating shops ' +
              'and priority access to contracts. Do you want in?',
        options: [
          {
            label: 'Join the guild (25 GP)',
            requires: { gold: 25 },
            effect: {
              type: 'join_guild',
              cost: 25,
              attitudeShift: { npc: 'guild_master', delta: 1 }
            },
            next: 'guild_joined'
          },
          {
            label: 'Not right now.',
            next: null
          }
        ]
      },

      guild_joined: {
        id: 'guild_joined',
        text: 'Welcome to the Adventurers\' Guild. Try not to die immediately — ' +
              'it reflects poorly on our recruitment standards.',
        options: [{ label: 'I\'ll do my best.', next: null }]
      },

      guild_lore: {
        id: 'guild_lore',
        text: 'The guild coordinates exploration contracts, arbitrates disputes ' +
              'between adventuring parties, and maintains records of known dungeons ' +
              'and their inhabitants. We are not a charity and we are not a temple. ' +
              'We are professionals.',
        options: [
          {
            label: 'Sounds like my kind of organization.',
            next: 'guild_join'
          },
          {
            label: 'Good to know.',
            next: null
          }
        ]
      }
    }
  }
};

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * Get a dialogue node by NPC id and node id.
 * @param {string} npcId
 * @param {string} nodeId  — defaults to entry node
 * @returns {Object|null}
 */
export function getDialogueNode(npcId, nodeId = null) {
  const tree = dialogueTrees[npcId];
  if (!tree) return null;
  const id = nodeId ?? tree.entry;
  return tree.nodes[id] ?? null;
}

/**
 * Evaluate whether a dialogue option's `requires` gate is met.
 * @param {Object} requires  — option.requires
 * @param {Object} character — CharacterContext state
 * @param {Object} townState — TownContext state
 * @returns {{ met: boolean, reason: string|null }}
 */
export function evaluateRequires(requires, character, townState) {
  if (!requires) return { met: true, reason: null };

  if (requires.gold !== undefined && character.gold < requires.gold) {
    return { met: false, reason: `Requires ${requires.gold} GP` };
  }

  if (requires.classes && !requires.classes.includes(character.class)) {
    return {
      met: false,
      reason: `Only available to ${requires.classes.join(', ')}`
    };
  }

  if (requires.hasRumors && (!townState.activeRumors || townState.activeRumors.length === 0)) {
    return { met: false, reason: 'No rumors available yet' };
  }

  if (requires.visitCount !== undefined && townState.townVisitCount < requires.visitCount) {
    return { met: false, reason: 'Visit more before this becomes available' };
  }

  return { met: true, reason: null };
}

/**
 * Get NPC data by id.
 */
export function getNPC(npcId) {
  return npcRoster[npcId] ?? null;
}

/**
 * Calculate the attitude label from a numeric score.
 * @param {number} score
 * @returns {'hostile'|'neutral'|'friendly'}
 */
export function scoreToAttitude(score) {
  if (score <= -2) return 'hostile';
  if (score >= 2)  return 'friendly';
  return 'neutral';
}