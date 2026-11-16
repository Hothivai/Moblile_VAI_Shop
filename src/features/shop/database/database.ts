import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDb = (): Promise<SQLite.SQLiteDatabase> => {
  dbPromise ??= SQLite.openDatabaseAsync("myDatabase.db");
  return dbPromise;
};

export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
};

export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

export type Order = {
  id: number;
  userId: number;
  items: string;
  total: number;
  status: string;
  createdAt: string;
  recipientName?: string;
  phone?: string;
  address?: string;
  note?: string;
  paymentMethod?: string;
  shippingFee?: number;
};

export type OrderDeliveryInfo = {
  recipientName: string;
  phone: string;
  address: string;
  note: string;
  paymentMethod: string;
  shippingFee: number;
};

const initialCategories: Category[] = [
  { id: 1, name: "Áo" },
  { id: 2, name: "Giày" },
  { id: 3, name: "Balo" },
  { id: 4, name: "Mũ" },
  { id: 5, name: "Túi" },
  { id: 6, name: "Quần" },
];

const initialProducts: Product[] = [
  { id: 1, name: "Áo sơ mi công sở", price: 250000, img: "hinh1.jpg", categoryId: 1 },
  {
    id: 2,
    name: "Giày thể thao năng động",
    price: 1100000,
    img: "giay sneaker.jpg",
    categoryId: 2,
  },
  {
    id: 3,
    name: "Balo thời trang phù hợp mọi giới",
    price: 490000,
    img: "balo.jpg",
    categoryId: 3,
  },
  {
    id: 4,
    name: "Mũ lưỡi trai cá tính",
    price: 120000,
    img: "mũ lưỡi trai.jpg",
    categoryId: 4,
  },
  {
    id: 5,
    name: "Túi xách nữ thanh lịch",
    price: 980000,
    img: "tui xach.jpg",
    categoryId: 5,
  },
  {
    id: 6,
    name: "Quần jeans ống loe cổ điển",
    price: 380000,
    img: "Quần jeans ống loe .jpg",
    categoryId: 6,
  },
  {
    id: 7,
    name: "Túi mây đan vintage",
    price: 290000,
    img: "Túi mây.jpg",
    categoryId: 5,
  },
  {
    id: 8,
    name: "Túi xách dáng trống cao cấp",
    price: 850000,
    img: "Túi xách tay dáng trống .jpg",
    categoryId: 5,
  },
  {
    id: 9,
    name: "Áo thun phong cách tối giản",
    price: 180000,
    img: "images (30).jpg",
    categoryId: 1,
  },
  {
    id: 10,
    name: "Giày lười năng động",
    price: 550000,
    img: "images.jpg",
    categoryId: 2,
  },
  {
    id: 11,
    name: "Balo laptop chống nước",
    price: 650000,
    img: "balo.jpg",
    categoryId: 3,
  },
  {
    id: 12,
    name: "Mũ bucket vành tròn dạo phố",
    price: 150000,
    img: "mũ lưỡi trai.jpg",
    categoryId: 4,
  },
];

const legacyProductNames = [
  { id: 2, oldName: "Giày sneaker thể thao", name: "Giày thể thao năng động" },
  { id: 3, oldName: "Balo thời trang unisex", name: "Balo thời trang phù hợp mọi giới" },
  { id: 6, oldName: "Quần jeans ống loe retro", name: "Quần jeans ống loe cổ điển" },
  { id: 9, oldName: "Áo thun phong cách basic", name: "Áo thun phong cách tối giản" },
  { id: 10, oldName: "Giày lười slip-on năng động", name: "Giày lười năng động" },
];

