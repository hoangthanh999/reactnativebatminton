import { useCartContext } from '../contexts/CartContext';

export function useCart() {
    const context = useCartContext();

    // Alias loadCart to refreshCart for backward compatibility if needed, 
    // or just expose the context directly.
    return {
        ...context,
        loadCart: context.refreshCart
    };
}
