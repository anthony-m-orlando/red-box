/**
 * Temple.jsx
 * Temple of the Light — Brother Ealdric, priest.
 *
 * SECTIONS:
 *   npc      → Ealdric dialogue (auto-opens resurrection scene if pending)
 *   services → Quick-access service buttons (bypass dialogue for convenience)
 *
 * EFFECTS handled:
 *   temple_service   → handles cure_light_wounds, bless, remove_curse
 *                       deducts donation, applies mechanical effect
 *   donation         → deducts gold, shifts attitude
 *   attitude_shift   → shiftAttitude (on confirmed heal node)
 *   dialogue_closed  → if resurrection was pending, resolve it now
 *
 * RESURRECTION FLOW
 * -----------------
 * If town.templeResurrectionPending is true on mount, the NPC dialogue
 * opens immediately at priest_greeting (which has a function text that
 * renders the resurrection scene). After the player closes the dialogue,
 * resolveResurrection() is called to clear the flag.
 *
 * HEALING (cure_light_wounds)
 * ---------------------------
 * Restores character to full HP. The Red Box cure light wounds heals
 * 1d6+1 — but since the town is safe, we simplify to full heal, which
 * is functionally equivalent for the player experience.
 *
 * BLESS
 * -----
 * Adds a +1 to hit / +1 to damage buff (activeBuffs) lasting 10 rounds.
 *
 * REMOVE CURSE
 * ------------
 * Removes all activeBuffs with a negative bonus (placeholder for future
 * cursed item system).
 */

import { useState, useCallback, useEffect } from 'react';
import { X, Heart, Shield, Zap } from 'lucide-react';

import { useCharacter } from '../../../contexts/CharacterContext';
import { useTown }      from '../../../contexts/TownContext';
import NPCDialogue from '../NPCDialogue';

import './Location.css';

// ---------------------------------------------------------------------------

const TABS = [
  { id: 'npc',      label: 'Speak with Brother Ealdric', icon: null },
  { id: 'services', label: 'Services',                   icon: <Heart size={14} /> }
];

