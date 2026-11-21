import { useCallback, useEffect, useState } from "react";
import { readCart, addCartItem, addCartItems } from "../domain/cart";
import { CART_STORAGE_KEY } from "../domain/constants";
export function useCart() {
  const [cart, setCart] = useState(readCart);
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);
  const add = useCallback(
    (product, option, quantity = 1, customization) =>
      setCart((current) =>
        addCartItem(current, product, option, quantity, customization),
      ),
    [],
  );
  const addMany = useCallback(
    (entries) => setCart((current) => addCartItems(current, entries)),
    [],
  );
  return { cart, setCart, add, addMany };
}
