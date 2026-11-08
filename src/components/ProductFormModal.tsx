import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  Tag,
  Barcode,
  FolderKanban,
  DollarSign,
  AlertTriangle,
  KeyRound,
  Check,
  Save,
  Star,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Trash2,
  ShieldCheck,
  TrendingUp,
  Layers,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  BellRing,
  ShoppingBag,
  Terminal,
  Percent,
  Wallet,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Highlighter,
  Link2,
  Minus as DividerIcon,
  Eraser,
  Undo2,
  Redo2,
  FileCode,
  Wand2,
  Palette,
} from 'lucide-react';
import {
  ProductItem,
  ProductFormInput,
  DeliveryType,
  CATEGORIES,
  DELIVERY_LABELS,
  PRODUCT_IMAGE_PRESETS,
  validateProductForm,
  parseStockKeys,
} from '../utils/productLogic';

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: ProductItem | null;
  onClose: () => void;
  onSave: (data: Omit<ProductItem, 'id' | 'soldCount' | 'updatedAt'>, existingId?: string) => void;
}

const selectableCategories = CATEGORIES.filter((c) => c !== 'ทั้งหมด');

const DEFAULT_RICH_HTML = `<h3><strong>รายละเอียดบริการและการรับประกันสินค้า</strong></h3>
<p>สินค้าดิจิทัลพร้อมส่งทันทีผ่านระบบอัตโนมัติ <u><strong>รับประกันตลอดอายุการใช้งาน</strong></u> (1 บรรทัด = สินค้า 1 ชิ้น)</p>
<ul>
  <li>จัดส่งรหัสคีย์ / บัญชีทันทีหลังชำระเงินสำเร็จภายใน <strong>3 วินาที</strong></li>
  <li>มีระบบ <u>พินล็อกจอส่วนตัว</u> และคู่มือการใช้งานภาษาไทยครบถ้วน</li>
  <li>หากพบปัญหาการใช้งาน สามารถกดเคลมรหัสใหม่ผ่านระบบอัตโนมัติได้ทันที 24 ชม.</li>
</ul>`;

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  editingProduct,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<ProductFormInput>({
    name: '',
    sku: '',
    subtitle: '',
    imageUrl: PRODUCT_IMAGE_PRESETS[0].url,
    category: 'คีย์เกม & สตรีมมิ่ง',
    price: '',
    cost: '',
    stock: '0',
    lowStockThreshold: '3',
    deliveryType: 'auto_key',
    isHidden: false,
    featured: false,
    stockKeysRaw: '',
  });

  // Extended studio settings
  const [compareAtPrice, setCompareAtPrice] = useState<string>('159');
  const [badgeText, setBadgeText] = useState<string>('ส่งไวอัตโนมัติ 24 ชม.');
  const [richDescriptionHtml, setRichDescriptionHtml] = useState<string>(DEFAULT_RICH_HTML);
  const [editorSourceMode, setEditorSourceMode] = useState<boolean>(false);
  const [minOrder, setMinOrder] = useState<string>('1');
  const [maxOrder, setMaxOrder] = useState<string>('10');
  const [autoWarranty, setAutoWarranty] = useState<boolean>(true);
  const [lowStockNotify, setLowStockNotify] = useState<boolean>(true);
  const [quickSingleLine, setQuickSingleLine] = useState<string>('');
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setQuickSingleLine('');
    setEditorSourceMode(false);
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        sku: editingProduct.sku,
        subtitle: editingProduct.subtitle,
        imageUrl: editingProduct.imageUrl || PRODUCT_IMAGE_PRESETS[0].url,
        category: editingProduct.category,
        price: String(editingProduct.price),
        cost: String(editingProduct.cost),
        stock: String(editingProduct.stock),
        lowStockThreshold: String(editingProduct.lowStockThreshold),
        deliveryType: editingProduct.deliveryType,
        isHidden: editingProduct.isHidden,
        featured: editingProduct.featured,
        stockKeysRaw: editingProduct.stockKeys.join('\n'),
      });
      setCompareAtPrice(String(Math.round(editingProduct.price * 1.35)));
      const initialHtml = `<h3><strong>${editingProduct.name}</strong></h3>
<p>${editingProduct.subtitle} — <u><strong>พร้อมส่งอัตโนมัติทันทีตลอด 24 ชั่วโมง</strong></u></p>
<ul>
  <li>รหัสอ้างอิงสินค้า: <code>${editingProduct.sku}</code> (${editingProduct.category})</li>
  <li>ระบบตัดส่งสต็อกแบบ <u>1 บรรทัด = สินค้า 1 ชิ้น</u> ไม่ซ้ำกันแน่นอน</li>
  <li>รับประกันสินค้าเต็มจำนวนตามเงื่อนไขร้าน CYBERAPI</li>
</ul>`;
      setRichDescriptionHtml(initialHtml);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = initialHtml;
        }
      }, 0);
    } else {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setForm({
        name: '',
        sku: `CYB-PRD-${randomNum}`,
        subtitle: '',
        imageUrl: PRODUCT_IMAGE_PRESETS[0].url,
        category: 'คีย์เกม & สตรีมมิ่ง',
        price: '',
        cost: '',
        stock: '3',
        lowStockThreshold: '3',
        deliveryType: 'auto_key',
        isHidden: false,
        featured: false,
        stockKeysRaw: 'ITEM-KEY-001\nITEM-KEY-002\nITEM-KEY-003',
      });
      setCompareAtPrice('');
      setRichDescriptionHtml(DEFAULT_RICH_HTML);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = DEFAULT_RICH_HTML;
        }
      }, 0);
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const parsedKeys = parseStockKeys(form.stockKeysRaw || '');
  const effectiveStock =
    form.deliveryType === 'auto_key' || form.deliveryType === 'account'
      ? parsedKeys.length
      : Number(form.stock) || 0;

  const numericPrice = Math.max(0, Number(form.price) || 0);
  const numericCost = Math.max(0, Number(form.cost) || 0);
  const numericCompare = Math.max(0, Number(compareAtPrice) || 0);
  const profitPerUnit = numericPrice - numericCost;
  const profitMarginPercent =
    numericPrice > 0 ? Math.round((profitPerUnit / numericPrice) * 100) : 0;
  const totalStockValue = numericPrice * effectiveStock;
  const totalEstimatedProfit = Math.max(0, profitPerUnit) * effectiveStock;

  // Rich Text Editor Commands
  const syncEditorToState = () => {
    if (editorRef.current) {
      setRichDescriptionHtml(editorRef.current.innerHTML);
    }
  };

  const execRichCommand = (command: string, value?: string) => {
    if (editorSourceMode) return;
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString().length > 0;

    if (!hasSelection && ['bold', 'italic', 'underline', 'strikeThrough'].includes(command)) {
      const sampleMap: Record<string, string> = {
        bold: '<strong>ข้อความตัวหนา</strong> ',
        italic: '<em>ข้อความตัวเอียง</em> ',
        underline: '<u>ข้อความขีดเส้นใต้</u> ',
        strikeThrough: '<s>ข้อความขีดฆ่า</s> ',
      };
      document.execCommand('insertHTML', false, sampleMap[command]);
    } else {
      document.execCommand(command, false, value);
    }
    syncEditorToState();
  };

  const insertRichSnippet = (htmlSnippet: string) => {
    if (editorSourceMode) {
      setRichDescriptionHtml((prev) => `${prev}\n${htmlSnippet}`);
      return;
    }
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand('insertHTML', false, htmlSnippet);
    syncEditorToState();
  };

  const handleToggleSourceMode = () => {
    if (!editorSourceMode) {
      syncEditorToState();
      setEditorSourceMode(true);
    } else {
      setEditorSourceMode(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = richDescriptionHtml;
        }
      }, 0);
    }
  };

  const handleGenerateSku = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const prefix =
      form.category.includes('เกม')
        ? 'CYB-GAME'
        : form.category.includes('ซอฟต์แวร์')
        ? 'CYB-SOFT'
        : form.category.includes('คลาวด์')
        ? 'CYB-VPS'
        : 'CYB-ITEM';
    setForm({ ...form, sku: `${prefix}-${rand}` });
  };

  const handleAddSingleLine = () => {
    const trimmed = quickSingleLine.trim();
    if (!trimmed) return;
    const nextRaw = form.stockKeysRaw?.trim()
      ? `${form.stockKeysRaw.trim()}\n${trimmed}`
      : trimmed;
    setForm({ ...form, stockKeysRaw: nextRaw });
    setQuickSingleLine('');
  };

  const handleGenerateSampleKeys = (count: number) => {
    const skuPrefix = (form.sku || 'CYB-KEY').trim().toUpperCase();
    const samples: string[] = [];
    for (let i = 0; i < count; i++) {
      const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg2 = Math.floor(1000 + Math.random() * 9000);
      samples.push(`${skuPrefix}-${seg1}-${seg2}`);
    }
    const nextRaw = form.stockKeysRaw?.trim()
      ? `${form.stockKeysRaw.trim()}\n${samples.join('\n')}`
      : samples.join('\n');
    setForm({ ...form, stockKeysRaw: nextRaw });
  };

  const handleDeduplicateLines = () => {
    const clean = parseStockKeys(form.stockKeysRaw || '');
    setForm({ ...form, stockKeysRaw: clean.join('\n') });
  };

  const handleRemoveLineAt = (idx: number) => {
    const next = parsedKeys.filter((_, i) => i !== idx);
    setForm({ ...form, stockKeysRaw: next.join('\n') });
  };

  const handleCopyAllLines = async () => {
    try {
      await navigator.clipboard.writeText(parsedKeys.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // ignore clipboard restriction
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProductForm({
      ...form,
      stock: effectiveStock,
      cost: form.cost === '' ? 0 : form.cost,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSave(
      {
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        subtitle: form.subtitle.trim() || 'จัดส่งอัตโนมัติทันทีหลังชำระเงิน',
        imageUrl: form.imageUrl?.trim() || PRODUCT_IMAGE_PRESETS[0].url,
        category: form.category,
        price: Number(form.price),
        cost: form.cost === '' ? 0 : Number(form.cost),
        stock: effectiveStock,
        lowStockThreshold: Math.max(1, Number(form.lowStockThreshold) || 3),
        deliveryType: form.deliveryType,
        isHidden: form.isHidden,
        featured: form.featured,
        stockKeys: parsedKeys,
      },
      editingProduct?.id
    );
  };

  const plainCharCount = richDescriptionHtml.replace(/<[^>]*>/g, '').trim().length;

  return (
    <div
      className="w-full flex-1 flex flex-col space-y-5"
      role="region"
      aria-labelledby="product-modal-title"
    >
      {/* In-Page Studio Action Header (keeps Left Sidebar & Topbar visible!) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4 sm:p-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="กลับหน้าจัดการสินค้า"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b] px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ย้อนกลับ</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>สตูดิโอจัดการสินค้า</span>
              <span>·</span>
              <span className="font-mono text-indigo-500 dark:text-indigo-400">
                {form.sku || 'NEW-SKU'}
              </span>
            </div>
            <h1
              id="product-modal-title"
              className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate"
            >
              {editingProduct ? `แก้ไขสินค้า: ${editingProduct.name}` : 'เพิ่มสินค้าใหม่เข้าคลัง'}
            </h1>
          </div>
        </div>

        {/* Right: Publish Switch + Cancel + Save */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b] px-3.5 py-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={!form.isHidden}
              aria-label="สวิตช์เปิดปิดบริการเผยแพร่หน้าร้าน"
              onClick={() => setForm({ ...form, isHidden: !form.isHidden })}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                !form.isHidden ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                  !form.isHidden ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span
              className={`text-xs font-semibold ${
                !form.isHidden
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {!form.isHidden ? 'เปิดบริการเผยแพร่' : 'ปิดพักบริการชั่วคราว'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#16161b] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            form="full-product-studio-form"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>{editingProduct ? 'บันทึกการแก้ไขทั้งหมด' : 'บันทึกสินค้าใหม่'}</span>
          </button>
        </div>
      </div>

      {/* Main In-Page Form Workspace */}
      <form id="full-product-studio-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Top 4 Live KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>ราคาจำหน่าย / ชิ้น</span>
              <DollarSign className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">
              ฿{numericPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">
              ต้นทุน ฿{numericCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ต่อชิ้น
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>กำไรสุทธิต่อชิ้น (Margin)</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div
              className={`mt-1.5 font-mono text-xl font-bold ${
                profitPerUnit >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-500 dark:text-rose-400'
              }`}
            >
              {profitPerUnit >= 0 ? '+' : ''}฿{profitPerUnit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
              <Percent className="h-3 w-3 text-emerald-400" />
              <span>คิดเป็นอัตรากำไร {profitMarginPercent}%</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>สต็อกพร้อมขาย (1 บรรทัด = 1 ชิ้น)</span>
              <KeyRound className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {effectiveStock} ชิ้น{' '}
              <span className="text-xs font-normal text-zinc-500">({parsedKeys.length} บรรทัด)</span>
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">
              แจ้งเตือนเมื่อต่ำกว่า {form.lowStockThreshold || 3} ชิ้น
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>มูลค่าสต็อกรวม / กำไรรวม</span>
              <Wallet className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">
              ฿{totalStockValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
              กำไรรวมทั้งล็อต +฿{totalEstimatedProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* 12-Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 8 COLUMNS */}
          <div className="lg:col-span-8 space-y-5">
            {/* SECTION 1: General Product Identity + Rich Text Formatting Studio */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      1. ข้อมูลสินค้า & เครื่องมือแต่งรายละเอียดขั้นสูง (Rich Text Studio)
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      กำหนดชื่อ รหัส SKU และจัดรูปแบบข้อความ (ตัวหนา ขีดเส้นใต้ ไฮไลท์สี รายการหัวข้อ) ได้เหมือนโปรแกรมแต่งเว็บมืออาชีพ
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">STEP 01 / 04</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label
                    htmlFor="product-name"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <Tag className="h-3.5 w-3.5 text-indigo-400" />
                    <span>
                      ชื่อสินค้า <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="เช่น Netflix Ultra HD 4K (จอส่วนตัว 30 วัน)"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
                </div>

                <div className="md:col-span-4">
                  <label
                    htmlFor="product-sku"
                    className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <span className="flex items-center gap-1.5">
                      <Barcode className="h-3.5 w-3.5 text-indigo-400" />
                      <span>
                        รหัส SKU <span className="text-rose-500">*</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-500 dark:text-indigo-400 hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>สุ่มรหัส</span>
                    </button>
                  </label>
                  <input
                    id="product-sku"
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="CYB-NF-4K30"
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                  {errors.sku && <p className="mt-1 text-xs text-rose-400">{errors.sku}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="product-category"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <FolderKanban className="h-3.5 w-3.5 text-indigo-400" />
                    <span>
                      หมวดหมู่สินค้า <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <select
                    id="product-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  >
                    {selectableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="product-badge"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>ป้ายกำกับไฮไลท์ (Badge มุมการ์ดสินค้า)</span>
                  </label>
                  <input
                    id="product-badge"
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="เช่น ส่งไวใน 10 วินาที · ประกันครบ 30 วัน"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="product-subtitle"
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  <span>คำโปรยสั้น (แสดงใต้ชื่อสินค้าในตารางสต็อก)</span>
                </label>
                <input
                  id="product-subtitle"
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="เช่น รับประกันตลอดอายุการใช้งาน · มีพินล็อกจอส่วนตัว"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* INTERACTIVE RICH TEXT EDITOR STUDIO */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>รายละเอียดสินค้าฉบับเต็ม & เงื่อนไขบริการ (Rich Text Editor)</span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="font-mono">{plainCharCount} ตัวอักษร</span>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={handleToggleSourceMode}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium transition-colors ${
                        editorSourceMode
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <FileCode className="h-3 w-3" />
                      <span>{editorSourceMode ? 'ดูโหมดแสดงผลจริง' : 'ดูโค้ด HTML'}</span>
                    </button>
                  </div>
                </div>

                {/* Rich Text Editor Container */}
                <div className="rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] overflow-hidden">
                  {/* Top Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-[#141419] px-2.5 py-2">
                    {/* Text Style Group: Bold, Italic, Underline, Strikethrough */}
                    <button
                      type="button"
                      onClick={() => execRichCommand('bold')}
                      title="ตัวหนา (Bold)"
                      aria-label="ตัวหนา"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('italic')}
                      title="ตัวเอียง (Italic)"
                      aria-label="ตัวเอียง"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('underline')}
                      title="ขีดเส้นใต้ (Underline)"
                      aria-label="ขีดเส้นใต้"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Underline className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('strikeThrough')}
                      title="ขีดฆ่า (Strikethrough)"
                      aria-label="ขีดฆ่า"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Strikethrough className="h-3.5 w-3.5" />
                    </button>

                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

                    {/* Headings */}
                    <button
                      type="button"
                      onClick={() => execRichCommand('formatBlock', 'H2')}
                      title="หัวข้อใหญ่ H2"
                      className="flex h-7 px-1.5 items-center justify-center rounded-md font-mono text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Heading2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('formatBlock', 'H3')}
                      title="หัวข้อย่อย H3"
                      className="flex h-7 px-1.5 items-center justify-center rounded-md font-mono text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Heading3 className="h-3.5 w-3.5" />
                    </button>

                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

                    {/* Color & Highlight Accents */}
                    <button
                      type="button"
                      onClick={() =>
                        insertRichSnippet(
                          '<span style="color:#34d399;font-weight:600;"><u>ไฮไลท์สีเขียวพรีเมียม</u></span> '
                        )
                      }
                      title="ข้อความสีเขียว"
                      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-emerald-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Palette className="h-3 w-3" />
                      <span>สีเขียว</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichSnippet(
                          '<span style="background:rgba(99,102,241,0.22);color:#c7d2fe;padding:2px 6px;border-radius:4px;">ข้อความเน้นไฮไลท์</span> '
                        )
                      }
                      title="ป้ายไฮไลท์ข้อความ"
                      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-indigo-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Highlighter className="h-3 w-3" />
                      <span>ไฮไลท์</span>
                    </button>

                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

                    {/* Lists & Blocks */}
                    <button
                      type="button"
                      onClick={() => execRichCommand('insertUnorderedList')}
                      title="รายการแบบจุด (Bullet List)"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('insertOrderedList')}
                      title="รายการแบบตัวเลข (Numbered List)"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichSnippet(
                          '<blockquote style="border-left:3px solid #6366f1;padding-left:10px;margin:6px 0;color:#a1a1aa;">หมายเหตุสำคัญ: กรุณาห้ามเปลี่ยนรหัสผ่านบัญชีหลักเพื่อรักษาสิทธิ์ประกัน</blockquote>'
                        )
                      }
                      title="แทรกกล่องคำเตือน/หมายเหตุ"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Quote className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichSnippet(
                          '<code>KEY-FORMAT-XXXX</code> '
                        )
                      }
                      title="แทรกบล็อกโค้ด"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Code className="h-3.5 w-3.5" />
                    </button>

                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

                    {/* Alignment */}
                    <button
                      type="button"
                      onClick={() => execRichCommand('justifyLeft')}
                      title="ชิดซ้าย"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <AlignLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('justifyCenter')}
                      title="กึ่งกลาง"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <AlignCenter className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('justifyRight')}
                      title="ชิดขวา"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <AlignRight className="h-3.5 w-3.5" />
                    </button>

                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

                    {/* Divider, Link, Undo/Redo, Clear Formatting */}
                    <button
                      type="button"
                      onClick={() => execRichCommand('insertHorizontalRule')}
                      title="แทรกเส้นคั่นบรรทัด"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <DividerIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichSnippet(
                          '<a href="https://cybershop.carwraman.shop" style="color:#818cf8;text-decoration:underline;">ลิงก์คู่มือการใช้งาน</a> '
                        )
                      }
                      title="แทรกลิงก์คู่มือ"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('undo')}
                      title="ย้อนกลับ (Undo)"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('redo')}
                      title="ทำซ้ำ (Redo)"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Redo2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execRichCommand('removeFormat')}
                      title="ล้างการจัดรูปแบบข้อความ"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Eraser className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Quick Smart Template Insertion Bar */}
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50 dark:bg-[#101014] px-3 py-1.5 text-[11px]">
                    <span className="text-zinc-500 font-medium mr-1">แทรกเทมเพลตด่วน:</span>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichSnippet(
                          `<p><u><strong>เงื่อนไขการรับประกันสินค้า:</strong></u> รับประกันตลอดอายุแพ็กเกจ หากเข้าใช้งานไม่ได้เคลมรหัสใหม่ฟรีทันที</p>`
                        )
                      }
                      className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#17171c] px-2 py-0.5 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/50 transition-colors"
                    >
                      + เงื่อนไขรับประกัน
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichSnippet(
                          `<p><u><strong>ขั้นตอนการรับสินค้า:</strong></u> ระบบส่งข้อมูลให้ทันทีในหน้าประวัติการสั่งซื้อ (ตัดสต็อกทีละ 1 บรรทัด)</p>`
                        )
                      }
                      className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#17171c] px-2 py-0.5 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/50 transition-colors"
                    >
                      + ขั้นตอนรับของ
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichSnippet(
                          `<p><span style="color:#fbbf24;"><strong>⚠️ ข้อควรระวัง:</strong></span> <u>ห้ามแก้ไขรหัสผ่านหรือข้อมูลความปลอดภัยในบัญชี</u> เพื่อรักษาสิทธิ์การรับประกัน</p>`
                        )
                      }
                      className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#17171c] px-2 py-0.5 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/50 transition-colors"
                    >
                      + ข้อควรระวัง
                    </button>
                  </div>

                  {/* Editable Canvas or Raw HTML Source */}
                  {editorSourceMode ? (
                    <textarea
                      rows={6}
                      value={richDescriptionHtml}
                      onChange={(e) => setRichDescriptionHtml(e.target.value)}
                      className="w-full font-mono text-xs leading-6 bg-zinc-950 text-emerald-300 p-4 focus:outline-none"
                    />
                  ) : (
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={syncEditorToState}
                      aria-label="พื้นที่พิมพ์รายละเอียดสินค้าแบบจัดรูปแบบได้"
                      className="min-h-[150px] max-h-[280px] overflow-y-auto p-4 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 focus:outline-none [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_u]:underline [&_u]:decoration-indigo-400 [&_u]:underline-offset-4 [&_code]:font-mono [&_code]:bg-zinc-200 dark:[&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
                    />
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 2: Studio Product Image & Media Gallery */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      2. รูปภาพสินค้าและแกลเลอรีสตูดิโอ
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      เลือกรูปภาพสตูดิโอความละเอียดสูง หรือวางลิงก์รูปภาพสินค้าของคุณเอง
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">STEP 02 / 04</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#0c0c0f] p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-900">
                  <img
                    src={form.imageUrl || PRODUCT_IMAGE_PRESETS[0].url}
                    alt={form.name || 'ตัวอย่างรูปสินค้า'}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  <label
                    htmlFor="product-image-url"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                    <span>ลิงก์รูปภาพสินค้า (Image URL / Local Asset Path)</span>
                  </label>
                  <input
                    id="product-image-url"
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://... หรือคลิกเลือกรูปจากแกลเลอรีด้านล่าง"
                    className="w-full font-mono text-xs rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#121216] px-3.5 py-2 text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRODUCT_IMAGE_PRESETS.map((preset) => {
                  const selected = form.imageUrl === preset.url;
                  return (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: preset.url })}
                      className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5'
                          : 'border-zinc-200 dark:border-zinc-800/90 bg-zinc-50 dark:bg-[#141418] hover:border-zinc-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="relative h-20 w-full overflow-hidden bg-zinc-900">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {selected && (
                          <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {preset.label}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {selected ? 'กำลังใช้งานรูปนี้' : 'คลิกเพื่อเลือกใช้'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: Pricing, Cost, Margin & Order Limits */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      3. โครงสร้างราคา ต้นทุน และจำกัดจำนวนสั่งซื้อ
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      ตั้งราคาขายจริง ราคาป้ายลดราคา ต้นทุนต่อชิ้น และจำนวนการสั่งซื้อต่อครั้ง
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">STEP 03 / 04</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="product-price"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    <span>
                      ราคาขายจริง (฿) <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="99.00"
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                  {errors.price && <p className="mt-1 text-xs text-rose-400">{errors.price}</p>}
                </div>

                <div>
                  <label
                    htmlFor="product-compare-price"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <Tag className="h-3.5 w-3.5 text-zinc-400" />
                    <span>ราคาปกติก่อนลด (฿ ขีดฆ่า)</span>
                  </label>
                  <input
                    id="product-compare-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="159.00"
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-cost"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                    <span>ต้นทุนรับมาต่อชิ้น (฿)</span>
                  </label>
                  <input
                    id="product-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="62.00"
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                  {errors.cost && <p className="mt-1 text-xs text-rose-400">{errors.cost}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label
                    htmlFor="product-threshold"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span>เตือนสต็อกใกล้หมดเมื่อต่ำกว่า (ชิ้น)</span>
                  </label>
                  <input
                    id="product-threshold"
                    type="number"
                    min="1"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-min-order"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                    <span>จำนวนซื้อขั้นต่ำ / ออเดอร์</span>
                  </label>
                  <input
                    id="product-min-order"
                    type="number"
                    min="1"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-max-order"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                    <span>จำนวนซื้อสูงสุด / ออเดอร์</span>
                  </label>
                  <input
                    id="product-max-order"
                    type="number"
                    min="1"
                    value={maxOrder}
                    onChange={(e) => setMaxOrder(e.target.value)}
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 4: 1-Line = 1-Piece Stock & Delivery Engine */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      4. ระบบจัดการสต็อกรายบรรทัด (1 บรรทัด = สินค้า 1 ชิ้น)
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      วางคีย์เกม รหัสบัตร หรือบัญชีผู้ใช้บรรทัดละ 1 ชิ้น ระบบจะตัดส่งบรรทัดบนสุดให้ลูกค้าอัตโนมัติ
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-indigo-500 dark:text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg">
                  รวมสต็อก {parsedKeys.length} ชิ้น ({parsedKeys.length} บรรทัด)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(Object.keys(DELIVERY_LABELS) as DeliveryType[]).map((type) => {
                  const active = form.deliveryType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, deliveryType: type })}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                        active
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="truncate pr-2">{DELIVERY_LABELS[type]}</span>
                      {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Quick 1-Line Adder */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Terminal className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-400" />
                  <input
                    type="text"
                    value={quickSingleLine}
                    onChange={(e) => setQuickSingleLine(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSingleLine();
                      }
                    }}
                    placeholder="พิมพ์รหัสคีย์ หรือ user:pass เพื่อเพิ่มทีละ 1 บรรทัด (กด Enter ได้เลย)..."
                    className="w-full font-mono text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] pl-9 pr-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSingleLine}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shrink-0"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>+ เพิ่ม 1 บรรทัด</span>
                </button>
              </div>

              {/* Stock Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateSampleKeys(3)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#15151a] px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>สุ่มเพิ่ม +3 บรรทัด</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeduplicateLines}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#15151a] px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                    <span>ตัดบรรทัดซ้ำ/ว่างออก</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyAllLines}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#15151a] px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {copiedAll ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    <span>{copiedAll ? 'คัดลอกแล้ว' : 'คัดลอกทั้งหมด'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, stockKeysRaw: '' })}
                  className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>ล้างสต็อกทั้งหมด</span>
                </button>
              </div>

              {/* Split View: Raw Multi-line Editor + Individual Line Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    โหมดวางข้อมูลหลายบรรทัด (1 บรรทัด = 1 ชิ้น):
                  </div>
                  <textarea
                    rows={7}
                    value={form.stockKeysRaw}
                    onChange={(e) => setForm({ ...form, stockKeysRaw: e.target.value })}
                    placeholder="บรรทัดที่ 1: รหัสคีย์ หรือ user:pass ชิ้นที่ 1&#10;บรรทัดที่ 2: รหัสคีย์ หรือ user:pass ชิ้นที่ 2"
                    className="w-full font-mono text-xs leading-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] p-3.5 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    รายการแยกตามลำดับการจัดส่ง ({parsedKeys.length} ชิ้น):
                  </div>
                  <div className="h-[188px] overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] p-2.5 space-y-1.5">
                    {parsedKeys.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-xs text-zinc-500 p-4">
                        <KeyRound className="h-5 w-5 text-zinc-600 mb-1.5" />
                        <span>ยังไม่มีบรรทัดสต็อก (0 ชิ้น)</span>
                      </div>
                    ) : (
                      parsedKeys.map((line, index) => (
                        <div
                          key={`studio-line-${index}`}
                          className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800/90 bg-white dark:bg-[#131318] px-3 py-1.5 font-mono text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 shrink-0">
                              #{String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="truncate text-zinc-800 dark:text-zinc-200">
                              {line}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLineAt(index)}
                            className="text-zinc-400 hover:text-rose-400 shrink-0"
                            title="ลบบรรทัดนี้"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT 4 COLUMNS: Service Switches + Live Storefront Preview with Formatted Rich Text */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 space-y-3.5">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  สวิตช์ควบคุมการเผยแพร่และบริการ
                </h2>
              </div>

              {/* Switch 1: Publish Service */}
              <div
                onClick={() => setForm({ ...form, isHidden: !form.isHidden })}
                className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-colors ${
                  !form.isHidden
                    ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141418]'
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {!form.isHidden ? (
                      <Eye className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    <span>บริการเผยแพร่หน้าร้าน</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {!form.isHidden
                      ? 'เปิดขายและแสดงให้ลูกค้าสั่งซื้อได้ทันที'
                      : 'ปิดพักการขายและซ่อนจากหน้าร้านชั่วคราว'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!form.isHidden}
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm({ ...form, isHidden: !form.isHidden });
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    !form.isHidden ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      !form.isHidden ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Switch 2: Featured Product */}
              <div
                onClick={() => setForm({ ...form, featured: !form.featured })}
                className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-colors ${
                  form.featured
                    ? 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141418]'
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    <span>ปักหมุดสินค้าแนะนำ (Featured)</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    แสดงดาวแนะนำและดันขึ้นแถวบนของหมวดหมู่
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.featured}
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm({ ...form, featured: !form.featured });
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    form.featured ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      form.featured ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Switch 3: Auto Warranty */}
              <div
                onClick={() => setAutoWarranty(!autoWarranty)}
                className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141418] p-3.5 cursor-pointer"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                    <span>เคลมคีย์เสียอัตโนมัติ (Auto-Replace)</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    ดึงบรรทัดถัดไปทดแทนเมื่อตรวจพบคีย์มีปัญหา
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoWarranty}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAutoWarranty(!autoWarranty);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    autoWarranty ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      autoWarranty ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Switch 4: Low Stock Alert */}
              <div
                onClick={() => setLowStockNotify(!lowStockNotify)}
                className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141418] p-3.5 cursor-pointer"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <BellRing className="h-3.5 w-3.5 text-amber-400" />
                    <span>แจ้งเตือนเมื่อสต็อกใกล้หมด</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    เตือนเมื่อเหลือน้อยกว่า {form.lowStockThreshold || 3} บรรทัด
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={lowStockNotify}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLowStockNotify(!lowStockNotify);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    lowStockNotify ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      lowStockNotify ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Live Storefront Card & Rich Text Preview */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ตัวอย่างหน้าร้านจริง (Live Preview)
                  </h2>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                  REALTIME
                </span>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] overflow-hidden shadow-md">
                <div className="relative h-40 w-full bg-zinc-900 overflow-hidden">
                  <img
                    src={form.imageUrl || PRODUCT_IMAGE_PRESETS[0].url}
                    alt={form.name || 'ตัวอย่างสินค้า'}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        !form.isHidden
                          ? 'bg-emerald-500/90 text-zinc-950'
                          : 'bg-zinc-800/90 text-zinc-300'
                      }`}
                    >
                      {!form.isHidden ? 'พร้อมส่งทันที' : 'ปิดพักบริการ'}
                    </span>
                    {badgeText && (
                      <span className="rounded-md bg-black/75 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[10px] font-medium text-zinc-200">
                        {badgeText}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="font-mono text-[10px] text-zinc-300">
                      {form.sku || 'CYB-SKU'} · {form.category}
                    </div>
                    <div className="text-sm font-bold text-white line-clamp-1">
                      {form.name || 'ชื่อสินค้าของคุณจะแสดงตรงนี้'}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Live Rich Formatted Description Preview */}
                  <div
                    className="rounded-lg border border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-[#121217] p-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 max-h-36 overflow-y-auto [&_h2]:font-bold [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_u]:underline [&_u]:decoration-indigo-400"
                    dangerouslySetInnerHTML={{ __html: richDescriptionHtml }}
                  />

                  <div className="flex items-baseline justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                    <div>
                      <div className="text-[10px] text-zinc-500">ราคาพิเศษ</div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          ฿{numericPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                        {numericCompare > numericPrice && (
                          <span className="font-mono text-xs text-zinc-500 line-through">
                            ฿{numericCompare.toLocaleString('th-TH')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500">คงเหลือในคลัง</div>
                      <div className="font-mono text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                        {effectiveStock} ชิ้น
                      </div>
                    </div>
                  </div>

                  <div className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 py-2 text-center text-xs font-semibold text-white dark:text-zinc-950 flex items-center justify-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>สั่งซื้ออัตโนมัติ (ตัดสต็อกทีละ 1 บรรทัด)</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
};
