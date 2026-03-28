import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, CheckCircle2, CreditCard, Smartphone, ArrowRight, ShieldCheck, Info, Rocket } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PAYMENT_AMOUNT, MOBILE_PAYMENT_NUMBERS } from '../src/constants';
import { db } from '../src/firebase';
import { collection, addDoc } from 'firebase/firestore';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLIC_KEY || '');

interface PaymentData {
  name: string;
  email: string;
  channelLink: string;
  mobileNumber: string;
  trxId: string;
}

const CheckoutForm: React.FC<{ selectedMethod: string, paymentData: PaymentData }> = ({ selectedMethod, paymentData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!paymentData.name || !paymentData.email) {
      setError("Please fill in your Full Name and Email Address.");
      return;
    }

    if (['bkash', 'rocket'].includes(selectedMethod)) {
      if (!paymentData.mobileNumber || !paymentData.trxId) {
        setError(`Please provide your ${selectedMethod} number and Transaction ID.`);
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Save payment data to Firestore
      await addDoc(collection(db, "payments"), {
        name: paymentData.name,
        email: paymentData.email,
        channelLink: paymentData.channelLink,
        method: selectedMethod,
        mobileNumber: paymentData.mobileNumber,
        trxid: paymentData.trxId,
        time: new Date().toISOString(),
        status: 'pending',
        amount: 20
      });

      setTimeout(() => {
        window.location.href = "/success.html";
      }, 2000);
    } catch (err) {
      console.error("Error saving payment data:", err);
      setError("Failed to process payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {selectedMethod === 'card' && (
        <div className="p-4 border border-white/10 rounded-2xl bg-surface-900/50 backdrop-blur-md">
          <CardElement options={{ 
            style: { 
              base: { 
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#ef4444',
              }
            } 
          }} />
        </div>
      )}
      
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-fade-in">
          <ShieldCheck size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-10 h-10 border-4 border-orbit-500/30 border-t-orbit-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Processing Securely...</p>
        </div>
      ) : (
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: '#10b981' }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isProcessing}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <Lock size={20} />
          <span>Pay $20 USD</span>
          <ArrowRight size={20} className="ml-2" />
        </motion.button>
      )}
    </form>
  );
};

