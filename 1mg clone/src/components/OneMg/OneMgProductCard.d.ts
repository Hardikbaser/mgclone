import type { ComponentType } from 'react';

export type OneMgProduct = {
  id: string;
  title: string;
  packSize: string;
  manufacturer: string;
  mrp: number;
  discountPercent: number;
  isRxRequired: boolean;
  image: string;
};

declare const OneMgProductCard: ComponentType<{
  product: OneMgProduct;
  onAddToCart?: (product: OneMgProduct, quantity: number) => void;
}>;

export default OneMgProductCard;
