/**
 * TownScreen.jsx
 * Top-level layout for the Town of Threshold hub.
 *
 * LAYOUT
 * ------
 *   ┌─────────────────────────────────────────────────┐
 *   │  HEADER — "Town of Threshold" + character strip  │
 *   ├─────────────────────────────────────────────────┤
 *   │                                                  │
 *   │   SVG TOWN MAP  (600 × 500)                      │
 *   │   7 clickable buildings                          │
 *   │   Hand-drawn roads, compass rose                 │
 *   │                                                  │
 *   ├─────────────────────────────────────────────────┤
 *   │  FOOTER — "Depart for Quasqueton" button         │
 *   └─────────────────────────────────────────────────┘
 *
 * When the player clicks a building, the matching location component
 * mounts as a full-screen overlay (modal-style) over the map.
 * The map itself stays mounted underneath for a smooth close transition.
 *
 * TEMPLE LOOP
 * -----------
 * If town.templeResurrectionPending is true on mount, the Temple overlay
 * opens automatically and the resurrection scene plays out.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate }                       from 'react-router-dom';
import { Compass, Sword, ArrowRight }        from 'lucide-react';

import { useTown }        from '../../contexts/TownContext';
import { useCharacter }   from '../../contexts/CharacterContext';
import { townLocations }  from '../../data/townData';
import { TownLocation }   from './TownLocation';
import { applyItemEffect } from '../../utils/items';
import ItemMenu          from '../adventure/ItemMenu';
import Button            from '../common/Button';
import { Package }      from 'lucide-react';

// Location components — lazy-loadable but kept direct for v1
import ThresholdArms  from './locations/ThresholdArms';
import GeneralStore   from './locations/GeneralStore';
import Blacksmith     from './locations/Blacksmith';
import MagesTower     from './locations/MagesTower';
import Temple         from './locations/Temple';
import TownHall       from './locations/TownHall';
import GuildHall      from './locations/GuildHall';

import './TownScreen.css';

// Map location id → component
const LOCATION_COMPONENTS = {
  threshold_arms: ThresholdArms,
  general_store:  GeneralStore,
  blacksmith:     Blacksmith,
  mages_tower:    MagesTower,
  temple:         Temple,
  town_hall:      TownHall,
  guild_hall:     GuildHall
};

export function TownScreen() {
  const navigate                              = useNavigate();
  const { character, heal, setEquipment, removeItem, decrementItemQuantity } = useCharacter();
  const { town, initTown, markLocationVisited } = useTown();

  const [showInventory, setShowInventory]     = useState(false);
  const [inventoryNotice, setInventoryNotice] = useState('');

  // Which location overlay is open, if any
  const [activeLocation, setActiveLocation]   = useState(null);
  // Animate overlay in/out
  const [overlayVisible, setOverlayVisible]   = useState(false);

  // ---- On mount: init town visit counter + auto-open Temple if resurrection pending
  useEffect(() => {
    initTown();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (town.templeResurrectionPending && activeLocation !== 'temple') {
      // Brief delay so the map renders first before the overlay appears
      const t = setTimeout(() => openLocation('temple'), 400);
      return () => clearTimeout(t);
    }
  }, [town.templeResurrectionPending]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Location open/close
  const openLocation = useCallback((locationId) => {
    markLocationVisited(locationId);
    setActiveLocation(locationId);
    // Trigger CSS enter animation on next tick
    requestAnimationFrame(() => setOverlayVisible(true));
  }, [markLocationVisited]);

  const closeLocation = useCallback(() => {
    setOverlayVisible(false);
    // Wait for CSS exit animation before unmounting
    setTimeout(() => setActiveLocation(null), 280);
  }, []);

  // ---- Depart for dungeon
  const handleDepart = useCallback(() => {
    navigate('/adventure/select');
  }, [navigate]);

  const handleUseTownItem = useCallback((item) => {
    setShowInventory(false);
    const result = applyItemEffect(item, character, 'town');

    if (result.type === 'healing') {
      heal(result.healAmount);
    }
    if (result.type === 'equipment') {
      setEquipment(result.equipment);
    }
    if (result.consumed) {
      if (item.quantity !== undefined && item.quantity > 1) decrementItemQuantity(item.id, 1);
      else removeItem(item.id);
    }

    if (result.message) {
      setInventoryNotice(result.message);
      window.setTimeout(() => setInventoryNotice(''), 4000);
    }
  }, [character, heal, setEquipment, decrementItemQuantity, removeItem]);

  // ---- Render active location overlay
  const LocationComponent = activeLocation
    ? LOCATION_COMPONENTS[activeLocation]
    : null;

  const isResurrectionTarget = (locId) =>
    locId === 'temple' && town.templeResurrectionPending;

  return (
    <div className="town-screen">

      {/* ================================================================
          HEADER
      ================================================================ */}
      <header className="town-header">
        <div className="town-header-left">
          <h1 className="town-title">
            <span className="town-title-small">Welcome to</span>
            Town of Threshold
          </h1>
          <p className="town-subtitle">
            A crossroads town on the edge of the wilderness
          </p>
        </div>

        <div className="town-header-right">
          <div className="town-header-actions">
            <Button
              variant="secondary"
              size="sm"
              icon={<Package size={14} />}
              onClick={() => setShowInventory(true)}
            >
              Inventory
            </Button>
          </div>
          <div className="character-strip">
            <div className="character-strip-name">
              {character.name}
              <span className="character-strip-class">
                {character.class
                  ? character.class.charAt(0).toUpperCase() + character.class.slice(1)
                  : ''}
                {' '}Level {character.level}
              </span>
            </div>
            <div className="character-strip-stats">
              <span className="stat-chip hp">
                ♥ {character.hp?.current ?? 0}/{character.hp?.max ?? 0}
              </span>
              <span className="stat-chip gold">
                ✦ {character.gold ?? 0} gp
              </span>
              <span className="stat-chip ac">
                🛡 AC {character.ac ?? 9}
              </span>
              <span className="stat-chip weapon">
                ⚔ {character.weapon || 'None'}
              </span>
              <span className="stat-chip armor">
                🛡 {character.armor || 'None'}
              </span>
              <span className="stat-chip shield">
                ⛨ {character.shield || 'None'}
              </span>
              {town.hirelings.filter(h => h.isAlive).length > 0 && (
                <span className="stat-chip hirelings">
                  ⚔ {town.hirelings.filter(h => h.isAlive).length} hireling{town.hirelings.filter(h => h.isAlive).length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        {inventoryNotice && (
          <div className="town-inventory-notice">
            {inventoryNotice}
          </div>
        )}
      </header>

      {/* ================================================================
          TOWN MAP
      ================================================================ */}
      <main className="town-map-wrapper">
        <div className="town-map-container">

          {/* Decorative map border label */}
          <div className="map-border-label map-border-top">THE TOWN OF THRESHOLD</div>
          <div className="map-border-label map-border-bottom">SCALE: 1 SQUARE = 30 FEET</div>

          <svg
            className="town-map-svg"
            viewBox="0 0 600 500"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Town of Threshold map"
          >
            {/* ---- Background parchment ---- */}
            <defs>
              <filter id="paper-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3"
                  stitchTiles="stitch" result="noise" />
                <feColorMatrix type="saturate" values="0" in="noise" result="greyNoise" />
                <feBlend in="SourceGraphic" in2="greyNoise" mode="multiply" result="blend" />
                <feComposite in="blend" in2="SourceGraphic" operator="in" />
              </filter>
              <filter id="ink-rough">
                <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2"
                  result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"
                  xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <radialGradient id="map-vignette" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(92,75,58,0.18)" />
              </radialGradient>
            </defs>

            {/* Parchment base */}
            <rect width="600" height="500" fill="var(--paper-aged)" />
            <rect width="600" height="500" fill="url(#map-vignette)" />

            {/* ---- Road network (hand-drawn style) ---- */}
            <g className="town-roads" filter="url(#ink-rough)">
              {/* Main north-south road */}
              <path d="M 300 0 L 300 500" className="road road-main" />
              {/* Main east-west road */}
              <path d="M 0 280 L 600 280" className="road road-main" />
              {/* Side roads to buildings */}
              <path d="M 300 280 L 120 200" className="road road-side" />
              <path d="M 300 280 L 120 340" className="road road-side" />
              <path d="M 300 280 L 480 180" className="road road-side" />
              <path d="M 300 280 L 480 340" className="road road-side" />
              <path d="M 300 280 L 300 420" className="road road-side" />
              <path d="M 480 280 L 480 50"  className="road road-side" />
            </g>

            {/* ---- Town square / fountain ---- */}
            <g className="town-square">
              <circle cx="300" cy="280" r="22" className="square-base" />
              <circle cx="300" cy="280" r="14" className="fountain-rim" />
              <circle cx="300" cy="280" r="6"  className="fountain-water" />
              <text x="300" y="316" textAnchor="middle" className="square-label">
                TOWN SQUARE
              </text>
            </g>

            {/* ---- Compass rose (top-right corner) ---- */}
            <g className="compass-rose" transform="translate(545, 45)">
              <circle cx="0" cy="0" r="22" className="compass-bg" />
              <text x="0" y="-26" textAnchor="middle" className="compass-dir">N</text>
              <text x="0" y="32"  textAnchor="middle" className="compass-dir">S</text>
              <text x="28"  y="5" textAnchor="middle" className="compass-dir">E</text>
              <text x="-28" y="5" textAnchor="middle" className="compass-dir">W</text>
              {/* Arrow pointing north */}
              <polygon points="0,-18 4,-4 0,-8 -4,-4" className="compass-arrow-n" />
              <polygon points="0,18  4,4  0,8  -4,4"  className="compass-arrow-s" />
            </g>

            {/* ---- Wilderness trees (decorative, map edges) ---- */}
            <g className="map-trees">
              {TREE_POSITIONS.map((pos, i) => (
                <text key={i} x={pos.x} y={pos.y} className="map-tree">🌲</text>
              ))}
            </g>

            {/* ---- Location buildings ---- */}
            {townLocations.map(location => (
              <TownLocation
                key={location.id}
                location={location}
                onEnter={openLocation}
                isResurrectionTarget={isResurrectionTarget(location.id)}
              />
            ))}
          </svg>
        </div>

        {/* ---- Sidebar legend ---- */}
        <aside className="town-legend">
          <h2 className="legend-title">Locations</h2>
          <ul className="legend-list">
            {townLocations.map(loc => (
              <li
                key={loc.id}
                className={`legend-item ${town.visitedLocations.includes(loc.id) ? 'visited' : ''}`}
                onClick={() => openLocation(loc.id)}
              >
                <span className="legend-icon">{loc.icon}</span>
                <span className="legend-name">{loc.shortName}</span>
                {town.templeResurrectionPending && loc.id === 'temple' && (
                  <span className="legend-alert">!</span>
                )}
              </li>
            ))}
          </ul>

          {/* Active contracts summary */}
          {town.activeContracts.filter(c => c.status === 'active').length > 0 && (
            <div className="legend-contracts">
              <h3 className="legend-contracts-title">Active Contracts</h3>
              {town.activeContracts
                .filter(c => c.status === 'active')
                .map(c => (
                  <div key={c.contractId} className="legend-contract-item">
                    <Sword size={12} />
                    {CONTRACT_LABELS[c.contractId] ?? c.contractId}
                  </div>
                ))
              }
            </div>
          )}

          {/* Rumor count hint */}
          {town.activeRumors.length > 0 && (
            <div className="legend-rumors-hint">
              <span className="rumors-dot" />
              {town.activeRumors.length} rumor{town.activeRumors.length > 1 ? 's' : ''} heard
            </div>
          )}
        </aside>
      </main>

      {/* ================================================================
          FOOTER — Depart button
      ================================================================ */}
      <footer className="town-footer">
        <p className="town-footer-text">
          The road north leads to the Caverns of Quasqueton…
        </p>
        <button className="depart-button" onClick={handleDepart}>
          <span>Depart for Adventure</span>
          <ArrowRight size={18} />
        </button>
      </footer>

      {/* ================================================================
          LOCATION OVERLAY
      ================================================================ */}
      {showInventory && (
        <ItemMenu
          character={character}
          onUseItem={handleUseTownItem}
          onClose={() => setShowInventory(false)}
          context="town"
        />
      )}
      {LocationComponent && (
        <div
          className={`location-overlay ${overlayVisible ? 'overlay-visible' : 'overlay-hidden'}`}
          role="dialog"
          aria-modal="true"
          aria-label={activeLocation}
        >
          <LocationComponent onClose={closeLocation} />
        </div>
      )}
    </div>
  );
}

// Sparse tree positions around map edges — kept outside component to avoid
// recomputing on every render
const TREE_POSITIONS = [
  { x: 20,  y: 30  }, { x: 55,  y: 18  }, { x: 90,  y: 40  },
  { x: 20,  y: 80  }, { x: 45,  y: 65  },
  { x: 490, y: 430 }, { x: 530, y: 460 }, { x: 560, y: 440 },
  { x: 20,  y: 440 }, { x: 50,  y: 460 }, { x: 80,  y: 470 },
  { x: 540, y: 30  },                      { x: 570, y: 60  },
];

const CONTRACT_LABELS = {
  explore_quasqueton_10rooms: 'Map 10 rooms of Quasqueton'
};

export default TownScreen;