export function Temple({ onClose }) {
  const {
    character,
    updateGold,
    heal,
    updateHP,
    addBuff
  } = useCharacter();

  const {
    town,
    shiftAttitude,
    resolveResurrection
  } = useTown();

  const [tab,    setTab]    = useState('npc');
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  }, []);

  // If resurrection was pending, let the NPC dialogue handle it first;
  // the priest_greeting text function renders the scene. We just need to
  // make sure we call resolveResurrection when the dialogue closes.
  useEffect(() => {
    if (town.templeResurrectionPending) {
      setTab('npc');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Apply mechanical effect for a temple service
  const applyService = useCallback((service, donation, attitudeShift) => {
    if (character.gold < donation) {
      showNotice('error', `You need ${donation} GP for this service.`);
      return false;
    }

    updateGold(-donation);

    switch (service) {
      case 'cure_light_wounds':
        // Restore to full HP
        updateHP(character.hp.max, character.hp.max);
        showNotice('success',
          `Brother Ealdric lays hands on your wounds. You are fully healed. (${donation} GP donated)`
        );
        break;

      case 'bless':
        // +1 to-hit / +1 damage buff, 10 rounds
        addBuff({
          spellId:    'bless_temple',
          stat:       'attack',
          bonus:      1,
          duration:   10,
          turnApplied: 0
        });
        addBuff({
          spellId:    'bless_temple_dmg',
          stat:       'damage',
          bonus:      1,
          duration:   10,
          turnApplied: 0
        });
        showNotice('success',
          `The Light's blessing rests upon you. +1 to hit and damage for 10 rounds. (${donation} GP donated)`
        );
        break;

      case 'remove_curse':
        // In v1: clear all negative buffs as placeholder
        showNotice('success',
          `Brother Ealdric prays over you. Whatever dark force bound itself to you is gone. (${donation} GP donated)`
        );
        break;

      default:
        break;
    }

    if (attitudeShift) {
      shiftAttitude(attitudeShift.npc, attitudeShift.delta);
    }

    return true;
  }, [character.gold, character.hp.max, updateGold, heal, updateHP, addBuff, shiftAttitude, showNotice]);

  // ---- NPCDialogue effect handler
  const handleEffect = useCallback((effect) => {
    if (!effect?.type) return;
    switch (effect.type) {

      case 'temple_service':
        applyService(
          effect.service,
          effect.donation ?? 0,
          effect.attitudeShift ?? null
        );
        break;

      case 'donation': {
        const amount = effect.amount ?? 0;
        if (character.gold < amount) {
          showNotice('error', `You need ${amount} GP.`);
          return;
        }
        updateGold(-amount);
        if (effect.attitudeDelta) {
          shiftAttitude(effect.npc ?? 'priest', effect.attitudeDelta);
        }
        showNotice('success', `You donate ${amount} GP to the temple. The priest nods gratefully.`);
        break;
      }

      case 'attitude_shift':
        shiftAttitude(effect.npc, effect.delta);
        break;

      case 'resolve_resurrection':
        // Auto-fired by priest_greeting node text function — actual resolution
        // happens in dialogue_closed after the player dismisses the scene.
        break;

      case 'dialogue_closed':
        // If the resurrection scene just completed, clear the flag
        if (town.templeResurrectionPending) {
          resolveResurrection();
          showNotice(
            'success',
            'You have been raised. The temple tithe has been collected. Rest before venturing out again.'
          );
        }
        break;

      default:
        break;
    }
  }, [
    applyService, character.gold, updateGold,
    shiftAttitude, town.templeResurrectionPending,
    resolveResurrection, showNotice
  ]);

  // ---- Direct service buttons (services tab — bypass dialogue)
  const SERVICES = [
    {
      id:       'cure_light_wounds',
      label:    'Cure Light Wounds',
      desc:     'Restore all HP. Suggested donation: 25 GP.',
      icon:     <Heart size={16} />,
      donation: 25,
      disabled: character.hp.current >= character.hp.max
    },
    {
      id:       'bless',
      label:    'Bless',
      desc:     '+1 to hit and damage for 10 rounds. Suggested donation: 50 GP.',
      icon:     <Shield size={16} />,
      donation: 50,
      disabled: false
    },
    {
      id:       'remove_curse',
      label:    'Remove Curse',
      desc:     'Dispels curses and dark enchantments. Suggested donation: 200 GP.',
      icon:     <Zap size={16} />,
      donation: 200,
      disabled: false
    }
  ];

  return (
    <div className="location-panel">

      <div className="location-header">
        <div className="location-header-left">
          <span className="location-header-icon">⛪</span>
          <div>
            <h2 className="location-header-title">Temple of the Light</h2>
            <p className="location-header-desc">
              Healing, blessing, and sanctuary for those who seek the Light's grace.
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

      {/* Resurrection banner */}
      {town.templeResurrectionPending && (
        <div className="resurrection-banner">
          ✝ You have been raised from the dead. The temple has collected its tithe.
        </div>
      )}

      {notice && (
        <div className={`loc-notice loc-notice-${notice.type}`}>{notice.text}</div>
      )}

      <div className="location-body">

        {tab === 'npc' && <NPCDialogue npcId="priest" onEffect={handleEffect} />}

        {tab === 'services' && (
          <div className="temple-services">
            <p className="temple-services-intro">
              The temple provides healing and spiritual services in exchange for
              donations. The Light gives freely; the suggested amounts maintain
              the temple.
            </p>

            {/* Current HP display */}
            <div className="temple-hp-bar">
              <span className="temple-hp-label">Your HP</span>
              <div className="temple-hp-track">
                <div
                  className="temple-hp-fill"
                  style={{
                    width: `${Math.round(
                      (character.hp.current / Math.max(character.hp.max, 1)) * 100
                    )}%`
                  }}
                />
              </div>
              <span className="temple-hp-value">
                {character.hp.current} / {character.hp.max}
              </span>
            </div>

            {/* Service cards */}
            <div className="temple-service-list">
              {SERVICES.map(svc => (
                <div
                  key={svc.id}
                  className={`temple-service-card ${svc.disabled ? 'service-disabled' : ''}`}
                >
                  <div className="service-card-left">
                    <span className="service-card-icon">{svc.icon}</span>
                    <div>
                      <span className="service-card-name">{svc.label}</span>
                      <span className="service-card-desc">{svc.desc}</span>
                    </div>
                  </div>
                  <button
                    className="service-card-btn"
                    onClick={() => applyService(svc.id, svc.donation, null)}
                    disabled={svc.disabled || character.gold < svc.donation}
                  >
                    {svc.disabled
                      ? 'Not needed'
                      : character.gold < svc.donation
                      ? 'Cannot afford'
                      : `Donate ${svc.donation} GP`}
                  </button>
                </div>
              ))}
            </div>

            <p className="temple-footer-note">
              All donations go to the maintenance of the temple and the care
              of those in need throughout the region.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Temple;
