export type DeliveryType = 'auto_key' | 'account' | 'api_topup' | 'manual';
export type ProductStatus = 'active' | 'low_stock' | 'out_of_stock' | 'hidden';
export type StatusFilter = 'all' | 'active' | 'low_stock' | 'out_of_stock' | 'hidden';
export type SortOption = 'updated_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'sales_desc';

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  category: string;
  price: number;
  originalPrice?: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  soldCount: number;
  deliveryType: DeliveryType;
  isHidden: boolean;
  featured: boolean;
  stockKeys: string[];
  updatedAt: string;
}

export interface ProductFilterState {
  search: string;
  category: string;
  status: StatusFilter;
  deliveryType: string;
  sortBy: SortOption;
  onlyFeatured?: boolean;
}

export interface ProductMetrics {
  totalProducts: number;
  activeCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  hiddenCount: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  totalRevenue: number;
  totalProfitEstimate: number;
}

export interface ProductFormInput {
  name: string;
  sku: string;
  subtitle: string;
  imageUrl?: string;
  category: string;
  price: string | number;
  cost: string | number;
  stock: string | number;
  lowStockThreshold: string | number;
  deliveryType: DeliveryType;
  isHidden: boolean;
  featured: boolean;
  stockKeysRaw?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const PRODUCT_IMAGE_PRESETS = [
  {
    label: 'Streaming & Entertainment 4K',
    url: '/src/assets/images/prod_streaming_cinema_1794123175710.jpg',
  },
  {
    label: 'Gaming Pass & Gift Token',
    url: '/src/assets/images/prod_gaming_valorant_1794123178143.jpg',
  },
  {
    label: 'Creative Software Suite',
    url: '/src/assets/images/prod_creative_software_1794123177959.jpg',
  },
  {
    label: 'Cloud NVMe Server Module',
    url: '/src/assets/images/prod_cloud_server_1794123179393.jpg',
  },
];

export const DELIVERY_LABELS: Record<DeliveryType, string> = {
  auto_key: 'ส่งคีย์อัตโนมัติ (1 บรรทัด = 1 ชิ้น)',
  account: 'ส่งบัญชีพร้อมใช้ (1 บรรทัด = 1 ชิ้น)',
  api_topup: 'เชื่อมต่อ API ทันที',
  manual: 'แอดมินจัดส่ง',
};

export const CATEGORIES = [
  'ทั้งหมด',
  'คีย์เกม & สตรีมมิ่ง',
  'ซอฟต์แวร์ & ครีเอทีฟ',
  'เติมเกมผ่าน UID / API',
  'คลาวด์ & เซิร์ฟเวอร์',
  'บัตรเติมเงินดิจิทัล',
];

/**
 * Derives semantic status of a product from its stock, threshold, and visibility.
 */
export function getProductStatus(
  product: Pick<ProductItem, 'stock' | 'lowStockThreshold' | 'isHidden'>
): ProductStatus {
  if (product.isHidden) return 'hidden';
  if (product.stock <= 0) return 'out_of_stock';
  if (product.stock <= product.lowStockThreshold) return 'low_stock';
  return 'active';
}

export function getStatusLabel(status: ProductStatus): string {
  switch (status) {
    case 'active':
      return 'พร้อมจำหน่าย';
    case 'low_stock':
      return 'สต็อกใกล้หมด';
    case 'out_of_stock':
      return 'สินค้าหมด';
    case 'hidden':
      return 'ซ่อนจากหน้าร้าน';
  }
}

/**
 * Filters and sorts product items deterministically.
 */
export function filterAndSortProducts(
  products: ProductItem[],
  filter: ProductFilterState
): ProductItem[] {
  const q = filter.search.trim().toLowerCase();

  const filtered = products.filter((item) => {
    if (q) {
      const matchName = item.name.toLowerCase().includes(q);
      const matchSku = item.sku.toLowerCase().includes(q);
      const matchSub = item.subtitle.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchSub && !matchCat) {
        return false;
      }
    }

    if (filter.category && filter.category !== 'all' && filter.category !== 'ทั้งหมด') {
      if (item.category !== filter.category) return false;
    }

    if (filter.deliveryType && filter.deliveryType !== 'all') {
      if (item.deliveryType !== filter.deliveryType) return false;
    }

    if (filter.onlyFeatured && !item.featured) {
      return false;
    }

    const status = getProductStatus(item);
    if (filter.status !== 'all') {
      if (status !== filter.status) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (filter.sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'stock_asc':
        return a.stock - b.stock;
      case 'sales_desc':
        return b.soldCount - a.soldCount;
      case 'updated_desc':
      default:
        return b.updatedAt.localeCompare(a.updatedAt);
    }
  });
}

/**
 * Calculates aggregate store and inventory metrics.
 */
export function calculateProductMetrics(products: ProductItem[]): ProductMetrics {
  let activeCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let hiddenCount = 0;
  let totalStockUnits = 0;
  let totalInventoryValue = 0;
  let totalRevenue = 0;
  let totalProfitEstimate = 0;

  for (const p of products) {
    const status = getProductStatus(p);
    if (status === 'active') activeCount++;
    else if (status === 'low_stock') lowStockCount++;
    else if (status === 'out_of_stock') outOfStockCount++;
    else if (status === 'hidden') hiddenCount++;

    const safeStock = Math.max(0, p.stock);
    totalStockUnits += safeStock;
    totalInventoryValue += safeStock * p.price;
    totalRevenue += p.soldCount * p.price;
    totalProfitEstimate += p.soldCount * Math.max(0, p.price - p.cost);
  }

  return {
    totalProducts: products.length,
    activeCount,
    lowStockCount,
    outOfStockCount,
    hiddenCount,
    totalStockUnits,
    totalInventoryValue,
    totalRevenue,
    totalProfitEstimate,
  };
}

/**
 * Validates product creation / edit form inputs.
 */
export function validateProductForm(input: ProductFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'กรุณาระบุชื่อสินค้าอย่างน้อย 2 ตัวอักษร';
  }

