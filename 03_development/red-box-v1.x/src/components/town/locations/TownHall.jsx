/**
 * TownHall.jsx
 * Threshold Town Hall — Aldous Fenwick, town clerk.
 *
 * SECTIONS:
 *   npc     → Aldous dialogue
 *   bank    → Deposit / withdraw / balance view
 *   board   → Adventure contract board
 *
 * EFFECTS handled:
 *   open_bank          → switch to bank tab, sets bank mode (deposit/withdraw/balance)
 *   open_adventure_board → switch to board tab
 *   register_adventurer → registerAdventurer(), shifts attitude
 *   attitude_shift     → shiftAttitude
 *
 * BANK
 * ----
 * character.gold ←→ town.bankBalance
 * deposit:  updateGold(-amount), depositGold(amount)
 * withdraw: withdrawGold(amount) returns actual (capped), updateGold(+actual)
 *
 * CONTRACT BOARD
 * --------------
 * Contracts are defined in townData and listed here. Each contract shows
 * objective, reward hint, and an Accept button that calls acceptContract().
 * Already accepted contracts show status instead.
 */

import { useState, useCallback } from 'react';
import { X, ScrollText, Landmark, Sword } from 'lucide-react';

import { useCharacter }  from '../../../contexts/CharacterContext';
import { useTown }       from '../../../contexts/TownContext';
import { NPCDialogue }   from '../NPCDialogue';

import './Location.css';

// ---------------------------------------------------------------------------

const TABS = [
  { id: 'npc',   label: 'Speak with Aldous', icon: null },
  { id: 'bank',  label: 'Bank',              icon: <Landmark size={14} /> },
  { id: 'board', label: 'Contract Board',    icon: <Sword size={14} /> }
];

// Static contract definitions — in B1 scope this would come from townData
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

