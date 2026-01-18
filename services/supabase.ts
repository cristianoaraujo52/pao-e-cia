
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient | null =
    supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey)
        : null;

export const isSupabaseConfigured = (): boolean => {
    return supabaseUrl !== '' && supabaseKey !== '' && supabase !== null;
};

// ==================== PRODUCTS ====================

export async function fetchProducts(): Promise<Product[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }

    return data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        category: p.category,
        image: p.image,
        rating: parseFloat(p.rating),
    }));
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('products')
        .insert({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image,
            rating: product.rating,
        })
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar produto:', error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        image: data.image,
        rating: parseFloat(data.rating),
    };
}

export async function updateProduct(product: Product): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
        .from('products')
        .update({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image,
            rating: product.rating,
        })
        .eq('id', product.id);

    if (error) {
        console.error('Erro ao atualizar produto:', error);
        return false;
    }

    return true;
}

export async function deleteProduct(productId: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('Erro ao deletar produto:', error);
        return false;
    }

    return true;
}

// ==================== ORDERS ====================

export async function fetchOrders(): Promise<Order[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar pedidos:', error);
        return [];
    }

    return data.map(o => ({
        id: o.id,
        userId: o.user_id,
        items: o.items,
        subtotal: parseFloat(o.subtotal),
        deliveryFee: parseFloat(o.delivery_fee),
        discount: parseFloat(o.discount),
        total: parseFloat(o.total),
        paymentMethod: o.payment_method,
        deliveryAddress: {
            block: o.delivery_block,
            apartment: o.delivery_apartment,
            notes: o.delivery_notes,
        },
        status: o.status,
        createdAt: o.created_at,
    }));
}

export async function createOrder(order: Order): Promise<Order | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('orders')
        .insert({
            user_id: order.userId,
            items: order.items,
            subtotal: order.subtotal,
            delivery_fee: order.deliveryFee,
            discount: order.discount,
            total: order.total,
            payment_method: order.paymentMethod,
            delivery_block: order.deliveryAddress.block,
            delivery_apartment: order.deliveryAddress.apartment,
            delivery_notes: order.deliveryAddress.notes || null,
            status: order.status,
        })
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar pedido:', error);
        return null;
    }

    return {
        ...order,
        id: data.id,
        createdAt: data.created_at,
    };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) {
        console.error('Erro ao atualizar status:', error);
        return false;
    }

    return true;
}

// ==================== REPORTS ====================

export interface DailyReport {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    paymentBreakdown: Record<string, number>;
    topProducts: { name: string; quantity: number; revenue: number }[];
}

export async function generateDailyReport(date: string): Promise<DailyReport | null> {
    if (!supabase) return null;

    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

    if (error || !orders) {
        console.error('Erro ao gerar relatório:', error);
        return null;
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const paymentBreakdown: Record<string, number> = {};
    orders.forEach(o => {
        const method = o.payment_method;
        paymentBreakdown[method] = (paymentBreakdown[method] || 0) + parseFloat(o.total);
    });

    const productCount: Record<string, { quantity: number; revenue: number }> = {};
    orders.forEach(o => {
        (o.items as any[]).forEach(item => {
            if (!productCount[item.name]) {
                productCount[item.name] = { quantity: 0, revenue: 0 };
            }
            productCount[item.name].quantity += item.quantity;
            productCount[item.name].revenue += item.price * item.quantity;
        });
    });

    const topProducts = Object.entries(productCount)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    return { date, totalOrders, totalRevenue, averageTicket, paymentBreakdown, topProducts };
}

// ==================== REALTIME SUBSCRIPTIONS ====================

export function subscribeToOrders(callback: (order: Order) => void) {
    if (!supabase) return null;

    return supabase
        .channel('orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
            const o = payload.new as any;
            callback({
                id: o.id,
                userId: o.user_id,
                items: o.items,
                subtotal: parseFloat(o.subtotal),
                deliveryFee: parseFloat(o.delivery_fee),
                discount: parseFloat(o.discount),
                total: parseFloat(o.total),
                paymentMethod: o.payment_method,
                deliveryAddress: {
                    block: o.delivery_block,
                    apartment: o.delivery_apartment,
                    notes: o.delivery_notes,
                },
                status: o.status,
                createdAt: o.created_at,
            });
        })
        .subscribe();
}
