import React from 'react';
import { Map, User, Skull, DoorOpen } from 'lucide-react';
import { useAdventure } from '../../contexts/AdventureContext';
import { tutorialAdventure } from '../../data/tutorialAdventure';
import PaperContainer from '../common/PaperContainer';
import './MapDisplay.css';

/**
 * MapDisplay - Shows dungeon map on graph paper with fog of war
 */
export function MapDisplay() {
  const { adventure, enterRoom, getCurrentRoom, isRoomCleared, hasVisited } = useAdventure();
  
  const currentRoom = getCurrentRoom();
  const allRooms = tutorialAdventure.rooms;
  
  // Calculate grid bounds
  const minX = 0, maxX = 4;
  const minY = 0, maxY = 3;
  
  return (
    <div className="map-display">
      <PaperContainer variant="graph" padding="md" className="map-container">
        <div className="map-header">
          <Map size={20} />
          <span className="map-title">Dungeon Map</span>
        </div>
        
        <div className="map-grid">
          <svg
            viewBox={`${minX * 60 - 10} ${minY * 60 - 10} ${(maxX - minX + 1) * 60 + 20} ${(maxY - minY + 1) * 60 + 20}`}
            className="map-svg"
          >
            {/* Grid provided by PaperContainer variant="graph" CSS */}
            
            {/* Corridors/Connections */}
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
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
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
              const visited = hasVisited(room.id);
              const cleared = isRoomCleared(room.id);
              const isCurrent = room.id === currentRoom.id;
              const fogOfWar = !visited;
              
              const x = room.coordinates.x * 60;
              const y = room.coordinates.y * 60;
              
              if (fogOfWar) {
                // Fog of war - show nothing or just a hint
                return (
                  <g key={room.id}>
                    <rect
                      x={x + 5}
                      y={y + 5}
                      width="50"
                      height="50"
                      fill="rgba(42, 35, 28, 0.1)"
                      stroke="rgba(42, 35, 28, 0.2)"
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
                  style={{ cursor: 'pointer' }}
                  onClick={() => !isCurrent && canMoveToRoom(currentRoom, room) && enterRoom(room.id)}
                >
                  {/* Room square */}
                  <rect
                    x={x + 5}
                    y={y + 5}
                    width="50"
                    height="50"
                    fill={isCurrent ? 'var(--ink-blue)' : cleared ? 'var(--paper-aged)' : 'var(--paper-cream)'}
                    stroke={isCurrent ? 'var(--ink-blue)' : 'var(--border-dark)'}
                    strokeWidth={isCurrent ? '3' : '2'}
                    opacity={isCurrent ? '0.3' : '1'}
                  />
                  
                  {/* Current player marker */}
                  {isCurrent && (
                    <circle
                      cx={x + 30}
                      cy={y + 30}
                      r="8"
                      fill="var(--ink-blue)"
                    />
                  )}
                  
                  {/* Status indicators */}
                  {!isCurrent && !cleared && room.contents.monsters.length > 0 && (
                    <circle
                      cx={x + 45}
                      cy={y + 15}
                      r="5"
                      fill="var(--ink-red)"
                    />
                  )}
                  
                  {!isCurrent && !cleared && room.contents.treasure.length > 0 && (
                    <circle
                      cx={x + 15}
                      cy={y + 15}
                      r="5"
                      fill="gold"
                    />
                  )}
                  
                  {cleared && (
                    <text
                      x={x + 30}
                      y={y + 35}
                      fontSize="20"
                      textAnchor="middle"
                      fill="var(--ink-brown)"
                    >
                      ✓
                    </text>
                  )}
                  
                  {/* Room label */}
                  <text
                    x={x + 30}
                    y={y + 70}
                    fontSize="8"
                    textAnchor="middle"
                    fill="var(--ink-black)"
                    fontFamily="var(--font-body)"
                  >
                    {room.name.substring(0, 12)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-icon current-marker"></div>
            <span>You</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon danger-marker"></div>
            <span>Danger</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon treasure-marker"></div>
            <span>Treasure</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon cleared-marker">✓</div>
            <span>Cleared</span>
          </div>
        </div>
      </PaperContainer>
    </div>
  );
}

/**
 * Check if player can move to a room
 */
function canMoveToRoom(currentRoom, targetRoom) {
  // Check if there's a connecting exit
  return currentRoom.exits.some(exit => exit.targetRoomId === targetRoom.id);
}

export default MapDisplay;
