import React from 'react';
import { X, Package } from 'lucide-react';
import { canUseItem, getItemIcon, isEquipableItem } from '../../utils/items';
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
    const { canUse } = canUseItem(item, context, character);
    const equipable = isEquipable(item);
    const isEquipped = equipable && (
      (item.effect?.type === 'equip_weapon' && character.weapon === item.name) ||
      (item.effect?.type === 'equip_armor' && character.armor === item.name) ||
      (item.effect?.type === 'equip_shield' && character.shield === item.name)
    );
    
    if (canUse || isEquipped) {
      onUseItem(item);
    }
  };

  const isEquipable = (item) => isEquipableItem(item);

  // Filter items by context — in town inventory mode, show all items.
  const inventoryItems = character.inventory.filter(item => {
    if (context === 'town') return true;
    const { canUse } = canUseItem(item, context, character);
    return canUse || item.usableIn?.includes(context) || isEquipable(item);
  });

  return (
    <div className="item-menu-overlay" onClick={onClose}>
      <div className="item-menu" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="item-menu-header">
          <div className="menu-title">
            <Package size={24} />
            <h3>Inventory</h3>
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
          ) : inventoryItems.length === 0 ? (
            <div className="no-items">
              <Package size={48} />
              <p>No inventory items to display.</p>
              <p className="hint">Use the action buttons to gain items or return later.</p>
            </div>
          ) : (
            inventoryItems.map((item, index) => {
              const { canUse, reason } = canUseItem(item, context, character);
              const icon = getItemIcon(item);
              const equipable = isEquipable(item);
              let actionLabel = 'Use Item';
              let disableAction = !canUse;

              if (equipable) {
                if (item.effect?.type === 'equip_weapon') {
                  actionLabel = character.weapon === item.name ? 'Unequip' : 'Equip';
                } else if (item.effect?.type === 'equip_armor') {
                  actionLabel = character.armor === item.name ? 'Unequip' : 'Equip';
                } else if (item.effect?.type === 'equip_shield') {
                  actionLabel = character.shield === item.name ? 'Unequip' : 'Equip';
                } else {
                  actionLabel = 'Equip';
                }
              } else {
                actionLabel = canUse ? 'Use Item' : 'Unavailable';
              }

              if (equipable && !canUse && actionLabel !== 'Unequip') {
                disableAction = true;
              }

              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`item-option ${disableAction ? 'disabled' : ''}`}
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
                      variant={disableAction ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleItemClick(item)}
                      disabled={disableAction}
                      fullWidth
                    >
                      {actionLabel}
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
