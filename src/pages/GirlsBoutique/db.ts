import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import { Product, Category } from "./types";

let db: SqlJsDatabase | null = null;

export async function initDb(): Promise<SqlJsDatabase> {
  if (db) return db;
  const SQL = await initSqlJs({ locateFile: () => `/sql-wasm.wasm` });
  db = new SQL.Database();
  createTables(db);
  seedData(db);
  return db;
}

export function getDb(): SqlJsDatabase {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return db;
}

function createTables(d: SqlJsDatabase) {
  d.run(`CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT)`);
  d.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer', address TEXT, city TEXT, postal TEXT, country TEXT DEFAULT 'United States', phone TEXT)`);
  d.run(`CREATE TABLE products (id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL, name TEXT NOT NULL, brand TEXT NOT NULL, description TEXT, price REAL NOT NULL, original_price REAL, stock INTEGER NOT NULL DEFAULT 50, rating REAL DEFAULT 4.5, reviews INTEGER DEFAULT 0, tag TEXT, image_url TEXT NOT NULL, hover_image_url TEXT NOT NULL, FOREIGN KEY (category_id) REFERENCES categories(id))`);
  d.run(`CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, email TEXT NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, postal TEXT NOT NULL, country TEXT NOT NULL DEFAULT 'United States', phone TEXT, order_date TEXT DEFAULT (datetime('now')), status TEXT NOT NULL DEFAULT 'Pending', total_amount REAL NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id))`);
  d.run(`CREATE TABLE order_items (id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, unit_price REAL NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id))`);
}

function seedData(d: SqlJsDatabase) {
  d.run("INSERT INTO categories VALUES (1,'Makeup & Beauty','makeup','Curated makeup and skincare for the modern woman.')");
  d.run("INSERT INTO categories VALUES (2,'Bags','bags','Handbags, totes and shoulder bags.')");
  d.run("INSERT INTO categories VALUES (3,'Clothes','clothes','Blazers, dresses, coats and apparel.')");
  d.run("INSERT INTO users VALUES (1,'Admin','Girls','admin@girls.com','admin','admin','Girls HQ, 5th Ave','New York','10001','United States','+1-212-555-0199')");
  d.run("INSERT INTO users VALUES (2,'Sophie','Martin','sophie@girls.com','user','customer','12 Rue de la Paix','Paris','75001','France','+33-6-1234-5678')");

  const products: [number, number, string, string, string, number, number | null, number, number, number, string | null, string, string][] = [
    [1,1,'Velvet Matte Lipstick','Charlotte Tilbury','Transfer-proof matte formula, 40 shades.',38.00,null,50,4.8,234,'Bestseller','#d43f6e','#f0a6ca'],
    [2,1,'Luminous Foundation SPF30','NARS','Buildable medium-to-full coverage.',55.00,null,35,4.6,189,null,'#c4925a','#e8d5b7'],
    [3,1,'Rose Gold Eyeshadow Palette','Urban Decay','12 highly pigmented shades.',42.00,58.00,20,4.9,412,'Sale','#d4a373','#f0d5b0'],
    [4,1,'Soft Matte Skin Tint','Fenty Beauty','Lightweight buildable formula, 40 shades.',35.00,null,40,4.7,567,'New','#c9a96e','#eddcc8'],
    [5,1,'Glass Skin Hyaluronic Serum','The Ordinary','2% Hyaluronic Acid + Niacinamide.',18.00,null,45,4.5,891,null,'#89b5d4','#c5dee8'],
    [6,1,'Sculpt & Glow Brush Set','Morphe','Professional 8-piece brush set.',65.00,null,30,4.4,156,null,'#5c4a3f','#a8988a'],
    [7,2,'Mini Pebbled Leather Tote','Polène','Hand-stitched pebbled leather tote.',295.00,null,15,4.9,88,'New','#8b6f5c','#c4b5a5'],
    [8,2,'Gold Chain Shoulder Bag','Mango','Structured flap with gold chain strap.',79.00,120.00,18,4.6,203,'Sale','#3a2a1a','#8b7355'],
    [9,2,'Ivory Bucket Bag','Aritzia','Buttery vegan leather drawstring bag.',148.00,null,12,4.7,147,null,'#e8ddd0','#f5f0eb'],
    [10,3,'Tailored Ivory Blazer','Reformation','Relaxed-fit blazer, deadstock fabric.',198.00,null,10,4.8,134,'New','#d9cdbc','#efe8df'],
    [11,3,'Trench Coat Classic','Burberry Edit','Iconic cotton gabardine trench.',420.00,null,8,4.9,76,null,'#8b7d6b','#b5a99a'],
    [12,3,'Linen Midi Dress','& Other Stories','Flowing midi in LENZING ECOVERO.',125.00,null,22,4.7,211,'Bestseller','#7ab3a1','#b5d9ce'],
  ];

  for (const p of products) {
    d.run("INSERT INTO products (id, category_id, name, brand, description, price, original_price, stock, rating, reviews, tag, image_url, hover_image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", [
      p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10],
      `prod_img_${p[0]}`,
      `prod_img_${p[0]}_hover`,
    ]);
  }
}

export function getCategories(): Category[] {
  const d = getDb();
  const r = d.exec("SELECT * FROM categories ORDER BY id");
  return r[0]?.values.map((row: any) => ({ id: row[0], name: row[1], slug: row[2], description: row[3] })) as Category[];
}

