/**
 * GuildHall.jsx
 * The Adventurers' Guild — Commander Thyra Voss, guild master.
 *
 * SECTIONS:
 *   npc      → Thyra dialogue (contracts, join, lore)
 *   contracts → Active and available contracts (same data as Town Hall board)
 *   benefits  → Guild membership perks summary
 *
 * EFFECTS handled:
 *   accept_contract → acceptContract(), showNotice
 *   join_guild      → deducts cost, joinGuild(), shifts attitude
 *   attitude_shift  → shiftAttitude
 *
 * MEMBERSHIP PERKS (displayed in benefits tab)
 *   - 10% discount at all town shops (getShopDiscount returns 0.9)
 *   - Priority contract access
 *   - Free use of guild map library (rumor bonus — v2)
 */

import { useState, useCallback } from 'react';
import { X, Star, ScrollText, Shield } from 'lucide-react';

import { useCharacter }  from '../../../contexts/CharacterContext';
import { useTown }       from '../../../contexts/TownContext';
import NPCDialogue from '../NPCDialogue';

import './Location.css';

// ---------------------------------------------------------------------------

const TABS = [
  { id: 'npc',       label: 'Speak with Thyra', icon: null },
  { id: 'contracts', label: 'Contracts',         icon: <ScrollText size={14} /> },
  { id: 'benefits',  label: 'Membership',        icon: <Star size={14} /> }
];

// Mirrors TownHall contract list — single source in a shared data file
// would be better in v2; fine for v1
const CONTRACTS = [
  {
    contractId:  'explore_quasqueton_10rooms',
    title:       'Survey the Caverns',
    giver:       'Town Council',
    objective:   'Map at least 10 rooms of the Caverns of Quasqueton and return with a report.',
    reward:      '50 GP + 200 XP on completion',
    difficulty:  'Moderate',
    icon:        '🗺️'
  }
];

const GUILD_JOIN_COST = 25;

