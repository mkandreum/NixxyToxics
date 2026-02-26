import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutDashboard, ImageIcon, Calendar, Settings, LogOut,
    Plus, Trash2, Save, Upload, Megaphone, ShoppingBag,
    Mail, Ticket, CheckCircle, Clock, X
} from "lucide-react";
import { useToast } from "./Toast";

interface AdminDashboardProps {
    onLogout: () => void;
}

const toxicFetch = (url: string, options: any = {}) => {
    const token = localStorage.getItem('toxic_token');
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });
};

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onConfirm: (data?: any) => void;
    fields?: { key: string, label: string, type: string, placeholder?: string }[];
    confirmText?: string;
}

function CustomModal({ isOpen, onClose, title, onConfirm, fields, confirmText = "Confirm" }: CustomModalProps) {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (isOpen) setFormData({});
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="bg-[#dfff00] border-8 border-black p-8 max-w-lg w-full relative z-[301] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
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
                            className="flex-1 bg-black text-[#dfff00] py-4 text-2xl uppercase font-black hover:bg-[#ff00ff] hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]"
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
    const [activeTab, setActiveTab] = useState<'stats' | 'gallery' | 'events' | 'banners' | 'store' | 'orders' | 'smtp' | 'settings'>('stats');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [data, setData] = useState<any>({ gallery: [], events: [], settings: {}, banners: [], products: [], orders: [], smtp: {} });
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
            const [gRes, eRes, sRes, bRes, pRes, oRes, smRes] = await Promise.all([
                fetch('/api/gallery'),
                fetch('/api/events'),
                fetch('/api/settings'),
                fetch('/api/banners'),
                fetch('/api/products'),
                toxicFetch('/api/orders'),
                toxicFetch('/api/smtp')
            ]);
            const [gallery, events, settings, banners, products, orders, smtp] = await Promise.all([
                gRes.json(), eRes.json(), sRes.json(), bRes.json(), pRes.json(), oRes.json(), smRes.json()
            ]);
            setData({ gallery, events, settings, banners, products, orders, smtp });
        } catch (err) {
            console.error("Error fetching admin data:", err);
        }
    };

    useEffect(() => { refreshData(); }, []);

    const handleAddNew = () => {
        if (activeTab === 'events') {
            openForm("New Drag Show", [
                { key: 'city', label: 'City', type: 'text', placeholder: 'MADRID' },
                { key: 'venue', label: 'Venue', type: 'text', placeholder: 'LA RIVIERA' },
                { key: 'date', label: 'Date', type: 'text', placeholder: 'OCT 31' },
                { key: 'ticket_price', label: 'Price (EUR)', type: 'number', placeholder: '15.00' },
            ], async (formData) => {
                showToast("Adding Drag Show...", "loading");
                await toxicFetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                refreshData();
                showToast("Drag Show added!", "success");
            });
        } else if (activeTab === 'banners') {
            openForm("New Banner", [
                { key: 'text', label: 'Banner Text', type: 'text', placeholder: 'SALE 50% OFF!' }
            ], async (formData) => {
                showToast("Creating banner...", "loading");
                await toxicFetch('/api/banners', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, bg_color: '#dfff00', text_color: 'black' })
                });
                refreshData();
                showToast("Banner created!", "success");
            });
        } else if (activeTab === 'gallery') {
            document.getElementById('gallery-upload-input')?.click();
        } else if (activeTab === 'store') {
            document.getElementById('product-upload-input')?.click();
        }
    };

    const tabs = [
        { id: 'stats', label: 'Overview', icon: LayoutDashboard },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'events', label: 'Drag Shows', icon: Ticket },
        { id: 'store', label: 'Store', icon: ShoppingBag },
        { id: 'orders', label: 'Orders', icon: Clock },
        { id: 'banners', label: 'Banners', icon: Megaphone },
        { id: 'smtp', label: 'SMTP Config', icon: Mail },
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
            <header className="md:hidden sticky top-0 z-[110] bg-[#dfff00] border-b-4 border-black p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_black]">
                        {isMobileMenuOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
                    </button>
                    <span className="font-black uppercase tracking-tighter text-xl">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </span>
                </div>
                <button onClick={onLogout} className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_black]">
                    <LogOut size={24} />
                </button>
            </header>

            {/* Sidebar (Mobile Drawer / Desktop Static) */}
            <aside className={`
                fixed inset-0 z-[105] bg-[#dfff00] transform transition-transform duration-300 md:relative md:translate-x-0 md:z-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                w-full md:w-80 border-r-4 border-black flex flex-col
            `}>
                <div className="p-8 border-b-4 border-black hidden md:block">
                    <h1 className="text-4xl font-logo uppercase leading-none">Toxic<br />Panel</h1>
                </div>
                <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto mt-16 md:mt-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-4 p-4 text-xl uppercase font-black border-4 transition-all ${activeTab === tab.id
                                ? 'bg-black text-[#dfff00] border-black shadow-[4px_4px_0px_0px_black]'
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
                    className="p-8 border-t-4 border-black flex items-center gap-4 text-2xl uppercase font-black hover:bg-black hover:text-[#dfff00] transition-colors md:flex hidden"
                >
                    <LogOut size={24} /> Logout
                </button>
            </aside>

            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <header className="mb-12 flex justify-between items-end border-b-4 border-black pb-8">
                    <div>
                        <h2 className="text-6xl uppercase font-black tracking-tighter">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-xl uppercase opacity-50">Manage your toxic empire</p>
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
                    {activeTab === 'stats' && <OverviewTab data={data} />}
                    {activeTab === 'gallery' && <GalleryTab items={data.gallery} onUpdate={refreshData} openConfirm={openConfirm} />}
                    {activeTab === 'events' && <EventsTab items={data.events} onUpdate={refreshData} openConfirm={openConfirm} />}
                    {activeTab === 'banners' && <BannersTab items={data.banners} onUpdate={refreshData} openConfirm={openConfirm} />}
                    {activeTab === 'store' && <StoreTab items={data.products} onUpdate={refreshData} openConfirm={openConfirm} openForm={openForm} />}
                    {activeTab === 'orders' && <OrdersTab items={data.orders} onUpdate={refreshData} />}
                    {activeTab === 'smtp' && <SMTPTab smtp={data.smtp} onUpdate={refreshData} />}
                    {activeTab === 'settings' && <SettingsTab settings={data.settings} onUpdate={refreshData} />}
                </div>
            </main>
        </div>
    );
}

