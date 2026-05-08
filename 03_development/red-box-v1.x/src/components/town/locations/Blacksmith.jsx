/**
 * Blacksmith.jsx
 * Halvard's Forge — weapons, armour, repair, silver weapons.
 *
 * SECTIONS:
 *   npc    → Halvard dialogue
 *   shop   → ShopInterface for 'blacksmith'
 *   silver → ShopInterface for 'blacksmith' filtered to silver items
 *
 * EFFECTS handled:
 *   open_shop      → switches to shop (full) or silver tab
 *   repair_armor   → deducts cost, fires a notice; no inventory mutation in v1
 *                    (full durability system is B1 scope)
 *   attitude_shift → shiftAttitude
 */

import { useState, useCallback } from 'react';
import { X, Hammer, Sparkles } from 'lucide-react';

import { useCharacter } from '../../../contexts/CharacterContext';
import { useTown }      from '../../../contexts/TownContext';
import NPCDialogue from '../NPCDialogue';
import { ShopInterface } from '../ShopInterface';

import './Location.css';

// ---------------------------------------------------------------------------

const TABS = [
  { id: 'npc',    label: 'Speak with Halvard',  icon: null },
  { id: 'shop',   label: 'Arms & Armour',  icon: <Hammer size={14} /> },
  { id: 'silver', label: 'Silver Arms', icon: <Sparkles size={14} /> }
];

export function Blacksmith({ onClose }) {
  const { character, updateGold } = useCharacter();
  const { shiftAttitude }         = useTown();

  const [tab,    setTab]    = useState('npc');
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  }, []);

  const handleEffect = useCallback((effect) => {
    if (!effect?.type) return;
    switch (effect.type) {

      case 'open_shop':
        // shopInventory filter drives which tab
        setTab(effect.filter === 'silver' ? 'silver' : 'shop');
        break;

      case 'repair_armor': {
        const cost = effect.cost ?? 10;
        if (character.gold < cost) {
          showNotice('error', `You need ${cost} GP for repairs.`);
          return;
        }
        updateGold(-cost);
        showNotice('success', `Halvard works the metal. Your armour is restored. (${cost} GP)`);
        break;
      }

      case 'attitude_shift':
        shiftAttitude(effect.npc, effect.delta);
        break;

      default:
        break;
    }
  }, [character.gold, updateGold, shiftAttitude, showNotice]);

  return (
    <div className="location-panel">

      <div className="location-header">
        <div className="location-header-left">
          <span className="location-header-icon">⚔️</span>
          <div>
            <h2 className="location-header-title">Halvard's Forge</h2>
            <p className="location-header-desc">
              Steel, silver, and strong arms — built to last against whatever
              lurks below.
            </p>
          </div>
        </div>
        <button className="location-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
      </div>

      <div className="loc-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`loc-tab ${tab === t.id ? 'loc-tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {notice && (
        <div className={`loc-notice loc-notice-${notice.type}`}>{notice.text}</div>
      )}

      <div className="location-body">
        {tab === 'npc'    && <NPCDialogue npcId="blacksmith" onEffect={handleEffect} />}
        {tab === 'shop'   && <ShopInterface shopId="blacksmith" />}
        {tab === 'silver' && <ShopInterface shopId="blacksmith" filter="silver" />}
      </div>

    </div>
  );
}

export default Blacksmith;
