import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_PRODUCTS,
  getProductStatus,
  filterAndSortProducts,
  calculateProductMetrics,
  validateProductForm,
  parseStockKeys,
  productsToCsv,
} from './productLogic';
import {
  INITIAL_USERS,
  calculateUserMetrics,
  filterAndSortUsers,
  usersToCsv,
} from './userLogic';
import {
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  calculateCategoryMetrics,
  calculateOrderMetrics,
  filterAndSortOrders,
} from './storeAdminLogic';

test('getProductStatus classifies active, low_stock, out_of_stock, and hidden accurately', () => {
  assert.equal(getProductStatus({ stock: 25, lowStockThreshold: 10, isHidden: false }), 'active');
  assert.equal(getProductStatus({ stock: 6, lowStockThreshold: 10, isHidden: false }), 'low_stock');
  assert.equal(getProductStatus({ stock: 0, lowStockThreshold: 10, isHidden: false }), 'out_of_stock');
  assert.equal(getProductStatus({ stock: 50, lowStockThreshold: 10, isHidden: true }), 'hidden');
});

test('filterAndSortProducts filters by search query, category, and status', () => {
  const bySearch = filterAndSortProducts(INITIAL_PRODUCTS, {
    search: 'CYB-VAL-2400',
    category: 'ทั้งหมด',
    status: 'all',
    deliveryType: 'all',
    sortBy: 'updated_desc',
  });
  assert.equal(bySearch.length, 1);
  assert.equal(bySearch[0].sku, 'CYB-VAL-2400');

  const lowStockOnly = filterAndSortProducts(INITIAL_PRODUCTS, {
    search: '',
    category: 'ทั้งหมด',
    status: 'low_stock',
    deliveryType: 'all',
    sortBy: 'stock_asc',
  });
  assert.equal(lowStockOnly.length, 2);
  assert.ok(lowStockOnly[0].stock <= lowStockOnly[1].stock);
});

test('calculateProductMetrics computes inventory totals accurately', () => {
  const metrics = calculateProductMetrics(INITIAL_PRODUCTS);
  assert.equal(metrics.totalProducts, 8);
  assert.equal(metrics.outOfStockCount, 1);
  assert.equal(metrics.hiddenCount, 1);
  assert.equal(metrics.lowStockCount, 2);
  assert.equal(metrics.activeCount, 4);
  assert.ok(metrics.totalStockUnits > 0);
  assert.ok(metrics.totalInventoryValue > 0);
});

test('validateProductForm catches invalid inputs and accepts valid data', () => {
  const invalid = validateProductForm({
    name: 'A',
    sku: '',
    subtitle: '',
    category: 'ทั้งหมด',
    price: -10,
    cost: 0,
    stock: 1.5,
    lowStockThreshold: 5,
    deliveryType: 'auto_key',
    isHidden: false,
    featured: false,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.sku);
  assert.ok(invalid.errors.category);
  assert.ok(invalid.errors.price);
  assert.ok(invalid.errors.stock);

  const valid = validateProductForm({
    name: 'Spotify Premium 30 Days',
    sku: 'CYB-SP-30D',
    subtitle: 'Individual plan',
    category: 'คีย์เกม & สตรีมมิ่ง',
    price: 69,
    cost: 35,
    stock: 20,
    lowStockThreshold: 5,
    deliveryType: 'auto_key',
    isHidden: false,
    featured: true,
  });
  assert.equal(valid.valid, true);
});

test('parseStockKeys deduplicates and trims non-empty lines', () => {
  const keys = parseStockKeys(' KEY-001 \n\nKEY-002\nKEY-001\n  KEY-003 ');
  assert.deepEqual(keys, ['KEY-001', 'KEY-002', 'KEY-003']);
});

test('productsToCsv outputs valid CSV header and rows', () => {
  const csv = productsToCsv(INITIAL_PRODUCTS.slice(0, 2));
  const lines = csv.split('\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[0].includes('SKU,ชื่อสินค้า'));
  assert.ok(lines[1].includes('CYB-NF-4K30'));
});

test('calculateUserMetrics and filterAndSortUsers compute member metrics and filters accurately', () => {
  const metrics = calculateUserMetrics(INITIAL_USERS);
  assert.equal(metrics.totalUsers, 6);
  assert.equal(metrics.suspendedUsers, 1);
  assert.equal(metrics.activeUsers, 5);
  assert.equal(metrics.vipAndResellerCount, 3);
  assert.ok(metrics.totalCreditBalance > 0);

  const vipOnly = filterAndSortUsers(INITIAL_USERS, {
    search: '',
    role: 'all',
    status: 'vip_reseller',
    sortBy: 'credit_desc',
  });
  assert.equal(vipOnly.length, 3);
  assert.ok(vipOnly[0].creditBalance >= vipOnly[1].creditBalance);

  const csv = usersToCsv(INITIAL_USERS.slice(0, 2));
  assert.ok(csv.includes('Code,Username,DisplayName'));
});

test('calculateCategoryMetrics and calculateOrderMetrics compute store categories and orders accurately', () => {
  const catMetrics = calculateCategoryMetrics(INITIAL_CATEGORIES, INITIAL_PRODUCTS);
  assert.equal(catMetrics.totalCategories, 5);
  assert.equal(catMetrics.activeCategories, 5);
  assert.equal(catMetrics.totalLinkedProducts, 8);
  assert.ok(catMetrics.totalCategoryStockUnits > 0);
  assert.ok(INITIAL_CATEGORIES.every((c) => c.imageUrl && c.imageUrl.length > 0));

  const ordMetrics = calculateOrderMetrics(INITIAL_ORDERS);
  assert.equal(ordMetrics.totalOrders, 6);
  assert.equal(ordMetrics.completedOrders, 4);
  assert.equal(ordMetrics.pendingOrders, 1);
  assert.equal(ordMetrics.refundedOrders, 1);
  assert.ok(ordMetrics.totalPaidRevenue > 0);

  const pendingOnly = filterAndSortOrders(INITIAL_ORDERS, {
    search: '',
    status: 'pending_verify',
    channel: 'all',
    sortBy: 'newest',
  });
  assert.equal(pendingOnly.length, 1);
  assert.equal(pendingOnly[0].orderCode, 'ORD-2026-8844');
});
