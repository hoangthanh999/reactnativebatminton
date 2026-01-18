import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { Cart } from '../types/shop';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext to know when to fetch cart

interface CartContextData {
    cart: Cart | null;
    itemCount: number;
    loading: boolean;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    refreshCart: () => Promise<void>;
    clearCartLocal: () => void; // Called on logout
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth(); // If AuthContext exposes this

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            // Don't set global loading here to avoid flickering everything
            const response = await cartService.getCart();
            if (response.success) {
                setCart(response.data);
            }
        } catch (error) {
            console.error('Load cart error', error);
        }
    }, [isAuthenticated]);

    // Initial load when auth changes
    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated, refreshCart]);

    const addToCart = async (productId: number, quantity: number = 1) => {
        try {
            setLoading(true);
            const response = await cartService.addToCart(productId, quantity);
            if (response.success) {
                setCart(response.data);
                Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
        if (quantity < 1) return;
        try {
            setLoading(true);
            const response = await cartService.updateItem(itemId, quantity);
            if (response.success) {
                setCart(response.data);
            }
        } catch (error) {
            console.error('Update cart error', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId: number) => {
        try {
            setLoading(true);
            const response = await cartService.removeItem(itemId);
            if (response.success) {
                setCart(response.data);
            }
        } catch (error) {
            console.error('Remove item error', error);
        } finally {
            setLoading(false);
        }
    };

    const clearCartLocal = () => {
        setCart(null);
    };

    return (
        <CartContext.Provider value={{
            cart,
            itemCount: cart?.totalItems || 0,
            loading,
            addToCart,
            updateQuantity,
            removeFromCart,
            refreshCart,
            clearCartLocal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCartContext() {
    return useContext(CartContext);
}
