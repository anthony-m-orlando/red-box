/**
 * MagesTower.jsx
 * Vethara's tower — scrolls, identification, arcane lore.
 *
 * SECTIONS:
 *   npc      → Vethara dialogue (class-aware greeting)
 *   shop     → ShopInterface for 'mages_tower' (scrolls + identify service)
 *   identify → Identify pending list / submit items
 *
 * EFFECTS handled:
 *   open_shop      → switch to shop tab
 *   open_identify  → switch to identify tab, deducts cost, queues item
 *   attitude_shift → shiftAttitude
 *
 * IDENTIFY FLOW
 * -------------
 * The player picks an unidentified item from their inventory, pays 100 GP,
 * and requestIdentification() queues it. In v1 the result is immediate
 * (item gains a known flag). Full B1 scope: result after next town return.
 */

import { useState, useCallback, useMemo } from 'react';
import { X, Search, ScrollText } from 'lucide-react';

import { useCharacter }     from '../../../contexts/CharacterContext';
import { useTown }          from '../../../contexts/TownContext';
import { NPCDialogue }      from '../NPCDialogue';
import { ShopInterface }    from '../ShopInterface';

import './Location.css';

// ---------------------------------------------------------------------------

const TABS = [
  { id: 'npc',      label: 'Speak with Vethara', icon: null },
  { id: 'shop',     label: 'Scrolls & Services', icon: <ScrollText size={14} /> },
  { id: 'identify', label: 'Identify Items',      icon: <Search size={14} /> }
];

// Cost per item identification
const IDENTIFY_COST = 100;

export function MagesTower({ onClose }) {
  const { character, updateGold } = useCharacter();
  const {
    shiftAttitude,
    requestIdentification,
    isPendingIdentification,
    town
  } = useTown();

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
        setTab('shop');
        break;
      case 'open_identify':
        setTab('identify');
        break;
      case 'attitude_shift':
        shiftAttitude(effect.npc, effect.delta);
        break;
      default:
        break;
    }
  }, [shiftAttitude]);

  // Items in inventory that could benefit from identification
  // (any item without a `identified: true` flag, or mysterious items)
  const identifiableItems = useMemo(() =>
    character.inventory.filter(item =>
      item.identified === false ||
      item.identified === undefined && item.type !== 'consumable' && item.type !== 'tool'
    ),
    [character.inventory]
  );

  const handleIdentify = useCallback((item) => {
    if (character.gold < IDENTIFY_COST) {
      showNotice('error', `You need ${IDENTIFY_COST} GP to identify an item.`);
      return;
    }
    if (isPendingIdentification(item.id)) {
      showNotice('error', `${item.name} is already awaiting identification.`);
      return;
    }
    updateGold(-IDENTIFY_COST);
    requestIdentification(item.id);
    showNotice(
      'success',
      `Vethara examines ${item.name}. Come back after your next expedition for the results. (${IDENTIFY_COST} GP)`
    );
  }, [character.gold, updateGold, requestIdentification, isPendingIdentification, showNotice]);

  return (
    <div className="location-panel">

      <div className="location-header">
        <div className="location-header-left">
          <span className="location-header-icon">🔮</span>
          <div>
            <h2 className="location-header-title">The Arcanist's Tower</h2>
            <p className="location-header-desc">
              Scrolls, identification, and arcane counsel — if you can afford her rates.
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

        {tab === 'npc'  && <NPCDialogue npcId="wizard" onEffect={handleEffect} />}
        {tab === 'shop' && <ShopInterface shopId="mages_tower" />}

        {tab === 'identify' && (
          <div className="identify-panel">
            <p className="identify-intro">
              Vethara will examine any item you bring her. Results are ready
              after your next expedition. Cost: <strong>{IDENTIFY_COST} GP</strong> per item.
            </p>

            {/* Pending identifications */}
            {town.pendingIdentifications.length > 0 && (
              <div className="identify-pending">
                <h3 className="identify-pending-title">Awaiting results</h3>
                {town.pendingIdentifications.map(entry => (
                  <div key={entry.itemId} className="identify-pending-item">
                    <Search size={13} />
                    <span>{entry.itemId}</span>
                    <span className="identify-status">Pending…</span>
                  </div>
                ))}
              </div>
            )}

            {/* Identifiable inventory items */}
            {identifiableItems.length === 0 ? (
              <div className="identify-empty">
                <Search size={28} />
                <p>You have no items that need identification.</p>
              </div>
            ) : (
              <div className="identify-list">
                <h3 className="identify-list-title">Your unidentified items</h3>
                {identifiableItems.map(item => (
                  <div key={item.id} className="identify-item-row">
                    <div className="identify-item-info">
                      <span className="identify-item-name">{item.name}</span>
                      {item.type && (
                        <span className="identify-item-type">{item.type}</span>
                      )}
                    </div>
                    <button
                      className="identify-btn"
                      onClick={() => handleIdentify(item)}
                      disabled={
                        character.gold < IDENTIFY_COST ||
                        isPendingIdentification(item.id)
                      }
                    >
                      {isPendingIdentification(item.id)
                        ? 'Pending'
                        : `Identify (${IDENTIFY_COST} GP)`}
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

export default MagesTower;
