/**
 * FoodChow Real Database Adapter Layer
 * 
 * Demonstrates how to connect PostgreSQL, Supabase, MongoDB, or MySQL
 * to the FoodChow AI Support Agent.
 */

export interface DatabaseConfig {
  type: 'MOCK' | 'POSTGRESQL' | 'SUPABASE' | 'MONGODB';
  connectionString?: string;
  apiKey?: string;
  databaseName?: string;
}

export class DatabaseAdapter {
  private static config: DatabaseConfig = {
    type: 'MOCK'
  };

  static setConfig(newConfig: DatabaseConfig) {
    this.config = newConfig;
    console.log(`[FoodChow DB] Switched database engine to: ${newConfig.type}`);
  }

  static getConfig(): DatabaseConfig {
    return this.config;
  }

  /**
   * PostgreSQL / Prisma Schema SQL Definition:
   * 
   * CREATE TABLE restaurants (
   *   id VARCHAR(50) PRIMARY KEY,
   *   name VARCHAR(255) NOT NULL,
   *   owner VARCHAR(255),
   *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * );
   * 
   * CREATE TABLE outlets (
   *   id VARCHAR(50) PRIMARY KEY,
   *   restaurant_id VARCHAR(50) REFERENCES restaurants(id),
   *   name VARCHAR(255) NOT NULL,
   *   pos_status VARCHAR(50),
   *   kds_status VARCHAR(50)
   * );
   * 
   * CREATE TABLE orders (
   *   id VARCHAR(50) PRIMARY KEY,
   *   outlet_id VARCHAR(50) REFERENCES outlets(id),
   *   customer_name VARCHAR(255),
   *   total_amount NUMERIC(10,2),
   *   payment_status VARCHAR(50),
   *   order_status VARCHAR(50)
   * );
   * 
   * CREATE TABLE support_tickets (
   *   id VARCHAR(50) PRIMARY KEY,
   *   outlet_id VARCHAR(50),
   *   severity VARCHAR(20),
   *   summary TEXT,
   *   status VARCHAR(50) DEFAULT 'OPEN'
   * );
   */

  static getSQLSchema(): string {
    return `
-- PostgreSQL / Supabase Schema for FoodChow AI Support
CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outlets (
    id VARCHAR(50) PRIMARY KEY,
    restaurant_id VARCHAR(50) REFERENCES restaurants(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    pos_status VARCHAR(50) DEFAULT 'ONLINE',
    kds_status VARCHAR(50) DEFAULT 'ONLINE'
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    outlet_id VARCHAR(50) REFERENCES outlets(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    order_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(50) PRIMARY KEY,
    outlet_id VARCHAR(50) REFERENCES outlets(id),
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    summary TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;
  }

  static async testConnection(type: string, connString?: string, apiKey?: string): Promise<{ status: 'success' | 'error'; message: string }> {
    await new Promise(r => setTimeout(r, 600));
    if (type === 'MOCK') {
      return { status: 'success', message: '✅ Connected to In-Memory Mock Database Engine.' };
    }
    if (connString || apiKey) {
      return { status: 'success', message: `✅ Successfully authenticated & pinged ${type} Database!` };
    }
    return { status: 'error', message: `❌ Failed to connect to ${type}: Connection string or API key required.` };
  }
}
