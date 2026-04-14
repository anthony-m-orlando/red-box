/**
 * rumors.js
 * B1 "In Search of the Unknown" Rumor Table
 *
 * Faithful to the original module's Background Information / Rumors section.
 * Each entry carries an `isTrue` flag — but both true and false rumors are
 * presented to the player with identical UI weight. The player cannot tell
 * which are accurate until they explore Quasqueton and find out for themselves.
 *
 * Usage: on first visit to the Threshold Arms, call rollRumors() to select
 * three entries (1d20 × 3) and store them in TownContext.activeRumors.
 * They persist for the character's lifetime.
 */

export const rumorTable = [
  {
    id: 'r01',
    text: 'Rogahn the Fearless was never defeated in single combat during his lifetime.',
    isTrue: true,
    source: 'an old veteran nursing his ale'
  },
  {
    id: 'r02',
    text: 'The stronghold is protected by a fierce monster that patrols the corridors — ' +
          'some kind of iron construct that cannot be harmed by normal weapons.',
    isTrue: false,
    source: 'a wide-eyed young merchant'
  },
  {
    id: 'r03',
    text: 'Zelligar the Unknown kept a magical pool somewhere in his fortress. ' +
          'Those who drink from it are granted great power — or destroyed utterly.',
    isTrue: true,
    source: 'a grey-bearded sage nursing a pipe'
  },
  {
    id: 'r04',
    text: 'A secret room in the complex contains the combined life savings ' +
          'of both Rogahn and Zelligar.',
    isTrue: true,
    source: 'a former hireling, now retired and talkative'
  },
  {
    id: 'r05',
    text: 'The two leaders had a falling out just before they disappeared — ' +
          'their treasure was divided and hidden in separate locations.',
    isTrue: false,
    source: 'a traveling bard'
  },
  {
    id: 'r06',
    text: 'Zelligar conducted arcane experiments on monsters, attempting to ' +
          'crossbreed different species. Some of those experiments may still ' +
          'be alive in the lower levels.',
    isTrue: true,
    source: 'a nervous-looking man who refuses to give his name'
  },
  {
    id: 'r07',
    text: 'The complex has two levels. The upper level is relatively safe; ' +
          'the lower level is where the real danger — and real treasure — lies.',
    isTrue: true,
    source: 'an adventurer who made it back, missing two fingers'
  },
  {
    id: 'r08',
    text: 'Rogahn and Zelligar left behind human servants and guardians ' +
          'who remain loyal even now, waiting for their masters to return.',
    isTrue: false,
    source: 'a superstitious farmhand'
  },
  {
    id: 'r09',
    text: 'There is a trapdoor somewhere on the upper level that leads ' +
          'directly to the lower level — but the fall will kill you.',
    isTrue: true,
    source: 'a dwarf stonecutter who claims to have inspected the foundations'
  },
  {
    id: 'r10',
    text: 'Zelligar\'s spellbook is still somewhere in the complex, ' +
          'hidden behind a secret door.',
    isTrue: false,
    source: 'a magic-user who smells faintly of sulfur'
  },
  {
    id: 'r11',
    text: 'The stronghold was carved from the living rock by Zelligar\'s magic, ' +
          'not by normal means. The stone itself is said to be enchanted.',
    isTrue: false,
    source: 'a dwarven prospector'
  },
  {
    id: 'r12',
    text: 'Rogahn kept a trophy room where he displayed the weapons and armor ' +
          'of enemies he had defeated. The trophies may still be there.',
    isTrue: true,
    source: 'a nostalgic old soldier'
  },
  {
    id: 'r13',
    text: 'The two adventurers went to fight in a great war to the north ' +
          'and were slain. Their bodies were never recovered.',
    isTrue: true,
    source: 'the innkeeper, lowering her voice'
  },
  {
    id: 'r14',
    text: 'A tribe of orcs has recently moved into the complex and set up ' +
          'a permanent lair in the upper level.',
    isTrue: true,
    source: 'a frightened farmer from the nearby valley'
  },
  {
    id: 'r15',
    text: 'Rogahn was actually a villain who preyed on local villages. ' +
          'His reputation as a hero was all lies.',
    isTrue: false,
    source: 'a sour-faced woman who spits on the floor'
  },
  {
    id: 'r16',
    text: 'There is a room in the complex that is always shrouded in mist. ' +
          'Those who enter often become disoriented and lose their way.',
    isTrue: true,
    source: 'an elf who claims she scouted the place years ago'
  },
  {
    id: 'r17',
    text: 'Zelligar kept exotic pets — strange creatures brought from distant lands. ' +
          'At least one is rumored to still be alive down there.',
    isTrue: true,
    source: 'a gnomish merchant who traded with Zelligar\'s servants long ago'
  },
  {
    id: 'r18',
    text: 'The complex is completely empty. Any monsters there long ago ' +
          'found their way out through a hidden passage to the outside.',
    isTrue: false,
    source: 'a man who is very clearly lying'
  },
  {
    id: 'r19',
    text: 'Rogahn had a magical sword of extraordinary power. He took it ' +
          'to war with him, so it is probably long gone.',
    isTrue: true,
    source: 'an old blacksmith who once sharpened the blade'
  },
  {
    id: 'r20',
    text: 'There are voices in some of the corridors — disembodied mouths ' +
          'carved into the stone that challenge those who pass.',
    isTrue: true,
    source: 'a halfling thief who made it to the entrance and no further'
  }
];

/**
 * Roll 3 unique rumors for a character's first visit to Threshold.
 * Uses 1d20 mechanics — re-rolls duplicates.
 * @returns {Array} Three rumor objects
 */
export function rollRumors() {
  const selected = [];
  const usedIndices = new Set();

  while (selected.length < 3) {
    const roll = Math.floor(Math.random() * 20); // 0-19 → index into rumorTable
    if (!usedIndices.has(roll)) {
      usedIndices.add(roll);
      selected.push(rumorTable[roll]);
    }
  }

  return selected;
}

/**
 * Get a rumor by ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getRumorById(id) {
  return rumorTable.find(r => r.id === id) ?? null;
}
