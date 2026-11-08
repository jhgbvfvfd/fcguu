import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  LayoutList,
  Package,
  KeyRound,
  Search,
  Sun,
  Moon,
  Plus,
  Minus,
  FileSpreadsheet,
  FileCode2,
  Edit3,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Layers,
  CheckSquare,
  Square,
  PanelLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Boxes,
  Wallet,
  Star,
  FolderKanban,
  Zap,
  ArrowUpDown,
  Terminal,
  ShoppingBag,
  TrendingUp,
  PackageX,
  Users,
} from 'lucide-react';
import {
  INITIAL_PRODUCTS,
  ProductItem,
  StatusFilter,
  SortOption,
  CATEGORIES,
  DELIVERY_LABELS,
  getProductStatus,
  getStatusLabel,
  filterAndSortProducts,
  calculateProductMetrics,
  productsToCsv,
} from './utils/productLogic';
import { INITIAL_USERS, UserItem } from './utils/userLogic';
import {
  INITIAL_CATEGORIES,
  CategoryItem,
  INITIAL_ORDERS,
  OrderItem,
  INITIAL_PAYEE_SETTINGS,
  PayeeSettings,
} from './utils/storeAdminLogic';
import { ProductFormModal } from './components/ProductFormModal';
import { StockKeysModal } from './components/StockKeysModal';
import { SingleFileHtmlModal } from './components/SingleFileHtmlModal';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductThumbnail } from './components/ProductThumbnail';
import { UserManagementView } from './components/UserManagementView';
import { CategoryManagementView } from './components/CategoryManagementView';
import { OrdersManagementView } from './components/OrdersManagementView';
import { PayeeSettingsView } from './components/PayeeSettingsView';

type ActiveSection =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'users'
  | 'payment';
