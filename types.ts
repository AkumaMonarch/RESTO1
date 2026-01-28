
export type CategoryType = 'RECOMMANDED' | 'BURGERS' | 'BUCKETS' | 'MEALS' | 'SIDES' | 'DRINKS' | 'DESSERTS';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: CategoryType;
  description: string;
  isBestseller?: boolean;
  isVegetarian?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  customizations?: string[];
}

export interface UserDetails {
  name: string;
  phone: string;
  address: string;
  cashTendered: number;
}

export enum AppView {
  LANDING = 'LANDING',
  MENU = 'MENU',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  USER_DETAILS = 'USER_DETAILS',
  FINAL_SUMMARY = 'FINAL_SUMMARY',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED'
}
