/**
 * DungeonMap.jsx
 * B1 Quasqueton — SVG Graph-Paper Map Renderer
 *
 * Reads mapPos + size from room definitions (level1.js / level2.js).
 * Draws graph-paper grid, room cells, door connectors, status icons,
 * secret door glyphs, staircase icons, and player position marker.
 *
 * Features:
 *   - Fog of war (unexplored = dark hatching, map-revealed = outline only)
 *   - Level I / II tab switcher (Level II locked until first descent)
 *   - Pan + zoom via drag and mousewheel
 *   - Click on navigable room → onEnterRoom()
 *   - "Center on player" button
 *   - Room hover tooltip
 *   - Compass rose, door tick marks, secret door S-glyph
 *   - Staircase step-lines + arrow icon
 *   - Player position pulse-ring marker
 *
 * Props:
 *   dungeonState  {object}   — from useAdventure()
 *   onEnterRoom   {fn}       — (roomId, level) => void
 *   onDescend     {fn}       — (stairExit) => void
 *   onAscend      {fn}       — (stairExit) => void
 *   className     {string}
 *   style         {object}
 *   compact       {boolean}  — hides legend + subtitle (sidebar mode)
 */

import React, {
  useState, useRef, useCallback, useEffect, useMemo,
} from 'react';
import './DungeonMap.css';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const GRID_SIZE    = 20;
const DEFAULT_ROOM = { w: 80, h: 80 };
const ROOM_PADDING = 70;
const MIN_ZOOM     = 0.3;
const MAX_ZOOM     = 2.8;
const ZOOM_STEP    = 0.15;

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────

// Room data: Y increases upward (cartographic). SVG: Y increases downward.
// mapPos coordinates use standard SVG convention: Y increases downward (south).
// No Y-flip needed.
function toSvgY(mapY, _maxMapY) { return mapY; }

function roomCentre(room, maxMapY) {
  const w = room.size?.w ?? DEFAULT_ROOM.w;
  const h = room.size?.h ?? DEFAULT_ROOM.h;
  return {
    cx: room.mapPos.x + w / 2,
    cy: toSvgY(room.mapPos.y, maxMapY) + h / 2,
  };
}

function wallMidpoint(from, to, maxMapY) {
  const fw = from.size?.w ?? DEFAULT_ROOM.w;
  const fh = from.size?.h ?? DEFAULT_ROOM.h;
  const fx = from.mapPos.x;
  const fy = toSvgY(from.mapPos.y, maxMapY);
  const { cx: tx, cy: ty } = roomCentre(to, maxMapY);
  const fcx = fx + fw / 2;
  const fcy = fy + fh / 2;
  const dx = tx - fcx;
  const dy = ty - fcy;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { x: dx > 0 ? fx + fw : fx, y: fcy };
  }
  return { x: fcx, y: dy > 0 ? fy + fh : fy };
}

function computeBounds(rooms, maxMapY, pad = ROOM_PADDING) {
  if (!rooms.length) return { minX: 0, minY: 0, width: 800, height: 600 };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rooms) {
    const w = r.size?.w ?? DEFAULT_ROOM.w;
    const h = r.size?.h ?? DEFAULT_ROOM.h;
    const rx = r.mapPos.x;
    const ry = toSvgY(r.mapPos.y, maxMapY);
    x0 = Math.min(x0, rx); y0 = Math.min(y0, ry);
    x1 = Math.max(x1, rx + w); y1 = Math.max(y1, ry + h);
  }
  return { minX: x0 - pad, minY: y0 - pad, width: (x1-x0)+pad*2, height: (y1-y0)+pad*2 };
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

function GraphGrid({ bounds }) {
  const { minX, minY, width, height } = bounds;
  const lines = [];
  const sx = Math.floor(minX / GRID_SIZE) * GRID_SIZE;
  const sy = Math.floor(minY / GRID_SIZE) * GRID_SIZE;
  for (let x = sx; x <= minX + width; x += GRID_SIZE) {
    const maj = x % (GRID_SIZE * 5) === 0;
    lines.push(<line key={`gx${x}`} x1={x} y1={minY} x2={x} y2={minY+height}
      stroke="var(--map-grid)" strokeWidth={maj ? 0.7 : 0.35} opacity={maj ? 0.5 : 0.35} />);
  }
  for (let y = sy; y <= minY + height; y += GRID_SIZE) {
    const maj = y % (GRID_SIZE * 5) === 0;
    lines.push(<line key={`gy${y}`} x1={minX} y1={y} x2={minX+width} y2={y}
      stroke="var(--map-grid)" strokeWidth={maj ? 0.7 : 0.35} opacity={maj ? 0.5 : 0.35} />);
  }
  return <g>{lines}</g>;
}

