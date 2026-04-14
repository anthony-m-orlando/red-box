/**
 * ShopInterface.jsx
 * Shared buy/sell UI used by GeneralStore, Blacksmith, and MagesTower.
 * Temple uses its own donation-based UI (TempleService), not this component.
 *
 * USAGE
 * -----
 *   <ShopInterface shopId="general_store" filter={null} />
 *   <ShopInterface shopId="blacksmith" filter="silver" />
 *
 * TRANSACTION LOGIC
 * -----------------
 * Purchase is a two-step atomic operation:
 *   1. Validate: character.gold >= finalCost  (pre-check, no state mutation)
 *   2. Execute:  updateGold(-finalCost) then addItem(inventoryItem)
 *
 * The shop item's `itemId` field maps to `id` on the inventory item so
 * CharacterContext.removeItem() works correctly later.
 *
 * GUILD DISCOUNT
 * --------------
 * If town.isGuildMember, getShopDiscount() returns 0.9 (10% off).
 * Final price = Math.floor(item.cost * quantity * discount).
 * Services (type === 'service') are always full price.
 *
 * STOCK LIMITS
 * ------------
 * Each item has a shopStock number (Infinity = unlimited).
 * purchasedThisVisit{} tracks how many have been bought this session.
 * Resets on component mount (i.e. each time the shop is opened).
 */

import { useState, useMemo, useCallback } from 'react';
import { ShoppingBag, Package, CheckCircle, AlertCircle } from 'lucide-react';

import { useCharacter }       from '../../contexts/CharacterContext';
import { useTown }            from '../../contexts/TownContext';
import { getShopInventory, canPurchase, calculateCost } from '../../data/shopInventory';

import './ShopInterface.css';

// ---------------------------------------------------------------------------

