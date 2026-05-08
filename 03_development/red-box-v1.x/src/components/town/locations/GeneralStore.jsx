/**
 * GeneralStore.jsx
 * Threshold Provisioners — Oswin Burrows, shopkeeper.
 *
 * SECTIONS:
 *   npc  → Oswin dialogue (greet, shop intro, potions)
 *   shop → ShopInterface for 'general_store'
 *
 * EFFECTS handled:
 *   open_shop      → switch to shop tab
 *   attitude_shift → shiftAttitude
 *   dialogue_closed → no-op
 */

import { useState, useCallback } from 'react';
import { X, ShoppingBag } from 'lucide-react';

import { useTown }         from '../../../contexts/TownContext';
import NPCDialogue     from '../NPCDialogue';
import { ShopInterface }   from '../ShopInterface';

import './Location.css';

// ---------------------------------------------------------------------------

const TABS = [
  { id: 'npc',  label: 'Speak with Oswin',  icon: null },
  { id: 'shop', label: 'Browse Goods', icon: <ShoppingBag size={14} /> }
];

export function GeneralStore({ onClose }) {
  const { shiftAttitude } = useTown();
  const [tab, setTab] = useState('npc');

  const handleEffect = useCallback((effect) => {
    if (!effect?.type) return;
    switch (effect.type) {
      case 'open_shop':
        setTab('shop');
        break;
      case 'attitude_shift':
        shiftAttitude(effect.npc, effect.delta);
        break;
      default:
        break;
    }
  }, [shiftAttitude]);

  return (
    <div className="location-panel">

      <div className="location-header">
        <div className="location-header-left">
          <span className="location-header-icon">🛒</span>
          <div>
            <h2 className="location-header-title">Threshold Provisioners</h2>
            <p className="location-header-desc">
              Torches, rope, rations, potions — everything a sensible adventurer needs.
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

      <div className="location-body">
        {tab === 'npc'  && <NPCDialogue npcId="shopkeeper" onEffect={handleEffect} />}
        {tab === 'shop' && <ShopInterface shopId="general_store" />}
      </div>

    </div>
  );
}

export default GeneralStore;
