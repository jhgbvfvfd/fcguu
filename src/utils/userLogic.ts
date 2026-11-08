export type UserRole = 'admin' | 'reseller' | 'vip' | 'member';
export type UserStatusFilter = 'all' | 'active' | 'vip_reseller' | 'admin' | 'suspended';
export type UserSortOption = 'recent_desc' | 'credit_desc' | 'spent_desc' | 'orders_desc';

export interface UserItem {
  id: string;
  code: string;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  role: UserRole;
  creditBalance: number;
  totalSpent: number;
  ordersCount: number;
  discountPercent: number;
  isActive: boolean;
  twoFactorEnabled: boolean;
  joinedAt: string;
  lastLoginAt: string;
  noteHtml: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'ผู้ดูแลระบบ (Admin)',
  reseller: 'ตัวแทนจำหน่าย (Reseller)',
  vip: 'สมาชิก VIP',
  member: 'สมาชิกทั่วไป',
};

export const INITIAL_USERS: UserItem[] = [
  {
    id: 'usr-1',
    code: 'USR-1001',
    username: 'vghh_admin',
    displayName: 'Vghh Vvgg (Owner)',
    email: 'safgg19042565@gmail.com',
    phone: '089-451-9980',
    role: 'admin',
    creditBalance: 15000,
    totalSpent: 84500,
    ordersCount: 142,
    discountPercent: 25,
    isActive: true,
    twoFactorEnabled: true,
    joinedAt: '2026-01-12',
    lastLoginAt: '08/11/2026 11:58',
    noteHtml:
      '<p><strong>บัญชีผู้ดูแลระบบหลักของร้าน CYBERAPI</strong> — <u>สิทธิ์เข้าถึงระบบคลังสต็อกและการเงินทั้งหมด</u></p>',
  },
  {
    id: 'usr-2',
    code: 'USR-1002',
    username: 'kittipong_vip',
    displayName: 'กิตติพงศ์ อัศวเมธี',
    email: 'kittipong.vip@cybermail.io',
    phone: '081-889-2410',
    role: 'vip',
    creditBalance: 2450,
    totalSpent: 38920,
    ordersCount: 86,
    discountPercent: 10,
    isActive: true,
    twoFactorEnabled: true,
    joinedAt: '2026-03-19',
    lastLoginAt: '08/11/2026 11:42',
    noteHtml:
      '<p>ลูกค้าประจำระดับ <u><strong>VIP Gold</strong></u> สั่งซื้อคีย์สตรีมมิ่งและ Valorant Points ต่อเนื่องทุกสัปดาห์</p>',
  },
  {
    id: 'usr-3',
    code: 'USR-1003',
    username: 'nexus_reseller',
    displayName: 'Nexus Game Store (ตัวแทน)',
    email: 'contact@nexusgamestore.th',
    phone: '092-310-7741',
    role: 'reseller',
    creditBalance: 12800,
    totalSpent: 142600,
    ordersCount: 512,
    discountPercent: 18,
    isActive: true,
    twoFactorEnabled: true,
    joinedAt: '2026-02-04',
    lastLoginAt: '08/11/2026 11:30',
    noteHtml:
      '<p>ตัวแทนจำหน่ายเชื่อมต่อ API ตัดสต็อกอัตโนมัติ <u>ได้รับเรทราคาส่งลด 18%</u></p>',
  },
  {
    id: 'usr-4',
    code: 'USR-1004',
    username: 'nattawut_dev',
    displayName: 'ณัฐวุฒิ วงศ์สวัสดิ์',
    email: 'nattawut.w@gmail.com',
    phone: '086-712-3309',
    role: 'member',
    creditBalance: 320,
    totalSpent: 4850,
    ordersCount: 19,
    discountPercent: 0,
    isActive: true,
    twoFactorEnabled: false,
    joinedAt: '2026-06-22',
    lastLoginAt: '08/11/2026 10:15',
    noteHtml: '<p>สมาชิกทั่วไป ชำระเงินผ่านสแกน QR PromptPay ประวัติการสั่งซื้อปกติ</p>',
  },
  {
    id: 'usr-5',
    code: 'USR-1005',
    username: 'chanon_cloud',
    displayName: 'ชานนท์ ศรีวิไล',
    email: 'chanon.cloud@outlook.com',
    phone: '095-601-8823',
    role: 'vip',
    creditBalance: 1890,
    totalSpent: 26400,
    ordersCount: 44,
    discountPercent: 8,
    isActive: true,
    twoFactorEnabled: true,
    joinedAt: '2026-05-10',
    lastLoginAt: '08/11/2026 09:50',
    noteHtml: '<p>เช่าเซิร์ฟเวอร์ <u>Cloud VPS Thailand NVMe</u> จำนวน 4 เครื่อง ต่ออายุรายเดือนอัตโนมัติ</p>',
  },
  {
    id: 'usr-6',
    code: 'USR-1006',
    username: 'susp_bot99',
    displayName: 'ธนกร เกียรติเจริญ',
    email: 'thanakorn99@tempmail.org',
    phone: '080-112-4900',
    role: 'member',
    creditBalance: 0,
    totalSpent: 198,
    ordersCount: 1,
    discountPercent: 0,
    isActive: false,
    twoFactorEnabled: false,
    joinedAt: '2026-10-29',
    lastLoginAt: '02/11/2026 22:14',
    noteHtml:
      '<p><span style="color:#fbbf24;"><strong>⚠️ ระงับการใช้งานชั่วคราว:</strong></span> ตรวจพบการสุ่มส่งคำขอแจ้งโอนสลิปซ้ำเกินกำหนด</p>',
  },
];

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  vipAndResellerCount: number;
  adminCount: number;
  totalCreditBalance: number;
  totalMemberSpent: number;
}

