import React from 'react';
import { getProducts } from '../../../lib/product';
import ShopSection from './ShopSection';

export default async function ProductGrid() {
  const products = await getProducts();

  return <ShopSection products={products} />;
}
