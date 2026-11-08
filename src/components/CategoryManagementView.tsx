import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  EyeOff,
  Star,
  Layers,
  Gamepad2,
  Sparkles,
  Zap,
  Server,
  Ticket,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Save,
  Boxes,
  KeyRound,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Highlighter,
  List,
  Eraser,
  SlidersHorizontal,
  Eye,
  Tag,
  Image as ImageIcon,
  Upload,
  Link2,
  LayoutList,
  LayoutGrid,
  X,
} from 'lucide-react';
import {
  CategoryItem,
  CategoryIconType,
  CategoryStatusFilter,
  CATEGORY_IMAGE_PRESETS,
  calculateCategoryMetrics,
  filterAndSortCategories,
} from '../utils/storeAdminLogic';
import { ProductItem } from '../utils/productLogic';

interface CategoryManagementViewProps {
  categories: CategoryItem[];
  products: ProductItem[];
  onUpdateCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  onShowToast: (msg: string) => void;
  isStudioOpen: boolean;
  setIsStudioOpen: (open: boolean) => void;
  editingCategory: CategoryItem | null;
  setEditingCategory: (cat: CategoryItem | null) => void;
}

const ICON_OPTIONS: { id: CategoryIconType; label: string; Icon: React.ElementType }[] = [
  { id: 'gamepad', label: 'เกม & สตรีมมิ่ง', Icon: Gamepad2 },
  { id: 'sparkles', label: 'ซอฟต์แวร์ & ครีเอทีฟ', Icon: Sparkles },
  { id: 'zap', label: 'เติมเกม API ด่วน', Icon: Zap },
  { id: 'server', label: 'คลาวด์ & เซิร์ฟเวอร์', Icon: Server },
  { id: 'ticket', label: 'บัตรเติมเงิน & คูปอง', Icon: Ticket },
];