export function GuildHall({ onClose }) {
  const { character, updateGold } = useCharacter();
  const {
    town,
    shiftAttitude,
    joinGuild,
    acceptContract,
    hasContract,
    getContractStatus
  } = useTown();

  const [tab,    setTab]    = useState('npc');
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  }, []);

  // ---- Effect dispatcher
  const handleEffect = useCallback((effect) => {
    if (!effect?.type) return;
    switch (effect.type) {

      case 'join_guild': {
        const cost = effect.cost ?? GUILD_JOIN_COST;
        if (character.gold < cost) {
          showNotice('error', `You need ${cost} GP to join the guild.`);
          return;
        }
        if (town.isGuildMember) {
          showNotice('error', 'You are already a member.');
          return;
        }
        updateGold(-cost);
        joinGuild();
        if (effect.attitudeShift) {
          shiftAttitude(effect.attitudeShift.npc, effect.attitudeShift.delta);
        }
        showNotice('success', `Welcome to the Adventurers' Guild. 10% shop discount now active. (${cost} GP)`);
        break;
      }

      case 'accept_contract': {
        const { contractId } = effect;
        if (hasContract(contractId)) {
          showNotice('error', 'You already have this contract.');
          return;
        }
        acceptContract(contractId);
        showNotice('success', 'Contract accepted. Complete the objective and return to collect your reward.');
        break;
      }

      case 'attitude_shift':
        shiftAttitude(effect.npc, effect.delta);
        break;

      default:
        break;
    }
  }, [
    character.gold, updateGold, town.isGuildMember,
    joinGuild, shiftAttitude, acceptContract, hasContract, showNotice
  ]);

  return (
    <div className="location-panel">

      <div className="location-header">
        <div className="location-header-left">
          <span className="location-header-icon">🏛️</span>
          <div>
            <h2 className="location-header-title">The Adventurers' Guild</h2>
            <p className="location-header-desc">
              Contracts, camaraderie, and the collective knowledge of those who
              returned from below.
            </p>
          </div>
        </div>
        <button className="location-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
      </div>

      {/* Membership badge */}
      {town.isGuildMember && (
        <div className="guild-member-banner">
          <Star size={14} /> Guild Member — 10% shop discount active
        </div>
      )}

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

        {/* NPC */}
        {tab === 'npc' && <NPCDialogue npcId="guild_master" onEffect={handleEffect} />}

        {/* CONTRACTS */}
        {tab === 'contracts' && (
          <div className="contract-board">
            <div className="contract-list">
              {CONTRACTS.map(contract => {
                const status   = getContractStatus(contract.contractId);
                const accepted = hasContract(contract.contractId);

                return (
                  <div key={contract.contractId} className={`contract-card ${accepted ? 'contract-accepted' : ''}`}>
                    <div className="contract-card-header">
                      <span className="contract-icon">{contract.icon}</span>
                      <div className="contract-header-text">
                        <span className="contract-title">{contract.title}</span>
                        <span className="contract-giver">Posted by: {contract.giver}</span>
                      </div>
                      {status && (
                        <span className={`contract-status contract-status-${status}`}>
                          {STATUS_LABELS[status] ?? status}
                        </span>
                      )}
                    </div>
                    <p className="contract-objective">{contract.objective}</p>
                    <div className="contract-footer">
                      <span className="contract-reward">{contract.reward}</span>
                      <span className="contract-difficulty">Difficulty: {contract.difficulty}</span>
                      {!accepted && (
                        <button
                          className="contract-accept-btn"
                          onClick={() =>
                            handleEffect({
                              type: 'accept_contract',
                              contractId: contract.contractId
                            })
                          }
                        >
                          Accept Contract
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BENEFITS */}
        {tab === 'benefits' && (
          <div className="guild-benefits">

            {!town.isGuildMember && (
              <div className="guild-join-cta">
                <Shield size={28} />
                <h3 className="guild-join-title">Join the Adventurers' Guild</h3>
                <p className="guild-join-desc">
                  One-time membership fee of <strong>{GUILD_JOIN_COST} GP</strong>.
                  Full benefits immediately.
                </p>
                <button
                  className="guild-join-btn"
                  onClick={() =>
                    handleEffect({
                      type: 'join_guild',
                      cost: GUILD_JOIN_COST,
                      attitudeShift: { npc: 'guild_master', delta: 1 }
                    })
                  }
                  disabled={character.gold < GUILD_JOIN_COST}
                >
                  {character.gold < GUILD_JOIN_COST
                    ? `Not enough gold (need ${GUILD_JOIN_COST} GP)`
                    : `Join for ${GUILD_JOIN_COST} GP`}
                </button>
              </div>
            )}

            <div className="guild-perk-list">
              <h3 className="guild-perk-title">Membership Benefits</h3>

              <div className={`guild-perk ${town.isGuildMember ? 'perk-active' : 'perk-locked'}`}>
                <span className="perk-icon">🏷️</span>
                <div>
                  <span className="perk-name">Shop Discount</span>
                  <span className="perk-desc">10% off all purchases in Threshold.</span>
                </div>
                {town.isGuildMember && <span className="perk-active-badge">Active</span>}
              </div>

              <div className={`guild-perk ${town.isGuildMember ? 'perk-active' : 'perk-locked'}`}>
                <span className="perk-icon">📋</span>
                <div>
                  <span className="perk-name">Contract Access</span>
                  <span className="perk-desc">Accept exploration and recovery contracts for gold and XP.</span>
                </div>
                {town.isGuildMember && <span className="perk-active-badge">Active</span>}
              </div>

              <div className="guild-perk perk-locked">
                <span className="perk-icon">🗺️</span>
                <div>
                  <span className="perk-name">Map Library</span>
                  <span className="perk-desc">
                    Access to guild survey maps and rumour archives.
                    <em className="perk-coming"> (B1 update)</em>
                  </span>
                </div>
              </div>

              <div className="guild-perk perk-locked">
                <span className="perk-icon">⚔️</span>
                <div>
                  <span className="perk-name">Class Quests</span>
                  <span className="perk-desc">
                    Specialised missions for fighters, magic-users, clerics, and thieves.
                    <em className="perk-coming"> (B1 update)</em>
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

const STATUS_LABELS = {
  active:    'In Progress',
  completed: 'Completed',
  failed:    'Failed'
};

export default GuildHall;
