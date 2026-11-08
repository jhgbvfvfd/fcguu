import { ProductItem } from './productLogic';

// ============================================================================
// 1. CATEGORIES LOGIC (จัดการหมวดหมู่สินค้า)
// ============================================================================

export type CategoryIconType = 'gamepad' | 'sparkles' | 'zap' | 'server' | 'ticket';
export type CategoryStatusFilter = 'all' | 'active' | 'hidden' | 'featured';

export interface CategoryItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  subtitle: string;
  imageUrl: string;
  descriptionHtml: string;
  iconType: CategoryIconType;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  badgeText: string;
  updatedAt: string;
}

export const CATEGORY_IMAGE_PRESETS = [
  {
    label: 'สตรีมมิ่ง & ความบันเทิง 4K',
    url: '/src/assets/images/prod_streaming_cinema_1794123175710.jpg',
  },
  {
    label: 'ซอฟต์แวร์ & ครีเอทีฟสตูดิโอ',
    url: '/src/assets/images/prod_creative_software_1794123177959.jpg',
  },
  {
    label: 'เติมเกม UID & บัตรเกมมิ่ง',
    url: '/src/assets/images/prod_gaming_valorant_1794123178143.jpg',
  },
  {
    label: 'คลาวด์เซิร์ฟเวอร์ & VPS NVMe',
    url: '/src/assets/images/prod_cloud_server_1794123179393.jpg',
  },
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    code: 'CAT-STREAM',
    name: 'คีย์เกม & สตรีมมิ่ง',
    slug: 'game-keys-streaming',
    subtitle: 'Netflix 4K, YouTube Premium, Spotify รายเดือน ส่งรหัสทันที',
    imageUrl: '/src/assets/images/prod_streaming_cinema_1794123175710.jpg',
    descriptionHtml:
      '<p>รวมบัญชีสตรีมมิ่งภาพชัดระดับ <strong>4K Ultra HD</strong> และคีย์เกมแท้ <u>จัดส่งอัตโนมัติทีละ 1 บรรทัด</u> พร้อมรับประกันตลอดอายุการใช้งาน</p>',
    iconType: 'gamepad',
    sortOrder: 1,
    isActive: true,
    isFeatured: true,
    badgeText: 'ยอดนิยมอันดับ 1',
    updatedAt: '08/11/2026 11:55',
  },
  {
    id: 'cat-2',
    code: 'CAT-SOFT',
    name: 'ซอฟต์แวร์ & ครีเอทีฟ',
    slug: 'software-creative',
    subtitle: 'Canva Pro, CapCut Pro, Adobe Cloud สำหรับสายออกแบบและตัดต่อ',
    imageUrl: '/src/assets/images/prod_creative_software_1794123177959.jpg',
    descriptionHtml:
      '<p>ซอฟต์แวร์ลิขสิทธิ์แท้สำหรับครีเอเตอร์ <strong>ปลดล็อกฟีเจอร์ Pro ครบทุกเครื่องมือ</strong> รองรับทั้ง PC, Mac, iPad และมือถือ</p>',
    iconType: 'sparkles',
    sortOrder: 2,
    isActive: true,
    isFeatured: true,
    badgeText: 'ขายดีสายทำงาน',
    updatedAt: '08/11/2026 11:40',
  },
  {
    id: 'cat-3',
    code: 'CAT-TOPUP',
    name: 'เติมเกมผ่าน UID / API',
    slug: 'uid-api-game-topup',
    subtitle: 'Valorant Points, RoV, Genshin Impact เติมไวใน 10 วินาที',
    imageUrl: '/src/assets/images/prod_gaming_valorant_1794123178143.jpg',
    descriptionHtml:
      '<p>ระบบเชื่อมต่อ <u>Direct Game API</u> เพียงกรอก Riot ID หรือ UID เกม ระบบตัดสต็อกและเติมพอยต์เข้าไอดีทันทีตลอด 24 ชม.</p>',
    iconType: 'zap',
    sortOrder: 3,
    isActive: true,
    isFeatured: true,
    badgeText: 'API อัตโนมัติ',
    updatedAt: '08/11/2026 11:20',
  },
  {
    id: 'cat-4',
    code: 'CAT-CLOUD',
    name: 'คลาวด์ & เซิร์ฟเวอร์',
    slug: 'cloud-vps-server',
    subtitle: 'Cloud VPS Thailand NVMe ปิงต่ำ 1-3ms กันยิง DDoS ฟรี',
    imageUrl: '/src/assets/images/prod_cloud_server_1794123179393.jpg',
    descriptionHtml:
      '<p>เซิร์ฟเวอร์ส่วนตัวความเร็วสูง <strong>NVMe Enterprise SSD</strong> ตั้งอยู่ที่ Data Center กรุงเทพฯ พร้อมส่ง IP และรหัส Root ทันที</p>',
    iconType: 'server',
    sortOrder: 4,
    isActive: true,
    isFeatured: false,
    badgeText: 'Uptime 99.9%',
    updatedAt: '08/11/2026 10:45',
  },
  {
    id: 'cat-5',
    code: 'CAT-GIFTCARD',
    name: 'บัตรเติมเงินดิจิทัล',
    slug: 'digital-gift-cards',
    subtitle: 'Steam Wallet THB, Roblox Gift Card แลกรับพอยต์ได้ทุกโซน',
    imageUrl: '/src/assets/images/prod_gaming_valorant_1794123178143.jpg',
    descriptionHtml:
      '<p>รหัสบัตรเติมเงินดิจิทัลแท้ 100% <u>คัดลอกรหัสไป Redeem เข้ากระเป๋าทันที</u> ไม่มีวันหมดอายุ</p>',
    iconType: 'ticket',
    sortOrder: 5,
    isActive: true,
    isFeatured: false,
    badgeText: 'Redeem ทันที',
    updatedAt: '08/11/2026 10:15',
  },
];