function OverviewTab({ data }: { data: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
                { label: 'Photos', value: data.gallery?.length || 0, color: 'bg-green-400' },
                { label: 'Drag Shows', value: data.events?.length || 0, color: 'bg-purple-400' },
                { label: 'Products', value: data.products?.length || 0, color: 'bg-[#dfff00]' },
                { label: 'Orders', value: data.orders?.length || 0, color: 'bg-blue-400' },
            ].map((stat, i) => (
                <div key={i} className={`border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] ${stat.color}`}>
                    <p className="text-xl uppercase font-black mb-2">{stat.label}</p>
                    <p className="text-6xl font-black">{stat.value}</p>
                </div>
            ))}
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

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => (
                <div key={item.id} className="group relative border-4 border-black aspect-square overflow-hidden bg-gray-100 shadow-[4px_4px_0px_0px_#000]">
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 p-2 bg-white border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}
            <label className="border-4 border-dashed border-black aspect-square flex flex-col items-center justify-center gap-2 hover:bg-black/5 transition-colors cursor-pointer">
                <input id="gallery-upload-input" type="file" className="hidden" onChange={handleUpload} />
                <Upload size={32} />
                <span className="uppercase font-black">Upload</span>
            </label>
        </div>
    );
}

function EventsTab({ items, onUpdate, openConfirm }: { items: any[], onUpdate: () => void, openConfirm: any }) {
    const { showToast } = useToast();
    return (
        <div className="space-y-4">
            {items.map((event) => (
                <div key={event.id} className="border-4 border-black p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex gap-8 items-center flex-1">
                        <div className="text-4xl font-black bg-black text-[#dfff00] p-4 min-w-[140px] text-center">{event.date}</div>
                        <div>
                            <p className="text-2xl font-black uppercase">{event.city}</p>
                            <p className="text-xl uppercase opacity-60 font-bold">{event.venue}</p>
                            <p className="text-lg bg-[#ff00ff] text-white px-2 mt-1 inline-block uppercase font-black">{event.ticket_price}€ TICKETS</p>
                        </div>
                    </div>
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
            ))}
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
            { key: 'price', label: 'Price (EUR)', type: 'number', placeholder: '25.00' }
        ], async (formData) => {
            const toastId = showToast("Uploading product...", "loading");
            const fd = new FormData();
            fd.append('image', file);
            fd.append('name', formData.name);
            fd.append('price', formData.price);

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((prod) => (
                <div key={prod.id} className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000] overflow-hidden group">
                    <div className="aspect-square relative flex items-center justify-center p-4">
                        <img src={prod.image_url} alt={prod.name} className="max-h-full object-contain" />
                        <button onClick={() => handleDelete(prod.id)} className="absolute top-4 right-4 bg-white border-2 border-black p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                            <Trash2 size={24} />
                        </button>
                    </div>
                    <div className="p-6 border-t-4 border-black bg-[#dfff00]/10">
                        <h3 className="text-2xl font-black uppercase mb-2">{prod.name}</h3>
                        <p className="text-3xl font-black">{prod.price}€</p>
                    </div>
                </div>
            ))}
            <label className="border-4 border-dashed border-black aspect-square flex flex-col items-center justify-center gap-4 hover:bg-black/5 transition-colors cursor-pointer bg-white">
                <input id="product-upload-input" type="file" className="hidden" onChange={handleUpload} />
                <Plus size={48} />
                <span className="uppercase font-black text-2xl">Add Product</span>
            </label>
        </div>
    );
}