function DoorTick({ p1, p2, doorType }) {
  if (!doorType || doorType === 'open' || doorType === 'stair' || doorType === 'secret') return null;
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
  const nx = -(p2.y - p1.y) / len * 5;
  const ny =  (p2.x - p1.x) / len * 5;
  return (
    <line x1={mx-nx} y1={my-ny} x2={mx+nx} y2={my+ny}
      stroke="#1a1410" strokeWidth={1.8}
      strokeDasharray={doorType === 'locked' ? '2 2' : 'none'}
      opacity={0.7} />
  );
}

function SecretDoorGlyph({ p1, p2 }) {
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
  const nx = -(p2.y - p1.y) / len * 6;
  const ny =  (p2.x - p1.x) / len * 6;
  return (
    <g>
      <line x1={mx-nx} y1={my-ny} x2={mx+nx} y2={my+ny}
        stroke="var(--accent-secret)" strokeWidth={2} strokeDasharray="3 2" opacity={0.8} />
      <text x={mx} y={my-9} fontSize={7} fill="var(--accent-secret)"
        textAnchor="middle" dominantBaseline="middle" opacity={0.9}>S</text>
    </g>
  );
}

function StaircaseIcon({ cx, cy, direction }) {
  const down = direction === 'down' || direction === 'descend';
  return (
    <g>
      {[0, 3, 6].map((off, i) => (
        <line key={i}
          x1={cx - 8 + off} y1={cy + (down ? -3 + i*2 : 3 - i*2)}
          x2={cx - 8 + off + 4} y2={cy + (down ? -3 + i*2 : 3 - i*2)}
          stroke="var(--accent-stair)" strokeWidth={1.5} />
      ))}
      <text x={cx+5} y={cy} fontSize={9} fill="var(--accent-stair)"
        textAnchor="start" dominantBaseline="middle">{down ? '↓' : '↑'}</text>
    </g>
  );
}

function PlayerMarker({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={9}  className="player-marker-outer" />
      <circle cx={cx} cy={cy} r={4}  className="player-marker-inner" />
      <circle cx={cx} cy={cy} r={4}  fill="none" stroke="white" strokeWidth={1} opacity={0.55} />
    </g>
  );
}

function CompassRose({ x, y }) {
  return (
    <g opacity={0.5} transform={`translate(${x},${y})`}>
      <line x1={0} y1={12} x2={0} y2={-12} stroke="#4a3f30" strokeWidth={1.5} />
      <polygon points="0,-14 -3,-6 3,-6" fill="#4a3f30" />
      <line x1={-12} y1={0} x2={12} y2={0} stroke="#4a3f30" strokeWidth={0.8} />
      {[['N',0,-19,'auto'],['E',17,0,'middle'],['S',0,24,'hanging'],['W',-17,0,'middle']].map(
        ([l,dx,dy,db]) => (
          <text key={l} x={dx} y={dy} fontSize={9} textAnchor="middle"
            dominantBaseline={db} fill="#4a3f30" fontFamily="Georgia,serif" fontWeight="bold">{l}</text>
        )
      )}
    </g>
  );
}

