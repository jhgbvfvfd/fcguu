import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Layers,
  FileSpreadsheet,
  Copy,
  KeyRound,
  QrCode,
  Wallet,
  Building2,
  CreditCard,
  ArrowLeft,
  Save,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Highlighter,
  List,
  Eraser,
  Eye,
  Receipt,
} from 'lucide-react';
import {
  OrderItem,
  OrderStatus,
  OrderStatusFilter,
  PaymentChannel,
  PAYMENT_CHANNEL_LABELS,
  ORDER_STATUS_LABELS,
  calculateOrderMetrics,
  filterAndSortOrders,
  ordersToCsv,
} from '../utils/storeAdminLogic';
import { ProductItem } from '../utils/productLogic';
import { ProductThumbnail } from './ProductThumbnail';

interface OrdersManagementViewProps {
  orders: OrderItem[];
  products: ProductItem[];
  onUpdateOrders: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  onShowToast: (msg: string) => void;
  isStudioOpen: boolean;
  setIsStudioOpen: (open: boolean) => void;
  editingOrder: OrderItem | null;
  setEditingOrder: (ord: OrderItem | null) => void;
}

export const OrdersManagementView: React.FC<OrdersManagementViewProps> = ({
  orders,
  products,
  onUpdateOrders,
  onShowToast,
  isStudioOpen,
  setIsStudioOpen,
  editingOrder,
  setEditingOrder,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'amount_desc' | 'amount_asc'>('newest');

  // Studio Form State
  const [orderCode, setOrderCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerUsername, setCustomerUsername] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [netAmount, setNetAmount] = useState('99');
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>('promptpay_qr');
  const [status, setStatus] = useState<OrderStatus>('completed');
  const [deliveredLine, setDeliveredLine] = useState('');
  const [slipRef, setSlipRef] = useState('');
  const [noteHtml, setNoteHtml] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  const metrics = useMemo(() => calculateOrderMetrics(orders), [orders]);

  const filteredOrders = useMemo(
    () =>
      filterAndSortOrders(orders, {
        search,
        status: statusFilter,
        channel: channelFilter,
        sortBy,
      }),
    [orders, search, statusFilter, channelFilter, sortBy]
  );

  useEffect(() => {
    if (!isStudioOpen) return;
    if (editingOrder) {
      setOrderCode(editingOrder.orderCode);
      setCustomerName(editingOrder.customerName);
      setCustomerUsername(editingOrder.customerUsername);
      setCustomerEmail(editingOrder.customerEmail);
      setSelectedProductId(editingOrder.productId);
      setQuantity(String(editingOrder.quantity));
      setNetAmount(String(editingOrder.netAmount));
      setPaymentChannel(editingOrder.paymentChannel);
      setStatus(editingOrder.status);
      setDeliveredLine(editingOrder.deliveredLine);
      setSlipRef(editingOrder.slipRef);
      setNoteHtml(editingOrder.noteHtml);
      setFormError(null);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = editingOrder.noteHtml;
        }
      }, 0);
    } else {
      const firstProd = products[0];
      const nextNum = 8847 + orders.length;
      const defaultNote =
        '<p>สร้างรายการสั่งซื้อและจัดส่งคีย์สินค้า (<strong>1 บรรทัด = 1 ชิ้น</strong>) โดยผู้ดูแลระบบ</p>';
      setOrderCode(`ORD-2026-${nextNum}`);
      setCustomerName('');
      setCustomerUsername('');
      setCustomerEmail('');
      setSelectedProductId(firstProd?.id || '');
      setQuantity('1');
      setNetAmount(String(firstProd?.price || 99));
      setPaymentChannel('promptpay_qr');
      setStatus('completed');
      setDeliveredLine(firstProd?.stockKeys[0] || 'CYB-AUTO-KEY-001');
      setSlipRef(`PP-20261108-${Math.floor(100000 + Math.random() * 900000)}`);
      setNoteHtml(defaultNote);
      setFormError(null);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = defaultNote;
        }
      }, 0);
    }
  }, [isStudioOpen, editingOrder, products, orders.length]);

  const execNoteCommand = (cmd: string, val?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    setNoteHtml(editorRef.current.innerHTML);
  };

  const handleToggleOrderApproval = (ord: OrderItem) => {
    const nextStatus: OrderStatus =
      ord.status === 'completed' ? 'pending_verify' : 'completed';
    onUpdateOrders((prev) =>
      prev.map((item) => (item.id === ord.id ? { ...item, status: nextStatus } : item))
    );
    onShowToast(
      nextStatus === 'completed'
        ? `อนุมัติคำสั่งซื้อ ${ord.orderCode} และส่งมอบรหัสสินค้าแล้ว`
        : `เปลี่ยนสถานะคำสั่งซื้อ ${ord.orderCode} เป็นรอตรวจสอบสลิป`
    );
  };

  const handleCopyLine = (line: string, code: string) => {
    navigator.clipboard?.writeText(line);
    onShowToast(`คัดลอกข้อมูลที่จัดส่งของ ${code} เรียบร้อย`);
  };

  const handleDeleteOrder = (ord: OrderItem) => {
    onUpdateOrders((prev) => prev.filter((item) => item.id !== ord.id));
    onShowToast(`ลบคำสั่งซื้อ ${ord.orderCode} ออกจากประวัติแล้ว`);
  };

  const handleExportCsv = () => {
    const csv = ordersToCsv(filteredOrders);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cyberapi-orders-export.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(`ส่งออกประวัติคำสั่งซื้อ CSV (${filteredOrders.length} รายการ) สำเร็จ`);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !orderCode.trim() || !deliveredLine.trim()) {
      setFormError('กรุณากรอกชื่อผู้สั่งซื้อ รหัสคำสั่งซื้อ และข้อมูลคีย์ที่จัดส่ง (1 บรรทัด = 1 ชิ้น)');
      return;
    }

    const chosenProd =
      products.find((p) => p.id === selectedProductId) || products[0];

    const payload: Omit<OrderItem, 'id'> = {
      orderCode: orderCode.trim().toUpperCase(),
      customerName: customerName.trim(),
      customerUsername: customerUsername.trim() || 'guest_member',
      customerEmail: customerEmail.trim() || 'customer@cybermail.io',
      productId: chosenProd.id,
      productName: chosenProd.name,
      productSku: chosenProd.sku,
      productCategory: chosenProd.category,
      quantity: Math.max(1, Number(quantity) || 1),
      unitPrice: chosenProd.price,
      discountAmount: 0,
      netAmount: Math.max(0, Number(netAmount) || 0),
      paymentChannel,
      status,
      deliveredLine: deliveredLine.trim(),
      slipRef: slipRef.trim() || 'MANUAL-ADMIN',
      createdAt: editingOrder ? editingOrder.createdAt : '08/11/2026 12:08',
      noteHtml,
    };

    if (editingOrder) {
      onUpdateOrders((prev) =>
        prev.map((o) => (o.id === editingOrder.id ? { ...o, ...payload } : o))
      );
      onShowToast(`บันทึกการแก้ไขคำสั่งซื้อ "${payload.orderCode}" เรียบร้อย`);
    } else {
      const created: OrderItem = {
        ...payload,
        id: `ord-${Date.now()}`,
      };
      onUpdateOrders((prev) => [created, ...prev]);
      onShowToast(`สร้างคำสั่งซื้อใหม่ "${payload.orderCode}" สำเร็จ`);
    }

    setIsStudioOpen(false);
    setEditingOrder(null);
  };

  const getChannelIcon = (channel: PaymentChannel) => {
    switch (channel) {
      case 'promptpay_qr':
        return QrCode;
      case 'truemoney':
        return Wallet;
      case 'bank_slip':
        return Building2;
      case 'member_credit':
      default:
        return CreditCard;
    }
  };

  // ============================================================================
  // IN-PAGE ORDER STUDIO / INSPECTOR (Keeps Sidebar & Topbar visible)
  // ============================================================================
  if (isStudioOpen) {
    const selectedProd =
      products.find((p) => p.id === selectedProductId) || products[0];

    return (
      <form onSubmit={handleSaveOrder} className="w-full flex-1 flex flex-col space-y-5 pb-10">
        {/* Studio Header */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111114] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                setIsStudioOpen(false);
                setEditingOrder(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b] px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ย้อนกลับ</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                <span>สตูดิโอตรวจสอบคำสั่งซื้อและคีย์ที่จัดส่ง</span>
                <span>·</span>
                <span className="font-mono text-indigo-500 dark:text-indigo-400">
                  {orderCode}
                </span>
              </div>
              <h1 className="truncate text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {editingOrder
                  ? `จัดการคำสั่งซื้อ: ${editingOrder.orderCode} (${editingOrder.customerName})`
                  : 'สร้างรายการคำสั่งซื้อและส่งคีย์แมนนวล'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsStudioOpen(false);
                setEditingOrder(null);
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
              <span>บันทึกคำสั่งซื้อ</span>
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
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/70 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      1. ข้อมูลผู้สั่งซื้อและรายการสินค้า
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      ตรวจสอบผู้รับสินค้า ช่องทางชำระเงิน และอ้างอิงสลิปโอนเงิน
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">ORDER DETAILS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    รหัสคำสั่งซื้อ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ชื่อลูกค้า / ผู้รับสินค้า <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="เช่น กิตติพงศ์ อัศวเมธี"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Username / อีเมลรับคีย์
                  </label>
                  <input
                    type="text"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@cybermail.io"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    สินค้าที่สั่งซื้อ
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setSelectedProductId(pid);
                      const found = products.find((p) => p.id === pid);
                      if (found) {
                        setNetAmount(String(found.price * (Number(quantity) || 1)));
                        if (found.stockKeys[0]) {
                          setDeliveredLine(found.stockKeys[0]);
                        }
                      }
                    }}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku} · ฿{p.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    จำนวน (ชิ้น/บรรทัด)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ยอดชำระสุทธิ (฿)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={netAmount}
                    onChange={(e) => setNetAmount(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs font-bold text-emerald-500 dark:text-emerald-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ช่องทางชำระเงิน
                  </label>
                  <select
                    value={paymentChannel}
                    onChange={(e) => setPaymentChannel(e.target.value as PaymentChannel)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="promptpay_qr">PromptPay QR อัตโนมัติ</option>
                    <option value="bank_slip">โอนบัญชีธนาคาร (เช็คสลิป)</option>
                    <option value="truemoney">TrueMoney Wallet (ซองอั่งเปา)</option>
                    <option value="member_credit">หักเครดิตสมาชิกในระบบ</option>
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    เลขอ้างอิงสลิป / Transaction Ref
                  </label>
                  <input
                    type="text"
                    value={slipRef}
                    onChange={(e) => setSlipRef(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Delivered Key Line Section (1 Line = 1 Piece) */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    2. ข้อมูลสินค้าที่จัดส่งให้ลูกค้า (1 บรรทัด = 1 ชิ้น)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLine(deliveredLine, orderCode)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b] px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                >
                  <Copy className="h-3 w-3 text-indigo-400" />
                  <span>คัดลอกบรรทัดที่ส่ง</span>
                </button>
              </div>

              <input
                type="text"
                value={deliveredLine}
                onChange={(e) => setDeliveredLine(e.target.value)}
                placeholder="เช่น user@cybermail.io:Pass#9981 | PIN 1102"
                className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 font-mono text-xs text-emerald-600 dark:text-emerald-300 focus:border-emerald-500 focus:outline-none"
              />
            </section>

            {/* Rich Text Order Notes */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    3. บันทึกตรวจสอบสลิปและหมายเหตุคำสั่งซื้อ (Rich Text Formatting)
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-[#09090b]">
                <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-[#141418] px-2.5 py-2">
                  <button
                    type="button"
                    onClick={() => execNoteCommand('bold')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('italic')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('underline')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('strikeThrough')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Strikethrough className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-1" />
                  <button
                    type="button"
                    onClick={() => execNoteCommand('foreColor', '#34d399')}
                    className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-emerald-500 hover:bg-emerald-500/10"
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span>สีเขียว</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('hiliteColor', '#312e81')}
                    className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                    <span>ไฮไลท์</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('insertUnorderedList')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('removeFormat')}
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
                      setNoteHtml(editorRef.current.innerHTML);
                    }
                  }}
                  className="min-h-[110px] p-4 text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 focus:outline-none [&_u]:underline [&_u]:decoration-indigo-400"
                />
              </div>
            </section>
          </div>

          {/* Right 4 Columns: Order Status & Receipt Preview */}
          <div className="lg:col-span-4 space-y-5">
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                สถานะคำสั่งซื้อและการจัดส่ง
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    {
                      id: 'completed',
                      label: 'จัดส่งสำเร็จ (อนุมัติแล้ว)',
                      desc: 'ลูกค้าได้รับคีย์บรรทัดสินค้าเรียบร้อย',
                    },
                    {
                      id: 'pending_verify',
                      label: 'รอตรวจสอบสลิปโอนเงิน',
                      desc: 'พักการแสดงคีย์จนกว่าแอดมินจะกดอนุมัติ',
                    },
                    {
                      id: 'refunded',
                      label: 'คืนเงิน / ยกเลิกรายการ',
                      desc: 'ระงับคีย์และคืนเครดิตให้ลูกค้า',
                    },
                  ] as const
                ).map((st) => {
                  const active = status === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStatus(st.id)}
                      className={`flex items-start justify-between rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-200'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{st.label}</div>
                        <div className="text-[11px] opacity-75 mt-0.5">{st.desc}</div>
                      </div>
                      {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Live Order Receipt Card Preview */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/70 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    ใบเสร็จดิจิทัล (Live Receipt)
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">REALTIME</span>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <ProductThumbnail product={selectedProd} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedProd.name}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500">
                      {orderCode} · x{quantity} ชิ้น
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2.5 text-xs">
                  <span className="text-zinc-500">ยอดชำระสุทธิ</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    ฿{Number(netAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-2.5 font-mono text-[11px] text-emerald-400 truncate">
                  {deliveredLine}
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    );
  }

  // ============================================================================
  // ORDERS TABLE VIEW
  // ============================================================================
  return (
    <div className="w-full flex-1 flex flex-col space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            จัดการคำสั่งซื้อและประวัติส่งคีย์
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            ตรวจสอบรายการชำระเงิน อ้างอิงสลิปธนาคาร ข้อมูลสต็อกที่ตัดส่ง (1 บรรทัด = 1 ชิ้น) และสวิตช์อนุมัติออเดอร์
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
            <span>ส่งออกคำสั่งซื้อ CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingOrder(null);
              setIsStudioOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>สร้างคำสั่งซื้อแมนนวล</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>คำสั่งซื้อทั้งหมด</span>
            <ShoppingBag className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {metrics.totalOrders}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            จัดส่งสำเร็จ {metrics.completedOrders} รายการ
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            บันทึกบรรทัดคีย์ที่ส่งแล้วครบทุกออเดอร์
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>ยอดชำระสำเร็จรวม</span>
            <Wallet className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-500 dark:text-emerald-400">
            ฿{metrics.totalPaidRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            ตรวจสอบสลิปและตัดเครดิตสำเร็จ
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            เชื่อมต่อบัญชีผู้รับเงินของร้านโดยตรง
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>รอตรวจสอบสลิปโอนเงิน</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-amber-500 dark:text-amber-400">
            {metrics.pendingOrders}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            กดสวิตช์อนุมัติเพื่อส่งคีย์ได้ทันที
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            รองรับการตรวจสอบสลิปธนาคารย้อนหลัง
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>คืนเงิน / สลิปซ้ำ</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {metrics.refundedOrders}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            ป้องกันสลิปซ้ำอัตโนมัติ
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            ระบบบล็อกการส่งคีย์เมื่อสลิปไม่ถูกต้อง
          </div>
        </div>
      </div>

      {/* Filter & Search Panel */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800/90 bg-zinc-100/80 dark:bg-[#0b0b0e] p-1"
            role="tablist"
            aria-label="กรองตามสถานะคำสั่งซื้อ"
          >
            {(
              [
                { id: 'all', label: 'ทั้งหมด', count: metrics.totalOrders, Icon: Layers },
                {
                  id: 'completed',
                  label: 'จัดส่งสำเร็จ',
                  count: metrics.completedOrders,
                  Icon: CheckCircle2,
                },
                {
                  id: 'pending_verify',
                  label: 'รอตรวจสอบสลิป',
                  count: metrics.pendingOrders,
                  Icon: Clock,
                },
                {
                  id: 'refunded',
                  label: 'คืนเงิน/ยกเลิก',
                  count: metrics.refundedOrders,
                  Icon: XCircle,
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="relative md:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหารหัส ORD, ชื่อลูกค้า, สินค้า หรือบรรทัดคีย์ที่ส่ง..."
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0f] pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              aria-label="กรองตามช่องทางชำระเงิน"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0f] px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">ช่องทางชำระเงิน: ทั้งหมด</option>
              <option value="promptpay_qr">PromptPay QR อัตโนมัติ</option>
              <option value="bank_slip">โอนบัญชีธนาคาร (เช็คสลิป)</option>
              <option value="truemoney">TrueMoney Wallet</option>
              <option value="member_credit">หักเครดิตสมาชิก</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'newest' | 'amount_desc' | 'amount_asc')
              }
              aria-label="เรียงลำดับคำสั่งซื้อ"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0f] px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value="newest">เรียง: คำสั่งซื้อล่าสุด</option>
              <option value="amount_desc">เรียง: ยอดชำระสูงไปต่ำ</option>
              <option value="amount_asc">เรียง: ยอดชำระต่ำไปสูง</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 flex flex-col justify-between w-full rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0d0d10] text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                <th className="py-3 px-3">รหัสออเดอร์ · ลูกค้า</th>
                <th className="py-3 px-2.5">สินค้าที่สั่งซื้อ</th>
                <th className="py-3 px-2.5">สต็อกที่จัดส่ง (1 บรรทัด = 1 ชิ้น)</th>
                <th className="py-3 px-2.5 text-right">ยอดสุทธิ · ช่องทาง</th>
                <th className="py-3 px-2.5">อนุมัติ / สถานะ</th>
                <th className="py-3 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/60 text-xs">
              {filteredOrders.map((ord) => {
                const ChannelIcon = getChannelIcon(ord.paymentChannel);
                const isApproved = ord.status === 'completed';

                return (
                  <tr
                    key={ord.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    {/* Order Code & Customer */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-indigo-500 dark:text-indigo-300">
                        {ord.orderCode}
                      </div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">
                        {ord.customerName}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        @{ord.customerUsername} · {ord.createdAt}
                      </div>
                    </td>

                    {/* Product Thumbnail & Name */}
                    <td className="py-3 px-2 max-w-[190px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <ProductThumbnail
                          product={
                            products.find((p) => p.id === ord.productId) || {
                              name: ord.productName,
                              sku: ord.productSku,
                              category: ord.productCategory,
                              imageUrl: '',
                            }
                          }
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                            {ord.productName}
                          </div>
                          <div className="font-mono text-[11px] text-zinc-500">
                            {ord.productSku} · {ord.quantity} ชิ้น
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Delivered Key Line */}
                    <td className="py-3 px-2 max-w-[195px]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-2 py-1 font-mono text-[11px] text-emerald-500 dark:text-emerald-400 max-w-[145px]">
                          {ord.deliveredLine}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyLine(ord.deliveredLine, ord.orderCode)}
                          title="คัดลอกบรรทัดสินค้า"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        อ้างอิง: {ord.slipRef}
                      </div>
                    </td>

                    {/* Net Amount & Payment Channel */}
                    <td className="py-3 px-2.5 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        ฿{ord.netAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="inline-flex items-center justify-end gap-1 text-[11px] text-zinc-500 mt-0.5">
                        <ChannelIcon className="h-3 w-3 text-indigo-400" />
                        <span>{PAYMENT_CHANNEL_LABELS[ord.paymentChannel]}</span>
                      </div>
                    </td>

                    {/* Approval Switch & Status */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isApproved}
                          aria-label={`สวิตช์อนุมัติคำสั่งซื้อ ${ord.orderCode}`}
                          onClick={() => handleToggleOrderApproval(ord)}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                            isApproved
                              ? 'bg-emerald-500'
                              : ord.status === 'pending_verify'
                              ? 'bg-amber-500'
                              : 'bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                              isApproved ? 'translate-x-4.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <div className="leading-tight">
                          <div
                            className={`text-[11px] font-semibold ${
                              ord.status === 'completed'
                                ? 'text-emerald-400'
                                : ord.status === 'pending_verify'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {ORDER_STATUS_LABELS[ord.status]}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {isApproved ? 'ส่งคีย์แล้ว' : 'คลิกเพื่ออนุมัติ'}
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
                            setEditingOrder(ord);
                            setIsStudioOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161a] px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit3 className="h-3 w-3 text-zinc-400" />
                          <span>ตรวจสอบ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(ord)}
                          aria-label={`ลบคำสั่งซื้อ ${ord.orderCode}`}
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
          <span>แสดงผล {filteredOrders.length} จากทั้งหมด {orders.length} คำสั่งซื้อ</span>
          <span>อัปเดตข้อมูลล่าสุด: 08/11/2026 · เวลาไทย</span>
        </div>
      </div>
    </div>
  );
};
