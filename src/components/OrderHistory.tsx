import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { db } from '../services/database';
import { Clock, Database, Trash2 } from 'lucide-react';

interface OrderRecord {
  id: number;
  timestamp: string;
  users: User[];
  totalAmount: number;
}

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const allOrders = await db.getAllOrders();
      setOrders(allOrders.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('¿Está seguro de que desea borrar todo el historial de pedidos?')) {
      try {
        await db.clearAllOrders();
        setOrders([]);
      } catch (error) {
        console.error('Error clearing orders:', error);
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Historial de Pedidos</h2>
        </div>
        {orders.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Borrar Historial
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No hay pedidos en el historial</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(order.timestamp).toLocaleString()}</span>
                </div>
                <span className="font-semibold text-blue-600">
                  Total: {order.totalAmount.toFixed(2)}€
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {order.users.map((user, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{user.name}</span>
                      <span className="px-2 py-1 text-sm bg-gray-200 rounded-full">
                        {user.isChild ? 'Niño' : 'Adulto'}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {user.orders.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-600">
                          {item.productName} x{item.quantity} - {(item.price * item.quantity).toFixed(2)}€
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};