function ConnectorLayer({ rooms, roomMap, visited, discovered, maxMapY }) {
  const drawn = new Set();
  const connectors = [];

  for (const room of rooms) {
    for (const exit of (room.exits ?? [])) {
      const pairKey = [room.id, exit.targetRoomId].sort().join('::');
      if (drawn.has(pairKey)) continue;
      drawn.add(pairKey);

      const target = roomMap[exit.targetRoomId];
      if (!target) continue;

      if (exit.doorType === 'secret') {
        if (!exit.secretDoorId || !discovered.has(exit.secretDoorId)) continue;
      }
      // Skip cross-level stair connections (no target room on this level)
      if (exit.targetLevel != null && exit.targetLevel !== room.level) continue;
      if (!visited.has(room.id) && !visited.has(exit.targetRoomId)) continue;

      const p1 = wallMidpoint(room, target, maxMapY);
      const p2 = wallMidpoint(target, room, maxMapY);
      const isStair  = exit.doorType === 'stair';
      const isSecret = exit.doorType === 'secret';

      connectors.push(
        <g key={`c-${pairKey}`}>
          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isStair ? 'var(--accent-stair)' : isSecret ? 'var(--accent-secret)' : 'rgba(58,46,34,0.45)'}
            strokeWidth={isStair ? 2 : isSecret ? 1.5 : 1}
            strokeDasharray={isStair ? '5 3' : isSecret ? '3 3' : exit.doorType === 'locked' ? '2 2' : 'none'}
            opacity={isStair ? 0.85 : 0.65} />
          <DoorTick p1={p1} p2={p2} doorType={exit.doorType} />
          {isSecret && <SecretDoorGlyph p1={p1} p2={p2} />}
        </g>
      );
    }
  }
  return <g>{connectors}</g>;
}

function RoomCell({ room, maxMapY, isVisited, isRevealed, isCurrent, roomState,
  hasMonsters, hasTreasure, isNavigable, onClick, onMouseEnter, onMouseLeave }) {
  const w  = room.size?.w ?? DEFAULT_ROOM.w;
  const h  = room.size?.h ?? DEFAULT_ROOM.h;
  const rx = room.mapPos.x;
  const ry = toSvgY(room.mapPos.y, maxMapY);
  const cx = rx + w / 2;
  const cy = ry + h / 2;
  const shown = isVisited || isRevealed;

  const fill =
    isCurrent               ? 'var(--room-current)'   :
    roomState === 'cleared' ? 'var(--room-cleared)'   :
    roomState === 'looted'  ? 'var(--room-looted)'    :
    shown                   ? 'var(--room-entered)'   :
    'var(--room-unexplored)';

  const stroke =
    isCurrent          ? 'var(--accent-current)' :
    room.isSpecialRoom ? 'var(--accent-special)'  :
    room.isCheckpoint  ? 'var(--accent-cleared)'  :
    !shown             ? 'rgba(26,20,16,0.2)'    :
    'var(--map-wall)';

  const strokeW    = isCurrent ? 3.5 : !shown ? 1.5 : 2.5;
  const strokeDash = !shown ? '4 3' : 'none';

  const stairExit = (room.exits ?? []).find(e => e.doorType === 'stair');
  const cls = [
    'room-cell',
    isCurrent ? 'current' : roomState === 'cleared' ? 'cleared' : roomState === 'looted' ? 'looted' : shown ? 'entered' : 'unexplored',
    isNavigable   ? 'navigable'    : '',
    room.isSpecialRoom ? 'special-room' : '',
  ].filter(Boolean).join(' ');

  return (
    <g className={cls}
      onClick={isNavigable ? () => onClick(room) : undefined}
      onMouseEnter={e => onMouseEnter(e, room)}
      onMouseLeave={onMouseLeave}
      style={{ cursor: isNavigable ? 'pointer' : 'default' }}
    >
      <rect className="room-body"
        x={rx} y={ry} width={w} height={h}
        fill={fill} stroke={stroke}
        strokeWidth={strokeW} strokeDasharray={strokeDash}
        shapeRendering="crispEdges" />

      {shown && !isCurrent && (
        <rect x={rx+4} y={ry+4} width={w-8} height={h-8}
          fill="none"
          stroke={room.isSpecialRoom ? 'var(--accent-special)' : 'var(--map-partition)'}
          strokeWidth={0.5} opacity={0.28} shapeRendering="crispEdges" />
      )}

      {shown && (
        <text x={cx} y={cy}
          fontSize={Math.max(7, Math.min(10, w/7))}
          fill={isCurrent ? 'var(--accent-current)' : 'var(--map-ink-faint)'}
          fontWeight={isCurrent ? '900' : 'bold'}
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Courier New', monospace"
          pointerEvents="none" style={{ userSelect: 'none' }}>
          {room.number}
        </text>
      )}

      {hasMonsters && shown && !isCurrent && (
        <text x={rx+w-9} y={ry+10} fontSize={8} fill="var(--accent-monster)"
          textAnchor="middle" dominantBaseline="middle">⚔</text>
      )}
      {hasTreasure && shown && (
        <text x={rx+w-9} y={ry+h-10} fontSize={8} fill="var(--accent-treasure)"
          textAnchor="middle" dominantBaseline="middle">◆</text>
      )}
      {stairExit && shown && (
        <StaircaseIcon cx={cx+12} cy={cy} direction={stairExit.direction} />
      )}
      {room.isCheckpoint && shown && (
        <text x={cx} y={ry+h-8} fontSize={6.5}
          fill="var(--accent-cleared)" textAnchor="middle" dominantBaseline="middle"
          opacity={0.75} fontFamily="'Courier New', monospace" letterSpacing={1}>EXIT</text>
      )}
    </g>
  );
}

