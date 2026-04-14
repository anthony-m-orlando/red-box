/**
 * App.jsx
 * Root component — routing, providers, lazy loading
 *
 * v1.0.0 changes from v0.1.x:
 *   - TownProvider added (wraps Router)
 *   - /adventure route now renders AdventureRouter, which selects
 *     DungeonScreen (B1 engine) or AdventureScreen (legacy tutorial)
 *     based on useAdventure().isLegacy()
 *   - DungeonScreen lazy-loaded alongside existing lazy screens
 *   - RequireCharacter is synchronous (no useEffect) — preserves
 *     the fix introduced in the v0.1.x bug-fix session
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { CharacterProvider, useCharacter } from './contexts/CharacterContext';
import { AdventureProvider, useAdventure }  from './contexts/AdventureContext';
import { TownProvider }                      from './contexts/TownContext';
import { isLegacyModule }                    from './data/dungeons/registry';

import ScrollToTop from './components/common/ScrollToTop';
import HomePage    from './components/layout/HomePage';

import './styles/global.css';

// ─────────────────────────────────────────────────────────────────────────────
// Lazy-loaded route components
// ─────────────────────────────────────────────────────────────────────────────

const CharacterCreator   = lazy(() => import('./components/character/CharacterCreator'));
const CharacterManager   = lazy(() => import('./components/character/CharacterManager'));
const AdventureSelection = lazy(() => import('./components/adventure/AdventureSelection'));
const AdventureScreen    = lazy(() => import('./components/adventure/AdventureScreen'));
const DungeonScreen      = lazy(() => import('./components/dungeon/DungeonScreen'));
const TownScreen         = lazy(() => import('./components/town/TownScreen'));
const DiceRoller         = lazy(() => import('./components/tools/DiceRoller'));
const Bestiary           = lazy(() => import('./components/tools/Bestiary'));

// ─────────────────────────────────────────────────────────────────────────────
// Route guard — synchronous, no useEffect flash
// ─────────────────────────────────────────────────────────────────────────────

function RequireCharacter({ children }) {
  const { character } = useCharacter();
  if (!character.isCreated) {
    return <Navigate to="/character/create" replace />;
  }
  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// AdventureRouter — selects the correct adventure screen
// ─────────────────────────────────────────────────────────────────────────────
//
// SCREEN SELECTION LOGIC (in priority order):
//
//  1. If location.state.moduleId is set (came from AdventureSelection):
//       → look it up in the registry via isLegacyModule()
//       → native module (tutorial, quasqueton, etc.) → DungeonScreen
//       → legacy shim (goblin_warren, haunted_crypt)  → AdventureScreen
//
//  2. If dungeonState.moduleId is set (resumed from a save):
//       → same lookup
//
//  3. No moduleId at all (direct /adventure URL):
//       → DungeonScreen (defaults to tutorial inside DungeonScreen)
//
// IMPORTANT: Do NOT use isLegacy() from context here because it returns true
// when moduleId is null — that would mount AdventureScreen before DungeonScreen's
// useEffect can call startDungeon, meaning DungeonScreen never initialises.

function AdventureRouter() {
  const location = useLocation();
  const { dungeonState } = useAdventure();

  // Prefer the intended moduleId from navigation state (set by AdventureSelection).
  // Fall back to the saved moduleId from dungeonState (resumed run).
  const intendedModuleId =
    location.state?.moduleId   // coming fresh from AdventureSelection
    ?? dungeonState?.moduleId  // resuming a saved run
    ?? null;                   // direct URL navigation — defaults to tutorial

  // Legacy shim modules (goblin_warren, haunted_crypt) → AdventureScreen
  // Native modules (tutorial, quasqueton) + null → DungeonScreen
  if (intendedModuleId && isLegacyModule(intendedModuleId)) {
    return <AdventureScreen />;
  }

  return <DungeonScreen />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading fallback
// ─────────────────────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--paper-cream)',
      fontFamily: 'var(--font-body)',
      color: 'var(--ink-brown)',
    }}>
      Loading…
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Error boundary (class component — hooks can't catch render errors)
// ─────────────────────────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: 'var(--paper-cream)',
          fontFamily: 'var(--font-body)',
        }}>
          <h1 style={{ color: 'var(--ink-red)', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: 'var(--ink-brown)', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '8px 20px',
              fontFamily: 'var(--font-numbers)',
              cursor: 'pointer',
              background: 'var(--ink-brown)',
              color: 'var(--paper-cream)',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <ErrorBoundary>
      <CharacterProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {/* AdventureProvider, TownProvider all inside Router — they call useNavigate() */}
          <AdventureProvider>
            <TownProvider>
              <ScrollToTop />

              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ── Public ──────────────────────────────────────── */}
                  <Route path="/" element={<HomePage />} />

                  {/* ── Character ───────────────────────────────────── */}
                  <Route path="/character/create" element={<CharacterCreator />} />
                  <Route path="/character/manage" element={<CharacterManager />} />

                  {/* ── Adventure ───────────────────────────────────── */}
                  <Route
                    path="/adventure/select"
                    element={
                      <RequireCharacter>
                        <AdventureSelection />
                      </RequireCharacter>
                    }
                  />
                  <Route
                    path="/adventure"
                    element={
                      <RequireCharacter>
                        <AdventureRouter />
                      </RequireCharacter>
                    }
                  />

                  {/* ── Town ────────────────────────────────────────── */}
                  <Route
                    path="/town"
                    element={
                      <RequireCharacter>
                        <TownScreen />
                      </RequireCharacter>
                    }
                  />

                  {/* ── Tools ───────────────────────────────────────── */}
                  <Route path="/tools/dice"  element={<DiceRoller />} />
                  <Route path="/reference"   element={<Bestiary />} />

                  {/* ── 404 ─────────────────────────────────────────── */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>

            </TownProvider>
          </AdventureProvider>
        </Router>
      </CharacterProvider>
    </ErrorBoundary>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NotFoundPage
// ─────────────────────────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'var(--paper-cream)',
      fontFamily: 'var(--font-body)',
    }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--ink-red)', marginBottom: '1rem' }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: 'var(--ink-brown)', marginBottom: '1.5rem' }}>
        This passage leads nowhere.
      </p>
      <a href="/" style={{
        fontFamily: 'var(--font-numbers)',
        color: 'var(--ink-blue)',
        textDecoration: 'underline',
      }}>
        Return to the surface
      </a>
    </div>
  );
}

export default App;