export function getProductsByCategory(slug: string): Product[] {
  const d = getDb();
  return mapProducts(d.exec("SELECT p.*, c.slug as category_slug, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE c.slug = ? ORDER BY p.id", [slug]));
}

export function getProductById(id: number): Product | null {
  const d = getDb();
  const products = mapProducts(d.exec("SELECT p.*, c.slug as category_slug, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?", [id]));
  return products[0] || null;
}

export function getTrendingProducts(): Product[] {
  const d = getDb();
  const names = ["Velvet Matte Lipstick", "Mini Pebbled Leather Tote", "Tailored Ivory Blazer", "Rose Gold Eyeshadow Palette"];
  let products = mapProducts(d.exec(`SELECT p.*, c.slug as category_slug, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.name IN (${names.map(()=>"?").join(",")}) LIMIT 4`, names));
  if (products.length < 4) {
    products = mapProducts(d.exec("SELECT p.*, c.slug as category_slug, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC LIMIT 4"));
  }
  return products;
}

export function getRelatedProducts(categoryId: number, excludeId: number): Product[] {
  const d = getDb();
  return mapProducts(d.exec("SELECT p.*, c.slug as category_slug, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.category_id = ? AND p.id != ? ORDER BY p.id DESC LIMIT 4", [categoryId, excludeId]));
}

export function getCartProducts(ids: number[]): Product[] {
  if (ids.length === 0) return [];
  const d = getDb();
  return mapProducts(d.exec(`SELECT p.*, c.slug as category_slug, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id IN (${ids.map(()=>"?").join(",")})`, ids.map(String)));
}

function mapProducts(result: any): Product[] {
  if (!result[0]) return [];
  return result[0].values.map((row: any) => {
    const idx: Record<string, number> = {};
    result[0].columns.forEach((col: string, i: number) => idx[col] = i);
    return {
      id: row[idx.id], category_id: row[idx.category_id], name: row[idx.name], brand: row[idx.brand],
      description: row[idx.description], price: row[idx.price], original_price: row[idx.original_price],
      stock: row[idx.stock], rating: row[idx.rating], reviews: row[idx.reviews], tag: row[idx.tag],
      image_url: row[idx.image_url], hover_image_url: row[idx.hover_image_url],
      category_slug: row[idx.category_slug], category_name: row[idx.category_name],
    };
  });
}

export function updateProductStock(id: number, qty: number) {
  getDb().run("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?", [qty, id, qty]);
}

export function createOrder(order: { user_id?: number; email: string; first_name: string; last_name: string; address: string; city: string; postal: string; country: string; total_amount: number; items: { product_id: number; quantity: number; unit_price: number }[] }): number {
  const d = getDb();
  d.run("INSERT INTO orders (user_id, email, first_name, last_name, address, city, postal, country, total_amount) VALUES (?,?,?,?,?,?,?,?,?)", [order.user_id ?? null, order.email, order.first_name, order.last_name, order.address, order.city, order.postal, order.country, order.total_amount]);
  const orderId = (d.exec("SELECT last_insert_rowid()")[0].values[0][0] as number);
  for (const item of order.items) {
    d.run("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)", [orderId, item.product_id, item.quantity, item.unit_price]);
    updateProductStock(item.product_id, item.quantity);
  }
  return orderId;
}

const productPalettes: Record<string, [string, string, string, string]> = {
  makeup: ["#fae1dd", "#f0a6ca", "#ec4899", "#8b2252"],
  bags: ["#fefae0", "#d4a373", "#b8860b", "#5c4033"],
  clothes: ["#e0f0f5", "#7ab3c9", "#2c7a9e", "#1a4f6a"],
  default: ["#f4f0ec", "#d4a373", "#a67c52", "#6b4f32"],
};

export function svgPlaceholder(slug: string, label?: string): string {
  const [c1, c2, c3] = productPalettes[slug] || productPalettes.default;
  const dot = `<circle cx="${100 + Math.random()*200}" cy="${80 + Math.random()*60}" r="${20 + Math.random()*40}" fill="rgba(255,255,255,0.06)"/>
    <circle cx="${80 + Math.random()*240}" cy="${120 + Math.random()*80}" r="${30 + Math.random()*50}" fill="rgba(255,255,255,0.04)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1};stop-opacity:1"/>
      <stop offset="50%" style="stop-color:${c2};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${c3};stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="s" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.15);stop-opacity:1"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:1"/>
    </linearGradient></defs>
    <rect width="400" height="500" fill="url(#g)"/>
    <rect width="400" height="250" fill="url(#s)"/>
    ${dot}
    <rect x="100" y="280" width="200" height="12" rx="6" fill="rgba(255,255,255,0.15)"/>
    <rect x="130" y="300" width="140" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
    <rect x="160" y="360" width="80" height="80" rx="40" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="200" y="405" text-anchor="middle" font-family="Georgia,serif" font-size="32" fill="rgba(255,255,255,0.25)">${slug === "makeup" ? "♡" : slug === "bags" ? "✦" : slug === "clothes" ? "◇" : "○"}</text>
    ${label ? `
      <text x="200" y="450" text-anchor="middle" font-family="system-ui,'Sora',sans-serif" font-size="14" fill="rgba(255,255,255,0.7)" font-weight="600" letter-spacing="0.15em">${label}</text>
      <rect x="175" y="462" width="50" height="2" rx="1" fill="rgba(255,255,255,0.2)"/>
    ` : ''}
  </svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
