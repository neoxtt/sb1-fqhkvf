import React from 'react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(product)}
      className="group relative bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 overflow-hidden"
    >
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus className="w-5 h-5 text-blue-500" />
      </div>
      <h3 className="font-medium text-gray-800 mb-2 pr-6">{product.name}</h3>
      <p className="text-blue-600 font-semibold">{product.price.toFixed(2)}€</p>
      <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 transition-opacity" />
    </div>
  );
};