function OrdersTab({ items, onUpdate }: { items: any[], onUpdate: () => void }) {
    return (
        <div className="space-y-4">
            {items.map((order) => {
                const orderItems = JSON.parse(order.items || '[]');
                return (
                    <div key={order.id} className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#000]">
                        <div className="flex flex-col md:flex-row justify-between mb-4 border-b-2 border-black pb-4">
                            <div>
                                <h3 className="text-2xl font-black">ORDER #{order.order_id}</h3>
                                <p className="text-xl uppercase font-bold opacity-60">{order.customer_name} • {order.customer_email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-[#ff00ff]">{order.total}€</p>
                                <p className="uppercase font-bold text-xs">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            {orderItems.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between uppercase font-bold">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>{item.price * item.quantity}€</span>
                                </div>
                            ))}
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
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4 border-4 border-black p-6 bg-[#dfff00]/10">
                <input
                    type="checkbox"
                    checked={formData.enabled === 1}
                    onChange={e => setFormData({ ...formData, enabled: e.target.checked ? 1 : 0 })}
                    className="w-10 h-10 accent-black border-4 border-black"
                />
                <label className="text-3xl font-black uppercase">Enable Email Notifications</label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="font-black uppercase">SMTP Host</label>
                    <input type="text" value={formData.host || ''} onChange={e => setFormData({ ...formData, host: e.target.value })} className="w-full border-4 border-black p-4 outline-none font-bold" />
                </div>
                <div className="space-y-2">
                    <label className="font-black uppercase">Port</label>
                    <input type="number" value={formData.port || ''} onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })} className="w-full border-4 border-black p-4 outline-none font-bold" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-black uppercase">Username / Email</label>
                <input type="text" value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full border-4 border-black p-4 outline-none font-bold" />
            </div>

            <div className="space-y-2">
                <label className="font-black uppercase">Password</label>
                <input type="password" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border-4 border-black p-4 outline-none font-bold" />
            </div>

            <div className="pt-6">
                <button type="submit" className="bg-black text-[#dfff00] px-12 py-6 text-3xl uppercase font-black hover:bg-[#ff00ff] hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    Save SMTP Settings
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
                <input type="text" value={logoText} onChange={(e) => setLogoText(e.target.value)} className="w-full border-4 border-black p-4 text-2xl outline-none focus:bg-[#dfff00]/10" />
            </div>

            <div className="space-y-4">
                <label className="block text-2xl uppercase font-black">Hero Phrase</label>
                <input type="text" value={heroPhrase} onChange={(e) => setHeroPhrase(e.target.value)} className="w-full border-4 border-black p-4 text-2xl outline-none focus:bg-[#dfff00]/10" />
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
                    <label className="bg-black text-[#dfff00] px-4 py-2 uppercase font-black cursor-pointer hover:bg-[#ff00ff] transition-colors">
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

            <button onClick={handleSave} className="w-full bg-black text-[#dfff00] py-6 text-4xl uppercase font-black hover:bg-[#ff00ff] hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
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
