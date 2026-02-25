import React, { useState } from 'react';
import { BookOpen, Skull, Home, Filter, Shield, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdventure } from '../../contexts/AdventureContext';
import { getAllMonsters } from '../../data/bestiary';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './Bestiary.css';

/**
 * Bestiary - Monster reference guide
 */
export function Bestiary() {
  const navigate = useNavigate();
  const { hasDefeated } = useAdventure();
  const [filter, setFilter] = useState('all'); // 'all' | 'defeated' | 'undefeated'

  const monsters = getAllMonsters();
  
  const filteredMonsters = monsters.filter(monster => {
    if (filter === 'defeated') return hasDefeated(monster.id);
    if (filter === 'undefeated') return !hasDefeated(monster.id);
    return true;
  });

  const defeatedCount = monsters.filter(m => hasDefeated(m.id)).length;

  return (
    <div className="bestiary">
      <PaperContainer padding="lg" className="bestiary-container">
        <div className="bestiary-header">
          <div className="header-icon">
            <BookOpen size={64} />
          </div>
          <h1>Monster Bestiary</h1>
          <p className="bestiary-subtitle">Creatures of the Dungeon</p>
          <div className="completion-tracker">
            <span className="completion-label">Defeated:</span>
            <span className="completion-count number">{defeatedCount}/{monsters.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bestiary-filters">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Monsters ({monsters.length})
          </Button>
          <Button
            variant={filter === 'defeated' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('defeated')}
          >
            Defeated ({defeatedCount})
          </Button>
          <Button
            variant={filter === 'undefeated' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('undefeated')}
          >
            Not Yet Faced ({monsters.length - defeatedCount})
          </Button>
        </div>

        {/* Monster Grid */}
        <div className="monster-grid">
          {filteredMonsters.map(monster => (
            <MonsterCard
              key={monster.id}
              monster={monster}
              defeated={hasDefeated(monster.id)}
            />
          ))}
        </div>

        {filteredMonsters.length === 0 && (
          <div className="no-monsters">
            <Skull size={48} />
            <p>No monsters match this filter.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="bestiary-footer">
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

/**
 * MonsterCard - Individual monster display card
 */
function MonsterCard({ monster, defeated }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <PaperContainer 
      variant="aged"
      className={`monster-card ${defeated ? 'defeated' : ''} ${expanded ? 'expanded' : ''}`}
    >
      {/* Header */}
      <div className="monster-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="monster-title">
          <Skull size={28} />
          <div>
            <h3>{monster.name}</h3>
            <span className="monster-type">{monster.type}</span>
          </div>
        </div>
        {defeated && <span className="defeated-badge">✓ Defeated</span>}
      </div>

      {/* Quick Stats */}
      <div className="monster-quick-stats">
        <div className="quick-stat">
          <span className="stat-label">HD:</span>
          <span className="stat-value number">{monster.hitDice}</span>
        </div>
        <div className="quick-stat">
          <span className="stat-label">AC:</span>
          <span className="stat-value number">{monster.ac}</span>
        </div>
        <div className="quick-stat">
          <span className="stat-label">XP:</span>
          <span className="stat-value number">{monster.xp}</span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="monster-details">
          {/* Full Stats */}
          <div className="stats-section">
            <h4>Statistics</h4>
            <div className="stats-grid">
              <div className="stat-row">
                <span>Hit Points:</span>
                <span className="number">{monster.hp.max}</span>
              </div>
              <div className="stat-row">
                <span>Armor Class:</span>
                <span className="number">{monster.ac}</span>
              </div>
              <div className="stat-row">
                <span>THAC0:</span>
                <span className="number">{monster.thac0}</span>
              </div>
              <div className="stat-row">
                <span>Movement:</span>
                <span className="number">{monster.movement}'</span>
              </div>
              <div className="stat-row">
                <span>Morale:</span>
                <span className="number">{monster.morale}</span>
              </div>
              <div className="stat-row">
                <span>Alignment:</span>
                <span>{monster.alignment}</span>
              </div>
            </div>
          </div>

          {/* Attacks */}
          <div className="attacks-section">
            <h4><Swords size={16} /> Attacks</h4>
            {monster.attacks.map((attack, index) => (
              <div key={index} className="attack-entry">
                <span className="attack-name">{attack.name}:</span>
                <span className="attack-damage">{attack.damage}</span>
                {attack.special && (
                  <span className="attack-special">({attack.special})</span>
                )}
              </div>
            ))}
          </div>

          {/* Special Abilities */}
          {monster.special.length > 0 && (
            <div className="special-section">
              <h4>Special Abilities</h4>
              <ul>
                {monster.special.map((ability, index) => (
                  <li key={index}>{ability}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          <div className="description-section">
            <h4>Description</h4>
            <p>{monster.description}</p>
          </div>

          {/* Tactics */}
          <div className="tactics-section">
            <h4>Combat Tactics</h4>
            <p>{monster.tactics}</p>
          </div>

          {/* Additional Info */}
          <div className="info-grid">
            <div className="info-item">
              <strong>Habitat:</strong>
              <span>{monster.habitat}</span>
            </div>
            <div className="info-item">
              <strong>Treasure:</strong>
              <span>{monster.treasure}</span>
            </div>
            <div className="info-item">
              <strong>Encounter Size:</strong>
              <span>{monster.encounterSize}</span>
            </div>
            {monster.weakness && (
              <div className="info-item weakness">
                <strong>Weakness:</strong>
                <span>{monster.weakness}</span>
              </div>
            )}
          </div>

          {/* Saving Throws */}
          <div className="saves-section">
            <h4><Shield size={16} /> Saving Throws</h4>
            <div className="saves-grid">
              <div className="save-item">
                <span>Death Ray:</span>
                <span className="number">{monster.saves.death}</span>
              </div>
              <div className="save-item">
                <span>Wands:</span>
                <span className="number">{monster.saves.wands}</span>
              </div>
              <div className="save-item">
                <span>Paralysis:</span>
                <span className="number">{monster.saves.paralysis}</span>
              </div>
              <div className="save-item">
                <span>Breath:</span>
                <span className="number">{monster.saves.breath}</span>
              </div>
              <div className="save-item">
                <span>Spells:</span>
                <span className="number">{monster.saves.spells}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expand/Collapse Indicator */}
      <div className="expand-indicator">
        {expanded ? '▲ Click to collapse' : '▼ Click for details'}
      </div>
    </PaperContainer>
  );
}

export default Bestiary;
