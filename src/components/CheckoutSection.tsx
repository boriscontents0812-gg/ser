import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { storeConfig } from '../config/storeConfig';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  CreditCard, 
  Check, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Tag, 
  CheckCircle2,
  PackageCheck
} from 'lucide-react';

export const CheckoutSection: React.FC = () => {
  const { 
    items, 
    updateQuantity, 
    addItem, 
    handleCheckout, 
    isCheckingOut, 
    checkoutError, 
    clearCheckoutError 
  } = useCart();
  
  const { product } = storeConfig;

  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Shipping & payment method choices
  const [shippingMethod, setShippingMethod] = useState<'free' | 'express'>('free');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'stripe'>('card');

  // Card fields (for direct card entry presentation)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Validation errors
  const [formError, setFormError] = useState<string | null>(null);

  // Calculated values
  const currentQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const unitPrice = product.defaultRetailPrice || 38.0;
  const subtotal = currentQuantity * unitPrice;
  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingFee = shippingMethod === 'express' ? 9.99 : 0.0;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const cleaned = promoCode.trim().toUpperCase();
    if (!cleaned) return;

    if (cleaned === 'SEREIN10' || cleaned === 'TRAVEL10' || cleaned === 'WELCOME') {
      setDiscountPercent(10);
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoError('Invalid coupon code. Try SEREIN10');
      setPromoApplied(false);
      setDiscountPercent(0);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length >= 2) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
    }
    return clean;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearCheckoutError();

    if (items.length === 0) {
      setFormError('Please add an item to your bag before checking out.');
      return;
    }

    // Basic form validation
    if (!email || !email.includes('@')) {
      setFormError('Please provide a valid email address for your order confirmation receipt.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setFormError('Please enter your full name for shipping.');
      return;
    }

    if (!address.trim() || !city.trim() || !postalCode.trim()) {
      setFormError('Please complete your full delivery street address, city, and postal code.');
      return;
    }

    // Call CartContext checkout handler with complete shipping payload
    await handleCheckout({
      customerEmail: email,
      shippingDetails: {
        fullName: `${firstName} ${lastName}`,
        address,
        apartment,
        city,
        state,
        postalCode,
        country,
        shippingMethod,
        phone,
      },
      testMode: paymentMethod === 'card',
    });
  };

  return (
    <section id="checkout" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl mx-auto scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F1FC] text-[#2563EB] text-xs font-semibold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          <span>Secure Checkout · 256-Bit Encryption</span>
        </div>
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#14334D] font-normal tracking-tight">
          <span className="italic font-serif">Complete your</span> order.
        </h2>
        <p className="text-sm sm:text-base text-[#456176] max-w-md mx-auto leading-relaxed">
          Confirm your delivery address and travel organizer preferences below. Ships safely packaged with tracking.
        </p>
      </div>

      {items.length === 0 ? (
        /* Empty Cart State */
        <div className="max-w-xl mx-auto bg-white border border-[#D6DCE1] rounded-3xl p-10 text-center shadow-tactile space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F0F2F5] border border-[#CBD5E1] flex items-center justify-center text-[#456176] mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#14334D]">Your bag is currently empty</h3>
            <p className="text-xs sm:text-sm text-[#456176] max-w-sm mx-auto leading-relaxed">
              Add The Double-Layer Travel Organizer ($38.00) to activate checkout and secure your order.
            </p>
          </div>
          <button
            type="button"
            onClick={() => addItem(1)}
            className="px-8 py-3.5 bg-[#0D0E10] hover:bg-black text-white font-semibold text-xs tracking-wider uppercase rounded-full shadow-pill transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <span>Add Organizer & Proceed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Two Column Checkout Form & Order Summary */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Checkout Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Error Banners */}
            {(formError || checkoutError) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3 shadow-sm animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed flex-1">{formError || checkoutError}</p>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-8">
              {/* Step 1: Contact Information */}
              <div className="bg-white border border-[#D6DCE1] rounded-3xl p-6 sm:p-8 shadow-tactile space-y-5">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#14334D] text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-base font-bold text-[#14334D]">Contact Information</h3>
                  </div>
                  <span className="text-[11px] text-[#708496]">Receipt & tracking updates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="checkout-email" className="block text-xs font-bold text-[#14334D]">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="checkout-phone" className="block text-xs font-bold text-[#14334D]">
                      Phone Number <span className="text-[#708496] font-normal">(Optional for delivery SMS)</span>
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Address */}
              <div className="bg-white border border-[#D6DCE1] rounded-3xl p-6 sm:p-8 shadow-tactile space-y-5">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#14334D] text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-base font-bold text-[#14334D]">Shipping Address</h3>
                  </div>
                  <span className="text-[11px] text-[#708496]">Dispatched in 24 hrs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-first-name" className="block text-xs font-bold text-[#14334D]">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="checkout-first-name"
                      type="text"
                      required
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="checkout-last-name" className="block text-xs font-bold text-[#14334D]">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="checkout-last-name"
                      type="text"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="checkout-address" className="block text-xs font-bold text-[#14334D]">
                      Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      autoComplete="shipping street-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Travel Avenue"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="checkout-apt" className="block text-xs font-bold text-[#14334D]">
                      Apartment, Suite, Unit <span className="text-[#708496] font-normal">(Optional)</span>
                    </label>
                    <input
                      id="checkout-apt"
                      type="text"
                      autoComplete="shipping address-line2"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Apt 4B"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="checkout-city" className="block text-xs font-bold text-[#14334D]">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      autoComplete="shipping address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label htmlFor="checkout-state" className="block text-xs font-bold text-[#14334D]">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="checkout-state"
                        type="text"
                        required
                        autoComplete="shipping address-level1"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="NY"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="checkout-zip" className="block text-xs font-bold text-[#14334D]">
                        ZIP Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="checkout-zip"
                        type="text"
                        required
                        autoComplete="shipping postal-code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="10001"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="checkout-country" className="block text-xs font-bold text-[#14334D]">
                      Country / Region
                    </label>
                    <select
                      id="checkout-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Shipping Method Selection */}
              <div className="bg-white border border-[#D6DCE1] rounded-3xl p-6 sm:p-8 shadow-tactile space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#14334D] text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-base font-bold text-[#14334D]">Shipping Method</h3>
                  </div>
                  <span className="text-[11px] text-[#2563EB] font-semibold">Tracked Courier</span>
                </div>

                <div className="space-y-3">
                  {/* Complimentary Tracked */}
                  <label
                    onClick={() => setShippingMethod('free')}
                    className={`relative p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === 'free'
                        ? 'border-[#2563EB] bg-[#F4F8FD] ring-2 ring-[#2563EB]/20 shadow-sm'
                        : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        shippingMethod === 'free' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1] bg-white'
                      }`}>
                        {shippingMethod === 'free' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#14334D]">Complimentary Insured Delivery</p>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                            Free
                          </span>
                        </div>
                        <p className="text-[11px] text-[#456176]">Standard transit: 3–5 business days with tracking</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#14334D]">$0.00</span>
                  </label>

                  {/* Priority Express */}
                  <label
                    onClick={() => setShippingMethod('express')}
                    className={`relative p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'border-[#2563EB] bg-[#F4F8FD] ring-2 ring-[#2563EB]/20 shadow-sm'
                        : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        shippingMethod === 'express' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1] bg-white'
                      }`}>
                        {shippingMethod === 'express' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#14334D]">Priority Express Air Delivery</p>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                            Fastest
                          </span>
                        </div>
                        <p className="text-[11px] text-[#456176]">Expedited transit: 1–2 business days</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#14334D]">+$9.99</span>
                  </label>
                </div>
              </div>

              {/* Step 4: Payment Details */}
              <div className="bg-white border border-[#D6DCE1] rounded-3xl p-6 sm:p-8 shadow-tactile space-y-5">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#14334D] text-white text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-base font-bold text-[#14334D]">Payment Information</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#059669] font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>256-Bit Encrypted</span>
                  </div>
                </div>

                {/* Payment Option Selector */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#2563EB] bg-[#F4F8FD] text-[#2563EB] shadow-sm'
                        : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#456176] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-[#2563EB] bg-[#F4F8FD] text-[#2563EB] shadow-sm'
                        : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#456176] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Stripe Checkout</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <label htmlFor="card-name" className="block text-xs font-bold text-[#14334D]">
                        Name on Card
                      </label>
                      <input
                        id="card-name"
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="card-num" className="block text-xs font-bold text-[#14334D]">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          id="card-num"
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4242 •••• •••• 4242"
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] font-mono focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded shadow-xs">
                            VISA / MC / AMEX
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="card-exp" className="block text-xs font-bold text-[#14334D]">
                          Expires (MM/YY)
                        </label>
                        <input
                          id="card-exp"
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] font-mono focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="card-cvc" className="block text-xs font-bold text-[#14334D]">
                          CVC
                        </label>
                        <input
                          id="card-cvc"
                          type="password"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="•••"
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#14334D] font-mono focus:border-[#3898D5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3898D5]/20 transition-all placeholder:text-[#94A3B8]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl space-y-2 text-xs text-[#456176]">
                    <div className="flex items-center gap-2 text-[#14334D] font-bold">
                      <Lock className="w-4 h-4 text-[#2563EB]" />
                      <span>Direct Stripe Session</span>
                    </div>
                    <p className="leading-relaxed">
                      You will be securely forwarded to Stripe's encrypted checkout page. If Stripe keys are awaiting configuration on your server, your order will safely settle via the express test protocol.
                    </p>
                  </div>
                )}

                <div className="pt-2 text-[11px] text-[#708496] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero sensitive credit card information is stored on our servers.</span>
                </div>
              </div>

              {/* Submit CTA (Mobile only, Desktop is in right column) */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="w-full bg-[#0D0E10] hover:bg-black text-white font-semibold text-sm tracking-wider uppercase py-4 rounded-full transition-all shadow-pill active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order · ${totalAmount.toFixed(2)} USD</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Sticky Order Summary (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white border border-[#D6DCE1] rounded-3xl p-6 sm:p-8 shadow-tactile space-y-6">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <h3 className="text-base font-bold text-[#14334D]">Order Summary</h3>
                <span className="text-xs bg-[#F0F2F5] text-[#14334D] font-bold px-2.5 py-1 rounded-full">
                  {currentQuantity} {currentQuantity === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Product Row */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 items-center bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl">
                    <div className="w-16 h-16 bg-white border border-[#CBD5E1] rounded-xl flex items-center justify-center p-2 shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-h-12 max-w-12 object-contain"
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#14334D] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-bold text-[#14334D] truncate">{item.title}</h4>
                      <p className="text-[11px] text-[#456176]">{item.variantName}</p>
                      
                      {/* Stepper */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex items-center bg-white border border-[#CBD5E1] rounded-full px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.quantity - 1)}
                            className="p-1 text-[#456176] hover:text-[#14334D]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#14334D]">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.quantity + 1)}
                            className="p-1 text-[#456176] hover:text-[#14334D]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#14334D]">
                        ${(unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Discount code (e.g. SEREIN10)"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#14334D] focus:border-[#3898D5] focus:outline-none uppercase placeholder:normal-case placeholder:text-[#94A3B8]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#F0F2F5] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#14334D] text-xs font-bold rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> 10% promotional discount applied!
                  </p>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-500">{promoError}</p>
                )}
              </form>

              {/* Price Calculation Summary */}
              <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0] text-xs">
                <div className="flex justify-between items-center text-[#456176]">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-[#14334D]">${subtotal.toFixed(2)}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>Discount (10%)</span>
                    <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[#456176]">
                  <span>Insured Shipping</span>
                  <span className="font-semibold text-[#14334D]">
                    {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#456176]">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-[#14334D]">$0.00</span>
                </div>

                <div className="border-t border-[#E2E8F0] pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-extrabold text-[#14334D]">Total Due</span>
                    <p className="text-[10px] text-[#708496]">Includes all applicable discounts & shipping</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#14334D] tracking-tight">
                      ${totalAmount.toFixed(2)}
                    </span>
                    <span className="text-[11px] font-bold text-[#708496] ml-1">USD</span>
                  </div>
                </div>
              </div>

              {/* Desktop Place Order CTA */}
              <button
                type="button"
                disabled={isCheckingOut}
                onClick={handleSubmitOrder}
                className="hidden lg:flex w-full bg-[#0D0E10] hover:bg-black text-white font-semibold text-xs tracking-[0.15em] uppercase py-4 rounded-full transition-all shadow-pill hover:scale-[1.01] active:scale-[0.99] items-center justify-center gap-2 group disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3898D5]"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order · ${totalAmount.toFixed(2)} USD</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              {/* Guarantees Box */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-2 text-[11px] text-[#456176]">
                <div className="flex items-center gap-2 text-[#14334D] font-bold">
                  <PackageCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>Serein 30-Day Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  Every order is backed by our 30-day return policy and full transit protection. If anything doesn't meet your packing expectations, our concierge team will make it right.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
