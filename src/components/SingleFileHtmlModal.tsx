import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode } from 'lucide-react';
import { ProductItem } from '../utils/productLogic';
import { generateSingleFileHtml } from '../utils/singleFileHtmlGenerator';

interface SingleFileHtmlModalProps {
  isOpen: boolean;
  products: ProductItem[];
  onClose: () => void;
}

export const SingleFileHtmlModal: React.FC<SingleFileHtmlModalProps> = ({
  isOpen,
  products,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlCode = generateSingleFileHtml(products);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyberapi-product-management.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="html-export-title"
    >
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              <FileCode className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h2 id="html-export-title" className="text-base font-semibold">
                โค้ด HTML 1 ไฟล์ (พร้อมนำไปใช้งานทันที)
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                รวมโครงสร้าง HTML + CSS โทนดาร์กมินิมอล + ระบบค้นหาและจัดการสินค้าครบจบในไฟล์เดียว
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างโค้ด HTML"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#151519] px-6 py-2.5 text-xs">
          <span className="font-mono text-zinc-500 dark:text-zinc-400">
            cyberapi-product-management.html · {products.length} รายการสินค้า
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'คัดลอกโค้ดแล้ว' : 'คัดลอกโค้ด HTML'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>ดาวน์โหลดไฟล์ .html</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#0a0a0d] p-5">
          <pre className="font-mono text-xs leading-relaxed text-zinc-300 select-all whitespace-pre-wrap break-all">
            {htmlCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