export interface CategoryMetrics {
  totalCategories: number;
  activeCategories: number;
  hiddenCategories: number;
  featuredCategories: number;
  totalLinkedProducts: number;
  totalCategoryStockUnits: number;
}

export function calculateCategoryMetrics(
  categories: CategoryItem[],
  products: ProductItem[]
): CategoryMetrics {
  const activeCategories = categories.filter((c) => c.isActive).length;
  const hiddenCategories = categories.length - activeCategories;
  const featuredCategories = categories.filter((c) => c.isFeatured).length;

  const categoryNames = new Set(categories.map((c) => c.name));
  let totalLinkedProducts = 0;
  let totalCategoryStockUnits = 0;

  for (const p of products) {
    if (categoryNames.has(p.category)) {
      totalLinkedProducts += 1;
      totalCategoryStockUnits += p.stock;
    }
  }

  return {
    totalCategories: categories.length,
    activeCategories,
    hiddenCategories,
    featuredCategories,
    totalLinkedProducts,
    totalCategoryStockUnits,
  };
}

export function filterAndSortCategories(
  categories: CategoryItem[],
  options: {
    search: string;
    status: CategoryStatusFilter;
    sortBy: 'order_asc' | 'updated_desc' | 'name_asc';
  }
): CategoryItem[] {
  const q = options.search.trim().toLowerCase();
  const filtered = categories.filter((cat) => {
    if (q) {
      const hit =
        cat.name.toLowerCase().includes(q) ||
        cat.code.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        cat.subtitle.toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (options.status === 'active' && !cat.isActive) return false;
    if (options.status === 'hidden' && cat.isActive) return false;
    if (options.status === 'featured' && !cat.isFeatured) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (options.sortBy === 'name_asc') return a.name.localeCompare(b.name, 'th');
    if (options.sortBy === 'updated_desc') return b.updatedAt.localeCompare(a.updatedAt);
    return a.sortOrder - b.sortOrder;
  });
}

// ============================================================================
// 2. ORDERS LOGIC (จัดการคำสั่งซื้อ)
// ============================================================================

export type OrderStatus = 'completed' | 'pending_verify' | 'refunded';
export type OrderStatusFilter = 'all' | 'completed' | 'pending_verify' | 'refunded';
export type PaymentChannel = 'promptpay_qr' | 'truemoney' | 'bank_slip' | 'member_credit';

export const PAYMENT_CHANNEL_LABELS: Record<PaymentChannel, string> = {
  promptpay_qr: 'PromptPay QR อัตโนมัติ',
  truemoney: 'TrueMoney Wallet',
  bank_slip: 'โอนบัญชีธนาคาร (เช็คสลิป)',
  member_credit: 'หักเครดิตสมาชิก',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  completed: 'จัดส่งสำเร็จ',
  pending_verify: 'รอตรวจสอบสลิป',
  refunded: 'คืนเงิน / ยกเลิก',
};

export interface OrderItem {
  id: string;
  orderCode: string;
  customerName: string;
  customerUsername: string;
  customerEmail: string;
  productId: string;
  productName: string;
  productSku: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  netAmount: number;
  paymentChannel: PaymentChannel;
  status: OrderStatus;
  deliveredLine: string;
  slipRef: string;
  createdAt: string;
  noteHtml: string;
}

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    orderCode: 'ORD-2026-8846',
    customerName: 'กิตติพงศ์ อัศวเมธี',
    customerUsername: 'kittipong_vip',
    customerEmail: 'kittipong.vip@cybermail.io',
    productId: 'prod-1',
    productName: 'Netflix Ultra HD 4K (จอส่วนตัว 30 วัน)',
    productSku: 'CYB-NF-4K30',
    productCategory: 'คีย์เกม & สตรีมมิ่ง',
    quantity: 1,
    unitPrice: 99,
    discountAmount: 10,
    netAmount: 89,
    paymentChannel: 'promptpay_qr',
    status: 'completed',
    deliveredLine: 'nf4k_vip88@cybermail.io:Pass#7741 | PIN 4409 (จอ 2)',
    slipRef: 'PP-20261108-994120',
    createdAt: '08/11/2026 11:54',
    noteHtml: '<p>ชำระผ่าน <strong>QR PromptPay อัตโนมัติ</strong> ระบบตัดสต็อกบรรทัดที่ 1 ส่งให้ลูกค้าเรียบร้อย</p>',
  },
  {
    id: 'ord-2',
    orderCode: 'ORD-2026-8845',
    customerName: 'Nexus Game Store (ตัวแทน)',
    customerUsername: 'nexus_reseller',
    customerEmail: 'contact@nexusgamestore.th',
    productId: 'prod-2',
    productName: 'Valorant Points 2,400 VP (เติมผ่าน Riot ID ทันที)',
    productSku: 'CYB-VAL-2400',
    productCategory: 'เติมเกมผ่าน UID / API',
    quantity: 2,
    unitPrice: 565,
    discountAmount: 130,
    netAmount: 1000,
    paymentChannel: 'member_credit',
    status: 'completed',
    deliveredLine: 'VP-TH-2400-9910-X882 | RiotID: NexusPro#TH1',
    slipRef: 'CRD-WALLET-55102',
    createdAt: '08/11/2026 11:42',
    noteHtml: '<p>ตัวแทนจำหน่ายตัดเครดิตสะสม <u>ได้รับส่วนลดเรทตัวแทน 18%</u> ส่งพอยต์เข้าเกมสำเร็จ</p>',
  },
  {
    id: 'ord-3',
    orderCode: 'ORD-2026-8844',
    customerName: 'ชานนท์ ศรีวิไล',
    customerUsername: 'chanon_cloud',
    customerEmail: 'chanon.cloud@outlook.com',
    productId: 'prod-6',
    productName: 'Cloud VPS Thailand NVMe 4 vCPU / 8GB RAM (รายเดือน)',
    productSku: 'CYB-VPS-NVME4',
    productCategory: 'คลาวด์ & เซิร์ฟเวอร์',
    quantity: 1,
    unitPrice: 450,
    discountAmount: 36,
    netAmount: 414,
    paymentChannel: 'bank_slip',
    status: 'pending_verify',
    deliveredLine: '103.212.18.99 | root:Vps#PendingVerify2026',
    slipRef: 'KBANK-SLIP-88412',
    createdAt: '08/11/2026 11:28',
    noteHtml:
      '<p><span style="color:#fbbf24;"><strong>รอตรวจสอบสลิปโอนเงิน:</strong></span> ลูกค้าแนบสลิปธนาคารกสิกรไทย ยอด ฿414.00 รอแอดมินกดอนุมัติเพื่อปลดล็อก IP</p>',
  },
  {
    id: 'ord-4',
    orderCode: 'ORD-2026-8843',
    customerName: 'ณัฐวุฒิ วงศ์สวัสดิ์',
    customerUsername: 'nattawut_dev',
    customerEmail: 'nattawut.w@gmail.com',
    productId: 'prod-4',
    productName: 'Canva Pro Teams Invite Link (ใช้งาน 30 วัน)',
    productSku: 'CYB-CANVA-PRO',
    productCategory: 'ซอฟต์แวร์ & ครีเอทีฟ',
    quantity: 1,
    unitPrice: 39,
    discountAmount: 0,
    netAmount: 39,
    paymentChannel: 'truemoney',
    status: 'completed',
    deliveredLine: 'https://canva.com/brand/join?token=cyb_invite_99201',
    slipRef: 'TMN-ANGPAO-77219',
    createdAt: '08/11/2026 10:55',
    noteHtml: '<p>รับชำระผ่านซองของขวัญ <strong>TrueMoney Wallet</strong> จัดส่งลิงก์เข้าทีม Canva Pro ทันที</p>',
  },
  {
    id: 'ord-5',
    orderCode: 'ORD-2026-8842',
    customerName: 'พลอยไพลิน รัตนโชติ',
    customerUsername: 'ploy_design',
    customerEmail: 'ploy.rattana@gmail.com',
    productId: 'prod-7',
    productName: 'Roblox Gift Card 800 Robux (Global Redeem Key)',
    productSku: 'CYB-ROBUX-800',
    productCategory: 'บัตรเติมเงินดิจิทัล',
    quantity: 1,
    unitPrice: 315,
    discountAmount: 0,
    netAmount: 315,
    paymentChannel: 'promptpay_qr',
    status: 'completed',
    deliveredLine: 'RBX-800-TH-9941-2208-7712',
    slipRef: 'PP-20261108-771092',
    createdAt: '08/11/2026 10:12',
    noteHtml: '<p>จัดส่งคีย์ Redeem Robux อัตโนมัติทางหน้าเว็บและอีเมลลูกค้าเรียบร้อย</p>',
  },
  {
    id: 'ord-6',
    orderCode: 'ORD-2026-8841',
    customerName: 'ธนกร เกียรติเจริญ',
    customerUsername: 'susp_bot99',
    customerEmail: 'thanakorn99@tempmail.org',
    productId: 'prod-5',
    productName: 'Steam Wallet Code 200 THB (คีย์แท้โซนไทย)',
    productSku: 'CYB-STEAM-200',
    productCategory: 'บัตรเติมเงินดิจิทัล',
    quantity: 1,
    unitPrice: 198,
    discountAmount: 0,
    netAmount: 198,
    paymentChannel: 'bank_slip',
    status: 'refunded',
    deliveredLine: 'ระงับการจัดส่งคีย์ — สลิปซ้ำในระบบ',
    slipRef: 'DUP-SLIP-00912',
    createdAt: '08/11/2026 09:30',
    noteHtml: '<p>ยกเลิกรายการเนื่องจากระบบ <u>Slip Verification API</u> ตรวจพบสลิปโอนเงินซ้ำ</p>',
  },
];

export interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  refundedOrders: number;
  totalPaidRevenue: number;
}

export function calculateOrderMetrics(orders: OrderItem[]): OrderMetrics {
  return orders.reduce<OrderMetrics>(
    (acc, ord) => {
      acc.totalOrders += 1;
      if (ord.status === 'completed') {
        acc.completedOrders += 1;
        acc.totalPaidRevenue += ord.netAmount;
      } else if (ord.status === 'pending_verify') {
        acc.pendingOrders += 1;
      } else {
        acc.refundedOrders += 1;
      }
      return acc;
    },
    {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      refundedOrders: 0,
      totalPaidRevenue: 0,
    }
  );
}

export function filterAndSortOrders(
  orders: OrderItem[],
  options: {
    search: string;
    status: OrderStatusFilter;
    channel: string;
    sortBy: 'newest' | 'amount_desc' | 'amount_asc';
  }
): OrderItem[] {
  const q = options.search.trim().toLowerCase();
  const filtered = orders.filter((ord) => {
    if (q) {
      const hit =
        ord.orderCode.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerUsername.toLowerCase().includes(q) ||
        ord.productName.toLowerCase().includes(q) ||
        ord.productSku.toLowerCase().includes(q) ||
        ord.deliveredLine.toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (options.status !== 'all' && ord.status !== options.status) return false;
    if (options.channel !== 'all' && ord.paymentChannel !== options.channel) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (options.sortBy === 'amount_desc') return b.netAmount - a.netAmount;
    if (options.sortBy === 'amount_asc') return a.netAmount - b.netAmount;
    return b.orderCode.localeCompare(a.orderCode);
  });
}

export function ordersToCsv(orders: OrderItem[]): string {
  const header =
    'OrderCode,CustomerName,Username,ProductSKU,ProductName,Quantity,NetAmount,PaymentChannel,Status,DeliveredLine,CreatedAt\n';
  const rows = orders.map((o) => {
    const safeProd = o.productName.replace(/"/g, '""');
    const safeLine = o.deliveredLine.replace(/"/g, '""');
    return `"${o.orderCode}","${o.customerName}","${o.customerUsername}","${o.productSku}","${safeProd}",${o.quantity},${o.netAmount},"${o.paymentChannel}","${o.status}","${safeLine}","${o.createdAt}"`;
  });
  return header + rows.join('\n');
}

// ============================================================================
// 3. PAYEE & PAYMENT SETTINGS LOGIC (ตั้งค่าผู้รับเงิน)
// ============================================================================

export interface PayeeSettings {
  promptpayEnabled: boolean;
  promptpayIdType: 'phone' | 'tax_id';
  promptpayId: string;
  promptpayPayeeNameTH: string;
  promptpayPayeeNameEN: string;
  minPromptpayAmount: number;

  bankEnabled: boolean;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
  slipApiEnabled: boolean;
  slipApiProvider: string;
  slipApiSecretMasked: string;

  truemoneyEnabled: boolean;
  truemoneyPhone: string;
  truemoneyPayeeName: string;
  angpaoAutoRedeem: boolean;
  truemoneyFeePercent: number;

  memberCreditEnabled: boolean;
  vipBonusPercent: number;
  autoApproveMaxAmount: number;
  checkoutInstructionHtml: string;
  updatedAt: string;
}

export const INITIAL_PAYEE_SETTINGS: PayeeSettings = {
  promptpayEnabled: true,
  promptpayIdType: 'phone',
  promptpayId: '089-451-9980',
  promptpayPayeeNameTH: 'นาย วิชญ์พล อัศวเมธี (CYBERAPI)',
  promptpayPayeeNameEN: 'MR. WITCHAPOL ASSAWAMETHEE',
  minPromptpayAmount: 10,

  bankEnabled: true,
  bankName: 'ธนาคารกสิกรไทย (KBANK)',
  bankAccountNo: '148-2-99041-8',
  bankAccountName: 'บจก. ไซเบอร์เอพีไอ ดิจิทัล สโตร์',
  slipApiEnabled: true,
  slipApiProvider: 'SlipOK / Thunder Slip Verification API',
  slipApiSecretMasked: 'cyb_live_slip_99810a44f2c8b11e',

  truemoneyEnabled: true,
  truemoneyPhone: '089-451-9980',
  truemoneyPayeeName: 'วิชญ์พล อัศวเมธี (TrueMoney)',
  angpaoAutoRedeem: true,
  truemoneyFeePercent: 0,

  memberCreditEnabled: true,
  vipBonusPercent: 5,
  autoApproveMaxAmount: 10000,
  checkoutInstructionHtml:
    '<p><strong>คำแนะนำการชำระเงินอัตโนมัติ:</strong> กรุณาโอนเงินตามยอดทศนิยมหรือแนบสลิปที่มี <u>QR Code ชัดเจน</u> ระบบจะตรวจสอบผู้รับเงินและจัดส่งสินค้า (1 บรรทัด = 1 ชิ้น) ให้ภายใน <strong>3–5 วินาที</strong></p>',
  updatedAt: '08/11/2026 11:58',
};