const PaymentPage: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [channelLink, setChannelLink] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  const paymentData = { name, email, channelLink, mobileNumber, trxId };

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-surface-950 text-white flex justify-center p-4 md:p-10 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orbit-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-5xl w-full relative z-10">
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative group h-48 md:h-64"
          >
            <img 
              src="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2000&auto=format&fit=crop" 
              alt="OrbitX Network Banner" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-transparent flex items-end p-6 md:p-10">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orbit-500 to-violet-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl border border-white/10">
                  <Rocket size={32} className="text-white md:w-10 md:h-10" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter font-display">OrbitX MCN</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-orbit-400 font-bold text-xs md:text-sm uppercase tracking-[0.3em]">Official Payment Gateway</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Header Info Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-900/50 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                <Lock size={18} className="text-orbit-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">Secure Checkout</h1>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Encrypted Transaction</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Verified Merchant</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Plan & Info */}
            <div className="lg:col-span-5 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-300 mb-1">Network Access</h3>
                    <p className="text-sm text-gray-500">One-Time Activation Fee</p>
                  </div>
                  <div className="bg-orbit-500/10 text-orbit-400 px-3 py-1 rounded-full text-xs font-bold border border-orbit-500/20">
                    LIFETIME
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-white">$20</span>
                  <span className="text-gray-500 font-medium">USD</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    'Instant CMS Access',
                    'Copyright Shield Protection',
                    'Advanced Analytics Dashboard',
                    '24/7 Priority Support',
                    'Monthly Revenue Payouts'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                      <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="p-4 bg-surface-800/50 rounded-2xl border border-white/5 flex items-start gap-3">
                  <Info size={18} className="text-orbit-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This is a one-time fee to cover administrative costs and initial channel optimization. No recurring monthly fees.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl"
              >
                <h3 className="text-lg font-bold text-white mb-6">Creator Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full p-4 bg-surface-800/50 border border-white/5 rounded-xl text-white focus:border-orbit-500 outline-none transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="w-full p-4 bg-surface-800/50 border border-white/5 rounded-xl text-white focus:border-orbit-500 outline-none transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Channel Link (Optional)</label>
                    <input type="text" value={channelLink} onChange={(e) => setChannelLink(e.target.value)} placeholder="youtube.com/@channel" className="w-full p-4 bg-surface-800/50 border border-white/5 rounded-xl text-white focus:border-orbit-500 outline-none transition-all" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Payment & Summary */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl"
              >
                <h3 className="text-lg font-bold text-white mb-6">Select Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'card', name: 'Card', icon: CreditCard, color: 'text-blue-400' },
                    { id: 'bkash', name: 'bKash', icon: Smartphone, color: 'text-pink-500' },
                    { id: 'rocket', name: 'Rocket', icon: Smartphone, color: 'text-purple-500' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${
                        selectedMethod === method.id 
                        ? 'bg-orbit-500/10 border-orbit-500 shadow-lg shadow-orbit-500/10' 
                        : 'bg-surface-800/50 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <method.icon className={`w-6 h-6 ${method.color}`} />
                      <span className={`text-sm font-bold ${selectedMethod === method.id ? 'text-white' : 'text-gray-400'}`}>
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {['bkash', 'rocket'].includes(selectedMethod) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-surface-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === 'bkash' ? 'bg-pink-500/20 text-pink-500' : 'bg-purple-500/20 text-purple-500'}`}>
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white uppercase tracking-wider">{selectedMethod} Payment</h4>
                        <p className="text-xs text-gray-500">Manual Verification</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Send Amount</div>
                      <div className="text-xl font-bold text-white">৳{PAYMENT_AMOUNT}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-800/80 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Merchant Number:</span>
                      <span className="text-white font-mono font-bold tracking-wider">{MOBILE_PAYMENT_NUMBERS[selectedMethod as keyof typeof MOBILE_PAYMENT_NUMBERS]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Reference:</span>
                      <span className="text-white font-bold">ORBITX</span>
                    </div>
                  </div>
                  
                  {selectedMethod === 'bkash' && (
                    <div className="p-6 bg-gradient-to-br from-pink-600/20 to-pink-900/20 rounded-2xl border border-pink-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white">
                          <Rocket size={16} />
                        </div>
                        <h4 className="font-bold text-pink-400">bKash Gateway (Auto)</h4>
                      </div>
                      <button 
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/bkash/create-payment', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ amount: "20.00", reference: "orbitx" })
                            });
                            const data = await res.json();
                            if (data.bkashURL) {
                              window.location.href = data.bkashURL;
                            } else {
                              alert("bKash API response: " + JSON.stringify(data));
                            }
                          } catch (e) {
                            alert("Failed to connect to bKash API");
                          }
                        }}
                        className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-600/20"
                      >
                        Launch bKash Payment
                      </button>
                      <p className="text-[10px] text-pink-500/60 text-center mt-3 uppercase tracking-widest font-bold">Recommended for instant activation</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} Number</label>
                      <input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="01XXXXXXXXX" className="w-full p-4 bg-surface-800/50 border border-white/5 rounded-xl text-white focus:border-orbit-500 outline-none transition-all" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Transaction ID</label>
                      <input value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="TRX12345678" className="w-full p-4 bg-surface-800/50 border border-white/5 rounded-xl text-white focus:border-orbit-500 outline-none transition-all" required />
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-surface-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                    <Lock size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Finalize Payment</h3>
                </div>
                <CheckoutForm selectedMethod={selectedMethod} paymentData={paymentData} />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-surface-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-400"><span>Network Fee</span><span>$20.00</span></div>
                  <div className="flex justify-between text-gray-400"><span>Processing Fee</span><span>$0.00</span></div>
                  <div className="h-px bg-white/5 my-4"></div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-white">Total Amount</span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">$20.00 USD</div>
                      <div className="text-xs text-gray-500">Approx. ৳{PAYMENT_AMOUNT} BDT</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <p className="text-center text-xs text-gray-500 px-10 leading-relaxed">
                By completing this purchase, you agree to OrbitX MCN's <span className="text-orbit-400 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-orbit-400 cursor-pointer hover:underline">Privacy Policy</span>. All payments are secured by industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default PaymentPage;

