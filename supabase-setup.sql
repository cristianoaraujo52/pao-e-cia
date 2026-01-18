-- =====================================================
-- PAO E CIA - SUPABASE DATABASE SETUP
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pães', 'doces', 'bebidas', 'salgados')),
  image TEXT,
  rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'card', 'cash', 'monthly')),
  delivery_block TEXT NOT NULL CHECK (delivery_block IN ('1', '2', '3', '4')),
  delivery_apartment TEXT NOT NULL,
  delivery_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'delivering', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Moradores
CREATE TABLE IF NOT EXISTS residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  block TEXT NOT NULL CHECK (block IN ('1', '2', '3', '4')),
  apartment TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Mensagens (Chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES residents(id),
  sender_name TEXT NOT NULL,
  sender_block TEXT,
  sender_apartment TEXT,
  content TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT FALSE,
  recipient_id UUID REFERENCES residents(id),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_residents_block ON residents(block);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_block ON orders(delivery_block);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura de produtos
CREATE POLICY "Produtos visíveis para todos" ON products
    FOR SELECT USING (true);

-- Políticas de acesso para inserção/atualização/exclusão (autenticados ou anônimos)
CREATE POLICY "Inserir produtos" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Atualizar produtos" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Deletar produtos" ON products
    FOR DELETE USING (true);

-- Políticas de acesso para pedidos
CREATE POLICY "Visualizar pedidos" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Criar pedidos" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Atualizar pedidos" ON orders
    FOR UPDATE USING (true);

-- Habilitar RLS para moradores e mensagens
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas de moradores
CREATE POLICY "Inserir moradores" ON residents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Visualizar moradores" ON residents
    FOR SELECT USING (true);

CREATE POLICY "Atualizar moradores" ON residents
    FOR UPDATE USING (true);

-- Políticas de mensagens
CREATE POLICY "Inserir mensagens" ON messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Visualizar mensagens" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Atualizar mensagens" ON messages
    FOR UPDATE USING (true);

-- Habilitar Realtime para pedidos e mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =====================================================
-- DADOS INICIAIS (OPCIONAL - descomente para usar)
-- =====================================================

/*
INSERT INTO products (name, description, price, category, image, rating) VALUES
('Pão Francês Crocante', 'Tradicional, sempre quentinho e crocante por fora.', 0.85, 'pães', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', 4.8),
('Croissant de Chocolate', 'Massa folhada com recheio cremoso de chocolate.', 12.00, 'doces', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 4.9),
('Pão de Queijo Mineiro', 'Receita tradicional mineira, quentinho e macio.', 3.50, 'salgados', 'https://images.unsplash.com/photo-1598733753530-31e9e0ec1a96?w=400', 4.7),
('Café Expresso', 'Café forte e encorpado, feito na hora.', 4.50, 'bebidas', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', 4.8),
('Bolo de Cenoura', 'Com cobertura de chocolate, fatia generosa.', 8.00, 'doces', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', 4.9),
('Suco de Laranja Natural', 'Feito na hora com laranjas frescas.', 7.00, 'bebidas', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 4.6);
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
