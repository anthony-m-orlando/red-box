/**
 * TownLocation.jsx
 * A single clickable building on the town map SVG.
 *
 * Rendered inside TownScreen's SVG overlay. Each location has:
 *   - An SVG hit area (rect) that captures mouse events
 *   - A building icon (text/emoji)
 *   - A label beneath
 *   - A tooltip on hover showing description + services
 *   - A "first visit" glow pulse until the player enters
 *
 * The resurrection indicator renders only on the Temple when
 * town.templeResurrectionPending is true.
 */

import { useState, useCallback } from 'react';
import { useTown }               from '../../contexts/TownContext';

// Building footprint dimensions on the SVG canvas (all locations share these
// proportions so hover areas are consistent)
const BUILDING_W  = 72;
const BUILDING_H  = 56;
const LABEL_OFFSET = 36; // px below building centre to draw the label

export function TownLocation({ location, onEnter, isResurrectionTarget }) {
  const { town, hasVisitedLocation } = useTown();
  const [hovered, setHovered]        = useState(false);

  const { id, name, shortName, icon, description, services, coords, mapLabel } = location;

  const visited      = hasVisitedLocation(id);
  const isPending    = isResurrectionTarget && town.templeResurrectionPending;

  // Hit-area origin (top-left corner relative to building centre)
  const x = coords.x - BUILDING_W / 2;
  const y = coords.y - BUILDING_H / 2;

  const handleClick = useCallback(() => {
    onEnter(id);
  }, [id, onEnter]);

  return (
    <g
      className={`town-location ${visited ? 'visited' : 'unvisited'} ${isPending ? 'resurrection-pending' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role="button"
      aria-label={`Enter ${name}`}
      style={{ cursor: 'pointer' }}
    >
      {/* ---- Pulse ring for unvisited locations ---- */}
      {!visited && (
        <circle
          cx={coords.x}
          cy={coords.y}
          r={BUILDING_W * 0.55}
          className="location-pulse"
        />
      )}

      {/* ---- Resurrection alert ring ---- */}
      {isPending && (
        <circle
          cx={coords.x}
          cy={coords.y}
          r={BUILDING_W * 0.6}
          className="resurrection-ring"
        />
      )}

      {/* ---- Building shadow (offset rect) ---- */}
      <rect
        x={x + 4}
        y={y + 4}
        width={BUILDING_W}
        height={BUILDING_H}
        rx="6"
        className="building-shadow"
      />

      {/* ---- Building body ---- */}
      <rect
        x={x}
        y={y}
        width={BUILDING_W}
        height={BUILDING_H}
        rx="6"
        className={`building-body ${hovered ? 'hovered' : ''}`}
      />

      {/* ---- Building icon (emoji, centred) ---- */}
      <text
        x={coords.x}
        y={coords.y + 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="building-icon"
      >
        {icon}
      </text>

      {/* ---- Map label beneath building ---- */}
      <text
        x={coords.x}
        y={coords.y + LABEL_OFFSET}
        textAnchor="middle"
        dominantBaseline="middle"
        className="building-label"
      >
        {mapLabel}
      </text>

      {/* ---- Resurrection badge ---- */}
      {isPending && (
        <text
          x={coords.x + BUILDING_W * 0.4}
          y={coords.y - BUILDING_H * 0.4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="resurrection-badge"
        >
          !
        </text>
      )}

      {/* ---- Hover tooltip (rendered as foreignObject for HTML) ---- */}
      {hovered && (
        <foreignObject
          x={coords.x + BUILDING_W * 0.5 + 8}
          y={coords.y - BUILDING_H * 0.5}
          width={180}
          height={120}
          className="location-tooltip-wrapper"
          // Keep tooltip inside SVG viewport by nudging left when near right edge
          style={{ overflow: 'visible' }}
        >
          <div className="location-tooltip">
            <div className="tooltip-name">{name}</div>
            <div className="tooltip-desc">{description.slice(0, 80)}…</div>
            <div className="tooltip-services">
              {services.map(s => (
                <span key={s} className="tooltip-service-badge">
                  {SERVICE_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}

// Human-readable service labels for the tooltip badges
const SERVICE_LABELS = {
  rest:            'Rest',
  rumors:          'Rumors',
  hirelings:       'Hirelings',
  shop:            'Shop',
  repair:          'Repair',
  identify:        'Identify',
  healing:         'Healing',
  bless:           'Bless',
  resurrection:    'Resurrection',
  adventure_board: 'Contracts',
  bank:            'Bank',
  registration:    'Register',
  class_quests:    'Quests',
  guild_membership:'Guild'
};

export default TownLocation;
