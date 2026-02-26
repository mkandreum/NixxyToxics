import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useToast } from "./Toast";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { showToast } = useToast();

  // Checkout form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart!`, "success");
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Processing Order...", "loading");

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          items: cart.map(i => ({ name: i.product.name, price: i.product.price, quantity: i.quantity })),
          total
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast("Order placed! Check your email, Bitch!", "success");
        setCart([]);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setCustomerName("");
        setCustomerEmail("");
      }
    } catch (err) {
      showToast("Error processing order", "error");
    }
  };

  return (
    <section id="store" className="py-24 px-4 md:px-8 bg-black text-[#dfff00]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-8xl md:text-[10vw] leading-none uppercase tracking-tighter font-mono font-black italic">Store</h2>
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-[#dfff00] text-black p-4 flex items-center gap-4 border-4 border-white shadow-[6px_6px_0px_0px_#fff] relative group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <ShoppingCart size={32} />
            <span className="text-2xl font-black uppercase">Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
            {cart.length > 0 && <span className="absolute -top-4 -right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold animate-pulse">{cart.length}</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((prod) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bg-white text-black border-4 border-[#dfff00] shadow-[12px_12px_0px_0px_#dfff00] overflow-hidden flex flex-col group"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100 flex items-center justify-center p-8">
                <img src={prod.image_url} alt={prod.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-8 flex flex-col flex-1 gap-4 border-t-4 border-black">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-black uppercase tracking-tight">{prod.name}</h3>
                  <span className="text-4xl font-black italic">{prod.price}€</span>
                </div>
                <p className="text-lg opacity-60 font-bold uppercase">{prod.description || "Limited edition toxic merch. Wear it or leave it."}</p>
                <button
                  onClick={() => addToCart(prod)}
                  className="mt-auto w-full bg-black text-[#dfff00] py-4 text-2xl uppercase font-black hover:bg-[#ff00ff] hover:text-white transition-colors flex items-center justify-center gap-4"
                >
                  <Plus size={24} /> Add To Cart
                </button>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && <p className="text-center col-span-full py-20 text-4xl uppercase opacity-40 italic font-black">No merch available, Bitch!</p>}
        </div>
      </div>

      {/* Cart Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-[#dfff00] text-black z-[101] border-l-8 border-black p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-5xl font-black uppercase italic">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform"><X size={48} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="border-4 border-black p-4 bg-white shadow-[6px_6px_0px_0px_#000] flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 border-2 border-black flex items-center justify-center">
                      <img src={item.product.image_url} className="max-h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black uppercase mb-1">{item.product.name}</h3>
                      <p className="text-2xl font-black">{item.product.price}€</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 border-2 border-black"><Minus size={16} /></button>
                        <span className="text-xl font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 border-2 border-black"><Plus size={16} /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={24} /></button>
                  </div>
                ))}
                {cart.length === 0 && <p className="text-center py-20 text-2xl uppercase opacity-40 font-black">Your cart is empty, Bitch!</p>}
              </div>

              <div className="mt-8 pt-8 border-t-8 border-black">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-2xl font-black uppercase">Total:</span>
                  <span className="text-6xl font-black italic">{total.toFixed(2)}€</span>
                </div>
                <button
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-black text-[#dfff00] py-6 text-3xl uppercase font-black hover:bg-[#ff00ff] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[8px_8px_0px_0px_black]"
                >
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCheckoutOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.form
              onSubmit={handleCheckout}
              initial={{ scale: 0.9, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 100 }}
              className="bg-[#dfff00] text-black border-8 border-black p-12 max-w-2xl w-full relative z-[201] shadow-[20px_20px_0px_0px_#ff00ff]"
            >
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 hover:rotate-90 transition-transform"><X size={48} /></button>
              <h2 className="text-5xl font-black uppercase mb-8 italic">Final Step</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xl font-black uppercase">Your Name</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border-4 border-black p-4 text-2xl outline-none focus:bg-white" placeholder="FUCKING TOXIC NAME" />
                </div>
                <div className="space-y-2">
                  <label className="text-xl font-black uppercase">Your Email</label>
                  <input required type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full border-4 border-black p-4 text-2xl outline-none focus:bg-white" placeholder="YOU@TOXIC.COM" />
                </div>
                <div className="p-6 bg-black text-[#dfff00] border-4 border-white mt-8">
                  <p className="text-xl font-bold uppercase mb-2">Notice:</p>
                  <p className="text-sm uppercase opacity-80">This is a reservation system. Once you checkout, you will receive an email with payment instructions. We don't steal your credit card here, bitch.</p>
                </div>
                <button type="submit" className="w-full bg-[#ff00ff] text-white py-6 text-4xl uppercase font-black hover:bg-black hover:text-[#dfff00] transition-all shadow-[10px_10px_0px_0px_black] mt-8">
                  COMPLETE ORDER
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
