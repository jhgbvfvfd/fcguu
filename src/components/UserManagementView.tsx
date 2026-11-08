import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  ShieldCheck,
  Crown,
  Briefcase,
  Wallet,
  ShoppingBag,
  Search,
  RotateCcw,
  FileSpreadsheet,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Mail,
  Phone,
  ArrowLeft,
  Save,
  Sparkles,
  Percent,
  KeyRound,
  Lock,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Highlighter,
  Palette,
  Eraser,
  Wand2,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  RefreshCw,
} from 'lucide-react';
import {
  UserItem,
  UserRole,
  UserStatusFilter,
  UserSortOption,
  ROLE_LABELS,
  calculateUserMetrics,
  filterAndSortUsers,
  usersToCsv,
} from '../utils/userLogic';

interface UserManagementViewProps {
  users: UserItem[];
  onUpdateUsers: React.Dispatch<React.SetStateAction<UserItem[]>>;
  onShowToast: (msg: string) => void;
  isStudioOpen: boolean;
  setIsStudioOpen: (open: boolean) => void;
  editingUser: UserItem | null;
  setEditingUser: (user: UserItem | null) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onUpdateUsers,
  onShowToast,
  isStudioOpen,
  setIsStudioOpen,
  editingUser,
  setEditingUser,
}) => {
  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [sortBy, setSortBy] = useState<UserSortOption>('recent_desc');

  // Quick credit modal state
  const [creditModalUser, setCreditModalUser] = useState<UserItem | null>(null);
  const [creditDeltaInput, setCreditDeltaInput] = useState<string>('500');
  const [creditReason, setCreditReason] = useState<string>('เติมเครดิตผ่านแอดมิน');

  // In-Page User Studio Form State
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('member');
  const [formCredit, setFormCredit] = useState('0');
  const [formDiscount, setFormDiscount] = useState('0');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formTwoFactor, setFormTwoFactor] = useState(false);
  const [formNoteHtml, setFormNoteHtml] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const noteEditorRef = useRef<HTMLDivElement>(null);

  const metrics = useMemo(() => calculateUserMetrics(users), [users]);

  const filteredUsers = useMemo(
    () =>
      filterAndSortUsers(users, {
        search,
        role: roleFilter,
        status: statusFilter,
        sortBy,
      }),
    [users, search, roleFilter, statusFilter, sortBy]
  );

  const openAddUserStudio = () => {
    const rand = Math.floor(1005 + Math.random() * 8990);
    setEditingUser(null);
    setFormDisplayName('');
    setFormUsername('');
    setFormCode(`USR-${rand}`);
    setFormEmail('');
    setFormPhone('');
    setFormRole('member');
    setFormCredit('0');
    setFormDiscount('0');
    setFormIsActive(true);
    setFormTwoFactor(false);
    const defaultNote =
      '<p>สมาชิกใหม่ในระบบ <u><strong>ยืนยันอีเมลเรียบร้อย</strong></u> พร้อมใช้งานสั่งซื้อสินค้าอัตโนมัติ</p>';
    setFormNoteHtml(defaultNote);
    setFormError(null);
    setIsStudioOpen(true);
    setTimeout(() => {
      if (noteEditorRef.current) {
        noteEditorRef.current.innerHTML = defaultNote;
      }
    }, 0);
  };

  const openEditUserStudio = (user: UserItem) => {
    setEditingUser(user);
    setFormDisplayName(user.displayName);
    setFormUsername(user.username);
    setFormCode(user.code);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormCredit(String(user.creditBalance));
    setFormDiscount(String(user.discountPercent));
    setFormIsActive(user.isActive);
    setFormTwoFactor(user.twoFactorEnabled);
    setFormNoteHtml(user.noteHtml);
    setFormError(null);
    setIsStudioOpen(true);
    setTimeout(() => {
      if (noteEditorRef.current) {
        noteEditorRef.current.innerHTML = user.noteHtml;
      }
    }, 0);
  };

  const handleToggleUserActive = (id: string) => {
    onUpdateUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const nextActive = !u.isActive;
        onShowToast(
          nextActive
            ? `เปิดใช้งานบัญชี "${u.displayName}" เรียบร้อยแล้ว`
            : `ระงับการใช้งานบัญชี "${u.displayName}" ชั่วคราวแล้ว`
        );
        return { ...u, isActive: nextActive };
      })
    );
  };

  const handleQuickAdjustCredit = (id: string, delta: number) => {
    onUpdateUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const nextCredit = Math.max(0, u.creditBalance + delta);
        return { ...u, creditBalance: nextCredit };
      })
    );
  };

  const handleApplyCreditModal = (isAdd: boolean) => {
    if (!creditModalUser) return;
    const amount = Math.max(0, Number(creditDeltaInput) || 0);
    if (amount <= 0) return;
    const signed = isAdd ? amount : -amount;
    onUpdateUsers((prev) =>
      prev.map((u) =>
        u.id === creditModalUser.id
          ? { ...u, creditBalance: Math.max(0, u.creditBalance + signed) }
          : u
      )
    );
    onShowToast(
      `${isAdd ? 'เติมเครดิต +' : 'หักเครดิต -'}฿${amount.toLocaleString('th-TH')} ให้ "${
        creditModalUser.displayName
      }" (${creditReason}) สำเร็จ`
    );
    setCreditModalUser(null);
  };

  const handleDeleteUser = (user: UserItem) => {
    onUpdateUsers((prev) => prev.filter((u) => u.id !== user.id));
    onShowToast(`ลบบัญชีผู้ใช้ "${user.displayName}" (${user.code}) ออกจากระบบแล้ว`);
  };

  const handleExportUsersCsv = () => {
    const csv = usersToCsv(filteredUsers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cyberapi-users-export.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(`ส่งออกรายชื่อสมาชิก CSV (${filteredUsers.length} บัญชี) สำเร็จ`);
  };

  // Rich Text Editor Helpers for User Note
  const syncNoteEditor = () => {
    if (noteEditorRef.current) {
      setFormNoteHtml(noteEditorRef.current.innerHTML);
    }
  };

  const execNoteCommand = (command: string) => {
    const el = noteEditorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    const hasSel = sel && sel.toString().length > 0;
    if (!hasSel && ['bold', 'italic', 'underline', 'strikeThrough'].includes(command)) {
      const map: Record<string, string> = {
        bold: '<strong>ข้อความตัวหนา</strong> ',
        italic: '<em>ข้อความตัวเอียง</em> ',
        underline: '<u>ข้อความขีดเส้นใต้</u> ',
        strikeThrough: '<s>ข้อความขีดฆ่า</s> ',
      };
      document.execCommand('insertHTML', false, map[command]);
    } else {
      document.execCommand(command, false);
    }
    syncNoteEditor();
  };

  const insertNoteSnippet = (html: string) => {
    const el = noteEditorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand('insertHTML', false, html);
    syncNoteEditor();
  };

  const handleSaveUserStudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDisplayName.trim() || !formUsername.trim() || !formEmail.trim()) {
      setFormError('กรุณากรอกชื่อแสดงผล ชื่อผู้ใช้ (Username) และอีเมลให้ครบถ้วน');
      return;
    }

    if (editingUser) {
      onUpdateUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                displayName: formDisplayName.trim(),
                username: formUsername.trim(),
                code: formCode.trim().toUpperCase(),
                email: formEmail.trim(),
                phone: formPhone.trim() || '080-000-0000',
                role: formRole,
                creditBalance: Math.max(0, Number(formCredit) || 0),
                discountPercent: Math.min(100, Math.max(0, Number(formDiscount) || 0)),
                isActive: formIsActive,
                twoFactorEnabled: formTwoFactor,
                noteHtml: formNoteHtml,
              }
            : u
        )
      );
      onShowToast(`บันทึกการแก้ไขข้อมูลสมาชิก "${formDisplayName.trim()}" เรียบร้อย`);
    } else {
      const newUser: UserItem = {
        id: `usr-${Date.now()}`,
        code: formCode.trim().toUpperCase() || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        username: formUsername.trim(),
        displayName: formDisplayName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || '080-000-0000',
        role: formRole,
        creditBalance: Math.max(0, Number(formCredit) || 0),
        totalSpent: 0,
        ordersCount: 0,
        discountPercent: Math.min(100, Math.max(0, Number(formDiscount) || 0)),
        isActive: formIsActive,
        twoFactorEnabled: formTwoFactor,
        joinedAt: '2026-11-08',
        lastLoginAt: '08/11/2026 12:05',
        noteHtml: formNoteHtml,
      };
      onUpdateUsers((prev) => [newUser, ...prev]);
      onShowToast(`เพิ่มสมาชิกใหม่ "${formDisplayName.trim()}" เข้าระบบแล้ว`);
    }

    setIsStudioOpen(false);
    setEditingUser(null);
  };

  // Render In-Page User Studio when adding/editing a user (keeps Sidebar & Topbar intact!)
  if (isStudioOpen) {
    return (
      <div className="w-full flex-1 flex flex-col space-y-5" role="region" aria-label="สตูดิโอตั้งค่าบัญชีผู้ใช้">
        {/* Top Studio Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4 sm:p-5">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                setIsStudioOpen(false);
                setEditingUser(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b] px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ย้อนกลับ</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>สตูดิโอจัดการสมาชิก</span>
                <span>·</span>
                <span className="font-mono text-indigo-500 dark:text-indigo-400">
                  {formCode || 'NEW-USER'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                {editingUser
                  ? `แก้ไขข้อมูลผู้ใช้: ${editingUser.displayName}`
                  : 'เพิ่มบัญชีผู้ใช้ / สมาชิกใหม่'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Account Active Switch */}
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b] px-3.5 py-1.5">
              <button
                type="button"
                role="switch"
                aria-checked={formIsActive}
                onClick={() => setFormIsActive(!formIsActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  formIsActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                    formIsActive ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span
                className={`text-xs font-semibold ${
                  formIsActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-500 dark:text-rose-400'
                }`}
              >
                {formIsActive ? 'เปิดใช้งานบัญชี' : 'ระงับบัญชีชั่วคราว'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsStudioOpen(false);
                setEditingUser(null);
              }}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#16161b] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              form="user-studio-form"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>{editingUser ? 'บันทึกข้อมูลสมาชิก' : 'สร้างบัญชีผู้ใช้'}</span>
            </button>
          </div>
        </div>

        <form id="user-studio-form" onSubmit={handleSaveUserStudio} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Columns */}
          <div className="lg:col-span-8 space-y-5">
            {formError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-400">
                {formError}
              </div>
            )}

            {/* Section 1: Identity & Contact */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      1. ข้อมูลบัญชีผู้ใช้และช่องทางติดต่อ
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      กำหนดชื่อแสดงผล Username อีเมล และเบอร์โทรศัพท์สำหรับรับแจ้งเตือนออเดอร์
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">USER PROFILE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ชื่อ-นามสกุล / ชื่อที่แสดง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="เช่น กิตติพงศ์ อัศวเมธี"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="kittipong_vip"
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <span>รหัสสมาชิก</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormCode(`USR-${Math.floor(1000 + Math.random() * 9000)}`)
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>สุ่ม</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <Mail className="h-3.5 w-3.5 text-indigo-400" />
                    <span>
                      อีเมลรับรหัสสินค้า <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="member@cybermail.io"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>เบอร์โทรศัพท์</span>
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081-xxx-xxxx"
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Role, Credit & Discount */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      2. ระดับสิทธิ์ เครดิตคงเหลือ และส่วนลดประจำตัว
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      กำหนดกลุ่มผู้ใช้งาน ปรับยอดเครดิตในกระเป๋า และตั้งเรทส่วนลดอัตโนมัติ
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">ROLE & WALLET</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => {
                  const active = formRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormRole(r)}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                        active
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="truncate pr-1">{ROLE_LABELS[r]}</span>
                      {active && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                      <span>ยอดเครดิตคงเหลือในกระเป๋า (฿)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {[100, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() =>
                            setFormCredit(String((Number(formCredit) || 0) + amt))
                          }
                          className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400 hover:bg-emerald-500/20"
                        >
                          +{amt}
                        </button>
                      ))}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formCredit}
                    onChange={(e) => setFormCredit(e.target.value)}
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <Percent className="h-3.5 w-3.5 text-amber-400" />
                    <span>ส่วนลดพิเศษประจำตัวเมื่อสั่งซื้อสินค้า (%)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    className="w-full font-mono rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Rich Text Member Note Editor */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>บันทึกหมายเหตุแอดมิน & ประวัติสมาชิก (Rich Text Formatting)</span>
                </label>
              </div>

              <div className="rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] overflow-hidden">
                <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-[#141419] px-2.5 py-1.5">
                  <button
                    type="button"
                    onClick={() => execNoteCommand('bold')}
                    title="ตัวหนา"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('italic')}
                    title="ตัวเอียง"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('underline')}
                    title="ขีดเส้นใต้"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('strikeThrough')}
                    title="ขีดฆ่า"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Strikethrough className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />
                  <button
                    type="button"
                    onClick={() =>
                      insertNoteSnippet(
                        '<span style="color:#34d399;font-weight:600;"><u>เครดิตดีเยี่ยม</u></span> '
                      )
                    }
                    className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-emerald-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Palette className="h-3 w-3" />
                    <span>สีเขียว</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertNoteSnippet(
                        '<span style="background:rgba(99,102,241,0.22);color:#c7d2fe;padding:2px 6px;border-radius:4px;">สิทธิ์เรทตัวแทน</span> '
                      )
                    }
                    className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-indigo-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Highlighter className="h-3 w-3" />
                    <span>ไฮไลท์</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('insertUnorderedList')}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execNoteCommand('removeFormat')}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Eraser className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div
                  ref={noteEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncNoteEditor}
                  className="min-h-[110px] p-3.5 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 focus:outline-none [&_u]:underline [&_u]:decoration-indigo-400 [&_ul]:list-disc [&_ul]:pl-5"
                />
              </div>
            </section>
          </div>

          {/* Right 4 Columns: Security Switches & Live Member Profile Card */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 space-y-3.5">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  สวิตช์สถานะบัญชีและความปลอดภัย
                </h2>
              </div>

              <div
                onClick={() => setFormIsActive(!formIsActive)}
                className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-colors ${
                  formIsActive
                    ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141418]'
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {formIsActive ? (
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <UserX className="h-3.5 w-3.5 text-rose-400" />
                    )}
                    <span>สิทธิ์การเข้าใช้งานระบบ</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {formIsActive ? 'อนุญาตให้ล็อกอินและสั่งซื้อสินค้าได้ปกติ' : 'ระงับการเข้าสู่ระบบและการสั่งซื้อ'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formIsActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormIsActive(!formIsActive);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    formIsActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      formIsActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div
                onClick={() => setFormTwoFactor(!formTwoFactor)}
                className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141418] p-3.5 cursor-pointer"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <Lock className="h-3.5 w-3.5 text-indigo-400" />
                    <span>ยืนยันตัวตน 2 ชั้น (2FA Security)</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    ป้องกันการถอนเครดิตหรือสั่งซื้อด้วยรหัส OTP
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formTwoFactor}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormTwoFactor(!formTwoFactor);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    formTwoFactor ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      formTwoFactor ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Live Member Card Preview */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    การ์ดโปรไฟล์สมาชิก (Live Preview)
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">REALTIME</span>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] p-4 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 font-bold text-sm text-indigo-300">
                    {(formDisplayName || 'U').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {formDisplayName || 'ชื่อสมาชิกใหม่'}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-zinc-500 truncate">
                      @{formUsername || 'username'} · {formCode || 'USR-0000'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                  <div className="rounded-lg bg-white dark:bg-[#121217] p-2.5 border border-zinc-200/60 dark:border-zinc-800/80">
                    <div className="text-[10px] text-zinc-500">เครดิตคงเหลือ</div>
                    <div className="font-mono text-base font-bold text-emerald-500 dark:text-emerald-400">
                      ฿{(Number(formCredit) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-[#121217] p-2.5 border border-zinc-200/60 dark:border-zinc-800/80">
                    <div className="text-[10px] text-zinc-500">ระดับสิทธิ์ · ส่วนลด</div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {ROLE_LABELS[formRole]} (-{Number(formDiscount) || 0}%)
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-lg border border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-[#121217] p-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 [&_u]:underline [&_u]:decoration-indigo-400"
                  dangerouslySetInnerHTML={{ __html: formNoteHtml }}
                />
              </div>
            </section>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col space-y-5">
      {/* Page Title & Action Buttons */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            จัดการผู้ใช้และสมาชิก
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            บริหารจัดการบัญชีสมาชิก ระดับสิทธิ์ตัวแทนจำหน่าย ยอดเครดิตคงเหลือ และสวิตช์เปิด-ปิดสิทธิ์การใช้งาน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportUsersCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
            <span>ส่งออกรายชื่อ CSV</span>
          </button>

          <button
            type="button"
            onClick={openAddUserStudio}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors shadow-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>เพิ่มผู้ใช้ใหม่</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>สมาชิกทั้งหมดในระบบ</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {metrics.totalUsers}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            เปิดใช้งานปกติ {metrics.activeUsers} บัญชี
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            ระงับชั่วคราว {metrics.suspendedUsers} บัญชี
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>เครดิตสมาชิกคงเหลือรวม</span>
            <Wallet className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ฿{metrics.totalCreditBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            ยอดเครดิตพร้อมใช้สั่งซื้อสินค้าอัตโนมัติ
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            เติม/หักเครดิตรายบุคคลได้ทันทีจากตาราง
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>กลุ่ม VIP & ตัวแทนจำหน่าย</span>
            <Crown className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {metrics.vipAndResellerCount}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            ได้รับสิทธิ์ส่วนลดเรทตัวแทนอัตโนมัติ
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            ผู้ดูแลระบบ (Admin) {metrics.adminCount} บัญชี
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>ยอดสั่งซื้อสะสมของสมาชิก</span>
            <ShoppingBag className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            ฿{metrics.totalMemberSpent.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            ยอดชำระเงินสำเร็จรวมทุกบัญชี
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            อัปเดตข้อมูลล่าสุดวันนี้ · เวลาไทย
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800/90 bg-zinc-100/80 dark:bg-[#0b0b0e] p-1"
            role="tablist"
            aria-label="กรองตามกลุ่มผู้ใช้"
          >
            {(
              [
                { id: 'all', label: 'ทั้งหมด', count: metrics.totalUsers, Icon: Users },
                { id: 'active', label: 'ใช้งานปกติ', count: metrics.activeUsers, Icon: UserCheck },
                {
                  id: 'vip_reseller',
                  label: 'VIP & ตัวแทน',
                  count: metrics.vipAndResellerCount,
                  Icon: Crown,
                },
                { id: 'admin', label: 'ผู้ดูแลระบบ', count: metrics.adminCount, Icon: ShieldCheck },
                {
                  id: 'suspended',
                  label: 'ระงับบัญชี',
                  count: metrics.suspendedUsers,
                  Icon: UserX,
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
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
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

          {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#151519] px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="relative md:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสมาชิก, @username, อีเมล, เบอร์โทร หรือรหัส USR..."
              aria-label="ค้นหารายชื่อผู้ใช้"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="relative md:col-span-3">
            <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <select
              aria-label="กรองตามระดับสิทธิ์"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] pl-8 pr-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">ระดับสิทธิ์: ทั้งหมด</option>
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <div className="relative md:col-span-3">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <select
              aria-label="เรียงลำดับสมาชิก"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as UserSortOption)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] pl-8 pr-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="recent_desc">เรียง: สมาชิกล่าสุด</option>
              <option value="credit_desc">เรียง: เครดิตมากไปน้อย</option>
              <option value="spent_desc">เรียง: ยอดซื้อสะสมสูงสุด</option>
              <option value="orders_desc">เรียง: จำนวนออเดอร์สูงสุด</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="flex-1 flex flex-col justify-between w-full rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#111113] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/90 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-[#141418]/60">
                <th className="py-3 pl-4 pr-2.5">สมาชิก · ข้อมูลติดต่อ</th>
                <th className="py-3 px-2.5 whitespace-nowrap">ระดับสิทธิ์ · ส่วนลด</th>
                <th className="py-3 px-2.5 whitespace-nowrap">เครดิตคงเหลือ (ปรับด่วน)</th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">ยอดซื้อสะสม · ออเดอร์</th>
                <th className="py-3 px-2.5 whitespace-nowrap">สถานะบัญชี</th>
                <th className="py-3 pl-2 pr-4 text-right whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70 text-xs">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* User Avatar & Contact */}
                  <td className="py-3.5 pl-4 pr-2.5 align-middle max-w-[260px]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-bold text-xs ${
                          user.role === 'admin'
                            ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                            : user.role === 'reseller'
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                            : user.role === 'vip'
                            ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                            : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {user.displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                          <span className="truncate">{user.displayName}</span>
                          {user.twoFactorEnabled && (
                            <span
                              title="เปิดใช้งาน 2FA แล้ว"
                              className="inline-flex items-center rounded bg-indigo-500/10 px-1 py-0.5 font-mono text-[9px] text-indigo-400"
                            >
                              2FA
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          <span className="font-mono text-zinc-400 dark:text-zinc-300">
                            {user.code}
                          </span>
                          <span>·</span>
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role & Discount */}
                  <td className="py-3.5 px-2.5 align-middle whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                      {user.role === 'admin' && (
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                      )}
                      {user.role === 'vip' && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                      {user.role === 'reseller' && (
                        <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      {user.role === 'member' && (
                        <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
                      )}
                      <span>{ROLE_LABELS[user.role]}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-zinc-500">
                      ส่วนลดประจำตัว {user.discountPercent}% · เข้าล่าสุด {user.lastLoginAt.split(' ')[1]}
                    </div>
                  </td>

                  {/* Credit Balance with Quick Stepper */}
                  <td className="py-3.5 px-2.5 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#16161b]">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjustCredit(user.id, -100)}
                          aria-label={`ลดเครดิต ${user.displayName}`}
                          className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          ฿{user.creditBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjustCredit(user.id, 100)}
                          aria-label={`เพิ่มเครดิต ${user.displayName}`}
                          className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Total Spent & Orders */}
                  <td className="py-3.5 px-2.5 align-middle text-right whitespace-nowrap">
                    <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      ฿{user.totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-zinc-500">
                      สั่งซื้อแล้ว {user.ordersCount.toLocaleString()} ออเดอร์
                    </div>
                  </td>

                  {/* Account Active Toggle Switch */}
                  <td className="py-3.5 px-2.5 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={user.isActive}
                        aria-label={`สวิตช์เปิดปิดบัญชี ${user.displayName}`}
                        onClick={() => handleToggleUserActive(user.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                          user.isActive
                            ? 'bg-emerald-500 hover:bg-emerald-400'
                            : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                            user.isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <div className="leading-tight">
                        <div
                          className={`text-[11px] font-semibold ${
                            user.isActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-500 dark:text-rose-400'
                          }`}
                        >
                          {user.isActive ? 'เปิดใช้งาน' : 'ระงับบัญชี'}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {user.isActive ? 'เข้าสู่ระบบได้' : 'บล็อกชั่วคราว'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 pl-2 pr-4 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCreditModalUser(user);
                          setCreditDeltaInput('500');
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] px-2 py-1 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
                      >
                        <Wallet className="h-3 w-3 text-emerald-400" />
                        <span>เครดิต</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditUserStudio(user)}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] px-2 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>แก้ไข</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        aria-label={`ลบบัญชี ${user.displayName}`}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] text-zinc-500 dark:text-zinc-400 hover:border-rose-500/40 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800/80 px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            แสดงผล{' '}
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
              {filteredUsers.length}
            </span>{' '}
            จากทั้งหมด{' '}
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
              {users.length}
            </span>{' '}
            บัญชีสมาชิก
          </div>
          <div className="font-mono text-[11px]">ระบบจัดการสมาชิก CYBERAPI · เวลาไทย</div>
        </div>
      </div>

      {/* Quick Credit Top-Up / Deduct Modal */}
      {creditModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  ปรับยอดเครดิต: {creditModalUser.displayName}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  เครดิตปัจจุบัน: ฿
                  {creditModalUser.creditBalance.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  จำนวนเครดิตที่ต้องการเพิ่มหรือหัก (฿)
                </label>
                <input
                  type="number"
                  min="1"
                  value={creditDeltaInput}
                  onChange={(e) => setCreditDeltaInput(e.target.value)}
                  className="w-full font-mono text-base font-bold rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2 text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none"
                />
                <div className="mt-2 flex items-center gap-1.5">
                  {[100, 300, 500, 1000, 5000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setCreditDeltaInput(String(v))}
                      className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#17171c] px-2 py-1 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 hover:border-indigo-500"
                    >
                      ฿{v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  หมายเหตุรายการ
                </label>
                <input
                  type="text"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0b0e] px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCreditModalUser(null)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleApplyCreditModal(false)}
                className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
              >
                - หักเครดิต
              </button>
              <button
                type="button"
                onClick={() => handleApplyCreditModal(true)}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
              >
                + เติมเครดิตทันที
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
