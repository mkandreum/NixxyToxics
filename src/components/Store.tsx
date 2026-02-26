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

      {/* Floating Cart Button (Global-ish) */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && !isCheckoutOpen && (
          <motion.button
            initial={{ scale: 0, y: 100, rotate: -45 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0, y: 100, rotate: 45 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 z-[60] w-20 h-20 md:w-24 md:h-24 bg-[#dfff00]/80 backdrop-blur-md border-[4px] border-black rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center group"
          >
            <ShoppingBag size={32} className="group-hover:animate-bounce md:w-10 md:h-10" />
            <span className="text-xs md:text-sm font-black uppercase tracking-tighter -mt-1">Cesta</span>

            {/* Red Counter Bubble */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white border-2 border-black w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm md:text-base font-black shadow-[2px_2px_0px_0px_black] animate-pulse"
            >
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

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
              className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-[#dfff00] text-black z-[101] border-l-8 border-black p-4 md:p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 md:mb-12">
                <h2 className="text-3xl md:text-5xl font-black uppercase italic">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform"><X size={32} className="md:w-12 md:h-12" /></button>
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
                      <div className="flex items-center gap-2 md:gap-4 mt-2">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 border-2 border-black"><Minus size={14} className="md:w-4 md:h-4" /></button>
                        <span className="text-lg md:text-xl font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 border-2 border-black"><Plus size={14} className="md:w-4 md:h-4" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={24} /></button>
                  </div>
                ))}
                {cart.length === 0 && <p className="text-center py-20 text-2xl uppercase opacity-40 font-black">Your cart is empty, Bitch!</p>}
              </div>

              <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t-8 border-black font-mono">
                <div className="flex justify-between items-end mb-4 md:mb-8">
                  <span className="text-xl md:text-2xl font-black uppercase">Total:</span>
                  <span className="text-4xl md:text-6xl font-black italic">{total.toFixed(2)}€</span>
                </div>
                <button
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-black text-[#dfff00] py-4 md:py-6 text-2xl md:text-3xl uppercase font-black hover:bg-[#ff00ff] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0px_0px_black] md:shadow-[8px_8px_0px_0px_black]"
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
              className="bg-[#dfff00] text-black border-4 md:border-8 border-black p-6 md:p-12 max-w-2xl w-full relative z-[201] shadow-[12px_12px_0px_0px_#ff00ff] md:shadow-[20px_20px_0px_0px_#ff00ff]"
            >
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 md:top-6 md:right-6 hover:rotate-90 transition-transform"><X size={32} className="md:w-12 md:h-12" /></button>
              <h2 className="text-3xl md:text-5xl font-black uppercase mb-6 md:mb-8 italic">Final Step</h2>

              <div className="space-y-4 md:space-y-6">
                <div className="space-y-1 md:space-y-2">
                  <label className="text-lg md:text-xl font-black uppercase">Your Name</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border-4 border-black p-3 md:p-4 text-lg md:text-2xl outline-none focus:bg-white" placeholder="FUCKING TOXIC NAME" />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <label className="text-lg md:text-xl font-black uppercase">Your Email</label>
                  <input required type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full border-4 border-black p-3 md:p-4 text-lg md:text-2xl outline-none focus:bg-white" placeholder="YOU@TOXIC.COM" />
                </div>
                <div className="p-6 bg-black text-[#dfff00] border-4 border-white mt-8">
                  <p className="text-xl font-bold uppercase mb-2">Notice:</p>
                  <p className="text-sm uppercase opacity-80">This is a reservation system. Once you checkout, you will receive an email with payment instructions. We don't steal your credit card here, bitch.</p>
                </div>
                <button type="submit" className="w-full bg-[#ff00ff] text-white py-4 md:py-6 text-2xl md:text-4xl uppercase font-black hover:bg-black hover:text-[#dfff00] transition-all shadow-[8px_8px_0px_0px_black] md:shadow-[10px_10px_0px_0px_black] mt-4 md:mt-8">
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
