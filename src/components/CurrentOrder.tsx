import React from 'react';
import { OrderItem } from '../types';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CurrentOrderProps {
  products: OrderItem[];
  onUpdateQuantity: (products: OrderItem[]) => void;
}

export const CurrentOrder: React.FC<CurrentOrderProps> = ({ products, onUpdateQuantity }) => {
  const handleUpdateQuantity = (productName: string, increment: boolean) => {
    onUpdateQuantity(
      products.map(p => {
        if (p.productName === productName) {
          const newQuantity = increment ? p.quantity + 1 : p.quantity - 1;
          return newQuantity < 1 ? null : { ...p, quantity: newQuantity };
        }
        return p;
      }).filter((p): p is OrderItem => p !== null)
    );
  };

  const handleRemoveProduct = (productName: string) => {
    onUpdateQuantity(products.filter(p => p.productName !== productName));
  };

  if (products.length === 0) {
    return (
      <div className="mb-8 p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500">No hay productos seleccionados</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Pedido Actual</h3>
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        {products.map(product => (
          <div
            key={product.productName}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="flex-1 font-medium text-gray-700">{product.productName}</span>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleUpdateQuantity(product.productName, false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{product.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(product.productName, true)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="w-24 text-right font-medium text-gray-900">
                {(product.price * product.quantity).toFixed(2)}€
              </span>
              <button
                onClick={() => handleRemoveProduct(product.productName)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};