export function calculateUserMetrics(users: UserItem[]): UserMetrics {
  return users.reduce<UserMetrics>(
    (acc, user) => {
      acc.totalUsers += 1;
      if (user.isActive) {
        acc.activeUsers += 1;
      } else {
        acc.suspendedUsers += 1;
      }
      if (user.role === 'vip' || user.role === 'reseller') {
        acc.vipAndResellerCount += 1;
      }
      if (user.role === 'admin') {
        acc.adminCount += 1;
      }
      acc.totalCreditBalance += user.creditBalance;
      acc.totalMemberSpent += user.totalSpent;
      return acc;
    },
    {
      totalUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      vipAndResellerCount: 0,
      adminCount: 0,
      totalCreditBalance: 0,
      totalMemberSpent: 0,
    }
  );
}

export interface UserFilterOptions {
  search: string;
  role: string;
  status: UserStatusFilter;
  sortBy: UserSortOption;
}

export function filterAndSortUsers(
  users: UserItem[],
  options: UserFilterOptions
): UserItem[] {
  const q = options.search.trim().toLowerCase();

  const filtered = users.filter((u) => {
    if (q) {
      const match =
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (options.role !== 'all' && u.role !== options.role) {
      return false;
    }

    if (options.status === 'active' && !u.isActive) return false;
    if (options.status === 'suspended' && u.isActive) return false;
    if (
      options.status === 'vip_reseller' &&
      u.role !== 'vip' &&
      u.role !== 'reseller'
    ) {
      return false;
    }
    if (options.status === 'admin' && u.role !== 'admin') return false;

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (options.sortBy) {
      case 'credit_desc':
        return b.creditBalance - a.creditBalance;
      case 'spent_desc':
        return b.totalSpent - a.totalSpent;
      case 'orders_desc':
        return b.ordersCount - a.ordersCount;
      case 'recent_desc':
      default:
        return b.code.localeCompare(a.code);
    }
  });
}

export function usersToCsv(users: UserItem[]): string {
  const header = 'Code,Username,DisplayName,Email,Phone,Role,CreditBalance,TotalSpent,OrdersCount,Status\n';
  const rows = users.map((u) => {
    const statusText = u.isActive ? 'Active' : 'Suspended';
    const safeName = u.displayName.replace(/"/g, '""');
    return `"${u.code}","${u.username}","${safeName}","${u.email}","${u.phone}","${u.role}",${u.creditBalance},${u.totalSpent},${u.ordersCount},"${statusText}"`;
  });
  return header + rows.join('\n');
}
