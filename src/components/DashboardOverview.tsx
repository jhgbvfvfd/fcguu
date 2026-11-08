import React, { useState } from 'react';
import { FileSpreadsheet, ShoppingBag, BarChart3, ArrowUpRight } from 'lucide-react';
import { ProductItem, ProductMetrics } from '../utils/productLogic';

interface DashboardOverviewProps {
  metrics: ProductMetrics;
  products: ProductItem[];
  onNavigateToProducts: (statusFilter?: 'all' | 'low_stock' | 'out_of_stock') => void;
  onExportCsv: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  metrics,
  products,
  onNavigateToProducts,
  onExportCsv,
}) => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const topSelling = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);
  const totalOrders = products.reduce((sum, p) => sum + p.soldCount, 0);

  return (
    <div className="w-full flex-1 flex flex-col space-y-5">
      {/* Header matching reference screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            ภาพรวมร้านค้า
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            ติดตามยอดขาย สินค้า และสต็อกในที่เดียว
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateToProducts('all')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors whitespace-nowrap shrink-0"
          >
            <span>ไปที่หน้าจัดการสินค้า</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards matching screenshot layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">ยอดขายรวม</div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            ฿{metrics.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            ยอดขายสินค้าที่ชำระแล้ว
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            กำไรสุทธิโดยประมาณ ฿{metrics.totalProfitEstimate.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">สมาชิก</div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            148
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            สมาชิกในระบบ
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">สมัครใหม่วันนี้ 12 คน</div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToProducts('low_stock')}
          className="text-left rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
        >
          <div className="text-xs text-zinc-500 dark:text-zinc-400">สินค้า</div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {metrics.totalProducts}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            สินค้าในร้าน ({metrics.totalStockUnits.toLocaleString()} ชิ้น)
          </div>
          <div className="mt-0.5 text-xs text-amber-500 dark:text-amber-400">
            สินค้าใกล้หมด/หมด {metrics.lowStockCount + metrics.outOfStockCount} รายการ
          </div>
        </button>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">คำสั่งซื้อ</div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalOrders.toLocaleString()}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            คำสั่งซื้อทั้งหมด
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">จัดส่งอัตโนมัติสำเร็จ 100%</div>
        </div>
      </div>

      {/* Middle Row: Sales Chart + Top Products */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">กราฟยอดขาย</h2>
              <p className="mt-0.5 text-xs text-zinc-500">10/10/2026 – 08/11/2026 · เวลาไทย</p>
            </div>
            <div className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
              ฿{metrics.totalRevenue.toLocaleString('th-TH')}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            {(
              [
                { id: '7d', label: '7 วัน' },
                { id: '30d', label: '30 วัน' },
                { id: '90d', label: '90 วัน' },
                { id: '1y', label: '1 ปี' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRange(t.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === t.id
                    ? 'bg-indigo-950/90 text-indigo-300 border border-indigo-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex h-44 items-end gap-2 border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-3 pt-4">
            {[38, 52, 44, 65, 58, 72, 85, 63, 79, 92, 88, 100].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t bg-indigo-500/30 hover:bg-indigo-500/60 transition-colors"
                  style={{ height: `${Math.round(val * 1.2)}px` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] text-zinc-500">
            <span>10/10</span>
            <span>24/10</span>
            <span>08/11</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                สินค้าขายดีสูงสุด
              </h2>
              <BarChart3 className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">เรียงตามจำนวนคำสั่งซื้อที่ชำระแล้ว</p>

            <div className="mt-4 space-y-3">
              {topSelling.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5 last:border-none"
                >
                  <div className="min-w-0 pr-3">
                    <div className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {item.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-zinc-500">
                      {item.sku} · ฿{item.price}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.soldCount} ชิ้น
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500">
                      คงเหลือ {item.stock}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToProducts('all')}
            className="mt-4 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            จัดการสินค้าทั้งหมด ({products.length} รายการ)
          </button>
        </div>
      </div>
    </div>
  );
};
