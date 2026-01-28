
import React from 'react';
import { Product, CategoryType } from './types';

export const CATEGORIES: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'RECOMMANDED', label: 'RECOMMENDS', icon: '🔥' },
  { id: 'BURGERS', label: 'BURGERS', icon: '🍔' },
  { id: 'BUCKETS', label: 'BUCKETS', icon: '🍗' },
  { id: 'MEALS', label: 'BOX MEALS', icon: '🍱' },
  { id: 'SIDES', label: 'SIDES', icon: '🍟' },
  { id: 'DRINKS', label: 'DRINKS', icon: '🥤' },
  { id: 'DESSERTS', label: 'DESSERTS', icon: '🍦' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'b1',
    name: 'Kentucky Gold Grander',
    price: 33.95,
    image: 'https://picsum.photos/seed/kfc1/400/300',
    category: 'BURGERS',
    description: 'Bacon, onion rings, cheddar cheese and BBQ sauce with crispy chicken.',
    isBestseller: true
  },
  {
    id: 'b2',
    name: 'Double Grander',
    price: 29.95,
    image: 'https://picsum.photos/seed/kfc2/400/300',
    category: 'BURGERS',
    description: 'Double chicken fillet, cheese, and fresh lettuce.'
  },
  {
    id: 'b3',
    name: 'Halloumi Burger',
    price: 16.95,
    image: 'https://picsum.photos/seed/kfc3/400/300',
    category: 'BURGERS',
    description: 'Crispy halloumi cheese with fresh vegetables.',
    isVegetarian: true,
    isBestseller: true
  },
  {
    id: 'b4',
    name: 'Zinger',
    price: 21.95,
    image: 'https://picsum.photos/seed/kfc4/400/300',
    category: 'BURGERS',
    description: 'The spicy classic everyone loves.'
  },
  {
    id: 'k1',
    name: '15 Hot Wings Bucket',
    price: 45.00,
    image: 'https://picsum.photos/seed/kfc5/400/300',
    category: 'BUCKETS',
    description: 'The ultimate bucket for spice lovers.'
  },
  {
    id: 'k2',
    name: 'Classic Bucket',
    price: 52.50,
    image: 'https://picsum.photos/seed/kfc6/400/300',
    category: 'BUCKETS',
    description: 'Original recipe chicken for the whole family.'
  },
  {
    id: 's1',
    name: 'Large Fries',
    price: 8.50,
    image: 'https://picsum.photos/seed/kfc7/400/300',
    category: 'SIDES',
    description: 'Golden, crispy, and perfectly salted.'
  },
  {
    id: 'd1',
    name: 'Coca-Cola 0.5L',
    price: 7.00,
    image: 'https://picsum.photos/seed/kfc8/400/300',
    category: 'DRINKS',
    description: 'Refreshing cold beverage.'
  }
];
