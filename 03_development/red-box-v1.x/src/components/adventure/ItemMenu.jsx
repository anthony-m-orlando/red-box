import React from 'react';
import { X, Package } from 'lucide-react';
import { canUseItem, getItemIcon } from '../../utils/items';
import Button from '../common/Button';
import './ItemMenu.css';

/**
 * ItemMenu - Display inventory items for use during exploration/combat
 * @param {object} props
 * @param {object} props.character - Character object
 * @param {function} props.onUseItem - Callback when item is used
 * @param {function} props.onClose - Callback to close menu
 * @param {string} props.context - 'exploration' or 'combat'
 */
export function ItemMenu({ character, onUseItem, onClose, context = 'exploration' }) {
  const handleItemClick = (item) => {
    const { canUse } = canUseItem(item, context);
    
    if (canUse) {
      onUseItem(item);
    }
  };

  // Filter items by context (only show usable items)
  const usableItems = character.inventory.filter(item => {
    const { canUse } = canUseItem(item, context);
    return canUse || item.usableIn?.includes(context);
  });

  return (
    <div className="item-menu-overlay" onClick={onClose}>
      <div className="item-menu" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="item-menu-header">
          <div className="menu-title">
            <Package size={24} />
            <h3>Use an Item</h3>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Item Count Info */}
        <div className="inventory-info">
          <span className="info-label">Inventory:</span>
          <span className="info-value">
            {character.inventory.length} items
          </span>
        </div>

        {/* Item List */}
        <div className="item-list">
          {character.inventory.length === 0 ? (
            <div className="no-items">
              <Package size={48} />
              <p>Your inventory is empty!</p>
            </div>
          ) : usableItems.length === 0 ? (
            <div className="no-items">
              <Package size={48} />
              <p>No usable items in {context}.</p>
              <p className="hint">Some items can only be used during exploration or combat.</p>
            </div>
          ) : (
            usableItems.map((item, index) => {
              const { canUse, reason } = canUseItem(item, context);
              const icon = getItemIcon(item);

              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`item-option ${!canUse ? 'disabled' : ''}`}
                >
                  <div className="item-option-header">
                    <div className="item-option-title">
                      <span className="item-icon">{icon}</span>
                      <span className="item-name">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="item-quantity">×{item.quantity}</span>
                      )}
                    </div>
                    {!canUse && reason && (
                      <span className="item-unavailable">{reason}</span>
                    )}
                  </div>

                  {item.effect?.narrative && (
                    <div className="item-description">
                      {item.effect.narrative.substring(0, 100)}
                      {item.effect.narrative.length > 100 ? '...' : ''}
                    </div>
                  )}

                  <div className="item-meta">
                    <span className="item-type">{item.type}</span>
                    {item.weight && (
                      <span className="item-weight">{item.weight} lb</span>
                    )}
                  </div>

                  <div className="item-option-actions">
                    <Button
                      variant={canUse ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleItemClick(item)}
                      disabled={!canUse}
                      fullWidth
                    >
                      {canUse ? 'Use Item' : 'Unavailable'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="item-menu-footer">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ItemMenu;
