/**
 * HirelingPanel.jsx
 * Recruit, inspect, dismiss, and configure hirelings.
 * Used inside ThresholdArms.jsx.
 *
 * TWO MODES
 * ---------
 * ROSTER mode — browse available hirelings and recruit them.
 * PARTY mode  — view currently recruited hirelings, change AI mode, dismiss.
 *
 * WAGE DEDUCTION
 * --------------
 * Wages are deducted at recruitment time (wagePerExpedition from character.gold).
 * The game does not track daily upkeep — simplification for v1.
 * Future: deduct wages on each town return via TownContext.syncHirelings().
 *
 * LOYALTY DISPLAY
 * ---------------
 * loyalty is a +/- modifier on the base morale roll (2d6 vs morale score).
 * Displayed as a coloured badge: green for positive, red for negative, grey neutral.
 *
 * AI MODE TOGGLE
 * --------------
 * 'protector' — hireling targets same enemy as player; cleric heals when player < 30% HP
 * 'manual'    — player will direct this hireling themselves (B1 sprint, not yet wired)
 */

import { useState, useCallback, useMemo } from 'react';
import { Users, UserPlus, UserMinus, Shield, Sword, CheckCircle, AlertCircle } from 'lucide-react';

import { useCharacter }   from '../../contexts/CharacterContext';
import { useTown }        from '../../contexts/TownContext';
import { getAvailableHirelings } from '../../data/shopInventory';

import './HirelingPanel.css';

// ---------------------------------------------------------------------------

