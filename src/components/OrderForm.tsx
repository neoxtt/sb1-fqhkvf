import React, { useState } from 'react';
import { User, Product, OrderItem } from '../types';
import { products } from '../data/products';
import { Receipt, User as UserIcon } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { CurrentOrder } from './CurrentOrder';
import { OrderSummary } from './OrderSummary';
import { OrderHistory } from './OrderHistory';
import { db } from '../services/database';

export const OrderForm: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isChild, setIsChild] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const handleAddUser = () => {
    if (currentUser && selectedProducts.length > 0 && users.length < 40) {
      setUsers([...users, { name: currentUser, isChild, orders: selectedProducts }]);
      setCurrentUser('');
      setSelectedProducts([]);
      setIsChild(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    if (!currentUser) {
      alert('Por favor, introduzca el nombre del cliente antes de seleccionar productos.');
      return;
    }

    const existingProduct = selectedProducts.find(p => p.productName === product.name);
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p => 
        p.productName === product.name 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, {
        productName: product.name,
        quantity: 1,
        price: product.price
      }]);
    }
  };

  const handleRemoveOrder = (userName: string, productName: string) => {
    setUsers(users.map(user => {
      if (user.name === userName) {
        return {
          ...user,
          orders: user.orders.filter(order => order.productName !== productName)
        };
      }
      return user;
    }));
  };

  const handleFinishOrder = async () => {
    try {
      await db.saveOrder(users);
      setUsers([]);
      setShowSummary(false);
      setShowHistory(true);
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error al guardar el pedido. Por favor, inténtelo de nuevo.');
    }
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <OrderHistory />
            <button
              onClick={() => setShowHistory(false)}
              className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Nuevo Pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Receipt className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-800">Sistema de Pedidos</h1>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Ver Historial
            </button>
          </div>

          {!showSummary ? (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="w-6 h-6 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Datos del Cliente ({users.length}/40)
                  </h2>
                </div>
                <div className="flex gap-4 max-w-xl">
                  <input
                    type="text"
                    value={currentUser}
                    onChange={(e) => setCurrentUser(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                  <label className="flex items-center gap-3 text-gray-700">
                    <input
                      type="checkbox"
                      checked={isChild}
                      onChange={(e) => setIsChild(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                    />
                    Niño
                  </label>
                </div>
                {currentUser && selectedProducts.length === 0 && (
                  <p className="mt-2 text-sm text-red-500">
                    Debe seleccionar al menos un producto antes de añadir la comanda
                  </p>
                )}
              </div>

              <div className="grid gap-8 mb-8">
                {['Tapas', 'Bocatas', 'Sandwich', 'Hamburguesa'].map(category => (
                  <div key={category}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {products
                        .filter(p => p.category === category)
                        .map(product => (
                          <ProductCard
                            key={product.name}
                            product={product}
                            onSelect={handleProductSelect}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <CurrentOrder
                products={selectedProducts}
                onUpdateQuantity={setSelectedProducts}
              />

              <div className="flex gap-4">
                <button
                  onClick={handleAddUser}
                  disabled={!currentUser || selectedProducts.length === 0 || users.length >= 40}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  Añadir Comanda
                </button>
                <button
                  onClick={() => setShowSummary(true)}
                  disabled={users.length === 0}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
                >
                  Ver Resumen
                </button>
              </div>
            </>
          ) : (
            <>
              <OrderSummary
                users={users}
                onBack={() => setShowSummary(false)}
                onRemoveOrder={handleRemoveOrder}
              />
              <button
                onClick={handleFinishOrder}
                className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Finalizar Pedido
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};