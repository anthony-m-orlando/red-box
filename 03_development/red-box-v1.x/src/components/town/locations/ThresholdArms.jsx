/**
 * ThresholdArms.jsx
 * The Threshold Arms — inn, tavern, hireling board.
 *
 * SECTIONS (rendered via tab strip):
 *   npc      → Marta Ashford dialogue (rest, rumors, lore, hirelings, storage)
 *   hirelings → HirelingPanel (recruit / manage party)
 *   storage   → Stored item list with retrieve buttons
 *
 * EFFECTS handled:
 *   rest              → updateGold(-cost), rest() on character, setLastRestLocation
 *   deliver_rumors    → renders town.activeRumors inline
 *   open_hireling_panel → switches to hirelings tab
 *   open_storage      → switches to storage tab
 *   attitude_shift    → shiftAttitude(npc, delta)
 *   dialogue_closed   → no-op
 */

import { useState, useCallback } from 'react';
import { X, Bed, Users, Archive } from 'lucide-react';

import { useCharacter } from '../../../contexts/CharacterContext';
import { useTown }      from '../../../contexts/TownContext';
import NPCDialogue from '../NPCDialogue';
import { HirelingPanel } from '../HirelingPanel';

import './Location.css';

// ---------------------------------------------------------------------------

const TABS = [
  { id: 'npc',       label: 'Speak with Marta', icon: <Bed size={14} /> },
  { id: 'hirelings', label: 'Hirelings',         icon: <Users size={14} /> },
  { id: 'storage',   label: 'Storage',           icon: <Archive size={14} /> }
];

export function ThresholdArms({ onClose }) {
  const { character, updateGold, rest } = useCharacter();
  const {
    town,
    shiftAttitude,
    setLastRestLocation,
    retrieveItem
  } = useTown();

  const [tab,     setTab]     = useState('npc');
  const [rumors,  setRumors]  = useState(false); // show rumor list inline
  const [notice,  setNotice]  = useState(null);  // { type, text }

  const showNotice = useCallback((type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  }, []);

  // ---- Effect dispatcher for Marta's dialogue
  const handleEffect = useCallback((effect) => {
    if (!effect?.type) return;
    switch (effect.type) {

      case 'rest': {
        const cost = effect.cost ?? 5;
        if (character.gold < cost) {
          showNotice('error', `You need ${cost} GP to rent a room.`);
          return;
        }
        updateGold(-cost);
        rest();
        setLastRestLocation('threshold_arms');
        showNotice('success', `You sleep deeply. HP and spell slots restored. (${cost} GP)`);
        break;
      }

      case 'deliver_rumors':
        setRumors(true);
        break;

      case 'open_hireling_panel':
        setTab('hirelings');
        break;

      case 'open_storage':
        setTab('storage');
        break;

      case 'attitude_shift':
        shiftAttitude(effect.npc, effect.delta);
        break;

      case 'dialogue_closed':
      default:
        break;
    }
  }, [character.gold, updateGold, rest, shiftAttitude, setLastRestLocation, showNotice]);

  // ---- Retrieve a stored item back into inventory
  const handleRetrieve = useCallback((itemId, name) => {
    retrieveItem(itemId);
    showNotice('success', `${name} retrieved from storage.`);
  }, [retrieveItem, showNotice]);

  return (
    <div className="location-panel">

      {/* Header */}
      <div className="location-header">
        <div className="location-header-left">
          <span className="location-header-icon">🏨</span>
          <div>
            <h2 className="location-header-title">The Threshold Arms</h2>
            <p className="location-header-desc">
              Rest, hear tales, and find companions for the road ahead.
            </p>
          </div>
        </div>
        <button className="location-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
      </div>

      {/* Tab strip */}
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

      {/* Notice */}
      {notice && (
        <div className={`loc-notice loc-notice-${notice.type}`}>{notice.text}</div>
      )}

      {/* Body */}
      <div className="location-body">

        {/* NPC DIALOGUE */}
        {tab === 'npc' && (
          <>
            <NPCDialogue npcId="innkeeper" onEffect={handleEffect} />

            {/* Inline rumor list — appears after player asks for gossip */}
            {rumors && town.activeRumors.length > 0 && (
              <div className="rumor-list">
                <h3 className="rumor-list-title">Rumours heard in the common room</h3>
                {town.activeRumors.map((rumor, i) => (
                  <div key={i} className="rumor-item">
                    <span className="rumor-bullet">◆</span>
                    <p className="rumor-text">{rumor.text}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* HIRELING PANEL */}
        {tab === 'hirelings' && <HirelingPanel />}

        {/* STORAGE */}
        {tab === 'storage' && (
          <div className="storage-panel">
            <p className="storage-intro">
              Marta keeps a locked storeroom for trusted regulars. Items left here
              are safe while you're in the dungeon.
            </p>
            {town.storedItems.length === 0 ? (
              <div className="storage-empty">
                <Archive size={28} />
                <p>Nothing in storage.</p>
              </div>
            ) : (
              <div className="storage-list">
                {town.storedItems.map(item => (
                  <div key={item.id} className="storage-item">
                    <span className="storage-item-name">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="storage-item-qty">×{item.quantity}</span>
                    )}
                    <button
                      className="storage-retrieve-btn"
                      onClick={() => handleRetrieve(item.id, item.name)}
                    >
                      Retrieve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ThresholdArms;