function MapTooltip({ room, x, y, visible, roomState, hasMonsters, hasTreasure }) {
  if (!visible || !room) return null;
  const status = roomState === 'cleared' ? 'Cleared' : roomState === 'looted' ? 'Looted' :
    roomState === 'entered' ? 'Explored' : 'Unexplored';
  return (
    <div className="map-tooltip" style={{ left: x+14, top: y-6 }}>
      <div className="tooltip-name">{room.label || `Room ${room.number}`}</div>
      <div className="tooltip-status">
        {status}{hasMonsters && ' · ⚔ Monsters'}{hasTreasure && ' · ◆ Treasure'}
      </div>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="dungeon-map-legend">
      {[['current','Current'],['entered','Explored'],['cleared','Cleared'],['looted','Looted'],['fog','Unknown']].map(([c,l]) => (
        <div key={c} className="legend-item"><div className={`legend-swatch ${c}`} /> {l}</div>
      ))}
      <div className="legend-item" style={{ marginLeft: 'auto' }}>
        <span style={{ color:'var(--accent-monster)',marginRight:3 }}>⚔</span>Monster
      </div>
      <div className="legend-item"><span style={{ color:'var(--accent-treasure)',marginRight:3 }}>◆</span>Treasure</div>
      <div className="legend-item"><span style={{ color:'var(--accent-stair)',marginRight:3 }}>↓</span>Stairs</div>
      <div className="legend-item"><span style={{ color:'var(--accent-secret)',marginRight:3 }}>S</span>Secret</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

export function DungeonMap({
  dungeonState,
  onEnterRoom,
  onDescend,
  onAscend,
  className = '',
  style = {},
  compact = false,
}) {
  const {
    currentLevel       = 1,
    currentRoomId      = null,
    visitedRooms       = { 1: [], 2: [] },
    roomStates         = { 1: {}, 2: {} },
    defeatedMonsters   = [],
    collectedTreasure  = [],
    discoveredSecretDoors = [],
    revealedMapRooms   = [],
    moduleId,
  } = dungeonState || {};

  const [viewLevel, setViewLevel] = useState(currentLevel || 1);
  useEffect(() => { setViewLevel(currentLevel || 1); }, [currentLevel]);

  const [zoom, setZoom] = useState(1.0);
  const [pan,  setPan]  = useState({ x: 0, y: 0 });
  const panOrigin   = useRef(null);
  const viewportRef = useRef(null);

  const [tooltip, setTooltip] = useState({ visible: false, room: null, x: 0, y: 0 });
  const [mod, setMod] = useState(null);

  useEffect(() => {
    if (!moduleId) return;
    import('../../data/dungeons/registry.js')
      .then(m => setMod(m.getModuleById(moduleId)))
      .catch(() => {});
  }, [moduleId]);

  const rooms   = useMemo(() => mod?.rooms?.[viewLevel] ? Object.values(mod.rooms[viewLevel]) : [], [mod, viewLevel]);
  const roomMap = useMemo(() => mod?.rooms?.[viewLevel] ?? {}, [mod, viewLevel]);

  const maxMapY = useMemo(() => {
    if (!rooms.length) return 700;
    return Math.max(...rooms.map(r => r.mapPos.y + (r.size?.h ?? DEFAULT_ROOM.h)));
  }, [rooms]);

  const bounds = useMemo(() => computeBounds(rooms, maxMapY), [rooms, maxMapY]);

  const visited    = useMemo(() => new Set(visitedRooms?.[viewLevel]  ?? []), [visitedRooms, viewLevel]);
  const revealed   = useMemo(() => new Set(revealedMapRooms ?? []),            [revealedMapRooms]);
  const stateMap   = useMemo(() => roomStates?.[viewLevel]  ?? {},             [roomStates, viewLevel]);
  const defeated   = useMemo(() => new Set(defeatedMonsters  ?? []),           [defeatedMonsters]);
  const collected  = useMemo(() => new Set(collectedTreasure ?? []),           [collectedTreasure]);
  const discovered = useMemo(() => new Set(discoveredSecretDoors ?? []),       [discoveredSecretDoors]);

  const navigable = useMemo(() => {
    if (viewLevel !== currentLevel || !mod) return new Set();
    const cur = roomMap[currentRoomId];
    if (!cur) return new Set();
    const set = new Set();
    for (const ex of (cur.exits ?? [])) {
      if (ex.doorType === 'secret' && (!ex.secretDoorId || !discovered.has(ex.secretDoorId))) continue;
      if (ex.doorType === 'stair') continue;
      if (ex.targetLevel != null && ex.targetLevel !== viewLevel) continue;
      set.add(ex.targetRoomId);
    }
    return set;
  }, [viewLevel, currentLevel, currentRoomId, roomMap, discovered, mod]);

  const hasMonsters = useCallback((room) => {
    const insts = mod?.monsterInstances?.[viewLevel] ?? {};
    return (room.contents?.monsters ?? []).some(id => !defeated.has(id) && insts[id]);
  }, [mod, viewLevel, defeated]);

  const hasTreasure = useCallback((room) => {
    return (room.contents?.treasure ?? []).some(t => !collected.has(t.id));
  }, [collected]);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + -Math.sign(e.deltaY) * ZOOM_STEP)));
  }, []);

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    panOrigin.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pan]);

  const onPointerMove = useCallback((e) => {
    if (!panOrigin.current) return;
    setPan({ x: e.clientX - panOrigin.current.x, y: e.clientY - panOrigin.current.y });
  }, []);

  const onPointerUp = useCallback(() => { panOrigin.current = null; }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const centerOnPlayer = useCallback(() => {
    const cur = roomMap[currentRoomId];
    if (!cur || !viewportRef.current) return;
    const { cx, cy } = roomCentre(cur, maxMapY);
    const vp = viewportRef.current.getBoundingClientRect();
    setPan({
      x: vp.width  / 2 - (cx - bounds.minX) * zoom,
      y: vp.height / 2 - (cy - bounds.minY) * zoom,
    });
  }, [currentRoomId, roomMap, maxMapY, zoom, bounds]);

  useEffect(() => {
    if (mod && viewLevel === currentLevel) setTimeout(centerOnPlayer, 60);
  }, [mod, currentRoomId, currentLevel, viewLevel]);

  const handleRoomClick = useCallback((room) => {
    if (room.id === currentRoomId) return;
    const cur = roomMap[currentRoomId];
    const stairEx = (cur?.exits ?? []).find(e => e.doorType === 'stair' && e.targetRoomId === room.id);
    if (stairEx) {
      const goDown = (stairEx.targetLevel ?? currentLevel + 1) > currentLevel;
      if (goDown) onDescend?.(stairEx); else onAscend?.(stairEx);
      return;
    }
    onEnterRoom?.(room.id, viewLevel);
  }, [currentRoomId, currentLevel, viewLevel, roomMap, onEnterRoom, onDescend, onAscend]);

  const onRoomEnter = useCallback((e, room) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ visible: true, room, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);
  const onRoomLeave = useCallback(() => setTooltip(t => ({ ...t, visible: false })), []);

  const level2Unlocked = (visitedRooms?.[2]?.length ?? 0) > 0;
  const curRoomDef = roomMap[currentRoomId];
  const marker = curRoomDef ? roomCentre(curRoomDef, maxMapY) : null;

  if (!moduleId) {
    return (
      <div className={`dungeon-map-root ${className}`} style={style}>
        <div style={{ padding:24, textAlign:'center', fontFamily:'Georgia,serif', fontSize:'0.85rem', color:'#4a3f30' }}>
          No dungeon loaded
        </div>
      </div>
    );
  }

  const { minX: vbX, minY: vbY, width: vbW, height: vbH } = bounds;

  return (
    <div className={`dungeon-map-root ${className}`} style={style}>

      <div className="dungeon-map-header">
        <div>
          <div className="dungeon-map-title">{mod?.name ?? 'Dungeon'}</div>
          {!compact && mod?.rooms?.[2] && Object.keys(mod.rooms[2]).length > 0 && (
            <div className="dungeon-map-subtitle">
              {viewLevel === 1 ? 'Level 1 — Upper Dungeon' : 'Level 2 — Lower Vaults'}
            </div>
          )}
        </div>
        {mod?.rooms?.[2] && Object.keys(mod.rooms[2]).length > 0 && (
          <div className="dungeon-map-level-tabs">
            <button className={`dungeon-map-tab ${viewLevel === 1 ? 'active' : ''}`} onClick={() => setViewLevel(1)}>Lvl I</button>
            <button className={`dungeon-map-tab ${viewLevel === 2 ? 'active' : ''}`}
              onClick={() => setViewLevel(2)}
              disabled={!level2Unlocked}
              title={!level2Unlocked ? 'Descend the stairs to unlock' : undefined}>Lvl II</button>
          </div>
        )}
      </div>

      <div className="dungeon-map-viewport" ref={viewportRef}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>

        <div className="dungeon-map-svg-wrapper"
          style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: 'top left' }}>
          <svg className="dungeon-map-svg"
            width={vbW} height={vbH}
            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`Dungeon map Level ${viewLevel}`}>

            <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="var(--map-parchment)" />
            <GraphGrid bounds={bounds} />
            <ConnectorLayer rooms={rooms} roomMap={roomMap}
              visited={visited} discovered={discovered} maxMapY={maxMapY} />

            {rooms.map(room => (
              <RoomCell key={room.id} room={room} maxMapY={maxMapY}
                isVisited={visited.has(room.id)}
                isRevealed={revealed.has(room.id) && !visited.has(room.id)}
                isCurrent={room.id === currentRoomId && viewLevel === currentLevel}
                roomState={stateMap[room.id] || 'unexplored'}
                hasMonsters={hasMonsters(room)}
                hasTreasure={hasTreasure(room)}
                isNavigable={navigable.has(room.id)}
                onClick={handleRoomClick}
                onMouseEnter={onRoomEnter}
                onMouseLeave={onRoomLeave} />
            ))}

            {viewLevel === currentLevel && marker && (
              <PlayerMarker cx={marker.cx} cy={marker.cy} />
            )}

            <CompassRose x={vbX + 24} y={vbY + vbH - 44} />
          </svg>
        </div>

        <MapTooltip room={tooltip.room} x={tooltip.x} y={tooltip.y}
          visible={tooltip.visible && !!(tooltip.room && (visited.has(tooltip.room?.id) || revealed.has(tooltip.room?.id)))}
          roomState={tooltip.room ? (stateMap[tooltip.room.id] || 'unexplored') : 'unexplored'}
          hasMonsters={tooltip.room ? hasMonsters(tooltip.room) : false}
          hasTreasure={tooltip.room ? hasTreasure(tooltip.room) : false} />

        <div className="dungeon-map-controls">
          <button className="map-control-btn" onClick={() => setZoom(z => Math.min(MAX_ZOOM, z+ZOOM_STEP))}>+</button>
          <button className="map-control-btn" onClick={() => setZoom(z => Math.max(MIN_ZOOM, z-ZOOM_STEP))}>−</button>
          <button className="map-control-btn" style={{ fontSize:'0.58rem' }}
            onClick={() => { setZoom(1); setPan({x:0,y:0}); setTimeout(centerOnPlayer,30); }}>↺</button>
        </div>

        {viewLevel === currentLevel && (
          <button className="map-center-btn" onClick={centerOnPlayer}>◉ Center</button>
        )}
      </div>

      {!compact && <MapLegend />}
    </div>
  );
}

export default DungeonMap;
