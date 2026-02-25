import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CharacterProvider } from './contexts/CharacterContext';
import { AdventureProvider } from './contexts/AdventureContext';
import ScrollToTop from './components/common/ScrollToTop';
import HomePage from './components/layout/HomePage';
import CharacterCreator from './components/character/CharacterCreator';
import CharacterManager from './components/character/CharacterManager';
import AdventureSelection from './components/adventure/AdventureSelection';
import AdventureScreen from './components/adventure/AdventureScreen';
import DiceRoller from './components/tools/DiceRoller';
import Bestiary from './components/tools/Bestiary';
import './styles/global.css';

/**
 * Main App Component
 * Sets up routing and global context providers
 */
function App() {
  return (
    <CharacterProvider>
      <AdventureProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Character Creation & Management */}
            <Route path="/character/create" element={<CharacterCreator />} />
            <Route path="/character/manage" element={<CharacterManager />} />
            
            {/* Adventure */}
            <Route path="/adventure/select" element={<AdventureSelection />} />
            <Route path="/adventure" element={<AdventureScreen />} />
            
            {/* Tools */}
            <Route path="/tools/dice" element={<DiceRoller />} />
            <Route path="/reference" element={<Bestiary />} />
            
            {/* Placeholder routes - will be implemented in future phases */}
            <Route path="/tools/dice" element={<PlaceholderPage title="Dice Roller" />} />
            <Route path="/reference" element={<PlaceholderPage title="Reference Library" />} />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AdventureProvider>
    </CharacterProvider>
  );
}

/**
 * Placeholder component for routes not yet implemented
 */
function PlaceholderPage({ title }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-xl)',
      backgroundColor: 'var(--paper-cream)'
    }}>
      <h1 style={{ marginBottom: 'var(--space-md)' }}>{title}</h1>
      <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--ink-brown)' }}>
        This feature is coming soon!
      </p>
      <a 
        href="/" 
        style={{
          padding: 'var(--space-sm) var(--space-md)',
          backgroundColor: 'var(--paper-aged)',
          border: '2px solid var(--border-dark)',
          borderRadius: 'var(--radius-sm)',
          textDecoration: 'none',
          color: 'var(--ink-black)',
          fontWeight: 700
        }}
      >
        ← Back to Home
      </a>
    </div>
  );
}

/**
 * 404 Not Found page
 */
function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-xl)',
      backgroundColor: 'var(--paper-cream)'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>404</h1>
      <h2 style={{ marginBottom: 'var(--space-md)' }}>Page Not Found</h2>
      <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--ink-brown)' }}>
        You've wandered into an unmapped area of the dungeon!
      </p>
      <a 
        href="/" 
        style={{
          padding: 'var(--space-sm) var(--space-md)',
          backgroundColor: 'var(--paper-aged)',
          border: '2px solid var(--border-dark)',
          borderRadius: 'var(--radius-sm)',
          textDecoration: 'none',
          color: 'var(--ink-black)',
          fontWeight: 700
        }}
      >
        ← Return to Safety
      </a>
    </div>
  );
}

export default App;
