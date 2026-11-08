import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Building2,
  Wallet,
  CreditCard,
  ShieldCheck,
  Save,
  RotateCcw,
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
  CheckCircle2,
  SlidersHorizontal,
  KeyRound,
} from 'lucide-react';
import { PayeeSettings, INITIAL_PAYEE_SETTINGS } from '../utils/storeAdminLogic';

interface PayeeSettingsViewProps {
  settings: PayeeSettings;
  onSaveSettings: (next: PayeeSettings) => void;
  onShowToast: (msg: string) => void;
}

export const PayeeSettingsView: React.FC<PayeeSettingsViewProps> = ({
  settings,
  onSaveSettings,
  onShowToast,
}) => {
  const [form, setForm] = useState<PayeeSettings>(settings);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm(settings);
    if (editorRef.current) {
      editorRef.current.innerHTML = settings.checkoutInstructionHtml;
    }
  }, [settings]);

  const execInstructionCommand = (cmd: string, val?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    setForm((prev) => ({
      ...prev,
      checkoutInstructionHtml: editorRef.current?.innerHTML || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PayeeSettings = {
      ...form,
      updatedAt: '08/11/2026 12:10',
    };
    onSaveSettings(updated);
    onShowToast('บันทึกการตั้งค่าผู้รับเงินและช่องทางชำระเงินเรียบร้อยแล้ว');
  };

  const handleResetDefaults = () => {
    setForm(INITIAL_PAYEE_SETTINGS);
    if (editorRef.current) {
      editorRef.current.innerHTML = INITIAL_PAYEE_SETTINGS.checkoutInstructionHtml;
    }
    onSaveSettings(INITIAL_PAYEE_SETTINGS);
    onShowToast('รีเซ็ตค่าผู้รับเงินกลับเป็นค่าเริ่มต้นของร้านแล้ว');
  };

  const activeChannelsCount = [
    form.promptpayEnabled,
    form.bankEnabled,
    form.truemoneyEnabled,
    form.memberCreditEnabled,
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="w-full flex-1 flex flex-col space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            ตั้งค่าผู้รับเงินและช่องทางชำระเงิน
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            กำหนดชื่อบัญชีผู้รับเงิน พร้อมเพย์ QR ธนาคารตรวจสลิปอัตโนมัติ และเบอร์รับซอง TrueMoney Wallet
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
            <span>คืนค่าเริ่มต้น</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>บันทึกตั้งค่าผู้รับเงิน</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>ช่องทางรับชำระที่เปิดใช้</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {activeChannelsCount} / 4
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            พร้อมรับเงินและส่งคีย์ 24 ชม.
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            อัปเดตล่าสุด {form.updatedAt}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>ผู้รับเงินพร้อมเพย์ QR</span>
            <QrCode className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-emerald-500 dark:text-emerald-400 truncate">
            {form.promptpayId}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {form.promptpayPayeeNameTH}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            ขั้นต่ำ ฿{form.minPromptpayAmount} · ตรวจสลิปทันที
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>บัญชีธนาคารเช็คสลิป API</span>
            <Building2 className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {form.bankAccountNo}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {form.bankName}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500 truncate">
            {form.bankAccountName}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>TrueMoney & โบนัส VIP</span>
            <Wallet className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {form.truemoneyPhone}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            โบนัสเติมเครดิต +{form.vipBonusPercent}%
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            ค่าธรรมเนียมซองของขวัญ {form.truemoneyFeePercent}%
          </div>
        </div>
      </div>

      {/* Main 12-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 8 Columns: Payee Configurations */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card 1: PromptPay QR */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    1. ตั้งค่าผู้รับเงิน PromptPay QR อัตโนมัติ
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    สร้าง QR Code ตามยอดสั่งซื้อพร้อมตรวจสอบชื่อผู้รับเงินตรงกับสลิป
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500">
                  {form.promptpayEnabled ? 'เปิดรับชำระ' : 'ปิดชั่วคราว'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.promptpayEnabled}
                  aria-label="สวิตช์เปิดรับชำระ PromptPay QR"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      promptpayEnabled: !prev.promptpayEnabled,
                    }))
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    form.promptpayEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      form.promptpayEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ประเภทหมายเลขพร้อมเพย์
                </label>
                <select
                  value={form.promptpayIdType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      promptpayIdType: e.target.value as 'phone' | 'tax_id',
                    }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="phone">เบอร์โทรศัพท์มือถือ (10 หลัก)</option>
                  <option value="tax_id">เลขบัตรประชาชน / นิติบุคคล (13 หลัก)</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  หมายเลขพร้อมเพย์ผู้รับเงิน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.promptpayId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, promptpayId: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs font-semibold text-emerald-500 dark:text-emerald-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ยอดโอนขั้นต่ำ (฿)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.minPromptpayAmount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      minPromptpayAmount: Number(e.target.value) || 1,
                    }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ชื่อบัญชีผู้รับเงิน (ภาษาไทย — ใช้ตรวจสลิป) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.promptpayPayeeNameTH}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, promptpayPayeeNameTH: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ชื่อบัญชีผู้รับเงิน (ภาษาอังกฤษ — ใช้ตรวจสลิป EN)
                </label>
                <input
                  type="text"
                  value={form.promptpayPayeeNameEN}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, promptpayPayeeNameEN: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 2: Bank Account & Slip Verification API */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    2. บัญชีธนาคารผู้รับเงิน & ระบบเช็คสลิป API
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    ตั้งค่าเลขที่บัญชีธนาคารและคีย์เชื่อมต่อระบบอ่าน QR สลิปโอนเงินอัตโนมัติ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500">
                  {form.bankEnabled ? 'เปิดรับโอนธนาคาร' : 'ปิดชั่วคราว'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.bankEnabled}
                  aria-label="สวิตช์เปิดรับโอนบัญชีธนาคาร"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, bankEnabled: !prev.bankEnabled }))
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    form.bankEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      form.bankEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ธนาคารผู้รับเงิน
                </label>
                <select
                  value={form.bankName}
                  onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ธนาคารกสิกรไทย (KBANK)">ธนาคารกสิกรไทย (KBANK)</option>
                  <option value="ธนาคารไทยพาณิชย์ (SCB)">ธนาคารไทยพาณิชย์ (SCB)</option>
                  <option value="ธนาคารกรุงเทพ (BBL)">ธนาคารกรุงเทพ (BBL)</option>
                  <option value="ธนาคารกรุงไทย (KTB)">ธนาคารกรุงไทย (KTB)</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  เลขที่บัญชีผู้รับเงิน
                </label>
                <input
                  type="text"
                  value={form.bankAccountNo}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bankAccountNo: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ชื่อบัญชีธนาคารนิติบุคคล / บุคคล
                </label>
                <input
                  type="text"
                  value={form.bankAccountName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bankAccountName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ผู้ให้บริการตรวจสลิป (Slip Verification Provider)
                </label>
                <input
                  type="text"
                  value={form.slipApiProvider}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slipApiProvider: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Webhook / Branch Token อ้างอิง</span>
                </label>
                <input
                  type="text"
                  value={form.slipApiSecretMasked}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slipApiSecretMasked: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 3: TrueMoney Wallet & Checkout Notice Rich Text Editor */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    3. ผู้รับเงิน TrueMoney Wallet & คำแนะนำหน้าชำระเงิน
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    รับชำระผ่านซองของขวัญอั่งเปา TrueMoney และปรับแต่งข้อความแจ้งเตือนหน้าชำระเงิน
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500">
                  {form.truemoneyEnabled ? 'เปิดรับ TrueMoney' : 'ปิดชั่วคราว'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.truemoneyEnabled}
                  aria-label="สวิตช์เปิดรับชำระ TrueMoney Wallet"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      truemoneyEnabled: !prev.truemoneyEnabled,
                    }))
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    form.truemoneyEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      form.truemoneyEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  เบอร์รับซอง TrueMoney Wallet
                </label>
                <input
                  type="text"
                  value={form.truemoneyPhone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, truemoneyPhone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ชื่อบัญชีผู้รับ TrueMoney
                </label>
                <input
                  type="text"
                  value={form.truemoneyPayeeName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, truemoneyPayeeName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  โบนัสเติมเครดิต VIP (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.vipBonusPercent}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      vipBonusPercent: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] px-3.5 py-2.5 font-mono text-xs font-bold text-indigo-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Rich Text Checkout Notice */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>ข้อความแจ้งเตือนผู้โอนเงินหน้า Checkout (Rich Text Formatting)</span>
                </span>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-[#09090b]">
                <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-[#141418] px-2.5 py-2">
                  <button
                    type="button"
                    onClick={() => execInstructionCommand('bold')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execInstructionCommand('italic')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execInstructionCommand('underline')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execInstructionCommand('strikeThrough')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Strikethrough className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-1" />
                  <button
                    type="button"
                    onClick={() => execInstructionCommand('foreColor', '#34d399')}
                    className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-emerald-500 hover:bg-emerald-500/10"
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span>สีเขียว</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => execInstructionCommand('hiliteColor', '#312e81')}
                    className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                    <span>ไฮไลท์</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => execInstructionCommand('insertUnorderedList')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execInstructionCommand('removeFormat')}
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
                      setForm((prev) => ({
                        ...prev,
                        checkoutInstructionHtml: editorRef.current?.innerHTML || '',
                      }));
                    }
                  }}
                  className="min-h-[95px] p-3.5 text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 focus:outline-none [&_u]:underline [&_u]:decoration-indigo-400"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right 4 Columns: Security Switches & Live Checkout Payee Card Preview */}
        <div className="lg:col-span-4 space-y-5">
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/70 pb-3">
              <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                สวิตช์ระบบตรวจสอบการรับเงินอัตโนมัติ
              </h3>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0b0b0e] p-3.5">
              <div className="pr-3">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  ตรวจสอบชื่อผู้รับเงินตรงกับสลิป 100%
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  ป้องกันสลิปปลอมหรือโอนผิดบัญชี
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.slipApiEnabled}
                onClick={() =>
                  setForm((prev) => ({ ...prev, slipApiEnabled: !prev.slipApiEnabled }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  form.slipApiEnabled ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    form.slipApiEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0b0b0e] p-3.5">
              <div className="pr-3">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  รับซองอั่งเปา TrueMoney อัตโนมัติ
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  เติมเครดิตเข้ากระเป๋าสมาชิกทันทีที่ส่งลิงก์ซอง
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.angpaoAutoRedeem}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    angpaoAutoRedeem: !prev.angpaoAutoRedeem,
                  }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  form.angpaoAutoRedeem ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    form.angpaoAutoRedeem ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0b0b0e] p-3.5">
              <div className="pr-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
                  <span>เปิดใช้กระเป๋าเครดิตสมาชิก</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  อนุญาตให้สมาชิกใช้เครดิตคงเหลือซื้อสินค้าได้ทันที
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.memberCreditEnabled}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    memberCreditEnabled: !prev.memberCreditEnabled,
                  }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  form.memberCreditEnabled ? 'bg-indigo-500' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    form.memberCreditEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Live Checkout Payee Card Preview */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#111114] p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/70 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  ตัวอย่างการ์ดผู้รับเงินหน้าชำระเงิน
                </h3>
              </div>
              <span className="font-mono text-[10px] text-emerald-400">LIVE CHECKOUT</span>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                  <QrCode className="h-3.5 w-3.5" />
                  <span>THAI QR PROMPTPAY</span>
                </span>
                <span className="font-mono text-xs text-zinc-500">ขั้นต่ำ ฿{form.minPromptpayAmount}</span>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-3.5 space-y-2">
                <div className="text-[11px] text-zinc-500">ชื่อผู้รับเงิน (ตรวจสอบอัตโนมัติ)</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {form.promptpayPayeeNameTH}
                </div>
                <div className="font-mono text-xs text-emerald-500 dark:text-emerald-400">
                  พร้อมเพย์: {form.promptpayId}
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>{form.bankName}</span>
                  <span className="font-mono text-zinc-300">{form.bankAccountNo}</span>
                </div>
              </div>

              <div
                className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#121216] p-3 text-[11px] text-zinc-600 dark:text-zinc-300 [&_u]:underline [&_strong]:text-zinc-900 dark:[&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: form.checkoutInstructionHtml }}
              />

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>เชื่อมต่อ API เช็คสลิปและส่งสินค้าทีละ 1 บรรทัดพร้อมใช้งาน</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};