export function HirelingPanel() {
  const { character, updateGold } = useCharacter();
  const {
    town,
    recruitHireling,
    dismissHireling,
    updateHireling
  } = useTown();

  const [view, setView]         = useState('party');   // 'party' | 'roster'
  const [feedback, setFeedback] = useState(null);      // { type, text }

  const livingHirelings  = useMemo(() =>
    town.hirelings.filter(h => h.isAlive), [town.hirelings]);
  const deadHirelings    = useMemo(() =>
    town.hirelings.filter(h => !h.isAlive), [town.hirelings]);
  const availableRoster  = useMemo(() =>
    getAvailableHirelings(town.hirelings), [town.hirelings]);

  const showFeedback = useCallback((type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  // ---- Recruit
  const handleRecruit = useCallback((templateId, wage) => {
    if (character.gold < wage) {
      showFeedback('error', `Not enough gold. Need ${wage} GP.`);
      return;
    }
    updateGold(-wage);
    const result = recruitHireling(templateId);
    if (result.success) {
      showFeedback('success', `Hired for ${wage} GP. They'll join you at the dungeon entrance.`);
      setView('party');
    } else {
      showFeedback('error', result.reason ?? 'Could not recruit.');
    }
  }, [character.gold, updateGold, recruitHireling, showFeedback]);

  // ---- Dismiss
  const handleDismiss = useCallback((instanceId, name) => {
    dismissHireling(instanceId);
    showFeedback('success', `${name} has been released from service.`);
  }, [dismissHireling, showFeedback]);

  // ---- Toggle AI mode
  const handleToggleMode = useCallback((instanceId, currentMode) => {
    const newMode = currentMode === 'protector' ? 'manual' : 'protector';
    updateHireling(instanceId, { mode: newMode });
  }, [updateHireling]);

  return (
    <div className="hireling-panel">

      {/* ---- Tab bar ---- */}
      <div className="hireling-tabs" role="tablist">
        <button
          role="tab"
          className={`hireling-tab ${view === 'party' ? 'tab-active' : ''}`}
          onClick={() => setView('party')}
          aria-selected={view === 'party'}
        >
          <Users size={14} />
          Your Party ({livingHirelings.length})
        </button>
        <button
          role="tab"
          className={`hireling-tab ${view === 'roster' ? 'tab-active' : ''}`}
          onClick={() => setView('roster')}
          aria-selected={view === 'roster'}
        >
          <UserPlus size={14} />
          Hire ({availableRoster.length} available)
        </button>
      </div>

      {/* ---- Feedback ---- */}
      {feedback && (
        <div className={`hireling-feedback hireling-feedback-${feedback.type}`}>
          {feedback.type === 'success'
            ? <CheckCircle size={14} />
            : <AlertCircle size={14} />
          }
          {feedback.text}
        </div>
      )}

      {/* ================================================================
          PARTY VIEW
      ================================================================ */}
      {view === 'party' && (
        <div className="hireling-party">
          {livingHirelings.length === 0 && deadHirelings.length === 0 ? (
            <div className="hireling-empty">
              <Users size={28} />
              <p>You have no companions.</p>
              <p className="hireling-empty-hint">
                Visit the Hire tab to recruit help before heading into the dungeon.
              </p>
            </div>
          ) : (
            <>
              {livingHirelings.map(h => (
                <HirelingCard
                  key={h.instanceId}
                  hireling={h}
                  onDismiss={handleDismiss}
                  onToggleMode={handleToggleMode}
                  alive
                />
              ))}
              {deadHirelings.map(h => (
                <HirelingCard
                  key={h.instanceId}
                  hireling={h}
                  onDismiss={handleDismiss}
                  onToggleMode={handleToggleMode}
                  alive={false}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* ================================================================
          ROSTER VIEW
      ================================================================ */}
      {view === 'roster' && (
        <div className="hireling-roster">
          {availableRoster.length === 0 ? (
            <div className="hireling-empty">
              <UserPlus size={28} />
              <p>No one available for hire right now.</p>
            </div>
          ) : (
            availableRoster.map(template => (
              <RosterCard
                key={template.templateId}
                template={template}
                canAfford={character.gold >= template.wagePerExpedition}
                onRecruit={handleRecruit}
              />
            ))
          )}
          <p className="roster-note">
            Wages are paid upfront per expedition. Hirelings will meet you
            at the dungeon entrance.
          </p>
        </div>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// HIRELING CARD (party view)
// ---------------------------------------------------------------------------

function HirelingCard({ hireling, onDismiss, onToggleMode, alive }) {
  const loyaltySign  = hireling.loyalty > 0 ? '+' : '';
  const loyaltyClass = hireling.loyalty > 0
    ? 'loyalty-positive'
    : hireling.loyalty < 0
    ? 'loyalty-negative'
    : 'loyalty-neutral';

  return (
    <div className={`hireling-card ${alive ? '' : 'hireling-dead'}`}>

      {/* Header row */}
      <div className="hcard-header">
        <div className="hcard-identity">
          <span className="hcard-role-icon" aria-hidden="true">
            {ROLE_ICONS[hireling.role] ?? '👤'}
          </span>
          <div>
            <span className="hcard-name">{hireling.name}</span>
            <span className="hcard-role">{hireling.role}</span>
          </div>
        </div>

        {alive && (
          <div className="hcard-actions">
            <button
              className="hcard-mode-btn"
              onClick={() => onToggleMode(hireling.instanceId, hireling.mode)}
              title={`Mode: ${hireling.mode}. Click to toggle.`}
            >
              {hireling.mode === 'protector' ? <Shield size={14} /> : <Sword size={14} />}
              {hireling.mode === 'protector' ? 'Protector' : 'Manual'}
            </button>
            <button
              className="hcard-dismiss-btn"
              onClick={() => onDismiss(hireling.instanceId, hireling.name)}
              title="Dismiss hireling"
            >
              <UserMinus size={14} />
            </button>
          </div>
        )}

        {!alive && (
          <span className="hcard-deceased">Deceased</span>
        )}
      </div>

      {/* Stats row */}
      <div className="hcard-stats">
        <span className="hcard-stat">
          ♥ {hireling.hp.current}/{hireling.hp.max}
        </span>
        <span className="hcard-stat">
          AC {hireling.ac}
        </span>
        <span className="hcard-stat">
          ML {hireling.morale}
        </span>
        <span className={`hcard-stat hcard-loyalty ${loyaltyClass}`}>
          Loyalty {loyaltySign}{hireling.loyalty}
        </span>
        {hireling.weapon && (
          <span className="hcard-stat">⚔ {hireling.weapon}</span>
        )}
        {hireling.spells && hireling.spells.length > 0 && alive && (
          <span className="hcard-stat">
            ✨ {hireling.spellsRemaining
              ? Object.values(hireling.spellsRemaining).reduce((a, b) => a + b, 0)
              : 0} spell{Object.values(hireling.spellsRemaining ?? {}).reduce((a,b)=>a+b,0) !== 1 ? 's' : ''} left
          </span>
        )}
      </div>

      {/* Description (collapsed to hint) */}
      <p className="hcard-desc">{hireling.description}</p>

    </div>
  );
}

// ---------------------------------------------------------------------------
// ROSTER CARD (hire view)
// ---------------------------------------------------------------------------

function RosterCard({ template, canAfford, onRecruit }) {
  return (
    <div className={`roster-card ${canAfford ? '' : 'roster-card-broke'}`}>

      <div className="rcard-header">
        <div className="rcard-identity">
          <span className="rcard-role-icon" aria-hidden="true">
            {ROLE_ICONS[template.role] ?? '👤'}
          </span>
          <div>
            <span className="rcard-name">{template.name}</span>
            <span className="rcard-role">{template.role}</span>
          </div>
        </div>
        <div className="rcard-wage">
          <span className={`rcard-wage-amount ${canAfford ? '' : 'wage-cant-afford'}`}>
            {template.wagePerExpedition} GP
          </span>
          <span className="rcard-wage-label">per expedition</span>
        </div>
      </div>

      <p className="rcard-desc">{template.description}</p>

      <div className="rcard-stats">
        <span className="rcard-stat">♥ {template.hp.max} HP</span>
        <span className="rcard-stat">AC {template.ac}</span>
        <span className="rcard-stat">ML {template.morale}</span>
        {template.combat && <span className="rcard-stat rcard-combat">⚔ Can fight</span>}
        {template.spells && template.spells.length > 0 && (
          <span className="rcard-stat rcard-spells">✨ Can cast spells</span>
        )}
        <span className="rcard-stat">
          Carry +{template.carryCapacity} coins
        </span>
      </div>

      <button
        className="rcard-hire-btn"
        onClick={() => onRecruit(template.templateId, template.wagePerExpedition)}
        disabled={!canAfford}
      >
        {canAfford ? `Hire for ${template.wagePerExpedition} GP` : 'Cannot afford'}
      </button>

    </div>
  );
}

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

const ROLE_ICONS = {
  'Torchbearer':      '🕯️',
  'Porter':           '🎒',
  'Man-at-Arms':      '⚔️',
  'Initiate Cleric':  '✝️'
};

export default HirelingPanel;
