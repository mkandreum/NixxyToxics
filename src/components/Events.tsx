import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { Ticket, X, CheckCircle2 } from "lucide-react";
import { useToast } from "./Toast";

interface DragShow {
  id: number;
  date: string;
  city: string;
  venue: string;
  ticket_price: number;
  buy_url?: string;
}

export default function Events() {
  const [shows, setShows] = useState<DragShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState<DragShow | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(setShows)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleTicketPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShow) return;

    showToast("Processing Ticket...", "loading");
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          items: [{ name: `TICKET: ${selectedShow.city}`, price: selectedShow.ticket_price, quantity: 1 }],
          total: selectedShow.ticket_price,
          event_id: selectedShow.id
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Success! Check your email for the ticket.", "success");
        setSelectedShow(null);
        setCustomerName("");
        setCustomerEmail("");
      }
    } catch (err) {
      showToast("Error processing ticket", "error");
    }
  };

  return (
    <section id="events" className="py-24 px-4 md:px-8 bg-white text-black border-b-4 border-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff00ff]/10 rounded-full blur-3xl -z-1" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-3xl -z-1" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-4"
        >
          <h2 className="text-8xl md:text-[12vw] leading-none uppercase tracking-tighter font-logo text-[#ff00ff] drop-shadow-[5px_5px_0px_#000]">
            Shows
          </h2>
          <p className="text-2xl md:text-3xl uppercase font-black bg-[#dfff00] px-4 py-2 border-2 border-black rotate-2">
            Live Drag Experience
          </p>
        </motion.div>

        <div className="grid gap-8">
          {shows.map((show, i) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border-4 border-black p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all group"
            >
              <div className="flex flex-col md:flex-row items-center gap-12 flex-1">
                <div className="bg-black text-[#dfff00] p-6 text-center min-w-[160px] group-hover:rotate-3 transition-transform">
                  <p className="text-4xl font-black leading-none">{show.date.split(' ')[0]}</p>
                  <p className="text-2xl font-bold uppercase mt-2">{show.date.split(' ').slice(1).join(' ')}</p>
                </div>

                <div className="text-center md:text-left">
                  <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">{show.city}</h3>
                  <p className="text-2xl uppercase opacity-60 font-bold mt-2">{show.venue}</p>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
                <div className="text-4xl font-black bg-[#dfff00] border-4 border-black px-6 py-2 shadow-[4px_4px_0px_0px_black] -rotate-2">
                  {show.ticket_price}€
                </div>
                <button
                  onClick={() => setSelectedShow(show)}
                  className="w-full md:w-auto bg-black text-white px-10 py-5 text-2xl uppercase font-black hover:bg-[#ff00ff] transition-all flex items-center justify-center gap-4 group"
                >
                  <Ticket size={28} className="group-hover:rotate-12 transition-transform" />
                  Get Tickets
                </button>
              </div>
            </motion.div>
          ))}

          {shows.length === 0 && !isLoading && (
            <div className="text-center py-20 border-4 border-black border-dashed rounded-3xl">
              <p className="text-4xl uppercase font-black opacity-30 italic">No upcoming shows, Bitch!</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      <AnimatePresence>
        {selectedShow && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedShow(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, rotate: -3 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9, rotate: 3 }}
              className="bg-[#dfff00] border-[10px] border-black p-10 max-w-xl w-full relative z-[151] shadow-[20px_20px_0px_0px_#ff00ff]"
            >
              <button onClick={() => setSelectedShow(null)} className="absolute top-6 right-6 hover:rotate-90 transition-transform"><X size={48} /></button>

              <h2 className="text-5xl font-black uppercase mb-2">Buy Tickets</h2>
              <p className="text-2xl font-bold uppercase mb-8 opacity-60">{selectedShow.city} • {selectedShow.venue}</p>

              <form onSubmit={handleTicketPurchase} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xl font-black uppercase">Your Name</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border-4 border-black p-4 text-2xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xl font-black uppercase">Your Email</label>
                  <input required type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full border-4 border-black p-4 text-2xl outline-none" />
                </div>

                <div className="p-6 bg-black text-white border-4 border-white">
                  <div className="flex justify-between items-center text-3xl font-black uppercase italic">
                    <span>Total:</span>
                    <span>{selectedShow.ticket_price}€</span>
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#00ff00] text-black py-6 text-4xl uppercase font-black hover:bg-[#ff00ff] hover:text-white transition-all shadow-[8px_8px_0px_0px_black]">
                  Confirm Order
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