type ViewMode = 'table' | 'grid';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [activeSection, setActiveSection] = useState<ActiveSection>('products');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const navigateToSection = (sec: ActiveSection) => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setIsCategoryStudioOpen(false);
    setEditingCategory(null);
    setIsOrderStudioOpen(false);
    setEditingOrder(null);
    setIsUserStudioOpen(false);
    setEditingUser(null);
    setActiveSection(sec);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Product state
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Category state
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [isCategoryStudioOpen, setIsCategoryStudioOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Order state
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [isOrderStudioOpen, setIsOrderStudioOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);

  // User state
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [isUserStudioOpen, setIsUserStudioOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Payee settings state
  const [payeeSettings, setPayeeSettings] =
    useState<PayeeSettings>(INITIAL_PAYEE_SETTINGS);

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<ProductItem | null>(null);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let wasDesktop = window.innerWidth >= 1024;
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop !== wasDesktop) {
        wasDesktop = isDesktop;
        setSidebarOpen(isDesktop);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const metrics = useMemo(() => calculateProductMetrics(products), [products]);

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        search,
        category,
        status: statusFilter,
        deliveryType: deliveryFilter,
        sortBy,
        onlyFeatured,
      }),
    [products, search, category, statusFilter, deliveryFilter, sortBy, onlyFeatured]
  );

  // Handlers
  const handleResetFilters = () => {
    setSearch('');
    setCategory('ทั้งหมด');
    setStatusFilter('all');
    setDeliveryFilter('all');
    setSortBy('updated_desc');
    setOnlyFeatured(false);
  };

  /**
   * Adjusts stock by 1 line = 1 item so stock count and stockKeys lines stay strictly in sync.
   */
  const handleAdjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStock = Math.max(0, item.stock + delta);
        let nextKeys = [...item.stockKeys];
        if (delta > 0) {
          for (let i = 0; i < delta; i++) {
            const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
            nextKeys.push(`${item.sku}-ITEM-${rand}`);
          }
        } else if (delta < 0) {
          nextKeys = nextKeys.slice(0, Math.max(0, nextKeys.length + delta));
        }
        return {
          ...item,
          stock: nextStock,
          stockKeys: nextKeys,
          updatedAt: '2026-11-08 12:00',
        };
      })
    );
  };

  const handleToggleVisibility = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextHidden = !item.isHidden;
        showToast(
          nextHidden
            ? `ปิดพักการเผยแพร่ "${item.name}" ชั่วคราวแล้ว`
            : `เปิดบริการเผยแพร่ "${item.name}" บนหน้าร้านแล้ว`
        );
        return { ...item, isHidden: nextHidden };
      })
    );
  };

  const handleDuplicateProduct = (product: ProductItem) => {
    const rand = Math.floor(100 + Math.random() * 900);
    const copy: ProductItem = {
      ...product,
      id: `prod-${Date.now()}`,
      sku: `${product.sku}-${rand}`,
      name: `${product.name} (สำเนา)`,
      soldCount: 0,
      updatedAt: '2026-11-08 12:01',
    };
    setProducts((prev) => [copy, ...prev]);
    showToast(`ทำสำเนา "${product.name}" เรียบร้อย`);
  };

  const handleDeleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    if (target) {
      showToast(`ลบสินค้า "${target.sku}" ออกจากระบบแล้ว`);
    }
  };

  const handleSaveProduct = (
    data: Omit<ProductItem, 'id' | 'soldCount' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? {
                ...item,
                ...data,
                updatedAt: '2026-11-08 12:02',
              }
            : item
        )
      );
      showToast(`บันทึกการแก้ไข "${data.name}" เรียบร้อย`);
    } else {
      const newItem: ProductItem = {
        ...data,
        id: `prod-${Date.now()}`,
        soldCount: 0,
        updatedAt: '2026-11-08 12:02',
      };
      setProducts((prev) => [newItem, ...prev]);
      showToast(`เพิ่มสินค้าใหม่ "${data.name}" เข้าระบบแล้ว`);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleUpdateStockAndKeys = (
    productId: string,
    newStock: number,
    newKeys: string[]
  ) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              stock: newStock,
              stockKeys: newKeys,
              updatedAt: '2026-11-08 12:03',
            }
          : item
      )
    );
    showToast(`อัปเดตสต็อก (${newStock} ชิ้น / ${newKeys.length} บรรทัด) เรียบร้อยแล้ว`);
  };

  const handleExportCsv = () => {
    const csv = productsToCsv(filteredProducts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cyberapi-products-export.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast(`ส่งออกไฟล์ CSV (${filteredProducts.length} รายการ) สำเร็จ`);
  };

  // Bulk operations
  const handleSelectAllFiltered = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAddStock = (delta: number) => {
    selectedIds.forEach((id) => handleAdjustStock(id, delta));
    showToast(`เพิ่มสต็อก +${delta} บรรทัด ให้สินค้าที่เลือก ${selectedIds.length} รายการแล้ว`);
  };

  const handleBulkToggleVisibility = (hide: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, isHidden: hide } : p))
    );
    showToast(
      hide
        ? `ซ่อนสินค้าที่เลือก ${selectedIds.length} รายการแล้ว`
        : `เปิดแสดงสินค้าที่เลือก ${selectedIds.length} รายการแล้ว`
    );
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    showToast(`ลบสินค้าที่เลือก ${count} รายการเรียบร้อย`);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'ทั้งหมด' ||
    statusFilter !== 'all' ||
    deliveryFilter !== 'all' ||
    onlyFeatured;

  return (
    <div className="min-h-screen w-full flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-[#fafafa] transition-colors overflow-x-hidden">
      {/* Mobile Slide-Over Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Left Sidebar: Slide-over drawer on mobile, sticky full-height sidebar on desktop */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 lg:static lg:z-auto lg:w-60 shrink-0 lg:sticky lg:top-0 h-screen overflow-y-auto border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] flex flex-col justify-between select-none shadow-2xl lg:shadow-none">
          <div className="p-3.5 space-y-5">
            {/* Store Brand Header */}
            <div className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold tracking-wide text-zinc-900 dark:text-zinc-100">
                    CYBERAPI
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">จัดการร้าน</div>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </div>

            {/* Navigation Group: จัดการร้าน */}
            <div className="space-y-1">
              <div className="px-2.5 pb-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                จัดการร้าน
              </div>
              <nav className="space-y-1" aria-label="เมนูหลักจัดการร้าน">
                <button
                  type="button"
                  onClick={() => navigateToSection('dashboard')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    activeSection === 'dashboard' && !isProductModalOpen
                      ? 'bg-indigo-600/15 dark:bg-[#1e1b4b]/90 text-indigo-600 dark:text-indigo-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutGrid className="h-4 w-4" />
                    <span>แดชบอร์ด</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToSection('products')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    activeSection === 'products'
                      ? 'bg-indigo-600/15 dark:bg-[#1e1b4b]/90 text-indigo-600 dark:text-indigo-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Package className="h-4 w-4" />
                    <span>จัดการสินค้า</span>
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-indigo-300/80">
                    {products.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToSection('categories')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    activeSection === 'categories' && !isProductModalOpen
                      ? 'bg-indigo-600/15 dark:bg-[#1e1b4b]/90 text-indigo-600 dark:text-indigo-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FolderKanban className="h-4 w-4" />
                    <span>หมวดหมู่สินค้า</span>
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {categories.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToSection('orders')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    activeSection === 'orders' && !isProductModalOpen
                      ? 'bg-indigo-600/15 dark:bg-[#1e1b4b]/90 text-indigo-600 dark:text-indigo-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="h-4 w-4" />
                    <span>คำสั่งซื้อ</span>
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {orders.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToSection('users')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    activeSection === 'users' && !isProductModalOpen
                      ? 'bg-indigo-600/15 dark:bg-[#1e1b4b]/90 text-indigo-600 dark:text-indigo-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="h-4 w-4" />
                    <span>จัดการผู้ใช้</span>
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {users.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToSection('payment')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    activeSection === 'payment' && !isProductModalOpen
                      ? 'bg-indigo-600/15 dark:bg-[#1e1b4b]/90 text-indigo-600 dark:text-indigo-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Wallet className="h-4 w-4" />
                    <span>ตั้งค่าผู้รับเงิน</span>
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Bottom User Profile matching screenshot */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 p-3">
            <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  V
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Vghh Vvgg
                  </div>
                  <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                    safgg19042565@gmail.com
                  </div>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area: 100% Full Width & Height */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Bar matching reference screenshot */}
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-md px-3.5 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 w-full">
          {/* Left: Sidebar Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="สลับแถบเมนูด้านข้าง"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">จัดการร้าน</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" />
              {isProductModalOpen ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProductModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    จัดการสินค้า
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
                  </span>
                </>
              ) : activeSection === 'categories' && isCategoryStudioOpen ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryStudioOpen(false);
                      setEditingCategory(null);
                    }}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    หมวดหมู่สินค้า
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                  </span>
                </>
              ) : activeSection === 'orders' && isOrderStudioOpen ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrderStudioOpen(false);
                      setEditingOrder(null);
                    }}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    คำสั่งซื้อ
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {editingOrder ? 'ตรวจสอบคำสั่งซื้อ' : 'สร้างคำสั่งซื้อใหม่'}
                  </span>
                </>
              ) : activeSection === 'users' && isUserStudioOpen ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserStudioOpen(false);
                      setEditingUser(null);
                    }}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    จัดการผู้ใช้
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {editingUser ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มผู้ใช้ใหม่'}
                  </span>
                </>
              ) : (
                <span className="font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  {activeSection === 'dashboard'
                    ? 'ภาพรวม'
                    : activeSection === 'categories'
                    ? 'หมวดหมู่สินค้า'
                    : activeSection === 'orders'
                    ? 'คำสั่งซื้อ'
                    : activeSection === 'users'
                    ? 'จัดการผู้ใช้'
                    : activeSection === 'payment'
                    ? 'ตั้งค่าผู้รับเงิน'
                    : 'จัดการสินค้า'}
                </span>
              )}
            </nav>
          </div>

          {/* Right: Global Search, Theme Switcher, Profile Avatar */}
          <div className="flex items-center gap-2.5">
            <div className="relative hidden sm:block w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsProductModalOpen(false);
                  if (activeSection === 'dashboard') {
                    setActiveSection('products');
                  }
                }}
                placeholder="ค้นหา... "
                aria-label="ค้นหาสินค้าด่วน"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-[#121215] pl-8 pr-12 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-zinc-300 dark:border-zinc-700/80 bg-zinc-200/60 dark:bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                ⌘K
              </kbd>
            </div>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="สลับโหมดสีมืดและสว่าง"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              V
            </div>
          </div>
        </header>

        {/* Main Workspace Viewport: Stretches 100% Full-Screen on Desktop & Mobile */}
        <main className="flex-1 w-full max-w-none min-h-[calc(100vh-3.5rem)] flex flex-col px-3 py-3.5 sm:px-5 sm:py-5 lg:px-6 lg:py-5 pb-20 lg:pb-6 space-y-4">
          {toastMessage && (
            <div
              role="status"
              className="fixed bottom-16 lg:bottom-5 right-4 lg:right-5 z-40 flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/90 bg-white dark:bg-[#16161b] px-4 py-3 text-xs font-medium text-zinc-900 dark:text-zinc-100 shadow-xl"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {isProductModalOpen ? (
            <ProductFormModal
              isOpen={isProductModalOpen}
              editingProduct={editingProduct}
              onClose={() => {
                setIsProductModalOpen(false);
                setEditingProduct(null);
              }}
              onSave={handleSaveProduct}
            />
          ) : activeSection === 'categories' ? (
            <CategoryManagementView
              categories={categories}
              products={products}
              onUpdateCategories={setCategories}
              onShowToast={showToast}
              isStudioOpen={isCategoryStudioOpen}
              setIsStudioOpen={setIsCategoryStudioOpen}
              editingCategory={editingCategory}
              setEditingCategory={setEditingCategory}
            />
          ) : activeSection === 'orders' ? (
            <OrdersManagementView
              orders={orders}
              products={products}
              onUpdateOrders={setOrders}
              onShowToast={showToast}
              isStudioOpen={isOrderStudioOpen}
              setIsStudioOpen={setIsOrderStudioOpen}
              editingOrder={editingOrder}
              setEditingOrder={setEditingOrder}
            />
          ) : activeSection === 'users' ? (
            <UserManagementView
              users={users}
              onUpdateUsers={setUsers}
              onShowToast={showToast}
              isStudioOpen={isUserStudioOpen}
              setIsStudioOpen={setIsUserStudioOpen}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
            />
          ) : activeSection === 'payment' ? (
            <PayeeSettingsView
              settings={payeeSettings}
              onSaveSettings={setPayeeSettings}
              onShowToast={showToast}
            />
          ) : activeSection === 'dashboard' ? (
            <DashboardOverview
              metrics={metrics}
              products={products}
              onNavigateToProducts={(st = 'all') => {
                setStatusFilter(st);
                setActiveSection('products');
              }}
              onExportCsv={handleExportCsv}
            />
          ) : (
            <>
              {/* Page Title & Action Buttons with Professional UI Icons */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    จัดการสินค้า
                  </h1>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    แสดงภาพสินค้า ราคา และระบบนับสต็อกจากจำนวนบรรทัดอัตโนมัติ (1 บรรทัด = สินค้า 1 ชิ้น)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHtmlModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors whitespace-nowrap shrink-0"
                  >
                    <FileCode2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>โค้ด HTML 1 ไฟล์</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors whitespace-nowrap shrink-0"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
                    <span>ส่งออก CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors whitespace-nowrap shrink-0 shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>เพิ่มสินค้าใหม่</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Summary Cards with Crisp Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="text-left rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>สินค้าทั้งหมด</span>
                    <Boxes className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {metrics.totalProducts}
                  </div>
                  <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    พร้อมจำหน่าย {metrics.activeCount} รายการ
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    ซ่อนจากหน้าร้าน {metrics.hiddenCount} รายการ
                  </div>
                </button>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>สต็อกพร้อมส่ง (1 บรรทัด = 1 ชิ้น)</span>
                    <KeyRound className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {metrics.totalStockUnits.toLocaleString()}
                  </div>
                  <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    จำนวนบรรทัดสินค้าคงเหลือในคลัง
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    ตัดส่งทีละ 1 บรรทัดตามลำดับอัตโนมัติ
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === 'low_stock' ? 'out_of_stock' : 'low_stock'
                    )
                  }
                  className="text-left rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>ต้องเติมสต็อก</span>
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-amber-500 dark:text-amber-400">
                    {metrics.lowStockCount + metrics.outOfStockCount}
                  </div>
                  <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    รายการที่ใกล้หมดหรือหมดสต็อก
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    ใกล้หมด {metrics.lowStockCount} · สินค้าหมด {metrics.outOfStockCount} รายการ
                  </div>
                </button>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>มูลค่าสต็อกในร้าน</span>
                    <Wallet className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    ฿{metrics.totalInventoryValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    มูลค่าสินค้าคงคลังตามราคาขาย
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    ยอดขายสะสมรวม ฿{metrics.totalRevenue.toLocaleString('th-TH')}
                  </div>
                </div>
              </div>

              {/* Filter & Search Control Panel with Professional UI Icons */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4 space-y-3.5">
                {/* Top Row: Segmented Status Filter Tabs + View Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800/90 bg-zinc-100/80 dark:bg-[#0b0b0e] p-1"
                    role="tablist"
                    aria-label="กรองตามสถานะสินค้า"
                  >
                    {(
                      [
                        { id: 'all', label: 'ทั้งหมด', count: metrics.totalProducts, Icon: Layers },
                        {
                          id: 'active',
                          label: 'พร้อมจำหน่าย',
                          count: metrics.activeCount,
                          Icon: CheckCircle2,
                        },
                        {
                          id: 'low_stock',
                          label: 'สต็อกใกล้หมด',
                          count: metrics.lowStockCount,
                          Icon: AlertTriangle,
                        },
                        {
                          id: 'out_of_stock',
                          label: 'สินค้าหมด',
                          count: metrics.outOfStockCount,
                          Icon: XCircle,
                        },
                        {
                          id: 'hidden',
                          label: 'ซ่อนจากร้าน',
                          count: metrics.hiddenCount,
                          Icon: EyeOff,
                        },
                      ] as const
                    ).map((tab) => {
                      const active = statusFilter === tab.id;
                      const TabIcon = tab.Icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setStatusFilter(tab.id)}
                          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            active
                              ? 'bg-white dark:bg-[#1e1b4b] text-zinc-900 dark:text-indigo-200 shadow-2xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          <TabIcon className="h-3.5 w-3.5 opacity-80" />
                          <span>{tab.label}</span>
                          <span className="font-mono text-[11px] opacity-75">({tab.count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Controls: Featured filter, Reset, View Mode with Icons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOnlyFeatured(!onlyFeatured)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        onlyFeatured
                          ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#151519] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      <span>เฉพาะสินค้าแนะนำ</span>
                    </button>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#151519] px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>ล้างตัวกรอง</span>
                      </button>
                    )}

                    <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-[#0b0b0e] p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        aria-label="มุมมองตาราง"
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
                          viewMode === 'table'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                        }`}
                      >
                        <LayoutList className="h-3.5 w-3.5" />
                        <span>ตาราง</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        aria-label="มุมมองการ์ด"
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span>การ์ด</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Second Row: Search Input, Category Select, Delivery Type Select, Sort Select with Icons */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                  <div className="relative md:col-span-5">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="ค้นหาชื่อสินค้า, รหัส SKU, หรือคำอธิบาย..."
                      aria-label="ค้นหารายการสินค้า"
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="relative md:col-span-3">
                    <FolderKanban className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <select
                      aria-label="กรองตามหมวดหมู่สินค้า"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] pl-8 pr-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'ทั้งหมด' ? 'หมวดหมู่: ทั้งหมด' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative md:col-span-2">
                    <Zap className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <select
                      aria-label="กรองตามรูปแบบการจัดส่ง"
                      value={deliveryFilter}
                      onChange={(e) => setDeliveryFilter(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] pl-8 pr-2.5 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="all">การจัดส่ง: ทั้งหมด</option>
                      {Object.entries(DELIVERY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative md:col-span-2">
                    <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <select
                      aria-label="เรียงลำดับสินค้า"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] pl-8 pr-2.5 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="updated_desc">เรียง: อัปเดตล่าสุด</option>
                      <option value="sales_desc">เรียง: ขายดีที่สุด</option>
                      <option value="stock_asc">เรียง: สต็อกน้อยไปมาก</option>
                      <option value="price_asc">เรียง: ราคาต่ำไปสูง</option>
                      <option value="price_desc">เรียง: ราคาสูงไปต่ำ</option>
                    </select>
                  </div>
                </div>

                {/* Contextual Bulk Action Bar when products are selected */}
                {selectedIds.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-2 font-medium text-indigo-700 dark:text-indigo-200">
                      <CheckSquare className="h-4 w-4 text-indigo-400" />
                      <span>เลือกแล้ว {selectedIds.length} รายการ</span>
                      <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        className="underline opacity-80 hover:opacity-100"
                      >
                        ยกเลิกการเลือก
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBulkAddStock(5)}
                        className="inline-flex items-center gap-1 rounded-md border border-indigo-500/40 bg-white/80 dark:bg-[#14141a] px-2.5 py-1 font-medium text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800"
                      >
                        <Plus className="h-3.5 w-3.5 text-indigo-400" />
                        <span>เติมสต็อก +5 บรรทัด</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkToggleVisibility(false)}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-[#14141a] px-2.5 py-1 font-medium text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>เปิดแสดงหน้าร้าน</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkToggleVisibility(true)}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-[#14141a] px-2.5 py-1 font-medium text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>ซ่อนที่เลือก</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-medium text-rose-600 dark:text-rose-300 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>ลบที่เลือก</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Empty State if no products match filter */}
              {filteredProducts.length === 0 ? (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] py-16 px-6 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161a] text-zinc-400">
                    <Package className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    ลองเปลี่ยนคำค้นหา เลือกหมวดหมู่อื่น หรือล้างตัวกรองเพื่อดูสินค้าทั้งหมดในร้าน
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>ล้างตัวกรองทั้งหมด</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setIsProductModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-white dark:text-zinc-950"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>เพิ่มสินค้าใหม่</span>
                    </button>
                  </div>
                </div>
              ) : viewMode === 'table' ? (
                /* Minimalist Designer Product Table with Product Images, 1-Line = 1-Piece Stock & Rich UI Icons */
                <div className="flex-1 flex flex-col justify-between w-full rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800/90 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-[#141418]/60">
                          <th className="py-3 pl-4 pr-2 w-8">
                            <button
                              type="button"
                              onClick={handleSelectAllFiltered}
                              aria-label="เลือกสินค้าทั้งหมดในหน้านี้"
                              className="flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                              {selectedIds.length === filteredProducts.length &&
                              filteredProducts.length > 0 ? (
                                <CheckSquare className="h-4 w-4 text-indigo-400" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-2.5">สินค้า · รูปภาพและรหัส SKU</th>
                          <th className="py-3 px-2 whitespace-nowrap">หมวดหมู่</th>
                          <th className="py-3 px-2 text-right whitespace-nowrap">ราคาขาย / ทุน</th>
                          <th className="py-3 px-2 whitespace-nowrap">
                            สต็อก (1 บรรทัด = 1 ชิ้น)
                          </th>
                          <th className="py-3 px-2 whitespace-nowrap">สถานะ · ยอดขาย</th>
                          <th className="py-3 px-2 whitespace-nowrap">เผยแพร่บริการ</th>
                          <th className="py-3 pl-2 pr-4 text-right whitespace-nowrap">
                            จัดการ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70 text-xs">
                        {filteredProducts.map((product) => {
                          const status = getProductStatus(product);
                          const isSelected = selectedIds.includes(product.id);
                          const profitPerUnit = Math.max(0, product.price - product.cost);
                          const firstLinePreview =
                            product.stockKeys[0] || 'ไม่มีบรรทัดสต็อกคงเหลือ';
                          const isPublished = !product.isHidden;

                          return (
                            <tr
                              key={product.id}
                              className={`transition-colors ${
                                isSelected
                                  ? 'bg-indigo-500/5 dark:bg-indigo-950/20'
                                  : 'hover:bg-zinc-50/80 dark:hover:bg-white/[0.02]'
                              }`}
                            >
                              <td className="py-3.5 pl-4 pr-2 align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSelectRow(product.id)}
                                  aria-label={`เลือกสินค้า ${product.name}`}
                                  className="flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                                  ) : (
                                    <Square className="h-4 w-4" />
                                  )}
                                </button>
                              </td>

                              {/* Product Image + Name + SKU */}
                              <td className="py-3.5 px-2.5 align-middle max-w-[225px]">
                                <div className="flex items-center gap-3">
                                  <ProductThumbnail product={product} size="md" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                                      <span className="truncate">{product.name}</span>
                                      {product.featured && (
                                        <Star className="h-3 w-3 text-amber-400 shrink-0 fill-amber-400/20" />
                                      )}
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                      <span className="font-mono text-zinc-400 dark:text-zinc-300">
                                        {product.sku}
                                      </span>
                                      <span>·</span>
                                      <span className="truncate">{product.subtitle}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category with Icon */}
                              <td className="py-3.5 px-2 align-middle whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                                <div className="text-xs">{product.category}</div>
                                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
                                  <KeyRound className="h-3 w-3 text-indigo-400/80" />
                                  <span>ส่งทีละ 1 บรรทัด</span>
                                </div>
                              </td>

                              {/* Price & Cost */}
                              <td className="py-3.5 px-2 align-middle text-right whitespace-nowrap">
                                <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                                  ฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="mt-0.5 inline-flex items-center justify-end gap-1 font-mono text-[11px] text-zinc-500">
                                  <TrendingUp className="h-3 w-3 text-emerald-400/80" />
                                  <span>+฿{profitPerUnit}</span>
                                </div>
                              </td>

                              {/* Stock: 1 Line = 1 Piece with First Line Preview & Icon Stepper */}
                              <td className="py-3.5 px-2 align-middle whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <div className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b]">
                                    <button
                                      type="button"
                                      onClick={() => handleAdjustStock(product.id, -1)}
                                      aria-label={`ลดสต็อก ${product.name}`}
                                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span
                                      className={`px-1.5 font-mono text-xs font-semibold ${
                                        product.stock === 0
                                          ? 'text-rose-500 dark:text-rose-400'
                                          : product.stock <= product.lowStockThreshold
                                          ? 'text-amber-500 dark:text-amber-400'
                                          : 'text-zinc-900 dark:text-zinc-100'
                                      }`}
                                    >
                                      {product.stock} ชิ้น
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleAdjustStock(product.id, 1)}
                                      aria-label={`เพิ่มสต็อก ${product.name}`}
                                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <span className="font-mono text-[11px] text-zinc-500">
                                    ({product.stockKeys.length} บรรทัด)
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center gap-1 font-mono text-[10.5px] text-zinc-500 max-w-[140px]">
                                  <Terminal className="h-3 w-3 shrink-0 text-zinc-500" />
                                  <span className="truncate">{firstLinePreview}</span>
                                </div>
                              </td>

                              {/* Status & Sales Count with Professional Icons */}
                              <td className="py-3.5 px-2 align-middle whitespace-nowrap">
                                <div>
                                  {status === 'active' && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                      <span>{getStatusLabel(status)}</span>
                                    </span>
                                  )}
                                  {status === 'low_stock' && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                      <span>{getStatusLabel(status)}</span>
                                    </span>
                                  )}
                                  {status === 'out_of_stock' && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                                      <XCircle className="h-3.5 w-3.5 shrink-0" />
                                      <span>{getStatusLabel(status)}</span>
                                    </span>
                                  )}
                                  {status === 'hidden' && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                      <EyeOff className="h-3.5 w-3.5 shrink-0" />
                                      <span>{getStatusLabel(status)}</span>
                                    </span>
                                  )}
                                </div>
                                <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                                  <ShoppingBag className="h-3 w-3 text-zinc-500" />
                                  <span>{product.soldCount.toLocaleString()} ชิ้น</span>
                                </div>
                              </td>

                              {/* Dedicated Publish Service Sliding Toggle Switch Column */}
                              <td className="py-3.5 px-2 align-middle whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isPublished}
                                    aria-label={`สวิตช์เปิดปิดบริการเผยแพร่ ${product.name}`}
                                    onClick={() => handleToggleVisibility(product.id)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                                      isPublished
                                        ? 'bg-emerald-500 hover:bg-emerald-400'
                                        : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                                        isPublished ? 'translate-x-4.5' : 'translate-x-0.5'
                                      }`}
                                    />
                                  </button>
                                  <div className="leading-tight">
                                    <div
                                      className={`text-[11px] font-semibold ${
                                        isPublished
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-zinc-500 dark:text-zinc-400'
                                      }`}
                                    >
                                      {isPublished ? 'เปิดบริการ' : 'ปิดพัก'}
                                    </div>
                                    <div className="text-[10px] text-zinc-500">
                                      {isPublished ? 'เผยแพร่แล้ว' : 'ซ่อนชั่วคราว'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Action Buttons with Crisp Professional UI Icons */}
                              <td className="py-3.5 pl-2 pr-4 align-middle text-right whitespace-nowrap">
                                <div className="inline-flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setStockModalProduct(product)}
                                    aria-label={`จัดการคีย์สต็อก ${product.name}`}
                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] px-2 py-1 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
                                  >
                                    <KeyRound className="h-3 w-3 text-indigo-400" />
                                    <span>สต็อก</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setIsProductModalOpen(true);
                                    }}
                                    aria-label={`แก้ไข ${product.name}`}
                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] px-2 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                    <span>แก้ไข</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateProduct(product)}
                                    aria-label={`ทำสำเนา ${product.name}`}
                                    title="ทำสำเนาสินค้า"
                                    className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    aria-label={`ลบ ${product.name}`}
                                    title="ลบสินค้า"
                                    className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] text-zinc-500 dark:text-zinc-400 hover:border-rose-500/40 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800/80 px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <div>
                      แสดงผล{' '}
                      <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        {filteredProducts.length}
                      </span>{' '}
                      จากทั้งหมด{' '}
                      <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        {products.length}
                      </span>{' '}
                      รายการ · สต็อก 1 บรรทัด = สินค้า 1 ชิ้น
                    </div>
                    <div className="font-mono text-[11px]">
                      อัปเดตข้อมูลล่าสุด: 08/11/2026 · เวลาไทย
                    </div>
                  </div>
                </div>
              ) : (
                /* Minimalist Grid Card View with Product Thumbnails & Icons */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => {
                    const status = getProductStatus(product);
                    return (
                      <div
                        key={product.id}
                        className="flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              <ProductThumbnail product={product} size="lg" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                                  <span className="font-mono">{product.sku}</span>
                                  <span>·</span>
                                  <span className="truncate">{product.category}</span>
                                </div>
                                <h3 className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                  {product.name}
                                </h3>
                              </div>
                            </div>

                            {/* Publish Service Toggle Switch in Card View */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={!product.isHidden}
                                aria-label={`สวิตช์เปิดปิดบริการเผยแพร่ ${product.name}`}
                                onClick={() => handleToggleVisibility(product.id)}
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                                  !product.isHidden
                                    ? 'bg-emerald-500'
                                    : 'bg-zinc-300 dark:bg-zinc-700'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                                    !product.isHidden ? 'translate-x-4.5' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-[10px] font-medium ${
                                  !product.isHidden
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {!product.isHidden ? 'เปิดบริการ' : 'ปิดพัก'}
                              </span>
                            </div>
                          </div>

                          <p className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                            {product.subtitle}
                          </p>

                          {/* Preview 1 line = 1 piece */}
                          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#0c0c0f] px-3 py-2 font-mono text-[11px] text-zinc-500">
                            <Terminal className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                            <span className="truncate">
                              ชิ้นที่ 1: {product.stockKeys[0] || 'ไม่มีสต็อกในบรรทัด'}
                            </span>
                          </div>

                          <div className="mt-3.5 flex items-baseline justify-between border-t border-zinc-100 dark:border-zinc-800/70 pt-3">
                            <div>
                              <div className="text-[11px] text-zinc-500">ราคาจำหน่าย</div>
                              <div className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                ฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[11px] text-zinc-500">
                                สต็อก (1 บรรทัด = 1 ชิ้น)
                              </div>
                              <div className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {product.stock} ชิ้น · {getStatusLabel(status)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800/70 pt-3">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(product.id, -1)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(product.id, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setStockModalProduct(product)}
                              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] px-2.5 py-1.5 text-xs font-medium hover:border-indigo-500/50"
                            >
                              <KeyRound className="h-3 w-3 text-indigo-400" />
                              <span>สต็อก</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(product);
                                setIsProductModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>แก้ไข</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              aria-label={`ลบ ${product.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>

        {/* Mobile Full-Width Bottom Quick Navigation Bar (< lg) */}
        <nav
          aria-label="เมนูทางลัดบนมือถือ"
          className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-6 border-t border-zinc-200 dark:border-zinc-800/90 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md px-1 py-1.5 lg:hidden"
        >
          {(
            [
              { id: 'dashboard', label: 'แดชบอร์ด', Icon: LayoutGrid },
              { id: 'products', label: 'สินค้า', Icon: Package },
              { id: 'categories', label: 'หมวดหมู่', Icon: FolderKanban },
              { id: 'orders', label: 'คำสั่งซื้อ', Icon: ShoppingBag },
              { id: 'users', label: 'ผู้ใช้', Icon: Users },
              { id: 'payment', label: 'ผู้รับเงิน', Icon: Wallet },
            ] as const
          ).map((item) => {
            const active = activeSection === item.id && !isProductModalOpen;
            const NavIcon = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateToSection(item.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? 'text-indigo-500 dark:text-indigo-300 font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <NavIcon className="h-4 w-4" />
                <span className="truncate max-w-full px-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Stock & Keys Manager Modal (1 Line = 1 Piece) */}
      <StockKeysModal
        product={stockModalProduct}
        onClose={() => setStockModalProduct(null)}
        onUpdateStockAndKeys={handleUpdateStockAndKeys}
      />

      {/* 1-File HTML Code Viewer / Downloader Modal */}
      <SingleFileHtmlModal
        isOpen={isHtmlModalOpen}
        products={products}
        onClose={() => setIsHtmlModalOpen(false)}
      />
    </div>
  );
}
