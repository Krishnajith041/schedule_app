import type { FoodCategory, FoodItem } from '../types';

// Seed timestamps are in the past so new items always sort above them
function ts(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const SEED_CATEGORIES: FoodCategory[] = [
  { id: 'cat-rice',    name: 'Rice & Biryani',   createdAt: ts(60) },
  { id: 'cat-starter', name: 'Starters',          createdAt: ts(59) },
  { id: 'cat-main',    name: 'Main Course',        createdAt: ts(58) },
  { id: 'cat-bread',   name: 'Breads',             createdAt: ts(57) },
  { id: 'cat-dessert', name: 'Desserts',           createdAt: ts(56) },
  { id: 'cat-bev',     name: 'Beverages',          createdAt: ts(55) },
  { id: 'cat-acc',     name: 'Accompaniments',     createdAt: ts(54) },
];

export const SEED_FOOD_ITEMS: FoodItem[] = [
  // Rice & Biryani
  { id: 'fi-01', name: 'Chicken Biryani',        categoryId: 'cat-rice',    pricePerUnit: 450,  defaultQuantity: 1,  createdAt: ts(60) },
  { id: 'fi-02', name: 'Veg Biryani',            categoryId: 'cat-rice',    pricePerUnit: 350,  defaultQuantity: 1,  createdAt: ts(60) },
  { id: 'fi-03', name: 'Jeera Rice',             categoryId: 'cat-rice',    pricePerUnit: 180,  defaultQuantity: 1,  createdAt: ts(60) },
  { id: 'fi-04', name: 'Mutton Dum Biryani',     categoryId: 'cat-rice',    pricePerUnit: 550,  defaultQuantity: 1,  createdAt: ts(60) },
  // Starters
  { id: 'fi-05', name: 'Paneer Tikka',           categoryId: 'cat-starter', pricePerUnit: 320,  defaultQuantity: 1,  createdAt: ts(59) },
  { id: 'fi-06', name: 'Chicken Seekh Kebab',    categoryId: 'cat-starter', pricePerUnit: 280,  defaultQuantity: 1,  createdAt: ts(59) },
  { id: 'fi-07', name: 'Live Chaat Counter',     categoryId: 'cat-starter', pricePerUnit: 8000, defaultQuantity: 50, createdAt: ts(59) },
  { id: 'fi-08', name: 'Veg Spring Rolls',       categoryId: 'cat-starter', pricePerUnit: 150,  defaultQuantity: 1,  createdAt: ts(59) },
  { id: 'fi-09', name: 'Hara Bhara Kebab',       categoryId: 'cat-starter', pricePerUnit: 190,  defaultQuantity: 1,  createdAt: ts(59) },
  // Main Course
  { id: 'fi-10', name: 'Paneer Butter Masala',   categoryId: 'cat-main',    pricePerUnit: 300,  defaultQuantity: 1,  createdAt: ts(58) },
  { id: 'fi-11', name: 'Dal Makhani',            categoryId: 'cat-main',    pricePerUnit: 220,  defaultQuantity: 1,  createdAt: ts(58) },
  { id: 'fi-12', name: 'Kadhai Chicken',         categoryId: 'cat-main',    pricePerUnit: 380,  defaultQuantity: 1,  createdAt: ts(58) },
  { id: 'fi-13', name: 'Shahi Mixed Veg',        categoryId: 'cat-main',    pricePerUnit: 260,  defaultQuantity: 1,  createdAt: ts(58) },
  // Breads
  { id: 'fi-14', name: 'Tandoori Roti',          categoryId: 'cat-bread',   pricePerUnit: 25,   defaultQuantity: 1,  createdAt: ts(57) },
  { id: 'fi-15', name: 'Garlic Naan',            categoryId: 'cat-bread',   pricePerUnit: 40,   defaultQuantity: 1,  createdAt: ts(57) },
  { id: 'fi-16', name: 'Missi Roti',             categoryId: 'cat-bread',   pricePerUnit: 30,   defaultQuantity: 1,  createdAt: ts(57) },
  // Desserts
  { id: 'fi-17', name: 'Gulab Jamun',            categoryId: 'cat-dessert', pricePerUnit: 3600, defaultQuantity: 50, createdAt: ts(56) },
  { id: 'fi-18', name: 'Rasgulla',               categoryId: 'cat-dessert', pricePerUnit: 3000, defaultQuantity: 50, createdAt: ts(56) },
  { id: 'fi-19', name: 'Gajar Halwa',            categoryId: 'cat-dessert', pricePerUnit: 220,  defaultQuantity: 1,  createdAt: ts(56) },
  { id: 'fi-20', name: 'Ice Cream Scoops',       categoryId: 'cat-dessert', pricePerUnit: 80,   defaultQuantity: 1,  createdAt: ts(56) },
  // Beverages
  { id: 'fi-21', name: 'Masala Chai',            categoryId: 'cat-bev',     pricePerUnit: 2500, defaultQuantity: 50, createdAt: ts(55) },
  { id: 'fi-22', name: 'Fresh Lime Soda',        categoryId: 'cat-bev',     pricePerUnit: 60,   defaultQuantity: 1,  createdAt: ts(55) },
  { id: 'fi-23', name: 'Mango Lassi',            categoryId: 'cat-bev',     pricePerUnit: 90,   defaultQuantity: 1,  createdAt: ts(55) },
  { id: 'fi-24', name: 'Sharbat (Rose/Kewra)',   categoryId: 'cat-bev',     pricePerUnit: 2000, defaultQuantity: 50, createdAt: ts(55) },
  // Accompaniments
  { id: 'fi-25', name: 'Raita',                  categoryId: 'cat-acc',     pricePerUnit: 120,  defaultQuantity: 1,  createdAt: ts(54) },
  { id: 'fi-26', name: 'Papad & Pickle',         categoryId: 'cat-acc',     pricePerUnit: 1500, defaultQuantity: 50, createdAt: ts(54) },
  { id: 'fi-27', name: 'Salad Counter',          categoryId: 'cat-acc',     pricePerUnit: 4500, defaultQuantity: 50, createdAt: ts(54) },
];
