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

const categoriesKey = "myexpoapp.categories";
const productsKey = "myexpoapp.products";
const usersKey = "myexpoapp.users";
const ordersKey = "myexpoapp.orders";

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
  { id: 2, name: "Giày sneaker thể thao", price: 1100000, img: "giay sneaker.jpg", categoryId: 2 },
  { id: 3, name: "Balo thời trang unisex", price: 490000, img: "balo.jpg", categoryId: 3 },
  { id: 4, name: "Mũ lưỡi trai cá tính", price: 120000, img: "mũ lưỡi trai.jpg", categoryId: 4 },
  { id: 5, name: "Túi xách nữ thanh lịch", price: 980000, img: "tui xach.jpg", categoryId: 5 },
  { id: 6, name: "Quần jeans ống loe retro", price: 380000, img: "Quần jeans ống loe .jpg", categoryId: 6 },
  { id: 7, name: "Túi mây đan vintage", price: 290000, img: "Túi mây.jpg", categoryId: 5 },
  { id: 8, name: "Túi xách dáng trống cao cấp", price: 850000, img: "Túi xách tay dáng trống .jpg", categoryId: 5 },
  { id: 9, name: "Áo thun phong cách basic", price: 180000, img: "images (30).jpg", categoryId: 1 },
  { id: 10, name: "Giày lười slip-on năng động", price: 550000, img: "images.jpg", categoryId: 2 },
  { id: 11, name: "Balo laptop chống nước", price: 650000, img: "balo.jpg", categoryId: 3 },
  { id: 12, name: "Mũ bucket vành tròn dạo phố", price: 150000, img: "mũ lưỡi trai.jpg", categoryId: 4 },
];

const read = <T,>(key: string, fallback: T): T => {
  if (typeof localStorage === "undefined") return fallback;
  const value = localStorage.getItem(key);
  return value === null ? fallback : (JSON.parse(value) as T);
};

const write = <T,>(key: string, value: T): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  if (typeof localStorage !== "undefined") {
    // Categories
    const existingCats = read<Category[]>(categoriesKey, []);
    const mergedCats = [...existingCats];
    for (const c of initialCategories) {
      if (!mergedCats.some((item) => item.id === c.id)) {
        mergedCats.push(c);
      }
    }
    write(categoriesKey, mergedCats.length > 0 ? mergedCats : initialCategories);

    // Products
    const existingProds = read<Product[]>(productsKey, []);
    const mergedProds = [...existingProds];
    for (const p of initialProducts) {
      if (!mergedProds.some((item) => item.id === p.id)) {
        mergedProds.push(p);
      }
    }
    write(productsKey, mergedProds.length > 0 ? mergedProds : initialProducts);

    if (localStorage.getItem(usersKey) === null) {
      write(usersKey, [{ id: 1, username: "admin", password: "123456", role: "admin" }]);
    }
  }
  onSuccess?.();
};

export const fetchCategories = async (): Promise<Category[]> =>
  read(categoriesKey, initialCategories);

export const addCategory = async (name: string): Promise<boolean> => {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const categories = await fetchCategories();
  const id = categories.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  write(categoriesKey, [...categories, { id, name: trimmed }]);
  return true;
};

export const updateCategory = async (category: Category): Promise<void> => {
  const categories = await fetchCategories();
  write(
    categoriesKey,
    categories.map((item) => (item.id === category.id ? { ...category, name: category.name.trim() } : item)),
  );
};

export const deleteCategory = async (id: number): Promise<void> => {
  const categories = await fetchCategories();
  write(
    categoriesKey,
    categories.filter((item) => item.id !== id),
  );
};

export const fetchProducts = async (): Promise<Product[]> =>
  read(productsKey, initialProducts);

export const addProduct = async (product: Omit<Product, "id">): Promise<void> => {
  const products = await fetchProducts();
  const id = products.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  write(productsKey, [...products, { ...product, id }]);
};

export const updateProduct = async (product: Product): Promise<void> => {
  const products = await fetchProducts();
  write(productsKey, products.map((item) => item.id === product.id ? product : item));
};

export const deleteProduct = async (id: number): Promise<void> => {
  const products = await fetchProducts();
  write(productsKey, products.filter((item) => item.id !== id));
};

export const fetchProductsByCategory = async (
  categoryId: number,
): Promise<Product[]> => {
  const products = await fetchProducts();
  return products.filter((product) => product.categoryId === categoryId);
};

export const searchProductsByNameOrCategory = async (
  keyword: string,
): Promise<Product[]> => {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);
  const normalizedKeyword = keyword.toLocaleLowerCase();
  const matchingCategoryIds = new Set(
    categories
      .filter((category) => category.name.toLocaleLowerCase().includes(normalizedKeyword))
      .map((category) => category.id),
  );
  return products.filter(
    (product) =>
      product.name.toLocaleLowerCase().includes(normalizedKeyword) ||
      matchingCategoryIds.has(product.categoryId),
  );
};

export const addUser = async (
  username: string,
  password: string,
  role: string,
): Promise<boolean> => {
  const users = await fetchUsers();
  if (users.some((user) => user.username === username)) return false;
  const id = users.reduce((maxId, user) => Math.max(maxId, user.id), 0) + 1;
  write(usersKey, [...users, { id, username, password, role }]);
  return true;
};

export const updateUser = async (user: User): Promise<void> => {
  const users = await fetchUsers();
  write(usersKey, users.map((item) => item.id === user.id ? user : item));
};

export const deleteUser = async (id: number): Promise<void> => {
  const users = await fetchUsers();
  write(usersKey, users.filter((user) => user.id !== id));
};

export const fetchUsers = async (): Promise<User[]> =>
  read(usersKey, [{ id: 1, username: "admin", password: "123456", role: "admin" }]);

export const getUserByCredentials = async (
  username: string,
  password: string,
): Promise<User | null> => {
  const users = await fetchUsers();
  return users.find((user) => user.username === username && user.password === password) ?? null;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const users = await fetchUsers();
  return users.find((user) => user.id === id) ?? null;
};

export const createOrder = async (
  userId: number,
  items: string,
  total: number,
  deliveryInfo: OrderDeliveryInfo,
): Promise<number> => {
  const orders = read<Order[]>(ordersKey, []);
  const id = orders.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const createdAt = new Date().toLocaleString("vi-VN");
  const newOrder: Order = {
    id,
    userId,
    items,
    total,
    status: "Đang xử lý",
    createdAt,
    ...deliveryInfo,
  };
  write(ordersKey, [newOrder, ...orders]);
  return id;
};

export const fetchOrdersByUserId = async (userId: number): Promise<Order[]> => {
  const orders = read<Order[]>(ordersKey, []);
  return orders.filter((order) => order.userId === userId);
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  return read<Order[]>(ordersKey, []);
};

export const updateOrderStatus = async (
  orderId: number,
  status: string,
): Promise<void> => {
  const orders = read<Order[]>(ordersKey, []);
  write(
    ordersKey,
    orders.map((item) => (item.id === orderId ? { ...item, status } : item)),
  );
};
