import React, { useState } from 'react';
import { Dices, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { rollDice } from '../../utils/dice';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './DiceRoller.css';

export function DiceRoller() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [dieType, setDieType] = useState(20);
  const [modifier, setModifier] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  const diceTypes = [4, 6, 8, 10, 12, 20, 100];

  const handleRoll = () => {
    setIsRolling(true);
    
    // Animate for 500ms
    setTimeout(() => {
      const rolls = rollDice(quantity, dieType);
      const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;
      
      const newResult = {
        rolls,
        total,
        quantity,
        dieType,
        modifier,
        timestamp: Date.now()
      };
      
      setResult(newResult);
      setHistory([newResult, ...history].slice(0, 10)); // Keep last 10
      setIsRolling(false);
    }, 500);
  };

  const formatModifier = (mod) => {
    if (mod === 0) return '';
    return mod > 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="dice-roller">
      <PaperContainer padding="lg" className="roller-container">
        <div className="roller-header">
          <Dices size={48} />
          <h1>Dice Roller</h1>
          <p className="roller-subtitle">Roll the bones!</p>
        </div>

        {/* Controls */}
        <div className="roller-controls">
          <div className="control-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              className="number-input"
            />
          </div>

          <div className="control-group">
            <label>Die Type</label>
            <div className="dice-buttons">
              {diceTypes.map(die => (
                <button
                  key={die}
                  className={`die-button ${dieType === die ? 'active' : ''}`}
                  onClick={() => setDieType(die)}
                >
                  d{die}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>Modifier</label>
            <input
              type="number"
              min="-10"
              max="10"
              value={modifier}
              onChange={(e) => setModifier(Math.min(10, Math.max(-10, parseInt(e.target.value) || 0)))}
              className="number-input"
            />
          </div>
        </div>

        {/* Roll Button */}
        <Button
          variant="primary"
          size="lg"
          icon={<Dices />}
          onClick={handleRoll}
          disabled={isRolling}
          fullWidth
        >
          {isRolling ? 'Rolling...' : `Roll ${quantity}d${dieType}${formatModifier(modifier)}`}
        </Button>

        {/* Result Display */}
        {result && (
          <div className={`result-display ${isRolling ? 'rolling' : ''}`}>
            <div className="result-total">
              <span className="result-label">Total:</span>
              <span className="result-value number">{result.total}</span>
            </div>
            <div className="result-breakdown">
              <span className="breakdown-label">Rolls:</span>
              <span className="breakdown-values">[{result.rolls.join(', ')}]</span>
              {result.modifier !== 0 && (
                <span className="breakdown-modifier"> {formatModifier(result.modifier)}</span>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="roll-history">
            <div className="history-header">
              <h3>Recent Rolls</h3>
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw />}
                onClick={() => setHistory([])}
              >
                Clear
              </Button>
            </div>
            <div className="history-list">
              {history.map((roll, index) => (
                <div key={roll.timestamp} className="history-item">
                  <span className="history-formula">
                    {roll.quantity}d{roll.dieType}{formatModifier(roll.modifier)}
                  </span>
                  <span className="history-result">
                    <span className="history-rolls">[{roll.rolls.join(', ')}]</span>
                    <span className="history-total number">{roll.total}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="roller-footer">
          <Button
            variant="ghost"
            icon={<Home />}
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </Button>
        </div>
      </PaperContainer>
    </div>
  );
}

export default DiceRoller;
