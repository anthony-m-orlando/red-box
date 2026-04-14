/**
 * MapDisplay.jsx
 * Tutorial dungeon map — graph paper SVG with fog of war
 *
 * Patched for Sprint 3 AdventureContext shape:
 *   hasVisited(roomId)   — was a function on context, now derived from dungeonState
 *   isRoomCleared(roomId) — same
 *
 * Both are now computed inline from dungeonState:
 *   hasVisited   → (dungeonState.visitedRooms?.[1] ?? []).includes(roomId)
 *   isRoomCleared → dungeonState.roomStates?.[1]?.[roomId] === 'cleared'
 *
 * currentRoom.id guard added — getCurrentRoom() can return null on first render.
 */

import React from 'react';
import { Map } from 'lucide-react';
import { useAdventure }        from '../../contexts/AdventureContext';
import { tutorialAdventure }   from '../../data/tutorialAdventure';
import PaperContainer          from '../common/PaperContainer';
import './MapDisplay.css';

export function MapDisplay() {
  const { dungeonState, getCurrentRoom, enterRoom } = useAdventure();

  const currentRoom = getCurrentRoom();
  const allRooms    = tutorialAdventure.rooms;

  // ── Derive visited / cleared from dungeonState ─────────────────────────
  // Sprint 3: visitedRooms is { 1: [...], 2: [...] } for engine modules,
  // or the legacy flat array when SET_ADVENTURE is used.
  // We handle both shapes safely.
  const visitedRooms = dungeonState?.visitedRooms;
  const roomStates   = dungeonState?.roomStates;

  const hasVisited = (roomId) => {
    if (!visitedRooms) return false;
    // Level-aware shape (Sprint 3)
    if (Array.isArray(visitedRooms[1])) return visitedRooms[1].includes(roomId);
    // Legacy flat array shape (old context)
    if (Array.isArray(visitedRooms))    return visitedRooms.includes(roomId);
    return false;
  };

  const isRoomCleared = (roomId) => {
    if (!roomStates) return false;
    // Level-aware shape (Sprint 3)
    if (roomStates[1] && typeof roomStates[1] === 'object') {
      return roomStates[1][roomId] === 'cleared' || roomStates[1][roomId] === 'looted';
    }
    // Legacy flat shape
    return roomStates[roomId] === 'cleared';
  };

  // Guard: currentRoom may be null before dungeonState initialises
  if (!currentRoom) {
    return (
      <div className="map-display">
        <PaperContainer variant="graph" padding="md" className="map-container">
          <div className="map-header">
            <Map size={20} aria-hidden="true" />
            <span className="map-title">Dungeon Map</span>
          </div>
          <div className="map-grid" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--ink-brown)', fontStyle: 'italic' }}>Loading map…</p>
          </div>
        </PaperContainer>
      </div>
    );
  }

  const minX = 0, maxX = 4;
  const minY = 0, maxY = 3;

  return (
    <div className="map-display">
      <PaperContainer variant="graph" padding="md" className="map-container">
        <div className="map-header">
          <Map size={20} aria-hidden="true" />
          <span className="map-title">Dungeon Map</span>
        </div>

        <div className="map-grid">
          <svg
            viewBox={`${minX * 60 - 10} ${minY * 60 - 10} ${(maxX - minX + 1) * 60 + 20} ${(maxY - minY + 1) * 60 + 20}`}
            className="map-svg"
            aria-label="Dungeon map"
          >
            {/* Corridors */}
            {Object.values(allRooms).map(room => {
              if (!hasVisited(room.id)) return null;

              return room.exits.map((exit, index) => {
                const targetRoom = allRooms[exit.targetRoomId];
                if (!targetRoom) return null;
                if (!hasVisited(targetRoom.id) && !exit.discovered) return null;

                const x1 = room.coordinates.x * 60 + 30;
                const y1 = room.coordinates.y * 60 + 30;
                const x2 = targetRoom.coordinates.x * 60 + 30;
                const y2 = targetRoom.coordinates.y * 60 + 30;

                return (
                  <line
                    key={`${room.id}-${exit.direction}-${index}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="var(--ink-brown)"
                    strokeWidth="2"
                    strokeDasharray={exit.doorType === 'closed' ? '5,5' : '0'}
                    opacity="0.6"
                  />
                );
              });
            })}

            {/* Rooms */}
            {Object.values(allRooms).map(room => {
              const visited   = hasVisited(room.id);
              const cleared   = isRoomCleared(room.id);
              const isCurrent = room.id === currentRoom.id;
              const fogOfWar  = !visited;

              const x = room.coordinates.x * 60;
              const y = room.coordinates.y * 60;

              if (fogOfWar) {
                return (
                  <g key={room.id}>
                    <rect
                      x={x + 5} y={y + 5} width="50" height="50"
                      fill="rgba(42,35,28,0.1)"
                      stroke="rgba(42,35,28,0.2)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  </g>
                );
              }

              return (
                <g
                  key={room.id}
                  className={`room-cell ${isCurrent ? 'current' : ''} ${cleared ? 'cleared' : ''}`}
                  style={{ cursor: isCurrent ? 'default' : 'pointer' }}
                  onClick={() => !isCurrent && canMoveToRoom(currentRoom, room) && enterRoom(room.id)}
                >
                  {/* Room background */}
                  <rect
                    x={x + 5} y={y + 5} width="50" height="50"
                    fill={isCurrent ? 'var(--ink-blue)' : cleared ? 'var(--paper-aged)' : 'var(--paper-cream)'}
                    stroke={isCurrent ? 'var(--ink-blue)' : 'var(--border-dark)'}
                    strokeWidth={isCurrent ? '3' : '2'}
                    opacity={isCurrent ? '0.3' : '1'}
                  />

                  {/* Player marker */}
                  {isCurrent && (
                    <circle cx={x + 30} cy={y + 30} r="8" fill="var(--ink-blue)" />
                  )}

                  {/* Monster pip */}
                  {!isCurrent && !cleared && (room.contents?.monsters?.length ?? 0) > 0 && (
                    <circle cx={x + 45} cy={y + 15} r="5" fill="var(--ink-red)" />
                  )}

                  {/* Treasure pip */}
                  {!isCurrent && !cleared && (room.contents?.treasure?.length ?? 0) > 0 && (
                    <circle cx={x + 15} cy={y + 15} r="5" fill="gold" />
                  )}

                  {/* Cleared checkmark */}
                  {cleared && (
                    <text x={x + 30} y={y + 35} fontSize="20" textAnchor="middle" fill="var(--ink-brown)">
                      ✓
                    </text>
                  )}

                  {/* Room label */}
                  <text
                    x={x + 30} y={y + 70}
                    fontSize="8" textAnchor="middle"
                    fill="var(--ink-black)" fontFamily="var(--font-body)"
                  >
                    {room.name?.substring(0, 12) ?? ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="map-legend">
          {[
            { cls: 'current-marker',  label: 'You'      },
            { cls: 'danger-marker',   label: 'Danger'   },
            { cls: 'treasure-marker', label: 'Treasure' },
            { cls: 'cleared-marker',  label: 'Cleared', text: '✓' },
          ].map(({ cls, label, text }) => (
            <div key={label} className="legend-item">
              <div className={`legend-icon ${cls}`}>{text ?? ''}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </PaperContainer>
    </div>
  );
}

function canMoveToRoom(currentRoom, targetRoom) {
  return currentRoom?.exits?.some(exit => exit.targetRoomId === targetRoom.id) ?? false;
}

export default MapDisplay;