  if (!input.sku || input.sku.trim().length < 2) {
    errors.sku = 'กรุณาระบุรหัสสินค้า (SKU)';
  }

  if (!input.category || input.category.trim() === '' || input.category === 'ทั้งหมด') {
    errors.category = 'กรุณาเลือกหมวดหมู่สินค้า';
  }

  const priceNum = Number(input.price);
  if (input.price === '' || Number.isNaN(priceNum) || priceNum < 0) {
    errors.price = 'ราคาขายต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป';
  }

  const costNum = Number(input.cost);
  if (input.cost === '' || Number.isNaN(costNum) || costNum < 0) {
    errors.cost = 'ต้นทุนต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป';
  }

  const stockNum = Number(input.stock);
  if (input.stock === '' || Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
    errors.stock = 'จำนวนสต็อกต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Parses multi-line stock keys/codes where 1 non-empty line = 1 product item.
 * Preserves exact order and removes empty lines & duplicates.
 */
export function parseStockKeys(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return Array.from(new Set(lines));
}

/**
 * Formats stock keys array back to 1-line-per-item text.
 */
export function formatStockLines(keys: string[]): string {
  return keys.join('\n');
}

/**
 * Generates CSV string from product list.
 */
export function productsToCsv(products: ProductItem[]): string {
  const headers = [
    'SKU',
    'ชื่อสินค้า',
    'หมวดหมู่',
    'ราคาขาย (THB)',
    'ต้นทุน (THB)',
    'สต็อกคงเหลือ (ชิ้น)',
    'คีย์ในคลัง (บรรทัด)',
    'ยอดขายสะสม',
    'รูปแบบจัดส่ง',
    'สถานะ',
  ];
  const rows = products.map((p) => {
    const status = getStatusLabel(getProductStatus(p));
    const delivery = DELIVERY_LABELS[p.deliveryType];
    const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
    return [
      escapeCsv(p.sku),
      escapeCsv(p.name),
      escapeCsv(p.category),
      p.price.toFixed(2),
      p.cost.toFixed(2),
      p.stock,
      p.stockKeys.length,
      p.soldCount,
      escapeCsv(delivery),
      escapeCsv(status),
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    sku: 'CYB-NF-4K30',
    name: 'Netflix Ultra HD 4K (จอส่วนตัว 30 วัน)',
    subtitle: 'รับประกันตลอดอายุการใช้งาน · มีพินล็อกจอส่วนตัว',
    imageUrl: '/src/assets/images/prod_streaming_cinema_1794123175710.jpg',
    category: 'คีย์เกม & สตรีมมิ่ง',
    price: 99,
    originalPrice: 139,
    cost: 62,
    stock: 5,
    lowStockThreshold: 3,
    soldCount: 318,
    deliveryType: 'account',
    isHidden: false,
    featured: true,
    stockKeys: [
      'nf4k_user01@cybermail.io:Pass#9981 | PIN 1102',
      'nf4k_user02@cybermail.io:Pass#9982 | PIN 2409',
      'nf4k_user03@cybermail.io:Pass#9983 | PIN 3810',
      'nf4k_user04@cybermail.io:Pass#9984 | PIN 4512',
      'nf4k_user05@cybermail.io:Pass#9985 | PIN 8821',
    ],
    updatedAt: '2026-11-08 11:42',
  },
  {
    id: 'prod-2',
    sku: 'CYB-VAL-2400',
    name: 'Valorant Points 2,400 VP (เติมผ่าน Riot ID ทันที)',
    subtitle: 'เซิร์ฟเวอร์ไทยแท้ · เข้าไวใน 10 วินาทีผ่าน API',
    imageUrl: '/src/assets/images/prod_gaming_valorant_1794123178143.jpg',
    category: 'เติมเกมผ่าน UID / API',
    price: 565,
    originalPrice: 600,
    cost: 510,
    stock: 4,
    lowStockThreshold: 2,
    soldCount: 204,
    deliveryType: 'auto_key',
    isHidden: false,
    featured: true,
    stockKeys: [
      'VP-TH-2400-8891-A102',
      'VP-TH-2400-8892-B409',
      'VP-TH-2400-8893-C712',
      'VP-TH-2400-8894-D994',
    ],
    updatedAt: '2026-11-08 11:30',
  },
  {
    id: 'prod-3',
    sku: 'CYB-YT-FAM1M',
    name: 'YouTube Premium + Music 30 วัน (ต่อเมลเดิมได้)',
    subtitle: 'ไม่ต้องเปลี่ยนอีเมล · ฟังเพลงปิดหน้าจอ ไม่มีโฆษณาคั่น',
    imageUrl: '/src/assets/images/prod_streaming_cinema_1794123175710.jpg',
    category: 'คีย์เกม & สตรีมมิ่ง',
    price: 49,
    originalPrice: 69,
    cost: 25,
    stock: 2,
    lowStockThreshold: 5,
    soldCount: 512,
    deliveryType: 'auto_key',
    isHidden: false,
    featured: true,
    stockKeys: [
      'YT-INV-2026-A89F-9912',
      'YT-INV-2026-B12C-4410',
    ],
    updatedAt: '2026-11-08 10:55',
  },
  {
    id: 'prod-4',
    sku: 'CYB-CANVA-PRO',
    name: 'Canva Pro Teams Invite Link (ใช้งาน 30 วัน)',
    subtitle: 'ปลดล็อกฟอนต์ไทยพรีเมียม ลบพื้นหลัง AI Magic Studio',
    imageUrl: '/src/assets/images/prod_creative_software_1794123177959.jpg',
    category: 'ซอฟต์แวร์ & ครีเอทีฟ',
    price: 39,
    originalPrice: 59,
    cost: 15,
    stock: 4,
    lowStockThreshold: 2,
    soldCount: 429,
    deliveryType: 'auto_key',
    isHidden: false,
    featured: false,
    stockKeys: [
      'https://canva.com/brand/join?token=cyb_8812a',
      'https://canva.com/brand/join?token=cyb_8812b',
      'https://canva.com/brand/join?token=cyb_8812c',
      'https://canva.com/brand/join?token=cyb_8812d',
    ],
    updatedAt: '2026-11-08 09:20',
  },
  {
    id: 'prod-5',
    sku: 'CYB-STEAM-200',
    name: 'Steam Wallet Code 200 THB (คีย์แท้โซนไทย)',
    subtitle: 'รับรหัสเติมเข้ากระเป๋า Steam ทันทีหลังชำระเงิน',
    imageUrl: '/src/assets/images/prod_gaming_valorant_1794123178143.jpg',
    category: 'บัตรเติมเงินดิจิทัล',
    price: 198,
    originalPrice: 205,
    cost: 186,
    stock: 0,
    lowStockThreshold: 3,
    soldCount: 167,
    deliveryType: 'auto_key',
    isHidden: false,
    featured: false,
    stockKeys: [],
    updatedAt: '2026-11-07 22:15',
  },
  {
    id: 'prod-6',
    sku: 'CYB-VPS-NVME4',
    name: 'Cloud VPS Thailand NVMe 4 vCPU / 8GB RAM (รายเดือน)',
    subtitle: 'Data Center กรุงเทพฯ · ปิงต่ำ 1-3ms · กันยิง DDoS ฟรี',
    imageUrl: '/src/assets/images/prod_cloud_server_1794123179393.jpg',
    category: 'คลาวด์ & เซิร์ฟเวอร์',
    price: 450,
    originalPrice: 590,
    cost: 290,
    stock: 2,
    lowStockThreshold: 3,
    soldCount: 64,
    deliveryType: 'account',
    isHidden: false,
    featured: false,
    stockKeys: [
      '103.212.18.41 | root:Vps#Thai991',
      '103.212.18.42 | root:Vps#Thai992',
    ],
    updatedAt: '2026-11-07 19:40',
  },
  {
    id: 'prod-7',
    sku: 'CYB-ROBUX-800',
    name: 'Roblox Gift Card 800 Robux (Global Redeem Key)',
    subtitle: 'แลกได้ทุกโซน แถมไอเทมพิเศษประจำเดือน',
    imageUrl: '/src/assets/images/prod_gaming_valorant_1794123178143.jpg',
    category: 'บัตรเติมเงินดิจิทัล',
    price: 315,
    originalPrice: 350,
    cost: 275,
    stock: 3,
    lowStockThreshold: 2,
    soldCount: 142,
    deliveryType: 'auto_key',
    isHidden: false,
    featured: false,
    stockKeys: [
      'RBX-9910-2281-7741',
      'RBX-9910-2281-7742',
      'RBX-9910-2281-7743',
    ],
    updatedAt: '2026-11-07 16:05',
  },
  {
    id: 'prod-8',
    sku: 'CYB-CAPCUT-PRO',
    name: 'CapCut Pro Account 30 วัน (รองรับ PC / มือถือ / iPad)',
    subtitle: 'ส่งออก 4K 60fps ใช้เอฟเฟกต์ Pro และ Auto Captions ครบ',
    imageUrl: '/src/assets/images/prod_creative_software_1794123177959.jpg',
    category: 'ซอฟต์แวร์ & ครีเอทีฟ',
    price: 79,
    originalPrice: 129,
    cost: 42,
    stock: 2,
    lowStockThreshold: 2,
    soldCount: 93,
    deliveryType: 'account',
    isHidden: true,
    featured: false,
    stockKeys: [
      'capcut_pro01@cybermail.io:Cap#2026',
      'capcut_pro02@cybermail.io:Cap#2027',
    ],
    updatedAt: '2026-11-06 14:12',
  },
];
