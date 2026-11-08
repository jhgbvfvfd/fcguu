import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  ListOrdered,
  FileText,
  Sparkles,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { ProductItem, parseStockKeys } from '../utils/productLogic';
import { ProductThumbnail } from './ProductThumbnail';

interface StockKeysModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onUpdateStockAndKeys: (productId: string, newStock: number, newKeys: string[]) => void;
}

export const StockKeysModal: React.FC<StockKeysModalProps> = ({
  product,
  onClose,
  onUpdateStockAndKeys,
}) => {
  const [keysText, setKeysText] = useState('');
  const [singleLineInput, setSingleLineInput] = useState('');
  const [editorMode, setEditorMode] = useState<'list' | 'bulk'>('list');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (product) {
      setKeysText(product.stockKeys.join('\n'));
      setSingleLineInput('');
      setCopied(false);
    }
  }, [product]);

  if (!product) return null;

  const parsedKeys = parseStockKeys(keysText);

  const handleAddSingleLine = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = singleLineInput.trim();
    if (!trimmed) return;
    const updated = [...parsedKeys, trimmed];
    setKeysText(updated.join('\n'));
    setSingleLineInput('');
  };

  const handleRemoveSingleLine = (indexToRemove: number) => {
    const updated = parsedKeys.filter((_, idx) => idx !== indexToRemove);
    setKeysText(updated.join('\n'));
  };

  const handleGenerateSampleKeys = (count: number) => {
    const prefix = product.sku.split('-').slice(0, 2).join('-') || 'CYB-KEY';
    const generated: string[] = [];
    for (let i = 0; i < count; i++) {
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      const num = Math.floor(1000 + Math.random() * 9000);
      generated.push(`${prefix}-${rand}-${num}`);
    }
    const combined = [...parsedKeys, ...generated];
    setKeysText(combined.join('\n'));
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(parsedKeys.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleSave = () => {
    onUpdateStockAndKeys(product.id, parsedKeys.length, parsedKeys);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-modal-title"
    >
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#101013] text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden">
        {/* Header with Product Image & Icon */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <ProductThumbnail product={product} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-indigo-400 shrink-0" />
                <h2 id="stock-modal-title" className="text-sm font-semibold truncate">
                  {product.name}
                </h2>
              </div>
              <p className="mt-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {product.sku} · ระบบสต็อก 1 บรรทัด = สินค้า 1 ชิ้น
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างจัดการสต็อก"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Stock Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800/90 bg-zinc-50 dark:bg-[#151519] px-4 py-3">
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                สต็อกพร้อมขาย (คำนวณจากจำนวนบรรทัด)
              </div>
              <div className="mt-0.5 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {parsedKeys.length.toLocaleString()}{' '}
                <span className="text-xs font-normal text-zinc-500">
                  ชิ้น ({parsedKeys.length} บรรทัด)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleGenerateSampleKeys(1)}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d10] px-2.5 py-1.5 font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
              >
                <Plus className="h-3.5 w-3.5 text-indigo-400" />
                <span>1 บรรทัด</span>
              </button>
              <button
                type="button"
                onClick={() => handleGenerateSampleKeys(5)}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d10] px-2.5 py-1.5 font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>+5 บรรทัด</span>
              </button>
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d10] px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-zinc-400" />
                )}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกทั้งหมด'}</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher: แยกบรรทัดละ 1 ชิ้น vs วางหลายบรรทัด */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-[#0b0b0e] p-1">
              <button
                type="button"
                onClick={() => setEditorMode('list')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  editorMode === 'list'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>รายการแยกชิ้น (บรรทัดละ 1 ชิ้น)</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('bulk')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  editorMode === 'bulk'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>วางข้อความหลายบรรทัด</span>
              </button>
            </div>

            {parsedKeys.length > 0 && (
              <button
                type="button"
                onClick={() => setKeysText('')}
                className="inline-flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>ล้างสต็อกทั้งหมด</span>
              </button>
            )}
          </div>

          {editorMode === 'list' ? (
            <div className="space-y-3">
              {/* Add 1 item form */}
              <form onSubmit={handleAddSingleLine} className="flex gap-2">
                <input
                  type="text"
                  value={singleLineInput}
                  onChange={(e) => setSingleLineInput(e.target.value)}
                  placeholder="พิมพ์รหัสคีย์ หรือ email:password (1 บรรทัด = 1 ชิ้น)..."
                  className="flex-1 font-mono text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>เพิ่มลงสต็อก</span>
                </button>
              </form>

              {/* Numbered 1-line-per-1-item list */}
              <div className="max-h-56 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0b0b0e] divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                {parsedKeys.length === 0 ? (
                  <div className="py-10 text-center text-xs text-zinc-500">
                    ยังไม่มีรายการในสต็อก · เพิ่มรหัสด้านบน หรือสลับไปโหมดวางหลายบรรทัด
                  </div>
                ) : (
                  parsedKeys.map((line, idx) => (
                    <div
                      key={`${idx}-${line}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs hover:bg-zinc-100/70 dark:hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 w-16 shrink-0">
                          ชิ้นที่ {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate">
                          {line}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSingleLine(idx)}
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-rose-400 shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                วางข้อมูลสต็อกบรรทัดละ 1 ชิ้น ระบบจะแยกบรรทัดและตัดบรรทัดว่างให้อัตโนมัติ
              </p>
              <textarea
                rows={7}
                value={keysText}
                onChange={(e) => setKeysText(e.target.value)}
                placeholder="บรรทัดที่ 1 = สินค้าชิ้นที่ 1&#10;บรรทัดที่ 2 = สินค้าชิ้นที่ 2&#10;บรรทัดที่ 3 = สินค้าชิ้นที่ 3"
                className="w-full font-mono text-xs leading-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] p-3.5 text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/80 px-6 py-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>ส่งสต็อกบรรทัดบนสุดให้ลูกค้าก่อนตามลำดับ (FIFO)</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90"
            >
              <Save className="h-3.5 w-3.5" />
              <span>บันทึกสต็อก ({parsedKeys.length} ชิ้น)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
