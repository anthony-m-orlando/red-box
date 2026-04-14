/**
 * NPCDialogue.jsx
 * Recursive dialogue tree engine for all Town of Threshold NPCs.
 *
 * USAGE
 * -----
 *   <NPCDialogue npcId="innkeeper" onEffect={handleEffect} />
 *
 * The component reads the tree from townData.dialogueTrees, resolves
 * the current node, evaluates option gates, and calls onEffect(effect)
 * when the player picks an option that carries a side-effect.
 *
 * onEffect is the location component's responsibility — it receives the
 * raw effect object and translates it into TownContext / CharacterContext
 * calls. This keeps NPCDialogue pure (no context imports).
 *
 * ATTITUDE-AWARE TEXT
 * -------------------
 * Node `text` may be a plain string OR a function:
 *   (attitude, character, townState) => string
 * NPCDialogue resolves it before rendering.
 *
 * HISTORY
 * -------
 * A local history stack lets the player step back one level at a time.
 * The stack is reset when the dialogue is closed and re-opened.
 */

import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, MessageSquare }      from 'lucide-react';

import { useCharacter }    from '../../contexts/CharacterContext';
import { useTown }         from '../../contexts/TownContext';
import {
  getDialogueNode,
  evaluateRequires,
  getNPC
} from '../../data/townData';

import './NPCDialogue.css';

// ---------------------------------------------------------------------------

export function NPCDialogue({ npcId, onEffect }) {
  const { character }           = useCharacter();
  const { town, getAttitude }   = useTown();

  const npc      = useMemo(() => getNPC(npcId), [npcId]);
  const attitude = getAttitude(npcId);

  // Navigation stack: array of node ids, current = last element
  const [stack, setStack] = useState([null]); // null = entry node
  const currentNodeId = stack[stack.length - 1];

  // Resolve node (null → entry node for this NPC)
  const node = useMemo(
    () => getDialogueNode(npcId, currentNodeId),
    [npcId, currentNodeId]
  );

  // Resolve text (string or function)
  const resolvedText = useMemo(() => {
    if (!node) return '';
    return typeof node.text === 'function'
      ? node.text(attitude, character, town)
      : node.text;
  }, [node, attitude, character, town]);

  // ---- Fire node-level effect on mount when node has a direct `effect`
  // (e.g. the priest's greeting resolves the resurrection automatically)
  // We use a ref so it only fires once per node visit.
  const [firedNodeEffect, setFiredNodeEffect] = useState(false);
  if (node?.effect && !firedNodeEffect && typeof node.effect !== 'function') {
    setFiredNodeEffect(true);
    // Defer to avoid setState-during-render
    setTimeout(() => onEffect?.(node.effect), 0);
  }
  // Reset when node changes
  const prevNodeId = useMemo(() => currentNodeId, []); // eslint-disable-line
  if (currentNodeId !== prevNodeId) setFiredNodeEffect(false);

  // ---- Handle option selection
  const handleOption = useCallback((option) => {
    // Fire side-effect if present
    if (option.effect) {
      onEffect?.(option.effect);
    }

    if (option.next === null) {
      // Close dialogue — pop back to entry
      setStack([null]);
      // Signal parent that dialogue has closed naturally
      onEffect?.({ type: 'dialogue_closed' });
    } else {
      setStack(prev => [...prev, option.next]);
      setFiredNodeEffect(false);
    }
  }, [onEffect]);

  // ---- Back button
  const handleBack = useCallback(() => {
    if (stack.length > 1) {
      setStack(prev => prev.slice(0, -1));
      setFiredNodeEffect(false);
    }
  }, [stack]);

  if (!npc || !node) {
    return (
      <div className="npc-dialogue npc-dialogue-error">
        <p>No dialogue available.</p>
      </div>
    );
  }

  return (
    <div className="npc-dialogue">

      {/* ---- NPC identity bar ---- */}
      <div className="npc-identity">
        <div className="npc-portrait" aria-hidden="true">
          {npc.portrait}
        </div>
        <div className="npc-identity-text">
          <span className="npc-name">{npc.name}</span>
          <span className="npc-title">{npc.title}</span>
        </div>
        <AttitudeBadge attitude={attitude} />
      </div>

      {/* ---- Speech bubble ---- */}
      <div className="npc-speech" role="status" aria-live="polite">
        {resolvedText}
      </div>

      {/* ---- Options ---- */}
      <div className="dialogue-options" role="group" aria-label="Dialogue options">
        {node.options?.map((option, idx) => {
          const gate = evaluateRequires(option.requires, character, town);
          const isLocked = !gate.met;

          return (
            <DialogueOption
              key={idx}
              option={option}
              isLocked={isLocked}
              lockReason={gate.reason}
              onSelect={handleOption}
            />
          );
        })}
      </div>

      {/* ---- Back button (when not at entry node) ---- */}
      {stack.length > 1 && (
        <button className="dialogue-back-btn" onClick={handleBack}>
          <ChevronLeft size={14} />
          Go back
        </button>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// DIALOGUE OPTION
// ---------------------------------------------------------------------------

function DialogueOption({ option, isLocked, lockReason, onSelect }) {
  // Parse cost hint from effect for display
  const costHint = useMemo(() => {
    if (!option.effect) return null;
    const { cost, donation } = option.effect;
    const amount = cost ?? donation;
    return amount ? `${amount} GP` : null;
  }, [option.effect]);

  return (
    <button
      className={`dialogue-option-btn ${isLocked ? 'option-locked' : ''}`}
      onClick={() => !isLocked && onSelect(option)}
      disabled={isLocked}
      aria-disabled={isLocked}
    >
      <span className="option-label">{option.label}</span>
      {costHint && !isLocked && (
        <span className="option-cost">({costHint})</span>
      )}
      {isLocked && lockReason && (
        <span className="option-lock-reason">{lockReason}</span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ATTITUDE BADGE
// ---------------------------------------------------------------------------

const ATTITUDE_CONFIG = {
  friendly: { label: 'Friendly', className: 'attitude-friendly' },
  neutral:  { label: 'Neutral',  className: 'attitude-neutral'  },
  hostile:  { label: 'Hostile',  className: 'attitude-hostile'  }
};

function AttitudeBadge({ attitude }) {
  const config = ATTITUDE_CONFIG[attitude] ?? ATTITUDE_CONFIG.neutral;
  return (
    <span className={`attitude-badge ${config.className}`} title={`NPC attitude: ${config.label}`}>
      {config.label}
    </span>
  );
}

export default NPCDialogue;
