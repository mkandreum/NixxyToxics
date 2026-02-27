import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutDashboard, ImageIcon, Calendar, Settings, LogOut,
    Plus, Trash2, Save, Upload, Megaphone, ShoppingBag,
    Mail, Ticket, CheckCircle, Clock, X, Users, ArrowUp, ArrowDown, Star, Check, Edit,
    History, Ticket as CouponIcon, BarChart3
} from "lucide-react";
import { useToast } from "./Toast";

interface AdminDashboardProps {
    onLogout: () => void;
}

const toxicFetch = async (url: string, options: any = {}) => {
    const token = localStorage.getItem('toxic_token');
    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Operation failed, bitch!');
    }
    return res;
};

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onConfirm: (data?: any) => void;
    fields?: { key: string, label: string, type: string, placeholder?: string, value?: any }[];
    confirmText?: string;
}

function CustomModal({ isOpen, onClose, title, onConfirm, fields, confirmText = "Confirm" }: CustomModalProps) {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (isOpen && fields) {
            const initial: any = {};
            fields.forEach(f => {
                if (f.value !== undefined) initial[f.key] = f.value;
            });
            setFormData(initial);
        } else if (isOpen) {
            setFormData({});
        }
    }, [isOpen, fields]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 glass"
                />
                <motion.div
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="bg-[#d9ff36] border-8 border-black p-8 max-w-lg w-full relative z-[301] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 hover:rotate-90 transition-transform">
                        <X size={32} />
                    </button>
                    <h2 className="text-4xl font-black uppercase mb-6 italic tracking-tighter">{title}</h2>

                    {fields && (
                        <div className="space-y-4 mb-8">
                            {fields.map(f => (
                                <div key={f.key} className="space-y-1">
                                    <label className="text-sm font-black uppercase opacity-60 font-mono">{f.label}</label>
                                    <input
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        className="w-full border-4 border-black p-3 text-xl outline-none font-bold"
                                        value={formData[f.key] || ''}
                                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                        autoFocus={fields[0].key === f.key}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {!fields && <p className="text-2xl font-bold uppercase mb-8">Are you sure, bitch? This cannot be undone.</p>}

                    <div className="flex gap-4">
                        <button
                            onClick={() => onConfirm(fields ? formData : true)}
                            className="flex-1 bg-black text-[#d9ff36] py-4 text-2xl uppercase font-black hover:bg-[#ff00ff] hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]"
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'stats' | 'gallery' | 'events' | 'banners' | 'store' | 'orders' | 'smtp' | 'settings' | 'activity' | 'coupons'>('stats');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [data, setData] = useState<any>({ gallery: [], events: [], settings: {}, banners: [], products: [], orders: [], smtp: {}, activity: [], coupons: [], stats: {} });
    const { showToast, hideToast } = useToast();

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean,
        title: string,
        type: 'confirm' | 'form',
        fields?: any[],
        onConfirm: (data?: any) => void
    }>({ isOpen: false, title: '', type: 'confirm', onConfirm: () => { } });

    const openConfirm = (title: string, onConfirm: () => void) => {
        setModalConfig({ isOpen: true, title, type: 'confirm', onConfirm: () => { onConfirm(); closeModal(); } });
    };

    const openForm = (title: string, fields: any[], onConfirm: (data: any) => void) => {
        setModalConfig({ isOpen: true, title, type: 'form', fields, onConfirm: (data) => { onConfirm(data); closeModal(); } });
    };

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const refreshData = async () => {
        try {
            const [gal, ev, sets, bans, prods, ords, smtp, activity, coupons, stats] = await Promise.all([
                toxicFetch('/api/gallery').then(r => r.json()),
                toxicFetch('/api/events').then(r => r.json()),
                toxicFetch('/api/settings').then(r => r.json()),
                toxicFetch('/api/banners').then(r => r.json()),
                toxicFetch('/api/products').then(r => r.json()),
                toxicFetch('/api/orders').then(r => r.json()),
                toxicFetch('/api/smtp').then(r => r.json()),
                toxicFetch('/api/activity').then(r => r.json()),
                toxicFetch('/api/coupons').then(r => r.json()),
                toxicFetch('/api/admin/stats').then(r => r.json())
            ]);
            setData({ gallery: gal, events: ev, settings: sets, banners: bans, products: prods, orders: ords, smtp, activity, coupons, stats });
        } catch (err) {
            console.error("Error fetching admin data:", err);
        }
    };

    useEffect(() => { refreshData(); }, []);

    const handleAddNew = () => {
        if (activeTab === 'gallery') {
            document.getElementById('gallery-upload-input')?.click();
        } else if (activeTab === 'events') {
            openForm("New Show", [
                { key: 'city', label: 'City', type: 'text', placeholder: 'MADRID' },
                { key: 'venue', label: 'Venue', type: 'text', placeholder: 'LA RIVIERA' },
                { key: 'date', label: 'Date', type: 'text', placeholder: 'OCT 31' },
                { key: 'ticket_price', label: 'Price (EUR)', type: 'number', placeholder: '15.00' },
                { key: 'tickets_available', label: 'Stock (Tickets)', type: 'number', placeholder: '100', value: 100 }
            ], async (formData) => {
                const toastId = showToast("Adding Show...", "loading");
                try {
                    await toxicFetch('/api/events', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    refreshData();
                    showToast("Show added!", "success");
                } catch (err: any) {
                    showToast(err.message || "Failed to add show", "error");
                } finally {
                    hideToast(toastId);
                }
            });
        } else if (activeTab === 'banners') {
            openForm("New Banner", [
                { key: 'text', label: 'Banner Text', type: 'text', placeholder: 'SALE 50% OFF!' }
            ], async (formData) => {
                showToast("Creating banner...", "loading");
                await toxicFetch('/api/banners', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, bg_color: '#d9ff36', text_color: 'black' })
                });
                refreshData();
                showToast("Banner added!", "success");
            });
        } else if (activeTab === 'store') {
            document.getElementById('product-upload-input')?.click();
        } else if (activeTab === 'coupons') {
            openForm("New Coupon", [
                { key: 'code', label: 'Promo Code', type: 'text', placeholder: 'TOXIC20' },
                { key: 'discount_percent', label: 'Discount %', type: 'number', placeholder: '20' }
            ], async (formData) => {
                showToast("Creating coupon...", "loading");
                await toxicFetch('/api/coupons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                refreshData();
                showToast("Coupon created!", "success");
            });
        }
    };

    const tabs = [
        { id: 'stats', label: 'Stats', icon: BarChart3 },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'store', label: 'Merch', icon: ShoppingBag },
        { id: 'events', label: 'Shows', icon: Calendar },
        { id: 'coupons', label: 'Coupons', icon: CouponIcon },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'banners', label: 'Banners', icon: Megaphone },
        { id: 'activity', label: 'Logs', icon: History },
        { id: 'smtp', label: 'Email', icon: Mail },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const logout = () => {
        openConfirm("Logout?", () => {
            localStorage.removeItem('toxic_token');
            onLogout();
        });
    };

    return (
        <div className="min-h-screen bg-white text-black font-mono flex flex-col md:flex-row">
            <CustomModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                onConfirm={modalConfig.onConfirm}
                fields={modalConfig.fields}
                confirmText={modalConfig.type === 'confirm' ? "DO IT!" : "SAVE"}
            />

            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-[100] bg-[#d9ff36] border-b-4 border-black p-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_black]">
                        <LayoutDashboard size={24} />
                    </button>
                    <span className="font-black uppercase tracking-tighter text-xl">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </span>
                </div>
                <button onClick={logout} className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_black]">
                    <LogOut size={24} />
                </button>
            </header>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 glass z-[190] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Mobile Drawer / Desktop Static) */}
            <aside className={`
                fixed inset-y-0 left-0 z-[200] bg-[#d9ff36] transform transition-transform duration-300 md:relative md:translate-x-0 md:z-0
                ${isMobileMenuOpen ? 'translate-x-0 shadow-[20px_0px_60px_rgba(0,0,0,0.5)]' : '-translate-x-full md:translate-x-0'}
                w-[85%] md:w-80 border-r-4 border-black flex flex-col md:shadow-none
            `}>
                <div className="p-8 border-b-4 border-black flex justify-between items-center bg-black text-[#d9ff36]">
                    <h1 className="text-3xl md:text-4xl font-logo uppercase leading-none">Toxic<br className="hidden md:block" /> Panel</h1>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 border-2 border-[#d9ff36]">
                        <X size={28} />
                    </button>
                </div>
                <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto pt-8">
                    <div className="md:hidden mb-4 opacity-50 text-sm font-black uppercase tracking-widest px-4">Admin Menu</div>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-4 p-4 text-xl uppercase font-black border-4 transition-all ${activeTab === tab.id
                                ? 'bg-black text-[#d9ff36] border-black shadow-[4px_4px_0px_0px_black]'
                                : 'border-transparent hover:border-black/20'
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
                <button
                    onClick={logout}
                    className="p-8 border-t-4 border-black flex items-center gap-4 text-2xl uppercase font-black hover:bg-black hover:text-[#d9ff36] transition-colors md:flex hidden"
                >
                    <LogOut size={24} /> Logout
                </button>
            </aside>

            <main className="flex-1 p-4 md:p-12 overflow-y-auto pt-6 md:pt-12">
                <header className="mb-6 md:mb-12 flex justify-between items-end border-b-4 border-black pb-4 md:pb-8">
                    <div>
                        <h2 className="text-4xl md:text-6xl uppercase font-black tracking-tighter">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-sm md:text-xl uppercase opacity-50">Manage your toxic empire</p>
                    </div>
                    {['gallery', 'events', 'banners', 'store'].includes(activeTab) && (
                        <button
                            onClick={handleAddNew}
                            className="bg-black text-white px-6 py-3 text-xl uppercase font-black flex items-center gap-2 hover:bg-[#ff00ff] hover:text-black transition-colors shadow-[6px_6px_0px_0px_#000000]"
                        >
                            <Plus size={24} /> Add New
                        </button>
                    )}
                </header>

                <div className="grid gap-8">
                    {activeTab === 'stats' && <OverviewTab data={data.stats} />}
                    {activeTab === 'activity' && <ActivityTab items={data.activity} />}
                    {activeTab === 'coupons' && <CouponsTab items={data.coupons} onUpdate={refreshData} openForm={openForm} openConfirm={openConfirm} />}
                    {activeTab === 'gallery' && <GalleryTab items={data.gallery} onUpdate={refreshData} openConfirm={openConfirm} />}
                    {activeTab === 'events' && <EventsTab items={data.events} onUpdate={refreshData} openConfirm={openConfirm} openForm={openForm} />}
                    {activeTab === 'banners' && <BannersTab items={data.banners} onUpdate={refreshData} openConfirm={openConfirm} />}
                    {activeTab === 'store' && <StoreTab items={data.products} onUpdate={refreshData} openConfirm={openConfirm} openForm={openForm} />}
                    {activeTab === 'orders' && <OrdersTab items={data.orders} onUpdate={refreshData} openConfirm={openConfirm} />}
                    {activeTab === 'smtp' && <SMTPTab smtp={data.smtp} onUpdate={refreshData} />}
                    {activeTab === 'settings' && <SettingsTab settings={data.settings} onUpdate={refreshData} />}
                </div>
            </main>
        </div>
    );
}

function OverviewTab({ data }: { data: any }) {
    if (!data) return <p className="text-center py-20 opacity-40 uppercase font-black">Loading stats...</p>;

    return (
        <div className="space-y-12 pb-20">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] bg-[#d9ff36] group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform"><BarChart3 size={100} /></div>
                    <p className="text-xl uppercase font-black mb-2 opacity-60 relative z-10">Total Revenue</p>
                    <p className="text-6xl font-black italic relative z-10">{data.totalRevenue?.toFixed(2) || 0}€</p>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] bg-white text-black relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform"><ShoppingBag size={100} /></div>
                    <p className="text-xl uppercase font-black mb-2 opacity-40 relative z-10">Total Orders</p>
                    <p className="text-6xl font-black relative z-10">{data.orderCount || 0}</p>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] bg-black text-[#d9ff36] relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform"><Ticket size={100} /></div>
                    <p className="text-xl uppercase font-black mb-2 opacity-60 relative z-10">Active Merch</p>
                    <p className="text-6xl font-black relative z-10">{data.productCount || 0}</p>
                </motion.div>
            </div>

            {/* Daily Sales Chart */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                {data.dailySales && data.dailySales.length > 0 ? (
                    <div className="border-8 border-black p-4 md:p-8 bg-white shadow-[12px_12px_0px_0px_black] overflow-x-auto">
                        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                            <h3 className="text-2xl font-black uppercase italic">Sales Pulse (Last 7 Days)</h3>
                            <span className="bg-[#ff00ff] text-white px-3 py-1 text-xs font-black uppercase">Live Data</span>
                        </div>
                        <div className="flex items-end gap-2 md:gap-4 h-64 min-w-[600px] border-b-4 border-l-4 border-black pl-4 mb-4">
                            {data.dailySales.map((s: any, i: number) => {
                                const max = Math.max(...data.dailySales.map((d: any) => d.amount));
                                const height = max > 0 ? (s.amount / max) * 100 : 0;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                        <div className="absolute -top-10 bg-black text-[#d9ff36] px-3 py-1 text-sm font-black opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-10 shadow-[4px_4px_0px_0px_#ff00ff]">{s.amount}€</div>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            className="w-full bg-[#ff00ff] border-2 border-black hover:bg-black transition-all cursor-pointer relative"
                                            whileHover={{ scaleX: 1.1 }}
                                        />
                                        <span className="text-[10px] uppercase font-black mt-4 rotate-45 md:rotate-0 whitespace-nowrap mb-2">{new Date(s.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="border-8 border-black p-20 bg-gray-50 text-center opacity-30 text-3xl font-black uppercase">No Sales History Yet</div>
                )}
            </motion.div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Best Sellers */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="border-4 border-black p-8 bg-white shadow-[12px_12px_0px_0px_black]">
                    <h3 className="text-3xl font-black uppercase mb-8 italic border-b-4 border-black pb-4 flex items-center gap-4">
                        <Star className="text-[#ff00ff]" fill="currentColor" /> Top Merch
                    </h3>
                    <div className="space-y-4">
                        {data.productStats && data.productStats.length > 0 ? (
                            data.productStats.sort((a: any, b: any) => b.qty - a.qty).slice(0, 5).map((p: any, i: number) => (
                                <div key={i} className="flex items-center justify-between border-b-2 border-black pb-2 group hover:translate-x-2 transition-transform">
                                    <span className="text-xl font-black uppercase italic group-hover:text-[#ff00ff]">{p.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-black opacity-40">{Math.round((p.qty / data.orderCount) * 100 || 0)}% of orders</span>
                                        <span className="bg-black text-[#d9ff36] px-4 py-1 font-mono font-black shadow-[4px_4px_0px_0px_#ff00ff]">{p.qty} SOLD</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="opacity-30 uppercase font-black text-center py-10 italic">No sales data recorded</p>
                        )}
                    </div>
                </motion.div>

                {/* Performance Summary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="border-4 border-black p-8 bg-[#d9ff36] shadow-[12px_12px_0px_0px_black] flex flex-col justify-center text-center">
                    <h3 className="text-4xl font-black uppercase mb-4 italic tracking-tighter">Toxic Performance</h3>
                    <p className="text-xl font-bold uppercase mb-8 opacity-60">Your empire is growing, Bitch!</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border-4 border-black p-4 bg-white">
                            <p className="text-xs font-black uppercase opacity-40">Avg Order</p>
                            <p className="text-3xl font-black italic">{(data.totalRevenue / data.orderCount || 0).toFixed(2)}€</p>
                        </div>
                        <div className="border-4 border-black p-4 bg-white">
                            <p className="text-xs font-black uppercase opacity-40">Top Sale</p>
                            <p className="text-3xl font-black italic">{Math.max(...(data.dailySales?.map((s: any) => s.amount) || [0])).toFixed(2)}€</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function GalleryTab({ items, onUpdate, openConfirm }: { items: any[], onUpdate: () => void, openConfirm: any }) {
    const { showToast, hideToast } = useToast();

    const handleDelete = (id: number) => {
        openConfirm("Delete Photo?", async () => {
            showToast("Deleting photo...", "loading");
            await toxicFetch(`/api/gallery/${id}`, { method: 'DELETE' });
            onUpdate();
            showToast("Photo deleted!", "success");
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const toastId = showToast("Optimizing photo...", "loading");
        const formData = new FormData();
        formData.append('photo', file);
        try {
            await toxicFetch('/api/gallery', { method: 'POST', body: formData });
            onUpdate();
            showToast("Uploaded!", "success");
        } finally {
            hideToast(toastId);
        }
    };

    const moveItem = async (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;

        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

        try {
            await toxicFetch('/api/gallery/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemIds: newItems.map(i => i.id) })
            });
            onUpdate();
        } catch (err) {
            showToast("Failed to reorder", "error");
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item, i) => (
                <div key={item.id} className="group relative border-4 border-black aspect-square overflow-hidden bg-gray-100 shadow-[4px_4px_0px_0px_#000] flex flex-col">
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end gap-1">
                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500 text-white border-2 border-black hover:scale-110 transition-transform">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => moveItem(i, 'up')} disabled={i === 0} className="flex-1 p-2 bg-white border-2 border-black disabled:opacity-30 hover:bg-[#d9ff36] transition-colors flex justify-center">
                                <ArrowUp size={16} />
                            </button>
                            <button onClick={() => moveItem(i, 'down')} disabled={i === items.length - 1} className="flex-1 p-2 bg-white border-2 border-black disabled:opacity-30 hover:bg-[#d9ff36] transition-colors flex justify-center">
                                <ArrowDown size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            <label className="border-4 border-dashed border-black aspect-square flex flex-col items-center justify-center gap-2 hover:bg-black/5 transition-colors cursor-pointer bg-white">
                <input id="gallery-upload-input" type="file" className="hidden" onChange={handleUpload} />
                <Upload size={32} />
                <span className="uppercase font-black">Upload</span>
            </label>
        </div>
    );
}

function EventsTab({ items, onUpdate, openConfirm, openForm }: { items: any[], onUpdate: () => void, openConfirm: any, openForm: any }) {
    const { showToast, hideToast } = useToast();
    const [attendees, setAttendees] = useState<{ isOpen: boolean, list: any[], title: string }>({ isOpen: false, list: [], title: '' });

    const viewAttendees = async (event: any) => {
        const toastId = showToast("Fetching attendees...", "loading");
        try {
            const res = await toxicFetch(`/api/events/${event.id}/attendees`);
            const list = await res.json();
            setAttendees({ isOpen: true, list, title: `${event.city} - ${event.date}` });
        } catch (err) {
            showToast("Failed to fetch attendees", "error");
        } finally {
            hideToast(toastId);
        }
    };

    return (
        <div className="space-y-4">
            {items.map((event) => (
                <div key={event.id} className="border-4 border-black p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[8px_8px_0px_0px_#000] bg-white">
                    <div className="flex gap-8 items-center flex-1">
                        <div className="text-4xl font-black bg-black text-[#d9ff36] p-4 min-w-[140px] text-center">{event.date}</div>
                        <div>
                            <p className="text-2xl font-black uppercase">{event.city}</p>
                            <p className="text-xl uppercase opacity-60 font-bold">{event.venue}</p>
                            <div className="flex gap-2 flex-wrap mt-1">
                                <p className="text-lg bg-[#ff00ff] text-white px-2 inline-block uppercase font-black">{event.ticket_price}€</p>
                                <p className={`text-lg px-2 inline-block uppercase font-black border-2 border-black ${event.tickets_available <= 0 ? 'bg-red-500 text-white' : 'bg-[#d9ff36] text-black'}`}>
                                    {event.tickets_available <= 0 ? 'SOLD OUT' : `${event.tickets_available} LEFT`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            className="p-4 border-4 border-black hover:bg-[#d9ff36] transition-colors flex items-center gap-2 font-black uppercase"
                            onClick={() => viewAttendees(event)}
                        >
                            <Users size={24} /> <span className="hidden md:inline">Attendees</span>
                        </button>
                        <button
                            className="p-4 border-4 border-black hover:bg-black hover:text-[#d9ff36] transition-colors"
                            onClick={() => {
                                openForm("Edit Show", [
                                    { key: 'date', label: 'Date', type: 'text', placeholder: 'FEB 24', value: event.date },
                                    { key: 'city', label: 'City', type: 'text', placeholder: 'MADRID', value: event.city },
                                    { key: 'venue', label: 'Venue', type: 'text', placeholder: 'SALA COOL', value: event.venue },
                                    { key: 'ticket_price', label: 'Price (EUR)', type: 'number', value: event.ticket_price },
                                    { key: 'buy_url', label: 'Buy URL', type: 'text', value: event.buy_url },
                                    { key: 'tickets_available', label: 'Stock (Tickets)', type: 'number', value: event.tickets_available }
                                ], async (data) => {
                                    showToast("Saving...", "loading");
                                    await toxicFetch(`/api/events/${event.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    });
                                    onUpdate();
                                    showToast("Show updated!", "success");
                                });
                            }}
                        >
                            <Edit size={24} />
                        </button>
                        <button className="p-4 border-4 border-black hover:bg-red-500 hover:text-white transition-colors" onClick={() => {
                            openConfirm("Delete Show?", async () => {
                                showToast("Deleting...", "loading");
                                await toxicFetch(`/api/events/${event.id}`, { method: 'DELETE' });
                                onUpdate();
                                showToast("Deleted!", "success");
                            });
                        }}>
                            <Trash2 size={24} />
                        </button>
                    </div>
                </div>
            ))}

            {/* Attendees Modal */}
            <AnimatePresence>
                {attendees.isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAttendees(prev => ({ ...prev, isOpen: false }))} className="absolute inset-0 bg-black/80 glass" />
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white border-8 border-black p-8 max-w-2xl w-full relative z-[201] shadow-[20px_20px_0px_0px_#000] max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-4">
                                <h3 className="text-3xl font-black uppercase italic">{attendees.title}</h3>
                                <button onClick={() => setAttendees(prev => ({ ...prev, isOpen: false }))}><X size={40} /></button>
                            </div>

                            <div className="space-y-4">
                                {attendees.list.length === 0 ? (
                                    <p className="text-center py-10 opacity-40 uppercase font-black">No tickets sold yet, Bitch!</p>
                                ) : (
                                    attendees.list.map((person, i) => (
                                        <div key={i} className="border-2 border-black p-4 flex justify-between items-center bg-gray-50">
                                            <div>
                                                <p className="font-black uppercase text-xl">{person.customer_name}</p>
                                                <p className="font-mono opacity-60">{person.customer_email}</p>
                                            </div>
                                            <div className="text-right text-sm opacity-40 font-bold uppercase">
                                                {new Date(person.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StoreTab({ items, onUpdate, openConfirm, openForm }: { items: any[], onUpdate: () => void, openConfirm: any, openForm: any }) {
    const { showToast, hideToast } = useToast();

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        openForm("Add Product", [
            { key: 'name', label: 'Product Name', type: 'text', placeholder: 'TOXIC HOODIE' },
            { key: 'price', label: 'Price (EUR)', type: 'number', placeholder: '25.00' },
            { key: 'stock', label: 'Stock (-1 for UNLIMITED)', type: 'number', placeholder: '50', value: -1 },
            { key: 'badge', label: 'Badge (WOW, TOOXICO, ⚡, 🔥)', type: 'text', placeholder: '🔥 TOOXICO' }
        ], async (formData) => {
            const toastId = showToast("Uploading product...", "loading");
            const fd = new FormData();
            fd.append('image', file);
            fd.append('name', formData.name);
            fd.append('price', formData.price);
            fd.append('stock', formData.stock);
            fd.append('badge', formData.badge || '');

            try {
                await toxicFetch('/api/products', { method: 'POST', body: fd });
                onUpdate();
                showToast("Product added!", "success");
            } finally {
                hideToast(toastId);
            }
        });
    };

    const handleDelete = (id: number) => {
        openConfirm("Delete Product?", async () => {
            showToast("Deleting...", "loading");
            await toxicFetch(`/api/products/${id}`, { method: 'DELETE' });
            onUpdate();
            showToast("Product deleted!", "success");
        });
    };

    const moveItem = async (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;

        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

        try {
            await toxicFetch('/api/products/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: newItems.map(i => i.id) })
            });
            onUpdate();
        } catch (err) {
            showToast("Failed to reorder", "error");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {items.map((prod, i) => (
                <div key={prod.id} className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000] overflow-hidden group flex flex-col">
                    <div className="aspect-square relative flex items-center justify-center p-4">
                        {prod.badge && (
                            <div className="absolute top-2 left-2 z-10 bg-[#ff00ff] text-white px-3 py-1 font-black uppercase text-xs border-2 border-black rotate-[-5deg] shadow-[2px_2px_0px_0px_black]">
                                {prod.badge}
                            </div>
                        )}
                        <img src={prod.image_url} alt={prod.name} className="max-h-full object-contain" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between border-t-4 border-black bg-[#f8f8f8]">
                        <div className="mb-4">
                            <p className="font-black uppercase text-xl leading-tight">{prod.name}</p>
                            <p className="text-2xl font-black text-[#ff00ff] italic">{prod.price}€</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => moveItem(i, 'up')} disabled={i === 0} className="flex-1 p-2 border-2 border-black hover:bg-[#d9ff36] disabled:opacity-20 flex justify-center"><ArrowUp size={20} /></button>
                            <button onClick={() => moveItem(i, 'down')} disabled={i === items.length - 1} className="flex-1 p-2 border-2 border-black hover:bg-[#d9ff36] disabled:opacity-20 flex justify-center"><ArrowDown size={20} /></button>
                            <button
                                onClick={() => {
                                    openForm("Edit Product", [
                                        { key: 'name', label: 'Product Name', type: 'text', value: prod.name },
                                        { key: 'price', label: 'Price (EUR)', type: 'number', value: prod.price },
                                        { key: 'stock', label: 'Stock (-1 = unlimited)', type: 'number', value: prod.stock },
                                        { key: 'badge', label: 'Badge', type: 'text', value: prod.badge }
                                    ], async (data) => {
                                        showToast("Saving...", "loading");
                                        const fd = new FormData();
                                        fd.append('name', data.name);
                                        fd.append('price', data.price);
                                        fd.append('stock', data.stock);
                                        fd.append('badge', data.badge || '');
                                        fd.append('image_url', prod.image_url); // Keep existing UI image URL

                                        await toxicFetch(`/api/products/${prod.id}`, {
                                            method: 'PATCH',
                                            body: fd
                                        });
                                        onUpdate();
                                        showToast("Product updated!", "success");
                                    });
                                }}
                                className="flex-1 p-2 border-2 border-black hover:bg-black hover:text-[#d9ff36] flex justify-center"
                            >
                                <Edit size={20} />
                            </button>
                            <button onClick={() => handleDelete(prod.id)} className="flex-1 p-2 border-2 border-black hover:bg-red-500 hover:text-white flex justify-center"><Trash2 size={20} /></button>
                        </div>
                    </div>
                </div>
            ))}
            <label className="border-4 border-dashed border-black aspect-square flex flex-col items-center justify-center gap-4 hover:bg-black/5 transition-colors cursor-pointer bg-white group shadow-[8px_8px_0px_0px_#ddd]">
                <input id="product-upload-input" type="file" className="hidden" onChange={handleUpload} />
                <Plus size={48} />
                <span className="uppercase font-black text-2xl">Add Product</span>
            </label>
        </div>
    );
}

function OrdersTab({ items, onUpdate, openConfirm }: { items: any[], onUpdate: () => void, openConfirm: any }) {
    const { showToast } = useToast();

    const updateStatus = async (id: number, status: string) => {
        await toxicFetch(`/api/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        onUpdate();
        showToast(`Order ${status}!`, "success");
    };

    const deleteOrder = (id: number) => {
        openConfirm("Delete Order Record?", async () => {
            await toxicFetch(`/api/orders/${id}`, { method: 'DELETE' });
            onUpdate();
            showToast("Order deleted", "success");
        });
    };

    return (
        <div className="space-y-4">
            {items.map((order) => {
                const orderItems = JSON.parse(order.items || '[]');
                const isCompleted = order.status === 'completed';
                return (
                    <div key={order.id} className={`border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden transition-all ${isCompleted ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                        {isCompleted && <div className="absolute top-4 right-4 text-green-600 font-black uppercase text-xl flex items-center gap-2 rotate-12 border-4 border-green-600 p-2">COMPLETED</div>}
                        <div className="flex flex-col md:flex-row justify-between mb-4 border-b-2 border-black pb-4">
                            <div>
                                <h3 className="text-2xl font-black">ORDER #{order.order_id}</h3>
                                <p className="text-xl uppercase font-bold opacity-60">{order.customer_name} • {order.customer_email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-[#ff00ff]">{order.total}€</p>
                                {order.discount_applied > 0 && <p className="text-green-600 font-bold uppercase text-xs">Discounted -{order.discount_applied}€</p>}
                                <p className="uppercase font-bold text-xs">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="grid gap-2 mb-6">
                            {orderItems.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between uppercase font-bold">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>{item.price * item.quantity}€</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            {!isCompleted && (
                                <button
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    className="px-6 py-2 bg-[#d9ff36] border-4 border-black font-black uppercase flex items-center gap-2 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_black] transition-all"
                                >
                                    <Check size={20} /> Complete
                                </button>
                            )}
                            <button
                                onClick={() => deleteOrder(order.id)}
                                className="px-6 py-2 bg-red-500 text-white border-4 border-black font-black uppercase flex items-center gap-2 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_black] transition-all"
                            >
                                <Trash2 size={20} /> Delete
                            </button>
                        </div>
                    </div>
                );
            })}
            {items.length === 0 && <p className="text-center py-20 text-2xl uppercase opacity-40 font-black">No orders yet, Bitch!</p>}
        </div>
    );
}

function SMTPTab({ smtp, onUpdate }: { smtp: any, onUpdate: () => void }) {
    const { showToast } = useToast();
    const [formData, setFormData] = useState(smtp);

    useEffect(() => { setFormData(smtp); }, [smtp]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        showToast("Saving SMTP config...", "loading");
        await toxicFetch('/api/smtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        onUpdate();
        showToast("SMTP Configured!", "success");
    };

    return (
        <form onSubmit={handleSave} className="max-w-4xl space-y-8">
            <div className="bg-[#d9ff36]/10 border-4 border-black p-6 space-y-6">
                <div className="flex items-center gap-4 border-b-2 border-black pb-6">
                    <input
                        type="checkbox"
                        checked={formData.enabled === 1}
                        onChange={e => setFormData({ ...formData, enabled: e.target.checked ? 1 : 0 })}
                        className="w-10 h-10 accent-black border-4 border-black"
                    />
                    <label className="text-3xl font-black uppercase">Enable Notifications</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="font-black uppercase text-sm opacity-60">SMTP Host</label>
                        <input type="text" value={formData.host || ''} onChange={e => setFormData({ ...formData, host: e.target.value })} className="w-full border-4 border-black p-4 outline-none font-bold bg-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="font-black uppercase text-sm opacity-60">Port</label>
                        <input type="number" value={formData.port || ''} onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })} className="w-full border-4 border-black p-4 outline-none font-bold bg-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="font-black uppercase text-sm opacity-60">Username / Email</label>
                        <input type="text" value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full border-4 border-black p-4 outline-none font-bold bg-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="font-black uppercase text-sm opacity-60">Password</label>
                        <input type="password" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border-4 border-black p-4 outline-none font-bold bg-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-black">
                    <div className="space-y-2">
                        <label className="font-black uppercase text-sm opacity-60">Sender Name (e.g. Nixxy Toxic)</label>
                        <input type="text" value={formData.from_name || ''} onChange={e => setFormData({ ...formData, from_name: e.target.value })} className="w-full border-4 border-black p-4 outline-none font-bold bg-white" placeholder="Nixxy Toxic" />
                    </div>
                    <div className="space-y-2">
                        <label className="font-black uppercase text-sm opacity-60">Sender Email (e.g. no-reply@site.com)</label>
                        <input type="text" value={formData.from_email || ''} onChange={e => setFormData({ ...formData, from_email: e.target.value })} className="w-full border-4 border-black p-4 outline-none font-bold bg-white" placeholder="no-reply@yourdomain.com" />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter border-b-4 border-black pb-2">Email Templates</h3>

                <div className="space-y-2">
                    <label className="font-black uppercase">Order Message (Custom intro)</label>
                    <textarea
                        value={formData.order_template || ''}
                        onChange={e => setFormData({ ...formData, order_template: e.target.value })}
                        className="w-full border-4 border-black p-4 outline-none font-bold bg-white min-h-[120px]"
                        placeholder="Thanks for being toxic! Your order is being processed..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-black uppercase">Purchase Instructions (Payment details, etc)</label>
                    <textarea
                        value={formData.order_instructions || ''}
                        onChange={e => setFormData({ ...formData, order_instructions: e.target.value })}
                        className="w-full border-4 border-black p-4 outline-none font-bold bg-black text-[#d9ff36] min-h-[150px]"
                        placeholder="Steps for payment go here..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-black uppercase">Ticket Message (Live show intro)</label>
                    <textarea
                        value={formData.ticket_template || ''}
                        onChange={e => setFormData({ ...formData, ticket_template: e.target.value })}
                        className="w-full border-4 border-black p-4 outline-none font-bold bg-white min-h-[120px]"
                        placeholder="You are ready for the show! Here is your ticket..."
                    />
                </div>
            </div>

            <div className="pt-6">
                <button type="submit" className="w-full md:w-auto bg-black text-[#d9ff36] px-12 py-6 text-3xl uppercase font-black hover:bg-[#ff00ff] hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    Save All SMTP & Email Settings
                </button>
            </div>
        </form>
    );
}

function SettingsTab({ settings, onUpdate }: { settings: any, onUpdate: () => void }) {
    const { showToast, hideToast } = useToast();
    const [logoText, setLogoText] = useState(settings.site_logo_text || "Nixxy Toxic");
    const [heroPhrase, setHeroPhrase] = useState(settings.hero_phrase || "It's Nixxy Toxic Bitch!");
    const [password, setPassword] = useState("");
    const [bgVideo, setBgVideo] = useState(settings.gallery_bg_video || "");
    const [logoUrl, setLogoUrl] = useState(settings.site_logo_url || "");
    const [heroImageUrl, setHeroImageUrl] = useState(settings.hero_image_url || "");

    const handleSave = async () => {
        showToast("Saving settings...", "loading");
        const updates: any = {
            site_logo_text: logoText,
            hero_phrase: heroPhrase
        };
        if (password) updates.admin_password = password;
        await toxicFetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        onUpdate();
        showToast("Settings saved!", "success");
    };

    const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const toastId = showToast("Uploading hero image...", "loading");
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await toxicFetch('/api/settings/hero-image', { method: 'POST', body: formData });
            const data = await res.json();
            setHeroImageUrl(data.url);
            onUpdate();
            showToast("Hero image updated!", "success");
        } finally {
            hideToast(toastId);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const toastId = showToast("Uploading video...", "loading");
        const formData = new FormData();
        formData.append('video', file);
        try {
            const res = await toxicFetch('/api/settings/gallery-bg', { method: 'POST', body: formData });
            const data = await res.json();
            setBgVideo(data.url);
            onUpdate();
            showToast("Video updated!", "success");
        } finally {
            hideToast(toastId);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const toastId = showToast("Uploading logo...", "loading");
        const formData = new FormData();
        formData.append('logo', file);
        try {
            const res = await toxicFetch('/api/settings/logo', { method: 'POST', body: formData });
            const data = await res.json();
            setLogoUrl(data.url);
            onUpdate();
            showToast("Logo updated!", "success");
        } finally {
            hideToast(toastId);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
                <label className="block text-2xl uppercase font-black">Logo Text (Fallback)</label>
                <input type="text" value={logoText} onChange={(e) => setLogoText(e.target.value)} className="w-full border-4 border-black p-4 text-2xl outline-none focus:bg-[#d9ff36]/10" />
            </div>

            <div className="space-y-4">
                <label className="block text-2xl uppercase font-black">Hero Phrase</label>
                <input type="text" value={heroPhrase} onChange={(e) => setHeroPhrase(e.target.value)} className="w-full border-4 border-black p-4 text-2xl outline-none focus:bg-[#d9ff36]/10" />
            </div>

            <div className="space-y-4">
                <label className="block text-2xl uppercase font-black">Hero Main Image (PNG/WebP)</label>
                <div className="border-4 border-black p-4 bg-gray-50 flex items-center justify-between gap-4">
                    <div className="flex-1 flex items-center gap-4">
                        {heroImageUrl && <img src={heroImageUrl} alt="Hero Preview" className="h-12 w-12 object-contain border-2 border-black" />}
                        <span className="truncate uppercase font-bold opacity-60">
                            {heroImageUrl ? "Hero image uploaded" : "No hero image"}
                        </span>
                    </div>
                    <label className="bg-black text-[#d9ff36] px-4 py-2 uppercase font-black cursor-pointer hover:bg-[#ff00ff] transition-colors">
                        <Upload size={20} className="inline mr-2" /> Upload Image
                        <input type="file" className="hidden" onChange={handleHeroImageUpload} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="block text-2xl uppercase font-black">Site Logo (PNG)</label>
                    <div className="border-4 border-black p-4 flex flex-col items-center gap-4 h-64 justify-center bg-gray-50">
                        {logoUrl ? <img src={logoUrl} className="h-32 w-auto object-contain shadow-md" /> : <p className="opacity-40 uppercase">No logo</p>}
                        <label className="bg-black text-white px-4 py-2 uppercase font-bold cursor-pointer hover:bg-[#ff00ff]">
                            Upload PNG
                            <input type="file" className="hidden" accept="image/png" onChange={handleLogoUpload} />
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-2xl uppercase font-black">Gallery BG Video</label>
                    <div className="border-4 border-black p-4 flex flex-col items-center gap-4 h-64 justify-center bg-gray-50">
                        {bgVideo ? <p className="font-bold uppercase text-xs break-all text-center">{bgVideo.split('/').pop()}</p> : <p className="opacity-40 uppercase">No video</p>}
                        <label className="bg-black text-white px-4 py-2 uppercase font-bold cursor-pointer hover:bg-[#00ff00]">
                            Upload MP4
                            <input type="file" className="hidden" accept="video/mp4" onChange={handleVideoUpload} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-8 border-t-4 border-black">
                <label className="block text-2xl uppercase font-black">New Admin Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Change only if needed..." className="w-full border-4 border-black p-4 text-2xl outline-none" />
            </div>

            <button onClick={handleSave} className="w-full bg-black text-[#d9ff36] py-6 text-4xl uppercase font-black hover:bg-[#ff00ff] hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                Save All Settings
            </button>
        </div>
    );
}

function BannersTab({ items, onUpdate, openConfirm }: { items: any[], onUpdate: () => void, openConfirm: any }) {
    const { showToast } = useToast();
    const toggleActive = async (id: number, current: number) => {
        await toxicFetch(`/api/banners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: current === 1 ? 0 : 1 })
        });
        onUpdate();
    };

    const handleDelete = (id: number) => {
        openConfirm("Delete Banner?", async () => {
            showToast("Deleting banner...", "loading");
            await toxicFetch(`/api/banners/${id}`, { method: 'DELETE' });
            onUpdate();
            showToast("Banner deleted!", "success");
        });
    };

    return (
        <div className="space-y-4">
            {items.map((banner, i) => (
                <div key={banner.id || i} className="border-4 border-black p-6 flex justify-between items-center bg-white shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex-1">
                        <div
                            className="inline-block px-4 py-1 uppercase font-black text-xs border-2 border-black mb-2"
                            style={{ backgroundColor: banner.bg_color, color: banner.text_color }}
                        >
                            Preview
                        </div>
                        <p className="text-xl font-black uppercase">{banner.text}</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => toggleActive(banner.id, banner.active)}
                            className={`p-4 border-4 border-black font-black uppercase ${banner.active ? 'bg-green-400' : 'bg-gray-200 opacity-50'}`}
                        >
                            {banner.active ? 'Active' : 'Hidden'}
                        </button>
                        <button
                            onClick={() => handleDelete(banner.id)}
                            className="p-4 border-4 border-black hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <Trash2 size={24} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ActivityTab({ items }: { items: any[] }) {
    return (
        <div className="border-8 border-black bg-white shadow-[12px_12px_0px_0px_black] overflow-hidden">
            <div className="bg-black text-[#d9ff36] p-4 text-2xl font-black uppercase italic">Toxic History</div>
            <div className="divide-y-4 divide-black max-h-[600px] overflow-y-auto">
                {items.length === 0 ? (
                    <p className="p-8 text-center opacity-40 uppercase font-black">No activity recorded yet...</p>
                ) : (
                    items.map((log) => (
                        <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50">
                            <div>
                                <span className={`inline-block px-2 py-1 text-xs font-black uppercase mb-2 ${log.action.includes('DELETE') ? 'bg-red-500 text-white' :
                                    log.action.includes('CREATE') ? 'bg-green-400 text-black' :
                                        'bg-blue-400 text-black'
                                    }`}>
                                    {log.action}
                                </span>
                                <p className="text-xl font-bold uppercase">{log.details}</p>
                            </div>
                            <span className="text-sm font-mono opacity-50 font-black whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function CouponsTab({ items, onUpdate, openForm, openConfirm }: { items: any[], onUpdate: () => void, openForm: any, openConfirm: any }) {
    const { showToast } = useToast();

    const handleDelete = (id: number) => {
        openConfirm("Burn this coupon?", async () => {
            showToast("Burning...", "loading");
            await toxicFetch(`/api/coupons/${id}`, { method: 'DELETE' });
            onUpdate();
            showToast("Coupon burned!", "success");
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((coupon) => (
                <div key={coupon.id} className="border-4 border-black p-6 bg-[#ff00ff] text-white shadow-[8px_8px_0px_0px_black] relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-white opacity-10 rotate-45 group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10">
                        <p className="text-4xl font-black uppercase italic tracking-tighter mb-2">{coupon.code}</p>
                        <p className="text-xl font-black opacity-80">{coupon.discount_percent}% DISCOUNT</p>
                        <div className="mt-8 flex justify-between items-end">
                            <span className="text-xs font-mono">CREATED: {new Date(coupon.created_at).toLocaleDateString()}</span>
                            <button onClick={() => handleDelete(coupon.id)} className="p-3 bg-white text-red-500 border-2 border-black hover:bg-black transition-colors shadow-[4px_4px_0px_0px_black]">
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            {items.length === 0 && <p className="col-span-full py-10 opacity-30 text-center uppercase font-black italic">No coupons yet, generous bitch!</p>}
        </div>
    );
}