export function ShopInterface({ shopId, filter = null }) {
  const { character, addItem, updateGold } = useCharacter();
  const { getShopDiscount }               = useTown();

  const discount = getShopDiscount();

  // Raw shop catalog, optionally filtered
  const allItems = useMemo(() => {
    const inventory = getShopInventory(shopId);
    if (!filter) return inventory;
    return inventory.filter(item =>
      item.itemId.includes(filter) ||
      item.name.toLowerCase().includes(filter) ||
      item.type === filter
    );
  }, [shopId, filter]);

  // Track units bought this session to enforce shopStock limits
  const [purchasedThisVisit, setPurchasedThisVisit] = useState({});

  // Quantity selector per item (default 1)
  const [quantities, setQuantities] = useState({});
  const getQty = (itemId) => quantities[itemId] ?? 1;

  // Per-item feedback message: { itemId: { type: 'success'|'error', text: string } }
  const [feedback, setFeedback] = useState({});

  const showFeedback = useCallback((itemId, type, text) => {
    setFeedback(prev => ({ ...prev, [itemId]: { type, text } }));
    setTimeout(() => {
      setFeedback(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }, 2800);
  }, []);

  // ---- Purchase handler
  const handlePurchase = useCallback((item) => {
    const qty      = getQty(item.itemId);
    const rawCost  = calculateCost(item, qty);
    // Services are never discounted
    const finalCost = item.type === 'service'
      ? rawCost
      : Math.floor(rawCost * discount);

    // 1. Affordability check
    if (character.gold < finalCost) {
      showFeedback(item.itemId, 'error', `Not enough gold (need ${finalCost} GP)`);
      return;
    }

    // 2. Stock check
    const bought = purchasedThisVisit[item.itemId] ?? 0;
    if (item.shopStock !== Infinity && bought + qty > item.shopStock) {
      const remaining = item.shopStock - bought;
      showFeedback(
        item.itemId,
        'error',
        remaining <= 0 ? 'Out of stock' : `Only ${remaining} available`
      );
      return;
    }

    // 3. Class restriction check
    const { allowed, reason } = canPurchase(item, character);
    if (!allowed) {
      showFeedback(item.itemId, 'error', reason);
      return;
    }

    // 4. Commit — gold first, then item
    updateGold(-finalCost);

    // Build the inventory item — id must match itemId for REMOVE_ITEM to work
    const inventoryItem = {
      id:          item.itemId,
      name:        item.name,
      type:        item.type,
      weight:      item.weight,
      quantity:    item.quantity * qty,
      description: item.description,
      effect:      item.effect,
      usableIn:    item.usableIn ?? [],
      // Weapon / armor specific
      ...(item.damage    && { damage: item.damage }),
      ...(item.armorClass && { armorClass: item.armorClass }),
      ...(item.silver    && { silver: item.silver }),
      ...(item.canThrow  && { canThrow: item.canThrow }),
      ...(item.ranged    && { ranged: item.ranged }),
      ...(item.twoHanded && { twoHanded: item.twoHanded })
    };

    // Services don't go into inventory
    if (item.type !== 'service') {
      addItem(inventoryItem);
    }

    // Update stock tracking
    setPurchasedThisVisit(prev => ({
      ...prev,
      [item.itemId]: (prev[item.itemId] ?? 0) + qty
    }));

    const costLabel = discount < 1 && item.type !== 'service'
      ? `${finalCost} GP (guild discount applied)`
      : `${finalCost} GP`;

    showFeedback(
      item.itemId,
      'success',
      item.type === 'service'
        ? `Service arranged. (${costLabel})`
        : qty > 1
        ? `Added ${qty}× ${item.name}. (${costLabel})`
        : `${item.name} added to inventory. (${costLabel})`
    );
  }, [character, discount, purchasedThisVisit, quantities, addItem, updateGold, showFeedback]);

  // ---- Quantity change
  const handleQtyChange = useCallback((itemId, delta, max) => {
    setQuantities(prev => {
      const current = prev[itemId] ?? 1;
      const next    = Math.max(1, Math.min(max, current + delta));
      return { ...prev, [itemId]: next };
    });
  }, []);

  // ---- Derived: remaining stock for an item
  const remainingStock = useCallback((item) => {
    if (item.shopStock === Infinity) return Infinity;
    return item.shopStock - (purchasedThisVisit[item.itemId] ?? 0);
  }, [purchasedThisVisit]);

  // ---- Group items by type for display
  const grouped = useMemo(() => {
    const groups = {};
    allItems.forEach(item => {
      const group = TYPE_GROUP_LABELS[item.type] ?? 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });
    return groups;
  }, [allItems]);

  return (
    <div className="shop-interface">

      {/* Gold display */}
      <div className="shop-gold-bar">
        <ShoppingBag size={15} />
        <span>Your gold:</span>
        <span className="shop-gold-amount">{character.gold} GP</span>
        {discount < 1 && (
          <span className="shop-guild-badge">Guild member — 10% off</span>
        )}
      </div>

      {/* Item groups */}
      {Object.entries(grouped).map(([groupLabel, items]) => (
        <div key={groupLabel} className="shop-group">
          <h3 className="shop-group-title">{groupLabel}</h3>
          <div className="shop-item-list">
            {items.map(item => (
              <ShopItem
                key={item.itemId}
                item={item}
                character={character}
                qty={getQty(item.itemId)}
                discount={discount}
                remaining={remainingStock(item)}
                feedback={feedback[item.itemId]}
                onQtyChange={(delta) =>
                  handleQtyChange(
                    item.itemId,
                    delta,
                    remainingStock(item) === Infinity ? 99 : remainingStock(item)
                  )
                }
                onPurchase={() => handlePurchase(item)}
              />
            ))}
          </div>
        </div>
      ))}

      {allItems.length === 0 && (
        <div className="shop-empty">
          <Package size={28} />
          <p>Nothing available at the moment.</p>
        </div>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// SHOP ITEM ROW
// ---------------------------------------------------------------------------

function ShopItem({ item, character, qty, discount, remaining, feedback, onQtyChange, onPurchase }) {
  const rawCost   = calculateCost(item, qty);
  const finalCost = item.type === 'service' ? rawCost : Math.floor(rawCost * discount);
  const discounted = discount < 1 && item.type !== 'service';

  const { allowed, reason } = canPurchase(item, character);
  const cantAfford = character.gold < finalCost;
  const outOfStock = remaining <= 0;
  const disabled   = !allowed || cantAfford || outOfStock;

  const showQtyControls = item.shopStock !== 1 &&
                          item.type !== 'service' &&
                          remaining > 1;

  return (
    <div className={`shop-item ${disabled ? 'shop-item-disabled' : ''}`}>

      {/* Left: icon + details */}
      <div className="shop-item-left">
        <span className="shop-item-icon" aria-hidden="true">
          {ITEM_TYPE_ICONS[item.type] ?? '📦'}
        </span>
        <div className="shop-item-details">
          <span className="shop-item-name">{item.name}</span>
          <span className="shop-item-desc">{item.description}</span>
          {item.damage     && <span className="shop-item-stat">DMG {item.damage}</span>}
          {item.armorClass && <span className="shop-item-stat">AC {item.armorClass}</span>}
          {!allowed        && <span className="shop-item-restriction">{reason}</span>}
          {outOfStock      && <span className="shop-item-restriction">Out of stock</span>}
        </div>
      </div>

      {/* Right: quantity + price + buy button */}
      <div className="shop-item-right">

        {showQtyControls && (
          <div className="shop-qty">
            <button
              className="shop-qty-btn"
              onClick={() => onQtyChange(-1)}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >−</button>
            <span className="shop-qty-value">{qty}</span>
            <button
              className="shop-qty-btn"
              onClick={() => onQtyChange(+1)}
              disabled={remaining !== Infinity && qty >= remaining}
              aria-label="Increase quantity"
            >+</button>
          </div>
        )}

        <div className="shop-item-price">
          {discounted && (
            <span className="shop-price-original">{rawCost} GP</span>
          )}
          <span className={`shop-price-final ${cantAfford ? 'price-cant-afford' : ''}`}>
            {finalCost} GP
          </span>
        </div>

        <button
          className="shop-buy-btn"
          onClick={onPurchase}
          disabled={disabled}
          aria-label={`Buy ${item.name} for ${finalCost} GP`}
        >
          Buy
        </button>

      </div>

      {/* Feedback row */}
      {feedback && (
        <div className={`shop-feedback shop-feedback-${feedback.type}`}>
          {feedback.type === 'success'
            ? <CheckCircle size={13} />
            : <AlertCircle size={13} />
          }
          {feedback.text}
        </div>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

const TYPE_GROUP_LABELS = {
  consumable: 'Consumables',
  tool:       'Equipment & Tools',
  weapon:     'Weapons',
  armor:      'Armour',
  service:    'Services',
  scroll:     'Scrolls'   // MagesTower items have type 'consumable' but feel like scrolls
};

const ITEM_TYPE_ICONS = {
  consumable: '🧪',
  tool:       '🎒',
  weapon:     '⚔️',
  armor:      '🛡️',
  service:    '📋',
  scroll:     '📜'
};

export default ShopInterface;
