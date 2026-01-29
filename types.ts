
export type CategoryType = string;

export interface Category {
  id: CategoryType;
  label: string;
  icon: string;
  backgroundImage?: string;
}

export interface SizeOption {
  label: string;
  price: number;
}

export interface AddonOption {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number; // Base price (usually for default size)
  image: string;
  category: CategoryType;
  description: string;
  isBestseller?: boolean;
  isVegetarian?: boolean;
  sizes: SizeOption[];
  addons: AddonOption[];
}

export interface WorkingDay {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface AppSettings {
  brandName: string;
  primaryColor: string;
  themeMode: 'light' | 'dark';
  currency: string;
  categories: Category[];
  products: Product[];
  workingHours: WorkingDay[];
  forceHolidays: string[]; // YYYY-MM-DD formatted strings
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: SizeOption;
  selectedAddons: AddonOption[];
}

export type DiningMode = 'EAT_IN' | 'TAKE_AWAY' | 'DELIVERY';

export interface UserDetails {
  name: string;
  phone: string;
  address: string;
  diningMode: DiningMode;
}

export enum AppView {
  LANDING = 'LANDING',
  MENU = 'MENU',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  USER_DETAILS = 'USER_DETAILS',
  FINAL_SUMMARY = 'FINAL_SUMMARY',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ADMIN = 'ADMIN'
}