export function TownHall({ onClose }) {
  const { character, updateGold } = useCharacter();
  const {
    town,
    shiftAttitude,
    depositGold,
    withdrawGold,
    registerAdventurer,
    acceptContract,
    hasContract,
    getContractStatus
  } = useTown();

  const [tab,       setTab]       = useState('npc');
  const [bankMode,  setBankMode]  = useState('balance'); // 'balance'|'deposit'|'withdraw'
  const [bankInput, setBankInput] = useState('');
  const [notice,    setNotice]    = useState(null);

  const showNotice = useCallback((type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  }, []);

  // ---- Effect dispatcher
  const handleEffect = useCallback((effect) => {
    if (!effect?.type) return;
    switch (effect.type) {

      case 'open_bank':
        setBankMode(effect.mode ?? 'balance');
        setTab('bank');
        break;

      case 'open_adventure_board':
        setTab('board');
        break;

      case 'register_adventurer':
        if (!town.registeredAdventurer) {
          registerAdventurer();
          showNotice('success', 'You are now a registered adventurer of Threshold. Contracts are now available to you.');
        }
        break;

      case 'attitude_shift':
        shiftAttitude(effect.npc, effect.delta);
        break;

      default:
        break;
    }
  }, [town.registeredAdventurer, registerAdventurer, shiftAttitude, showNotice]);

  // ---- Bank: deposit
  const handleDeposit = useCallback(() => {
    const amount = parseInt(bankInput, 10);
    if (!amount || amount <= 0) { showNotice('error', 'Enter a valid amount.'); return; }
    if (amount > character.gold)  { showNotice('error', `You only have ${character.gold} GP on hand.`); return; }
    updateGold(-amount);
    depositGold(amount);
    setBankInput('');
    showNotice('success', `${amount} GP deposited. Bank balance: ${town.bankBalance + amount} GP`);
  }, [bankInput, character.gold, updateGold, depositGold, town.bankBalance, showNotice]);

  // ---- Bank: withdraw
  const handleWithdraw = useCallback(() => {
    const amount = parseInt(bankInput, 10);
    if (!amount || amount <= 0)         { showNotice('error', 'Enter a valid amount.'); return; }
    if (amount > town.bankBalance)       { showNotice('error', `Bank balance is only ${town.bankBalance} GP.`); return; }
    const actual = withdrawGold(amount); // returns actual withdrawn (capped)
    updateGold(actual);
    setBankInput('');
    showNotice('success', `${actual} GP withdrawn. Bank balance: ${town.bankBalance - actual} GP`);
  }, [bankInput, town.bankBalance, withdrawGold, updateGold, showNotice]);

  // ---- Contract: accept
  const handleAcceptContract = useCallback((contractId) => {
    if (!town.registeredAdventurer) {
      showNotice('error', 'You must register as an adventurer first. Speak with Aldous.');
      return;
    }
    acceptContract(contractId);
    showNotice('success', 'Contract accepted. Complete the objective and return to claim your reward.');
  }, [town.registeredAdventurer, acceptContract, showNotice]);

  return (
    <div className="location-panel">

      <div className="location-header">
        <div className="location-header-left">
          <span className="location-header-icon">📜</span>
          <div>
            <h2 className="location-header-title">Threshold Town Hall</h2>
            <p className="location-header-desc">
              Official business: the bank, the contract board, and adventurer registration.
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

        {/* NPC */}
        {tab === 'npc' && <NPCDialogue npcId="clerk" onEffect={handleEffect} />}

        {/* BANK */}
        {tab === 'bank' && (
          <div className="bank-panel">

            {/* Balance summary */}
            <div className="bank-summary">
              <div className="bank-summary-row">
                <span className="bank-label">On your person</span>
                <span className="bank-value">{character.gold} GP</span>
              </div>
              <div className="bank-summary-row bank-summary-row--total">
                <span className="bank-label">In the vault</span>
                <span className="bank-value">{town.bankBalance} GP</span>
              </div>
            </div>

            {/* Mode switcher */}
            <div className="bank-mode-tabs">
              {['deposit', 'withdraw', 'balance'].map(mode => (
                <button
                  key={mode}
                  className={`bank-mode-btn ${bankMode === mode ? 'bank-mode-active' : ''}`}
                  onClick={() => setBankMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {bankMode === 'balance' && (
              <p className="bank-note">
                The Threshold vault is secured by a permanent Wizard Lock and
                guarded at all hours. Your gold is safe here.
              </p>
            )}

            {(bankMode === 'deposit' || bankMode === 'withdraw') && (
              <div className="bank-transaction">
                <label className="bank-input-label" htmlFor="bank-amount">
                  {bankMode === 'deposit' ? 'Amount to deposit (GP)' : 'Amount to withdraw (GP)'}
                </label>
                <div className="bank-input-row">
                  <input
                    id="bank-amount"
                    className="bank-input"
                    type="number"
                    min="1"
                    max={bankMode === 'deposit' ? character.gold : town.bankBalance}
                    value={bankInput}
                    onChange={e => setBankInput(e.target.value)}
                    placeholder="0"
                  />
                  <button
                    className="bank-confirm-btn"
                    onClick={bankMode === 'deposit' ? handleDeposit : handleWithdraw}
                    disabled={!bankInput || parseInt(bankInput, 10) <= 0}
                  >
                    Confirm
                  </button>
                </div>
                {bankMode === 'deposit' && (
                  <p className="bank-note">
                    Maximum: {character.gold} GP (on hand)
                  </p>
                )}
                {bankMode === 'withdraw' && (
                  <p className="bank-note">
                    Maximum: {town.bankBalance} GP (in vault)
                  </p>
                )}
              </div>
            )}

          </div>
        )}

        {/* CONTRACT BOARD */}
        {tab === 'board' && (
          <div className="contract-board">
            {!town.registeredAdventurer && (
              <div className="board-unregistered">
                <ScrollText size={24} />
                <p>
                  You must register as an adventurer before accepting contracts.
                  Speak with Aldous Fenwick at the reception desk.
                </p>
              </div>
            )}

            <div className="contract-list">
              {CONTRACTS.map(contract => {
                const status = getContractStatus(contract.contractId);
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
                          onClick={() => handleAcceptContract(contract.contractId)}
                          disabled={!town.registeredAdventurer}
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

      </div>
    </div>
  );
}

const STATUS_LABELS = {
  active:    'In Progress',
  completed: 'Completed',
  failed:    'Failed'
};

export default TownHall;
