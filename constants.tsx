
import { Product, Category, AppSettings, WorkingDay } from './types';

export const THEME_PRESETS = [
  { id: 'classic_red', name: 'Classic Red', color: '#E4002B' },
  { id: 'forest_green', name: 'Forest Green', color: '#059669' },
  { id: 'royal_blue', name: 'Royal Blue', color: '#2563EB' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: 'RECOMMENDED', 
    label: 'RECOMMENDS', 
    icon: '🔥',
    backgroundImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'
  },
  { 
    id: 'BURGERS', 
    label: 'BURGERS', 
    icon: '🍔',
    backgroundImage: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=400&q=80'
  },
  { 
    id: 'BUCKETS', 
    label: 'BUCKETS', 
    icon: '🍗',
    backgroundImage: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80'
  },
  { 
    id: 'MEALS', 
    label: 'BOX MEALS', 
    icon: '🍱',
    backgroundImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
  },
  { id: 'SIDES', label: 'SIDES', icon: '🍟' },
  { id: 'DRINKS', label: 'DRINKS', icon: '🥤' },
  { id: 'DESSERTS', label: 'DESSERTS', icon: '🍦' },
];

const DEFAULT_SIZES = [
  { label: 'Small', price: 0 },
  { label: 'Medium', price: 5 },
  { label: 'Large', price: 10 },
];

const BURGER_ADDONS = [
  { label: 'Double Cheese', price: 1.5 },
  { label: 'Extra Bacon', price: 2.0 },
  { label: 'Spicy Jalapeños', price: 1.0 },
];

export const DEFAULT_WORKING_HOURS: WorkingDay[] = [
  { day: 'Sunday', isOpen: true, openTime: '10:00', closeTime: '22:00' },
  { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
  { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
  { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
  { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
  { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '23:59' },
  { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '23:59' },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'b1',
    name: 'Kentucky Gold Grander',
    price: 33.95,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    category: 'BURGERS',
    description: 'Bacon, onion rings, cheddar cheese and BBQ sauce with crispy chicken.',
    isBestseller: true,
    sizes: [...DEFAULT_SIZES],
    addons: [...BURGER_ADDONS]
  },
  {
    id: 'b2',
    name: 'Double Grander',
    price: 29.95,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=400&q=80',
    category: 'BURGERS',
    description: 'Double chicken fillet, cheese, and fresh lettuce.',
    sizes: [...DEFAULT_SIZES],
    addons: [...BURGER_ADDONS]
  },
  {
    id: 'k1',
    name: '15 Hot Wings Bucket',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80',
    category: 'BUCKETS',
    description: 'The ultimate bucket for spice lovers.',
    sizes: [{ label: 'Regular', price: 0 }, { label: 'Giant', price: 15 }],
    addons: [{ label: 'Extra Hot Dip', price: 1.5 }, { label: 'Garlic Mayo', price: 1.5 }]
  },
  {
    id: 's1',
    name: 'Large Fries',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80',
    category: 'SIDES',
    description: 'Golden, crispy, and perfectly salted.',
    sizes: [{ label: 'Standard', price: 0 }],
    addons: [{ label: 'Cheese Sauce', price: 2.0 }]
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  brandName: 'LittleIndia',
  primaryColor: THEME_PRESETS[0].color,
  themeMode: 'light',
  currency: 'Rs',
  categories: DEFAULT_CATEGORIES,
  products: DEFAULT_PRODUCTS,
  workingHours: DEFAULT_WORKING_HOURS,
  forceHolidays: [],
  notificationWebhookUrl: '',
};