export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  const database = await getDb();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      img TEXT,
      categoryId INTEGER,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      items TEXT,
      total REAL,
      status TEXT,
      createdAt TEXT,
      recipientName TEXT,
      phone TEXT,
      address TEXT,
      note TEXT,
      paymentMethod TEXT,
      shippingFee REAL
    );
  `);

  const orderColumns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(orders)",
  );
  const existingOrderColumns = new Set(orderColumns.map((column) => column.name));
  const orderColumnsToAdd = [
    ["recipientName", "TEXT"],
    ["phone", "TEXT"],
    ["address", "TEXT"],
    ["note", "TEXT"],
    ["paymentMethod", "TEXT"],
    ["shippingFee", "REAL"],
  ] as const;
  for (const [name, type] of orderColumnsToAdd) {
    if (!existingOrderColumns.has(name)) {
      await database.execAsync(`ALTER TABLE orders ADD COLUMN ${name} ${type}`);
    }
  }

  await database.withTransactionAsync(async () => {
    for (const category of initialCategories) {
      await database.runAsync(
        "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)",
        [category.id, category.name],
      );
    }

    for (const product of initialProducts) {
      await database.runAsync(
        "INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)",
        [
          product.id,
          product.name,
          product.price,
          product.img,
          product.categoryId,
        ],
      );
    }

    for (const product of legacyProductNames) {
      await database.runAsync(
        "UPDATE products SET name = ? WHERE id = ? AND name = ?",
        [product.name, product.id, product.oldName],
      );
    }

    await database.runAsync(
      `INSERT OR IGNORE INTO users (username, password, role)
       VALUES ('admin', '123456', 'admin')`,
    );
  });

  onSuccess?.();
};

export const fetchCategories = async (): Promise<Category[]> => {
  const database = await getDb();
  return database.getAllAsync<Category>("SELECT * FROM categories");
};

export const addCategory = async (name: string): Promise<boolean> => {
  const database = await getDb();
  const trimmed = name.trim();
  if (!trimmed) return false;
  await database.runAsync("INSERT INTO categories (name) VALUES (?)", [trimmed]);
  return true;
};

export const updateCategory = async (category: Category): Promise<void> => {
  const database = await getDb();
  await database.runAsync("UPDATE categories SET name = ? WHERE id = ?", [
    category.name.trim(),
    category.id,
  ]);
};

export const deleteCategory = async (id: number): Promise<void> => {
  const database = await getDb();
  await database.runAsync("DELETE FROM categories WHERE id = ?", [id]);
};

export const fetchProducts = async (): Promise<Product[]> => {
  const database = await getDb();
  return database.getAllAsync<Product>("SELECT * FROM products");
};

export const addProduct = async (
  product: Omit<Product, "id">,
): Promise<void> => {
  const database = await getDb();
  await database.runAsync(
    "INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)",
    [product.name, product.price, product.img, product.categoryId],
  );
};

export const updateProduct = async (product: Product): Promise<void> => {
  const database = await getDb();
  await database.runAsync(
    "UPDATE products SET name = ?, price = ?, categoryId = ?, img = ? WHERE id = ?",
    [product.name, product.price, product.categoryId, product.img, product.id],
  );
};

export const deleteProduct = async (id: number): Promise<void> => {
  const database = await getDb();
  await database.runAsync("DELETE FROM products WHERE id = ?", [id]);
};

export const fetchProductsByCategory = async (
  categoryId: number,
): Promise<Product[]> => {
  const database = await getDb();
  return database.getAllAsync<Product>(
    "SELECT * FROM products WHERE categoryId = ?",
    [categoryId],
  );
};

export const searchProductsByNameOrCategory = async (
  keyword: string,
): Promise<Product[]> => {
  const database = await getDb();
  const searchTerm = `%${keyword}%`;
  return database.getAllAsync<Product>(
    `SELECT products.* FROM products
     JOIN categories ON products.categoryId = categories.id
     WHERE products.name LIKE ? OR categories.name LIKE ?`,
    [searchTerm, searchTerm],
  );
};

export const addUser = async (
  username: string,
  password: string,
  role: string,
): Promise<boolean> => {
  const database = await getDb();
  const existingUser = await database.getFirstAsync<{ id: number }>(
    "SELECT id FROM users WHERE username = ?",
    [username],
  );
  if (existingUser) {
    return false;
  }

  await database.runAsync(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, password, role],
  );
  return true;
};

export const updateUser = async (user: User): Promise<void> => {
  const database = await getDb();
  await database.runAsync(
    "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
    [user.username, user.password, user.role, user.id],
  );
};

export const deleteUser = async (id: number): Promise<void> => {
  const database = await getDb();
  await database.runAsync("DELETE FROM users WHERE id = ?", [id]);
};

export const fetchUsers = async (): Promise<User[]> => {
  const database = await getDb();
  return database.getAllAsync<User>("SELECT * FROM users");
};

export const getUserByCredentials = async (
  username: string,
  password: string,
): Promise<User | null> => {
  const database = await getDb();
  return database.getFirstAsync<User>(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
  );
};

export const getUserById = async (id: number): Promise<User | null> => {
  const database = await getDb();
  return database.getFirstAsync<User>("SELECT * FROM users WHERE id = ?", [id]);
};

export const createOrder = async (
  userId: number,
  items: string,
  total: number,
  deliveryInfo: OrderDeliveryInfo,
): Promise<number> => {
  const database = await getDb();
  const createdAt = new Date().toLocaleString("vi-VN");
  const result = await database.runAsync(
    `INSERT INTO orders
       (userId, items, total, status, createdAt, recipientName, phone, address, note, paymentMethod, shippingFee)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      items,
      total,
      "Đang xử lý",
      createdAt,
      deliveryInfo.recipientName,
      deliveryInfo.phone,
      deliveryInfo.address,
      deliveryInfo.note,
      deliveryInfo.paymentMethod,
      deliveryInfo.shippingFee,
    ],
  );
  return result.lastInsertRowId;
};

export const fetchOrdersByUserId = async (userId: number): Promise<Order[]> => {
  const database = await getDb();
  return database.getAllAsync<Order>(
    "SELECT * FROM orders WHERE userId = ? ORDER BY id DESC",
    [userId],
  );
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  const database = await getDb();
  return database.getAllAsync<Order>("SELECT * FROM orders ORDER BY id DESC");
};

export const updateOrderStatus = async (
  orderId: number,
  status: string,
): Promise<void> => {
  const database = await getDb();
  await database.runAsync("UPDATE orders SET status = ? WHERE id = ?", [
    status,
    orderId,
  ]);
};
