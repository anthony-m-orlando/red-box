/**
 * TurnCounter.jsx
 * Light Source Status + Turn Clock Widget
 *
 * Displayed in the DungeonScreen sidebar / action panel.
 * Reads dungeonState from AdventureContext — no props required.
 *
 * Shows:
 *   - Current turn count with elapsed-time label
 *   - Active light source and remaining duration
 *   - Urgency colour coding (safe → warning → critical → dark)
 *   - Next wandering monster check countdown
 *   - Quick-light button for torches (calls lightNewSource from context)
 */

import React, { useMemo } from 'react';
import { useAdventure } from '../../contexts/AdventureContext';
import './TurnCounter.css';

// Lucide-react icons (available in project)
import { Flame, Flashlight, Clock, AlertTriangle, Moon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TURNS_PER_WANDER_CHECK = 2;

// ─────────────────────────────────────────────────────────────────────────────
// TurnCounter
// ─────────────────────────────────────────────────────────────────────────────

export function TurnCounter() {
  const {
    dungeonState,
    getLightStatus,
    getTurnLabel,
    lightNewSource,
  } = useAdventure();

  const {
    turnCount,
    hasLight,
    lightSource,
    lightDuration,
    wanderingMonsterDue,
  } = dungeonState;

  // Derived values
  const lightStatus  = useMemo(() => getLightStatus(), [getLightStatus]);
  const turnLabel    = useMemo(() => getTurnLabel(),   [getTurnLabel]);

  // Turns until next wandering monster check
  const nextCheck = useMemo(() => {
    const currentCheckBlock = Math.floor(turnCount / TURNS_PER_WANDER_CHECK);
    return (currentCheckBlock + 1) * TURNS_PER_WANDER_CHECK - turnCount;
  }, [turnCount]);

  const urgency = lightStatus.urgency;   // 'safe' | 'warning' | 'critical' | 'dark'

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className={`turn-counter turn-counter--${urgency}`} aria-live="polite" aria-atomic="false">

      {/* ── Turn clock ────────────────────────────────────────────────── */}
      <div className="turn-counter__row turn-counter__clock">
        <Clock size={13} className="turn-counter__icon" aria-hidden="true" />
        <span className="turn-counter__label">Turn</span>
        <span className="turn-counter__value turn-counter__value--mono">{turnCount}</span>
        <span className="turn-counter__sublabel">{turnLabel}</span>
      </div>

      {/* ── Light status ──────────────────────────────────────────────── */}
      <div className={`turn-counter__row turn-counter__light turn-counter__light--${urgency}`}>
        <LightIcon source={lightSource} urgency={urgency} />
        <span className="turn-counter__light-text">{lightStatus.label}</span>

        {/* Light bar */}
        {hasLight && lightSource !== 'infravision' && lightDuration > 0 && (
          <LightBar
            duration={lightDuration}
            maxDuration={maxDurationForSource(lightSource)}
            urgency={urgency}
          />
        )}
      </div>

      {/* ── Dark warning + relight button ─────────────────────────────── */}
      {urgency === 'dark' && (
        <div className="turn-counter__dark-warning">
          <AlertTriangle size={12} className="turn-counter__icon--alert" aria-hidden="true" />
          <span>You are in darkness!</span>
          <button
            className="turn-counter__relight-btn"
            onClick={() => lightNewSource('torch')}
            title="Light a torch (uses one from inventory)"
          >
            Light torch
          </button>
        </div>
      )}

      {/* ── Wandering monster alert ────────────────────────────────────── */}
      {wanderingMonsterDue && (
        <div className="turn-counter__wander-alert" role="alert">
          <AlertTriangle size={12} aria-hidden="true" />
          <span>Something stirs in the dark…</span>
        </div>
      )}

      {/* ── Next check countdown ──────────────────────────────────────── */}
      {!wanderingMonsterDue && turnCount > 0 && (
        <div className="turn-counter__row turn-counter__wander-clock">
          <span className="turn-counter__sublabel">
            Next encounter check in {nextCheck} turn{nextCheck !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LightIcon — contextual icon based on active light source
// ─────────────────────────────────────────────────────────────────────────────

function LightIcon({ source, urgency }) {
  const iconProps = { size: 13, className: 'turn-counter__icon', 'aria-hidden': 'true' };

  if (urgency === 'dark') {
    return <Moon {...iconProps} className="turn-counter__icon turn-counter__icon--dark" />;
  }
  if (source === 'lantern') {
    return <Flashlight {...iconProps} />;
  }
  // torch, light_spell, infravision, default
  return <Flame {...iconProps} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// LightBar — depleting fuel gauge
// ─────────────────────────────────────────────────────────────────────────────

function LightBar({ duration, maxDuration, urgency }) {
  const pct = Math.max(0, Math.min(100, (duration / maxDuration) * 100));

  return (
    <div
      className={`turn-counter__light-bar turn-counter__light-bar--${urgency}`}
      role="meter"
      aria-valuenow={duration}
      aria-valuemin={0}
      aria-valuemax={maxDuration}
      aria-label={`Light remaining: ${duration} of ${maxDuration} turns`}
      title={`${duration} of ${maxDuration} turns`}
    >
      <div
        className="turn-counter__light-bar-fill"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: canonical max duration per source type
// ─────────────────────────────────────────────────────────────────────────────

function maxDurationForSource(source) {
  if (source === 'lantern')     return 24;
  if (source === 'light_spell') return 6;
  return 6;   // torch default
}

export default TurnCounter;
