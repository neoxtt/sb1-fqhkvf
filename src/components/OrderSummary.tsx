import React from 'react';
import { User } from '../types';
import { Trash2, ArrowLeft } from 'lucide-react';
import { products } from '../data/products';

interface OrderSummaryProps {
  users: User[];
  onBack: () => void;
  onRemoveOrder: (userName: string, productName: string) => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ users, onBack, onRemoveOrder }) => {
  const getTopThreeTapas = () => {
    const tapasCount: { [key: string]: number } = {};
    users.forEach(user => {
      user.orders
        .filter(order => products.find(p => p.name === order.productName)?.category === 'Tapas')
        .forEach(order => {
          tapasCount[order.productName] = (tapasCount[order.productName] || 0) + order.quantity;
        });
    });
    
    return Object.entries(tapasCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const getUserTotal = (user: User) => {
    return user.orders.reduce((sum, order) => 
      sum + (order.price * order.quantity), 0
    );
  };

  const getTotalPrice = () => {
    return users.reduce((total, user) => total + getUserTotal(user), 0);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Resumen de Pedidos</h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {users.map((user, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-800">
                {user.name}
              </h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {user.isChild ? 'Niño' : 'Adulto'}
              </span>
            </div>
            <div className="space-y-2">
              {user.orders.map((order, orderIndex) => (
                <div key={orderIndex} className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-gray-700">{order.productName}</span>
                    <div className="text-sm text-gray-500">
                      x{order.quantity} - {(order.price * order.quantity).toFixed(2)}€
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveOrder(user.name, order.productName)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-right font-semibold text-gray-800">
                Total: {getUserTotal(user).toFixed(2)}€
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Top 3 Tapas más Pedidas</h3>
        <div className="space-y-3">
          {getTopThreeTapas().map(([name, count], index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{name}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {count} unidades
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
        <div className="text-2xl font-bold">
          Precio Total: {getTotalPrice().toFixed(2)}€
        </div>
      </div>
    </div>
  );
};