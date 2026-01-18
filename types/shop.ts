// types/shop.ts

export interface ProductCategory {
    id: number;
    name: string;
    description: string;
    slug: string;
    parentId?: number;
    status: boolean;
    order?: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    stockQuantity: number;
    soldQuantity: number;
    categoryId: number;
    categoryName: string;
    images: string[];
    brand: string;
    specifications: Record<string, string>;
    status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
    featured: boolean;
    averageRating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductDetail extends Product {
    recentReviews: ProductReview[];
    relatedProducts: Product[];
}

export interface ProductReview {
    id: number;
    productId: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    images?: string[];
    createdAt: string;
}

export interface CartItem {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    subtotal: number;
    stockQuantity: number;
}

export interface Cart {
    id: number;
    userId: number;
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    updatedAt: string;
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface Order {
    id: number;
    orderNumber: string;
    userId: number;
    userName: string;
    userPhone: string;
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
    paymentMethod: 'COD' | 'MOMO' | 'VNPAY' | 'ZALOPAY';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

    // Shipping info
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingProvince: string;
    shippingDistrict: string;
    shippingWard: string;
    note?: string;

    // Dates
    createdAt: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    cancelReason?: string;
}

export interface ProductSearchParams {
    keyword?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    featured?: boolean;
    sort?: string; // createdAt, price, soldQuantity
    direction?: string; // ASC, DESC
    page: number;
    size: number;
}
