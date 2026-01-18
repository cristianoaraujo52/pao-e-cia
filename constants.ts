
import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Pão Francês Crocante',
    description: 'Tradicional, sempre quentinho e crocante por fora.',
    price: 0.85,
    category: 'pães',
    image: 'https://picsum.photos/seed/bread1/400/300',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Croissant de Chocolate',
    description: 'Massa folhada artesanal com recheio de chocolate belga.',
    price: 12.50,
    category: 'doces',
    image: 'https://picsum.photos/seed/choco1/400/300',
    rating: 4.9
  },
  {
    id: '3',
    name: 'Suco de Laranja Natural',
    description: 'Espremido na hora, sem conservantes.',
    price: 9.90,
    category: 'bebidas',
    image: 'https://picsum.photos/seed/juice1/400/300',
    rating: 4.7
  },
  {
    id: '4',
    name: 'Coxinha de Frango',
    description: 'Massa de batata leve e recheio suculento.',
    price: 7.50,
    category: 'salgados',
    image: 'https://picsum.photos/seed/snack1/400/300',
    rating: 4.5
  },
  {
    id: '5',
    name: 'Bolo de Cenoura',
    description: 'Fofinho com cobertura de brigadeiro gourmet.',
    price: 45.00,
    category: 'doces',
    image: 'https://picsum.photos/seed/cake1/400/300',
    rating: 5.0
  },
  {
    id: '6',
    name: 'Pão de Queijo Mineiro',
    description: 'Receita tradicional com queijo canastra real.',
    price: 4.50,
    category: 'pães',
    image: 'https://picsum.photos/seed/cheese1/400/300',
    rating: 4.9
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '🍞' },
  { id: 'pães', name: 'Pães', icon: '🥖' },
  { id: 'doces', name: 'Doces', icon: '🧁' },
  { id: 'salgados', name: 'Salgados', icon: '🥯' },
  { id: 'bebidas', name: 'Bebidas', icon: '☕' },
];