export const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({
  categories,
  products,
  onUpdateCategories,
  onShowToast,
  isStudioOpen,
  setIsStudioOpen,
  editingCategory,
  setEditingCategory,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CategoryStatusFilter>('all');
  const [sortBy, setSortBy] = useState<'order_asc' | 'updated_desc' | 'name_asc'>('order_asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Studio Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [iconType, setIconType] = useState<CategoryIconType>('gamepad');
  const [sortOrder, setSortOrder] = useState('1');
  const [badgeText, setBadgeText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const metrics = useMemo(
    () => calculateCategoryMetrics(categories, products),
    [categories, products]
  );

  const filteredCategories = useMemo(
    () =>
      filterAndSortCategories(categories, {
        search,
        status: statusFilter,
        sortBy,
      }),
    [categories, search, statusFilter, sortBy]
  );

  useEffect(() => {
    if (!isStudioOpen) return;
    if (editingCategory) {
      setName(editingCategory.name);
      setCode(editingCategory.code);
      setSlug(editingCategory.slug);
      setSubtitle(editingCategory.subtitle);
      setImageUrl(editingCategory.imageUrl || CATEGORY_IMAGE_PRESETS[0].url);
      setDescriptionHtml(editingCategory.descriptionHtml);
      setIconType(editingCategory.iconType);
      setSortOrder(String(editingCategory.sortOrder));
      setBadgeText(editingCategory.badgeText);
      setIsActive(editingCategory.isActive);
      setIsFeatured(editingCategory.isFeatured);
      setFormError(null);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = editingCategory.descriptionHtml;
        }
      }, 0);
    } else {
      const nextOrd = categories.length + 1;
      const defaultDesc =
        '<p>หมวดหมู่สินค้าดิจิทัล <strong>จัดส่งอัตโนมัติ (1 บรรทัด = 1 ชิ้น)</strong> พร้อมรับประกันคุณภาพทุกออเดอร์</p>';
      setName('');
      setCode(`CAT-0${nextOrd}`);
      setSlug('');
      setSubtitle('');
      setImageUrl(CATEGORY_IMAGE_PRESETS[0].url);
      setDescriptionHtml(defaultDesc);
      setIconType('gamepad');
      setSortOrder(String(nextOrd));
      setBadgeText('หมวดหมู่แนะนำ');
      setIsActive(true);
      setIsFeatured(false);
      setFormError(null);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = defaultDesc;
        }
      }, 0);
    }
  }, [isStudioOpen, editingCategory, categories.length]);

  const execDescCommand = (cmd: string, val?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    setDescriptionHtml(editorRef.current.innerHTML);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        onShowToast(`อัปโหลดรูปภาพ "${file.name}" สำหรับหมวดหมู่เรียบร้อย`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleToggleActive = (id: string) => {
    onUpdateCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = !c.isActive;
        onShowToast(
          next
            ? `เปิดแสดงหมวดหมู่ "${c.name}" บนหน้าร้านแล้ว`
            : `ซ่อนหมวดหมู่ "${c.name}" จากหน้าร้านชั่วคราวแล้ว`
        );
        return { ...c, isActive: next, updatedAt: '08/11/2026 12:05' };
      })
    );
  };

  const handleMoveSortOrder = (id: string, delta: number) => {
    onUpdateCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, sortOrder: Math.max(1, c.sortOrder + delta), updatedAt: '08/11/2026 12:05' }
          : c
      )
    );
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    onUpdateCategories((prev) => prev.filter((c) => c.id !== cat.id));
    onShowToast(`ลบหมวดหมู่ "${cat.name}" ออกจากระบบแล้ว`);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setFormError('กรุณากรอกชื่อหมวดหมู่และรหัสหมวดหมู่ให้ครบถ้วน');
      return;
    }

    const payload: Omit<CategoryItem, 'id'> = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      slug:
        slug.trim().toLowerCase() ||
        name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
      subtitle: subtitle.trim() || 'หมวดหมู่สินค้าดิจิทัลพร้อมส่งทันที',
      imageUrl: imageUrl.trim(),
      descriptionHtml,
      iconType,
      sortOrder: Math.max(1, Number(sortOrder) || 1),
      badgeText: badgeText.trim() || 'พร้อมส่ง',
      isActive,
      isFeatured,
      updatedAt: '08/11/2026 12:06',
    };

    if (editingCategory) {
      onUpdateCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, ...payload } : c))
      );
      onShowToast(`บันทึกการแก้ไขหมวดหมู่ "${payload.name}" เรียบร้อย`);
    } else {
      const created: CategoryItem = {
        ...payload,
        id: `cat-${Date.now()}`,
      };
      onUpdateCategories((prev) => [...prev, created]);
      onShowToast(`เพิ่มหมวดหมู่ใหม่ "${payload.name}" เรียบร้อยแล้ว`);
    }

    setIsStudioOpen(false);
    setEditingCategory(null);
  };

  const getCategoryIcon = (type: CategoryIconType) => {
    const found = ICON_OPTIONS.find((o) => o.id === type);
    return found ? found.Icon : FolderKanban;
  };

  // ============================================================================
  // IN-PAGE CATEGORY STUDIO (Keeps Sidebar & Topbar visible)
  // ============================================================================
  if (isStudioOpen) {
    const PreviewIcon = getCategoryIcon(iconType);
    return (
      <form onSubmit={handleSaveCategory} className="w-full flex-1 flex flex-col space-y-5 pb-10">
        {/* Studio Header */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111114] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                setIsStudioOpen(false);
                setEditingCategory(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b] px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ย้อนกลับ</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                <span>สตูดิโอจัดการหมวดหมู่สินค้า & รูปภาพปก</span>
                <span>·</span>
                <span className="font-mono text-indigo-500 dark:text-indigo-400">{code}</span>
              </div>
              <h1 className="truncate text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {editingCategory
                  ? `แก้ไขหมวดหมู่: ${editingCategory.name}`
                  : 'สร้างหมวดหมู่สินค้าใหม่เข้าสู่หน้าร้าน'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              onClick={() => setIsActive(!isActive)}
              className={`cursor-pointer inline-flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all select-none ${
                isActive
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                  : 'border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsActive(!isActive);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  isActive ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                    isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span>{isActive ? 'เปิดแสดงหมวดหมู่' : 'ซ่อนหมวดหมู่ชั่วคราว'}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsStudioOpen(false);
                setEditingCategory(null);
              }}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>บันทึกหมวดหมู่</span>
            </button>
          </div>
        </div>

        {formError && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-400">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Columns */}
          <div className="lg:col-span-8 space-y-5">
            {/* Section 1: Category Identity */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/70 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      1. ข้อมูลหมวดหมู่และไอคอนประจำหมวด
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      ตั้งชื่อหมวดหมู่ รหัสอ้างอิง Slug และเลือกไอคอนแสดงผลหน้าร้าน
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">CATEGORY IDENTITY</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ชื่อหมวดหมู่สินค้า <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น คีย์เกม & สตรีมมิ่ง"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    รหัสหมวดหมู่ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ลำดับการแสดงผล
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    คำโปรยย่อใต้หมวดหมู่ (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="เช่น ส่งรหัสอัตโนมัติทันทีตลอด 24 ชั่วโมง"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="game-keys-streaming"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <Tag className="h-3.5 w-3.5 text-indigo-400" />
                    <span>ป้ายกำกับเด่น (Badge)</span>
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="เช่น ยอดนิยมอันดับ 1"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  เลือกไอคอนประจำหมวดหมู่
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {ICON_OPTIONS.map((opt) => {
                    const active = iconType === opt.id;
                    const OptIcon = opt.Icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setIconType(opt.id)}
                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs transition-all ${
                          active
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-200 font-semibold'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                        }`}
                      >
                        <OptIcon className="h-4 w-4" />
                        <span className="truncate text-[11px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Section 2: Category Image Upload, URL & Studio Presets */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/70 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      2. รูปภาพปกหมวดหมู่สินค้า (Category Cover & Thumbnail)
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      อัปโหลดรูปภาพจากเครื่อง วางลิงก์รูปภาพ URL หรือเลือกจากคลังภาพสตูดิโอสำเร็จรูป
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>อัปโหลดรูปจากเครื่อง</span>
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b] px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-400 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>ลบรูป</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Image URL Input + Current Image Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-4">
                  <div className="relative h-28 w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name || 'รูปภาพหมวดหมู่'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-zinc-500">
                        <PreviewIcon className="h-6 w-6 text-indigo-400" />
                        <span className="text-[11px]">ยังไม่ได้ใส่รูปภาพหมวดหมู่</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-black/70 text-indigo-300 backdrop-blur-xs">
                      <PreviewIcon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-8 space-y-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <Link2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>ลิงก์รูปภาพหมวดหมู่ (Image URL หรือ Data URL)</span>
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/category-banner.jpg หรือกดอัปโหลดจากเครื่อง"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    รองรับไฟล์ JPG, PNG, WebP หรือคลิกเลือกภาพปกสตูดิโอสำเร็จรูปด้านล่างได้ทันที
                  </p>
                </div>
              </div>

              {/* Studio Category Presets */}
              <div>
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  คลังภาพปกหมวดหมู่ระดับสตูดิโอ (คลิกเพื่อเลือกใช้ทันที)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORY_IMAGE_PRESETS.map((preset) => {
                    const selected = imageUrl === preset.url;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                          selected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="h-16 w-full overflow-hidden bg-zinc-900">
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-2 bg-zinc-50 dark:bg-[#0b0b0e] flex items-center justify-between gap-1">
                          <span className="truncate text-[10.5px] font-medium text-zinc-700 dark:text-zinc-300">
                            {preset.label}
                          </span>
                          {selected && (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Section 3: Rich Text Description Editor */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    3. รายละเอียดหมวดหมู่สินค้า (Rich Text Editor)
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500">รองรับตัวหนา ขีดเส้นใต้ และไฮไลท์สี</span>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-[#09090b]">
                <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-[#141418] px-2.5 py-2">
                  <button
                    type="button"
                    onClick={() => execDescCommand('bold')}
                    title="ตัวหนา"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execDescCommand('italic')}
                    title="ตัวเอียง"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execDescCommand('underline')}
                    title="ขีดเส้นใต้"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execDescCommand('strikeThrough')}
                    title="ขีดฆ่า"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Strikethrough className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-1" />
                  <button
                    type="button"
                    onClick={() => execDescCommand('foreColor', '#34d399')}
                    className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-emerald-500 hover:bg-emerald-500/10"
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span>สีเขียว</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => execDescCommand('hiliteColor', '#312e81')}
                    className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                    <span>ไฮไลท์</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => execDescCommand('insertUnorderedList')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execDescCommand('removeFormat')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Eraser className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => {
                    if (editorRef.current) {
                      setDescriptionHtml(editorRef.current.innerHTML);
                    }
                  }}
                  className="min-h-[120px] p-4 text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 focus:outline-none [&_u]:underline [&_u]:decoration-indigo-400 [&_ul]:list-disc [&_ul]:pl-5"
                />
              </div>
            </section>
          </div>

          {/* Right 4 Columns: Switches & Live Category Card Preview with Cover Image */}
          <div className="lg:col-span-4 space-y-5">
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-3.5">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/70 pb-3">
                <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  สวิตช์ควบคุมการแสดงผลหมวดหมู่
                </h3>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0b0b0e] p-3.5">
                <div className="pr-3">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    เปิดแสดงหมวดหมู่บนหน้าร้าน
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    ลูกค้าสามารถคลิกเลือกกรองสินค้าตามหมวดหมู่นี้ได้
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    isActive ? 'bg-emerald-500' : 'bg-zinc-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0b0b0e] p-3.5">
                <div className="pr-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    <span>ปักหมุดเป็นหมวดหมู่แนะนำ</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    แสดงแบนเนอร์เด่นด้านบนสุดของหน้าแรก
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFeatured}
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    isFeatured ? 'bg-indigo-500' : 'bg-zinc-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      isFeatured ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Live Storefront Category Card Preview with Cover Image */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/70 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    ตัวอย่างการ์ดหมวดหมู่หน้าร้าน
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">LIVE PREVIEW</span>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b]">
                {/* Cover Image Banner */}
                <div className="relative h-36 w-full overflow-hidden bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name || 'ตัวอย่างรูปหมวดหมู่'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-950/60 to-zinc-950">
                      <PreviewIcon className="h-10 w-10 text-indigo-400/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="rounded-md border border-indigo-400/40 bg-black/70 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold text-indigo-300">
                      {badgeText || 'พร้อมส่ง'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 backdrop-blur-xs">
                      <PreviewIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-white">
                          {name || 'ชื่อหมวดหมู่สินค้า'}
                        </span>
                        {isFeatured && (
                          <Star className="h-3.5 w-3.5 shrink-0 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <div className="font-mono text-[10.5px] text-zinc-300">
                        /{slug || 'category-slug'} · ลำดับ #{sortOrder || 1}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {subtitle || 'คำโปรยหมวดหมู่สินค้าดิจิทัลพร้อมส่งทันที'}
                  </p>

                  <div
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#121216] p-3 text-[11px] text-zinc-600 dark:text-zinc-300 [&_u]:underline [&_strong]:text-zinc-900 dark:[&_strong]:text-white"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    );
  }

  // ============================================================================
  // CATEGORY LIST & TABLE / CARD GRID VIEW
  // ============================================================================
  return (
    <div className="w-full flex-1 flex flex-col space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            จัดการหมวดหมู่สินค้าและรูปภาพปก
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            แสดงรูปภาพปกหมวดหมู่ จัดลำดับการแสดงผลหน้าร้าน และสวิตช์เปิด-ปิดการเผยแพร่รายหมวดหมู่
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsStudioOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>เพิ่มหมวดหมู่ใหม่ (พร้อมรูปภาพ)</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>หมวดหมู่ทั้งหมด</span>
            <FolderKanban className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {metrics.totalCategories}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            เปิดแสดงผล {metrics.activeCategories} หมวดหมู่
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            ซ่อนชั่วคราว {metrics.hiddenCategories} หมวดหมู่
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>สินค้าที่ผูกกับหมวดหมู่</span>
            <Boxes className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {metrics.totalLinkedProducts}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            เชื่อมโยงกับคลังสินค้าอัตโนมัติ
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            แยกตามประเภทบริการและคีย์ดิจิทัล
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>สต็อกรวมทุกหมวดหมู่</span>
            <KeyRound className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-500 dark:text-emerald-400">
            {metrics.totalCategoryStockUnits} ชิ้น
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            นับตามจำนวนบรรทัดจริง (1 บรรทัด = 1 ชิ้น)
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            พร้อมตัดส่งอัตโนมัติทันทีหลังชำระเงิน
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>รูปภาพปกหมวดหมู่</span>
            <ImageIcon className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {categories.filter((c) => Boolean(c.imageUrl)).length} / {categories.length}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            หมวดหมู่ที่มีภาพปกแสดงผลหน้าร้าน
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            รองรับการอัปโหลดรูปและลิงก์ URL
          </div>
        </div>
      </div>

      {/* Filter & Search Bar + View Switcher */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800/90 bg-zinc-100/80 dark:bg-[#0b0b0e] p-1"
            role="tablist"
            aria-label="กรองตามสถานะหมวดหมู่"
          >
            {(
              [
                { id: 'all', label: 'ทั้งหมด', count: metrics.totalCategories, Icon: Layers },
                {
                  id: 'active',
                  label: 'เปิดแสดงผล',
                  count: metrics.activeCategories,
                  Icon: CheckCircle2,
                },
                {
                  id: 'featured',
                  label: 'หมวดหมู่แนะนำ',
                  count: metrics.featuredCategories,
                  Icon: Star,
                },
                {
                  id: 'hidden',
                  label: 'ซ่อนชั่วคราว',
                  count: metrics.hiddenCategories,
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
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
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

          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-[#0b0b0e] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
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
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>การ์ดรูปภาพ</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="relative md:col-span-8">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหมวดหมู่, รหัส CAT, Slug หรือคำโปรย..."
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0f] pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'order_asc' | 'updated_desc' | 'name_asc')
              }
              aria-label="เรียงลำดับหมวดหมู่"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0f] px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value="order_asc">เรียง: ลำดับการแสดงผล (1 → 9)</option>
              <option value="updated_desc">เรียง: อัปเดตล่าสุด</option>
              <option value="name_asc">เรียง: ชื่อหมวดหมู่ (ก → ฮ)</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Category Table with Category Cover Thumbnails */
        <div className="flex-1 flex flex-col justify-between w-full rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0d0d10] text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  <th className="py-3 px-3">ลำดับ</th>
                  <th className="py-3 px-3">หมวดหมู่สินค้า · รูปภาพปกและคำอธิบาย</th>
                  <th className="py-3 px-2.5">ป้ายกำกับ (Badge)</th>
                  <th className="py-3 px-2.5 text-right">จำนวนสินค้า · สต็อกรวม</th>
                  <th className="py-3 px-2.5">เผยแพร่หมวดหมู่</th>
                  <th className="py-3 px-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/60 text-xs">
                {filteredCategories.map((cat) => {
                  const CatIcon = getCategoryIcon(cat.iconType);
                  const linkedProducts = products.filter((p) => p.category === cat.name);
                  const linkedStock = linkedProducts.reduce((sum, p) => sum + p.stock, 0);

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* Sort Order Stepper */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] p-1">
                          <button
                            type="button"
                            onClick={() => handleMoveSortOrder(cat.id, -1)}
                            aria-label={`เลื่อนลำดับ ${cat.name} ขึ้น`}
                            className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <span className="font-mono text-xs font-bold px-1.5 text-zinc-800 dark:text-zinc-200">
                            #{cat.sortOrder}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveSortOrder(cat.id, 1)}
                            aria-label={`เลื่อนลำดับ ${cat.name} ลง`}
                            className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      {/* Category Image Thumbnail + Name & Subtitle */}
                      <td className="py-3 px-3 max-w-[340px]">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900">
                            {cat.imageUrl ? (
                              <img
                                src={cat.imageUrl}
                                alt={cat.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-indigo-500/10 text-indigo-400">
                                <CatIcon className="h-5 w-5" />
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-md bg-black/75 text-indigo-300 border border-white/10">
                              <CatIcon className="h-3 w-3" />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                                {cat.name}
                              </span>
                              {cat.isFeatured && (
                                <Star className="h-3 w-3 shrink-0 text-amber-400 fill-amber-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 truncate mt-0.5">
                              <span className="font-mono text-zinc-400">{cat.code}</span>
                              <span>·</span>
                              <span className="truncate">{cat.subtitle}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Badge */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                          <Tag className="h-3 w-3 text-indigo-400" />
                          <span>{cat.badgeText}</span>
                        </span>
                      </td>

                      {/* Linked Products & Stock Count */}
                      <td className="py-3 px-2.5 text-right whitespace-nowrap">
                        <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          {linkedProducts.length} สินค้า
                        </div>
                        <div className="text-[11px] text-emerald-500 dark:text-emerald-400 font-mono">
                          สต็อกรวม {linkedStock} ชิ้น (บรรทัด)
                        </div>
                      </td>

                      {/* Publish Toggle Switch */}
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={cat.isActive}
                            aria-label={`สวิตช์เปิดปิดหมวดหมู่ ${cat.name}`}
                            onClick={() => handleToggleActive(cat.id)}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                              cat.isActive ? 'bg-emerald-500' : 'bg-zinc-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                                cat.isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          <div className="leading-tight">
                            <div
                              className={`text-[11px] font-semibold ${
                                cat.isActive ? 'text-emerald-400' : 'text-zinc-400'
                              }`}
                            >
                              {cat.isActive ? 'เปิดแสดงผล' : 'ซ่อนหมวดหมู่'}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {cat.isActive ? 'แสดงหน้าร้าน' : 'ปิดพักชั่วคราว'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsStudioOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161a] px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Edit3 className="h-3 w-3 text-indigo-400" />
                            <span>แก้ไข / รูปภาพ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            aria-label={`ลบหมวดหมู่ ${cat.name}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#0d0d10] px-4 py-3 text-[11px] text-zinc-500">
            <span>แสดงผล {filteredCategories.length} จากทั้งหมด {categories.length} หมวดหมู่</span>
            <span>อัปเดตข้อมูลล่าสุด: 08/11/2026 · เวลาไทย</span>
          </div>
        </div>
      ) : (
        /* Category Visual Cover Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const CatIcon = getCategoryIcon(cat.iconType);
            const linkedProducts = products.filter((p) => p.category === cat.name);
            const linkedStock = linkedProducts.reduce((sum, p) => sum + p.stock, 0);

            return (
              <div
                key={cat.id}
                className="flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div>
                  {/* Cover Banner */}
                  <div className="relative h-36 w-full overflow-hidden bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-indigo-950/40">
                        <CatIcon className="h-10 w-10 text-indigo-400/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-md bg-black/70 border border-white/15 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
                        #{cat.sortOrder} · {cat.code}
                      </span>
                      <span className="rounded-md border border-indigo-400/40 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 backdrop-blur-xs">
                        {cat.badgeText}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 backdrop-blur-xs">
                        <CatIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="truncate text-sm font-bold text-white">{cat.name}</h3>
                          {cat.isFeatured && (
                            <Star className="h-3.5 w-3.5 shrink-0 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                        <div className="font-mono text-[10.5px] text-zinc-300 truncate">
                          /{cat.slug}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {cat.subtitle}
                    </p>
                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/70 pt-3 text-xs">
                      <div>
                        <div className="text-[11px] text-zinc-500">สินค้าในหมวดหมู่</div>
                        <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {linkedProducts.length} รายการ
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-zinc-500">สต็อกพร้อมส่งรวม</div>
                        <div className="font-mono font-bold text-emerald-500 dark:text-emerald-400">
                          {linkedStock} ชิ้น (บรรทัด)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/70 px-4 py-3 bg-zinc-50/40 dark:bg-[#0d0d10]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={cat.isActive}
                      onClick={() => handleToggleActive(cat.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                        cat.isActive ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          cat.isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                      {cat.isActive ? 'เปิดแสดงผล' : 'ซ่อนชั่วคราว'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsStudioOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#16161a] px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Edit3 className="h-3 w-3 text-indigo-400" />
                      <span>แก้ไข / รูปภาพ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-400"
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
    </div>
  );
};
