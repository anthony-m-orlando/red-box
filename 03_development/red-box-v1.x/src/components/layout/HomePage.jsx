import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, BookOpen, Dices, Scroll, Users } from 'lucide-react';
import Button from '../common/Button';
import './HomePage.css';
import dragonCover from '../../assets/images/dragon-cover.png';

/**
 * HomePage - Landing page with red dragon cover art and feature cards
 * Entry point for the application
 */
export const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'new-character',
      icon: <Swords size={48} />,
      title: 'Create New Character',
      description: 'Roll dice, choose your class, and embark on adventure',
      action: () => {
        // Clear any existing character before creating new one
        localStorage.removeItem('rpg-character');
        navigate('/character/create');
      },
      color: 'var(--ink-red)'
    },
    {
      id: 'manage-characters',
      icon: <Users size={48} />,
      title: 'Manage Characters',
      description: 'View, import, export, and switch between heroes',
      action: () => navigate('/character/manage'),
      color: 'var(--ink-brown)'
    },
    {
      id: 'continue',
      icon: <BookOpen size={48} />,
      title: 'Continue Adventure',
      description: 'Choose your quest and embark on adventure',
      action: () => navigate('/adventure/select'),
      color: 'var(--ink-blue)'
    },
    {
      id: 'dice-tools',
      icon: <Dices size={48} />,
      title: 'Dice Roller',
      description: 'Roll d4, d6, d8, d10, d12, and d20 dice',
      action: () => navigate('/tools/dice'),
      color: 'var(--ink-brown)'
    },
    {
      id: 'reference',
      icon: <Scroll size={48} />,
      title: 'Reference Library',
      description: 'Browse monsters, spells, and game rules',
      action: () => navigate('/reference'),
      color: 'var(--ink-black)'
    }
  ];

  return (
    <div className="home-page">
      {/* Dragon Cover Art Section */}
      <div className="hero-section">
        <div className="dragon-cover">
          <img 
            src={dragonCover} 
            alt="Dungeons & Dragons Red Dragon Cover Art" 
            className="dragon-image"
          />
          <div className="title-overlay">
            <h1 className="game-title">
              Dungeons & Dragons
            </h1>
            <p className="game-title">Basic Set</p>
            <p className="tagline">Solo Adventure Demo</p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="features-container">
        <div className="features-grid">
          {features.map((feature) => (
            <FeatureCard 
              key={feature.id} 
              {...feature} 
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p className="footer-text">
          This is a faithful digital recreation of the 1983 D&D Basic Rules.
          <br />
          All game mechanics are authentic to the original ruleset.
        </p>
      </footer>
    </div>
  );
};

/**
 * FeatureCard - Individual card in the features grid
 */
const FeatureCard = ({ icon, title, description, action, color, disabled }) => {
  return (
    <button
      className={`feature-card ${disabled ? 'feature-card-disabled' : ''}`}
      onClick={action}
      disabled={disabled}
      style={{ '--card-color': color }}
    >
      <div className="feature-icon" style={{ color }}>
        {icon}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      {disabled && (
        <span className="feature-badge">No Save Found</span>
      )}
    </button>
  );
};

/**
 * Helper to check if there's an existing save game
 */
function hasExistingSave() {
  try {
    const save = localStorage.getItem('rpg-save');
    return !!save;
  } catch {
    return false;
  }
}

export default HomePage;
