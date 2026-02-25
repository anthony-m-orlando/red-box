import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Skull, Shield, ArrowLeft, BookOpen } from 'lucide-react';
import { useAdventure } from '../../contexts/AdventureContext';
import { useCharacter } from '../../contexts/CharacterContext';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './AdventureSelection.css';

/**
 * AdventureSelection - Choose which adventure to embark on
 */
export default function AdventureSelection() {
  const navigate = useNavigate();
  const adventure = useAdventure();
  const { character } = useCharacter();
  const [selectedAdventure, setSelectedAdventure] = useState(null);

  // Check if character exists
  if (!character || !character.name) {
    return (
      <div className="adventure-selection">
        <PaperContainer variant="aged" padding="xl">
          <h2>No Character Found</h2>
          <p>You must create a character before starting an adventure.</p>
          <Button onClick={() => navigate('/character/create')}>
            Create Character
          </Button>
        </PaperContainer>
      </div>
    );
  }

  const adventures = [
    {
      id: 'tutorial',
      title: 'Your First Adventure',
      subtitle: 'The Tutorial Dungeon',
      difficulty: 'Beginner',
      recommendedLevel: 1,
      description: 'A small dungeon perfect for learning the basics of exploration and combat. Face goblins, giant snakes, and the fearsome rust monster.',
      features: [
        '5 rooms to explore',
        '3 different monster types',
        'Mixed challenges',
        'Learn game mechanics'
      ],
      icon: <BookOpen size={32} />,
      color: 'var(--ink-blue)',
      available: true
    },
    {
      id: 'goblin_warren',
      title: 'The Goblin Warren',
      subtitle: 'Goblin Infestation',
      difficulty: 'Easy',
      recommendedLevel: 1,
      description: 'A network of goblin-infested tunnels. The local village has offered a reward for clearing out this menace. Face goblin guards, giant rats, and their chieftain.',
      features: [
        '5 rooms of goblin tunnels',
        'Goblin Chieftain boss battle',
        'Good for beginners',
        'Treasure rewards'
      ],
      icon: <Shield size={32} />,
      color: 'var(--ink-brown)',
      available: true
    },
    {
      id: 'haunted_crypt',
      title: 'The Haunted Crypt',
      subtitle: 'Undead Tomb',
      difficulty: 'Medium',
      recommendedLevel: 1,
      description: 'An ancient burial site where the dead walk. Dark magic permeates the air. Clerics will find their abilities especially valuable here.',
      features: [
        '4 rooms of undead horror',
        'Skeleton Guardians',
        'Zombie Lord boss (12 HP!)',
        'Cleric-focused challenges'
      ],
      icon: <Skull size={32} />,
      color: 'var(--ink-red)',
      available: true
    }
  ];

  const handleStartAdventure = () => {
    if (!selectedAdventure) return;
    
    // Reset adventure state
    adventure.resetAdventure();
    
    // Set the selected adventure ID (you'll need to implement this)
    // For now, we'll just go to the adventure screen
    // In the future, AdventureContext should load the selected adventure
    
    navigate('/adventure');
  };

  return (
    <div className="adventure-selection">
      <PaperContainer variant="aged" padding="xl" className="selection-container">
        <div className="selection-header">
          <Button
            variant="ghost"
            icon={<ArrowLeft />}
            onClick={() => navigate('/')}
          >
            Back to Menu
          </Button>
          <h1>Choose Your Adventure</h1>
          <p className="character-name">Playing as: <strong>{character.name}</strong> ({character.class.name})</p>
        </div>

        <div className="adventures-grid">
          {adventures.map((adv) => (
            <div
              key={adv.id}
              className={`adventure-card ${selectedAdventure === adv.id ? 'selected' : ''} ${!adv.available ? 'locked' : ''}`}
              onClick={() => adv.available && setSelectedAdventure(adv.id)}
            >
              <div className="adventure-icon" style={{ color: adv.color }}>
                {adv.icon}
              </div>
              
              <div className="adventure-content">
                <h3>{adv.title}</h3>
                <p className="subtitle">{adv.subtitle}</p>
                
                <div className="adventure-meta">
                  <span className={`difficulty ${adv.difficulty.toLowerCase()}`}>
                    {adv.difficulty}
                  </span>
                  <span className="level">
                    <MapPin size={14} /> Level {adv.recommendedLevel}
                  </span>
                </div>

                <p className="description">{adv.description}</p>

                <ul className="features">
                  {adv.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>

                {!adv.available && (
                  <div className="locked-overlay">
                    <span>🔒 Coming Soon</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedAdventure && (
          <div className="selection-footer">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartAdventure}
              fullWidth
            >
              Begin: {adventures.find(a => a.id === selectedAdventure)?.title}
            </Button>
          </div>
        )}
      </PaperContainer>
    </div>
  );
}
