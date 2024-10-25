import { createClient } from '@libsql/client';
import { User } from '../types';

const client = createClient({
  url: 'libsql://restaurant-orders-bolt.turso.io',
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDg3MjQ0ODAsImV4cCI6MTcxMTMxNjQ4MH0.2S8LXFrJ6JZQVSXxhBs0ePyjkGUEKHCT6L22xZ2'
});

export class DatabaseService {
  async init(): Promise<void> {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        total_amount REAL NOT NULL
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        is_child BOOLEAN NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
  }

  async saveOrder(users: User[]): Promise<void> {
    const totalAmount = users.reduce((total, user) => 
      total + user.orders.reduce((sum, order) => 
        sum + (order.price * order.quantity), 0
      ), 0
    );

    const orderResult = await client.execute({
      sql: 'INSERT INTO orders (timestamp, total_amount) VALUES (?, ?)',
      args: [new Date().toISOString(), totalAmount]
    });

    const orderId = Number(orderResult.lastInsertId);

    for (const user of users) {
      const userResult = await client.execute({
        sql: 'INSERT INTO users (order_id, name, is_child) VALUES (?, ?, ?)',
        args: [orderId, user.name, user.isChild]
      });

      const userId = Number(userResult.lastInsertId);

      for (const item of user.orders) {
        await client.execute({
          sql: 'INSERT INTO order_items (user_id, product_name, quantity, price) VALUES (?, ?, ?, ?)',
          args: [userId, item.productName, item.quantity, item.price]
        });
      }
    }
  }

  async getAllOrders(): Promise<Array<{
    id: number;
    timestamp: string;
    users: User[];
    totalAmount: number;
  }>> {
    const orders = await client.execute('SELECT * FROM orders ORDER BY timestamp DESC');
    const result = [];

    for (const order of orders.rows) {
      const users = await client.execute({
        sql: 'SELECT * FROM users WHERE order_id = ?',
        args: [order.id]
      });

      const orderUsers = [];
      for (const user of users.rows) {
        const items = await client.execute({
          sql: 'SELECT * FROM order_items WHERE user_id = ?',
          args: [user.id]
        });

        orderUsers.push({
          name: user.name,
          isChild: Boolean(user.is_child),
          orders: items.rows.map(item => ({
            productName: item.product_name,
            quantity: item.quantity,
            price: item.price
          }))
        });
      }

      result.push({
        id: Number(order.id),
        timestamp: order.timestamp,
        users: orderUsers,
        totalAmount: order.total_amount
      });
    }

    return result;
  }

  async clearAllOrders(): Promise<void> {
    await client.transaction(async (tx) => {
      await tx.execute('DELETE FROM order_items');
      await tx.execute('DELETE FROM users');
      await tx.execute('DELETE FROM orders');
    });
  }
}

export const db = new DatabaseService();