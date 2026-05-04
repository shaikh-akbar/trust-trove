// "use client";

// import Link from "next/link";
// import { useEffect, useEffectEvent, useState } from "react";
// import { MapPin, Percent, Plus, ShieldCheck } from "lucide-react";
// import { useCart } from "./CartProvider";

// function formatPrice(value) {
//   return `Rs. ${Number(value || 0)}`;
// }

// const EMPTY_ADDRESS = {
//   fullName: "",
//   phone: "",
//   email: "",
//   addressLine1: "",
//   addressLine2: "",
//   landmark: "",
//   city: "",
//   state: "",
//   postalCode: "",
//   country: "India",
//   addressType: "home",
//   isDefault: true,
// };

// const PAYMENT_METHODS = [
//   {
//     id: "online",
//     label: "Pay Online",
//     description: "Complete payment securely with Razorpay.",
//   },
//   {
//     id: "cod",
//     label: "Cash on Delivery",
//     description: "Place the order now and pay when it arrives.",
//   },
// ];

// function OrderSummaryPanel({
//   items,
//   summary,
//   selectedAddressId,
//   canProceedToPayment,
//   handleProceedPayment,
//   paying,
//   paymentType,
//   loadingSummary,
//   codUnavailable,
//   className = "",
// }) {
//   return (
//     <section
//       className={`rounded-[1.1rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-3 shadow-[0_18px_48px_-42px_rgba(66,72,121,0.22)] sm:rounded-[1.75rem] sm:p-5 ${className}`}
//     >
//       <div className="flex items-center gap-3">
//         <span className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-navy)]">
//           <ShieldCheck size={18} />
//         </span>
//         <div>
//           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">
//             Final Step
//           </p>
//           <h2 className="mt-1 text-base font-black tracking-tight text-slate-950 sm:text-xl">Order summary</h2>
//         </div>
//       </div>

//       <div className="mt-4 space-y-3">
//         {items.map((item) => (
//           <div key={item.cartId} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
//             <div className="min-w-0">
//               <p className="truncate text-[12px] font-bold text-slate-900 sm:text-sm">{item.title}</p>
//               <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
//                 {item.optionLabel} x {item.quantity}
//               </p>
//             </div>
//             <p className="text-[12px] font-black text-slate-900 sm:text-sm">
//               {formatPrice(item.price_selling * item.quantity)}
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="mt-4 space-y-2.5 border-t border-slate-200 pt-4 text-[12px] sm:text-sm">
//         <div className="flex items-center justify-between text-slate-600">
//           <span>Subtotal</span>
//           <span>{formatPrice(summary?.subtotal || 0)}</span>
//         </div>
//         <div className="flex items-center justify-between text-slate-600">
//           <span>Discount</span>
//           <span>- {formatPrice(summary?.discountAmount || 0)}</span>
//         </div>
//         <div className="flex items-center justify-between text-slate-600">
//           <span>Base shipping</span>
//           <span>{formatPrice(summary?.baseShippingAmount || 0)}</span>
//         </div>
//         <div className="flex items-center justify-between text-slate-600">
//           <span>Vendor shipping</span>
//           <span>{formatPrice(summary?.vendorShippingAmount || 0)}</span>
//         </div>
//         <div className="flex items-center justify-between text-slate-600">
//           <span>Shipping total</span>
//           <span>{formatPrice(summary?.shippingAmount || 0)}</span>
//         </div>
//         <div className="flex items-center justify-between text-slate-600">
//           <span>Platform fee</span>
//           <span>{formatPrice(summary?.platformFeeAmount || 0)}</span>
//         </div>
//         <div className="flex items-center justify-between text-slate-600">
//           <span>Convenience fee</span>
//           <span>{formatPrice(summary?.convenienceFeeAmount || 0)}</span>
//         </div>
//         {paymentType === "cod" ? (
//           <div className="flex items-center justify-between text-slate-600">
//             <span>COD charge</span>
//             <span>{formatPrice(summary?.codChargeAmount || 0)}</span>
//           </div>
//         ) : null}
//         <div className="flex items-center justify-between text-base font-black text-slate-950 sm:text-lg">
//           <span>Total</span>
//           <span>{formatPrice(summary?.totalAmount || 0)}</span>
//         </div>
//       </div>

//       <div className="mt-4 rounded-[1rem] border border-[var(--line)] bg-white p-3 text-[12px] text-slate-600 sm:rounded-[1.5rem] sm:p-4 sm:text-sm">
//         <div className="flex items-start gap-3">
//           <MapPin size={16} className="mt-1 text-[var(--brand-navy)]" />
//           <p>
//             {selectedAddressId
//               ? "Selected address is ready for delivery."
//               : "Select a saved address or add a new one before payment."}
//           </p>
//         </div>
//       </div>

//       <button
//         type="button"
//         onClick={() => void handleProceedPayment()}
//         disabled={!canProceedToPayment}
//         className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-navy)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#353a66] disabled:opacity-70 sm:px-6 sm:py-4 sm:text-sm sm:tracking-[0.18em]"
//       >
//         {paying ? "Processing..." : paymentType === "cod" ? "Place COD Order" : "Pay with Razorpay"}
//       </button>
//       <p className="mt-3 text-center text-xs text-slate-400">
//         {paymentType === "cod"
//           ? "COD orders are placed immediately and payment stays pending until delivery."
//           : "Razorpay order is created on the server and payment signature is verified after checkout."}
//       </p>
//       {!selectedAddressId ? (
//         <p className="mt-2 text-center text-xs text-[var(--brand-navy)]/80">
//           Select a delivery address to continue.
//         </p>
//       ) : null}
//       {!summary && !loadingSummary ? (
//         <p className="mt-2 text-center text-xs text-[var(--brand-navy)]/80">
//           Checkout summary is unavailable right now. Please refresh coupon totals and try again.
//         </p>
//       ) : null}
//       {codUnavailable ? (
//         <p className="mt-2 text-center text-xs text-[var(--brand-navy)]/80">
//           Cash on Delivery is unavailable for one or more products in this cart.
//         </p>
//       ) : null}
//     </section>
//   );
// }

// function Field({ label, value, onChange, placeholder, type = "text" }) {
//   return (
//     <label className="block">
//       <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
//       <input
//         type={type}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-navy)] focus:bg-white"
//       />
//     </label>
//   );
// }

// function loadRazorpayScript() {
//   return new Promise((resolve) => {
//     if (typeof window === "undefined") {
//       resolve(false);
//       return;
//     }

//     if (window.Razorpay) {
//       resolve(true);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// }

// export default function CheckoutClient({ user, initialAddresses = [] }) {
//   const { items, isHydrated } = useCart();
//   const [addresses, setAddresses] = useState(initialAddresses);
//   const [selectedAddressId, setSelectedAddressId] = useState(
//     initialAddresses.find((address) => address.isDefault)?.id || initialAddresses[0]?.id || ""
//   );
//   const [isAddingAddress, setIsAddingAddress] = useState(initialAddresses.length === 0);
//   const [addressForm, setAddressForm] = useState({
//     ...EMPTY_ADDRESS,
//     fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
//     phone: "",
//     email: user.email || "",
//     city: user.city || "",
//   });
//   const [summary, setSummary] = useState(null);
//   const [couponCode, setCouponCode] = useState("");
//   const [couponMessage, setCouponMessage] = useState("");
//   const [loadingSummary, setLoadingSummary] = useState(false);
//   const [savingAddress, setSavingAddress] = useState(false);
//   const [paying, setPaying] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [paymentType, setPaymentType] = useState("online");

//   const cartSignature = items.map((item) => `${item.cartId}:${item.quantity}`).join("|");

//   const loadInitialSummary = useEffectEvent(() => {
//     void refreshSummary(couponCode, paymentType);
//   });

//   async function refreshSummary(nextCouponCode = couponCode, nextPaymentType = paymentType) {
//     setLoadingSummary(true);
//     setErrorMessage("");

//     try {
//       const response = await fetch("/api/checkout/summary", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           couponCode: nextCouponCode,
//           paymentType: nextPaymentType,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.error || "Failed to fetch checkout summary.");
//       }

//       setSummary(data);
//       setCouponMessage(data.coupon ? `Coupon ${data.coupon.code} applied.` : nextCouponCode ? "" : "No coupon applied.");
//     } catch (error) {
//       setCouponMessage("");
//       setErrorMessage(error.message);
//     } finally {
//       setLoadingSummary(false);
//     }
//   }

//   useEffect(() => {
//     if (!isHydrated || !items.length) {
//       return;
//     }

//     loadInitialSummary();
//   }, [cartSignature, isHydrated, items.length, paymentType]);

//   function updateAddressField(key, value) {
//     setAddressForm((current) => ({
//       ...current,
//       [key]: value,
//     }));
//   }

//   async function handleSaveAddress() {
//     setSavingAddress(true);
//     setErrorMessage("");

//     try {
//       const response = await fetch("/api/user-addresses", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(addressForm),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.error || "Failed to save address.");
//       }

//       const nextAddresses = [data.address, ...addresses.filter((address) => address.id !== data.address.id)];
//       setAddresses(nextAddresses);
//       setSelectedAddressId(data.address.id);
//       setIsAddingAddress(false);
//       setAddressForm({
//         ...EMPTY_ADDRESS,
//         fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
//         email: user.email || "",
//         city: user.city || "",
//       });
//     } catch (error) {
//       setErrorMessage(error.message);
//     } finally {
//       setSavingAddress(false);
//     }
//   }

//   async function handleApplyCoupon() {
//     setCouponMessage("");
//     await refreshSummary(couponCode);
//   }

//   async function handleProceedPayment() {
//     if (!selectedAddressId) {
//       setErrorMessage("Please select or add a delivery address first.");
//       return;
//     }

//     setPaying(true);
//     setErrorMessage("");

//     try {
//       const orderResponse = await fetch("/api/checkout/create-order", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           addressId: selectedAddressId,
//           couponCode,
//           paymentType,
//         }),
//       });

//       const orderData = await orderResponse.json();

//       if (!orderResponse.ok) {
//         throw new Error(orderData?.error || "Failed to create checkout order.");
//       }

//       if (orderData.paymentType === "cod") {
//         window.location.assign(`/orders?placed=${encodeURIComponent(orderData.orderNumber)}`);
//         return;
//       }

//       const scriptLoaded = await loadRazorpayScript();

//       if (!scriptLoaded) {
//         throw new Error("Unable to load Razorpay checkout.");
//       }

//       const razorpay = new window.Razorpay({
//         key: orderData.razorpayKeyId,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: "TrustTrove",
//         description: `Order ${orderData.orderNumber}`,
//         order_id: orderData.razorpayOrderId,
//         prefill: {
//           name: orderData.customer.name,
//           email: orderData.customer.email,
//           contact: orderData.customer.contact,
//         },
//         notes: {
//           internal_order_id: orderData.internalOrderId,
//           order_number: orderData.orderNumber,
//         },
//         theme: {
//           color: "#424879",
//         },
//         handler: async function (response) {
//           const verifyResponse = await fetch("/api/checkout/verify-payment", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               internalOrderId: orderData.internalOrderId,
//               ...response,
//             }),
//           });

//           const verifyData = await verifyResponse.json();

//           if (!verifyResponse.ok) {
//             throw new Error(verifyData?.error || "Payment verification failed.");
//           }

//           window.location.assign(`/orders?placed=${encodeURIComponent(verifyData.orderNumber)}`);
//         },
//       });

//       razorpay.on("payment.failed", function (response) {
//         setErrorMessage(
//           response?.error?.description || "Payment was not completed. Please try again."
//         );
//       });

//       razorpay.open();
//     } catch (error) {
//       setErrorMessage(error.message);
//     } finally {
//       setPaying(false);
//     }
//   }

//   if (!isHydrated) {
//     return (
//       <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
//         <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
//           <p className="text-sm font-semibold text-slate-500">Loading checkout...</p>
//         </div>
//       </section>
//     );
//   }

//   if (!items.length) {
//     return (
//       <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
//         <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
//           <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950">Your cart is empty</h1>
//           <p className="mt-3 text-sm leading-6 text-slate-500">
//             Add products to your cart before continuing to checkout.
//           </p>
//           <Link
//             href="/shop"
//             className="mt-6 inline-flex items-center rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#353a66]"
//           >
//             Back to Shop
//           </Link>
//         </div>
//       </section>
//     );
//   }

//   const canProceedToPayment =
//     Boolean(selectedAddressId) &&
//     Boolean(summary) &&
//     !loadingSummary &&
//     !paying &&
//     !(paymentType === "cod" && summary?.codAvailable === false);

//   return (
//     <section className="mx-auto max-w-6xl px-2 py-3 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
//       <div className="mb-4 sm:mb-8">
//         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">Checkout</p>
//         <h1 className="mt-1.5 max-w-3xl text-[1.35rem] font-black leading-[1.05] tracking-[-0.04em] text-slate-950 sm:mt-2 sm:text-4xl">
//           Delivery, coupon, and payment in one flow
//         </h1>
//         <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
//           Signed in as {user.email}. Final totals and coupon logic are verified on the server before payment.
//         </p>
//       </div>

//       {errorMessage ? (
//         <div className="mb-6 rounded-2xl border border-[var(--line)] bg-[linear-gradient(180deg,#f7f8fc_0%,#eef1fb_100%)] px-4 py-3 text-sm text-[var(--brand-navy)]">
//           {errorMessage}
//         </div>
//       ) : null}

//       <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start xl:gap-6">
//         <div className="space-y-4 sm:space-y-6">
//           <section className="rounded-[1.1rem] border border-[var(--line)] bg-white p-3 shadow-[0_16px_40px_-36px_rgba(66,72,121,0.16)] sm:rounded-[1.75rem] sm:p-5">
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
//               <div>
//                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">Step 1</p>
//                 <h2 className="mt-1.5 text-[15px] font-black tracking-tight text-slate-950 sm:mt-2 sm:text-xl">Choose delivery address</h2>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setIsAddingAddress((current) => !current)}
//                 className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--brand-navy)] transition hover:border-[var(--brand-navy)] hover:bg-[var(--surface-soft)] sm:min-h-0 sm:w-auto sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]"
//               >
//                 <Plus size={14} />
//                 {isAddingAddress ? "Hide Form" : "Add Address"}
//               </button>
//             </div>

//             {addresses.length ? (
//               <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-4">
//                 {addresses.map((address) => (
//                   <label
//                     key={address.id}
//                     className={`block rounded-[1rem] border p-3 transition sm:rounded-[1.5rem] sm:p-4 ${
//                       selectedAddressId === address.id
//                         ? "border-[var(--brand-navy)] bg-[linear-gradient(135deg,#424879_0%,#353a66_100%)] text-white"
//                         : "border-[var(--line)] bg-[var(--surface-soft)] text-slate-800"
//                     }`}
//                   >
//                     <div className="flex items-start gap-3">
//                       <input
//                         type="radio"
//                         name="selectedAddress"
//                         checked={selectedAddressId === address.id}
//                         onChange={() => setSelectedAddressId(address.id)}
//                         className="mt-1 h-4 w-4 shrink-0"
//                       />
//                       <div className="min-w-0 flex-1">
//                         <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
//                           <p className="text-[13px] font-black tracking-tight sm:text-base">{address.fullName}</p>
//                           {address.isDefault ? (
//                             <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${selectedAddressId === address.id ? "bg-white/12 text-slate-100" : "bg-white text-[var(--brand-navy)]"}`}>
//                               Default
//                             </span>
//                           ) : null}
//                         </div>
//                         <p className={`mt-1.5 break-words pr-1 text-[11px] leading-5 sm:mt-2 sm:text-sm sm:leading-6 ${selectedAddressId === address.id ? "text-slate-100" : "text-slate-500"}`}>
//                           {address.addressLine1}
//                           {address.addressLine2 ? `, ${address.addressLine2}` : ""}
//                           {address.landmark ? `, ${address.landmark}` : ""}
//                           <br />
//                           {address.city}, {address.state} {address.postalCode}
//                           <br />
//                           {address.country}
//                           <br />
//                           Phone: {address.phone}
//                         </p>
//                       </div>
//                     </div>
//                   </label>
//                 ))}
//               </div>
//             ) : (
//               <p className="mt-5 text-sm text-slate-500">No saved addresses yet. Add one below to continue.</p>
//             )}

//             {isAddingAddress ? (
//               <div className="mt-5 rounded-[1rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-3 sm:rounded-[1.5rem] sm:p-4">
//                 <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4">
//                   <Field label="Full Name" value={addressForm.fullName} onChange={(e) => updateAddressField("fullName", e.target.value)} placeholder="Akbar Khan" />
//                   <Field label="Phone" value={addressForm.phone} onChange={(e) => updateAddressField("phone", e.target.value)} placeholder="9876543210" />
//                   <div className="sm:col-span-2">
//                     <Field label="Email" value={addressForm.email} onChange={(e) => updateAddressField("email", e.target.value)} placeholder="you@example.com" type="email" />
//                   </div>
//                   <div className="sm:col-span-2">
//                     <Field label="Address Line 1" value={addressForm.addressLine1} onChange={(e) => updateAddressField("addressLine1", e.target.value)} placeholder="House no, street, area" />
//                   </div>
//                   <div className="sm:col-span-2">
//                     <Field label="Address Line 2" value={addressForm.addressLine2} onChange={(e) => updateAddressField("addressLine2", e.target.value)} placeholder="Apartment, building, floor" />
//                   </div>
//                   <Field label="Landmark" value={addressForm.landmark} onChange={(e) => updateAddressField("landmark", e.target.value)} placeholder="Near metro station" />
//                   <Field label="City" value={addressForm.city} onChange={(e) => updateAddressField("city", e.target.value)} placeholder="Mumbai" />
//                   <Field label="State" value={addressForm.state} onChange={(e) => updateAddressField("state", e.target.value)} placeholder="Maharashtra" />
//                   <Field label="Postal Code" value={addressForm.postalCode} onChange={(e) => updateAddressField("postalCode", e.target.value)} placeholder="400001" />
//                   <Field label="Country" value={addressForm.country} onChange={(e) => updateAddressField("country", e.target.value)} placeholder="India" />
//                   <Field label="Address Type" value={addressForm.addressType} onChange={(e) => updateAddressField("addressType", e.target.value)} placeholder="home" />
//                 </div>

//                 <label className="mt-4 flex items-center gap-3 text-[13px] text-slate-600 sm:text-sm">
//                   <input
//                     type="checkbox"
//                     checked={addressForm.isDefault}
//                     onChange={(e) => updateAddressField("isDefault", e.target.checked)}
//                     className="h-4 w-4 shrink-0"
//                   />
//                   Save this as default address
//                 </label>

//                 <button
//                   type="button"
//                   onClick={() => void handleSaveAddress()}
//                   disabled={savingAddress}
//                   className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-navy)] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#353a66] disabled:opacity-70 sm:text-sm sm:tracking-[0.18em]"
//                 >
//                   {savingAddress ? "Saving Address..." : "Save Address"}
//                 </button>
//               </div>
//             ) : null}
//           </section>

//           <section className="rounded-[1.1rem] border border-[var(--line)] bg-white p-3 shadow-[0_16px_40px_-36px_rgba(66,72,121,0.16)] sm:rounded-[1.75rem] sm:p-5">
//             <div className="flex items-start gap-3">
//               <span className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-navy)]">
//                 <Percent size={18} />
//               </span>
//               <div>
//                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">Step 2</p>
//                 <h2 className="mt-1.5 text-[15px] font-black tracking-tight text-slate-950 sm:mt-2 sm:text-xl">Apply coupon</h2>
//               </div>
//             </div>

//             <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:flex-row sm:items-center">
//               <input
//                 type="text"
//                 value={couponCode}
//                 onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
//                 placeholder="Enter coupon code"
//                 className="w-full rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2.5 text-[13px] text-slate-900 outline-none transition focus:border-[var(--brand-navy)] focus:bg-white sm:px-5 sm:py-3 sm:text-sm"
//               />
//               <button
//                 type="button"
//                 onClick={() => void handleApplyCoupon()}
//                 disabled={loadingSummary}
//                 className="inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#353a66] disabled:opacity-70 sm:w-auto sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.18em]"
//               >
//                 {loadingSummary ? "Checking..." : "Apply"}
//               </button>
//             </div>

//             {couponMessage ? <p className="mt-3 text-sm text-[var(--brand-navy)]">{couponMessage}</p> : null}
//           </section>

//           <section className="rounded-[1.1rem] border border-[var(--line)] bg-white p-3 shadow-[0_16px_40px_-36px_rgba(66,72,121,0.16)] sm:rounded-[1.75rem] sm:p-5">
//             <div>
//               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">Step 3</p>
//               <h2 className="mt-1.5 text-[15px] font-black tracking-tight text-slate-950 sm:mt-2 sm:text-xl">Choose payment method</h2>
//             </div>

//             <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-4">
//               {PAYMENT_METHODS.map((method) => {
//                 const isUnavailable = method.id === "cod" && summary?.codAvailable === false;

//                 return (
//                   <label
//                     key={method.id}
//                     className={`block rounded-[1rem] border p-3 transition sm:rounded-[1.5rem] sm:p-4 ${
//                       paymentType === method.id
//                         ? "border-[var(--brand-navy)] bg-[linear-gradient(135deg,#424879_0%,#353a66_100%)] text-white"
//                         : "border-[var(--line)] bg-[var(--surface-soft)] text-slate-800"
//                     } ${isUnavailable ? "opacity-60" : ""}`}
//                   >
//                     <div className="flex items-start gap-3">
//                       <input
//                         type="radio"
//                         name="paymentType"
//                         checked={paymentType === method.id}
//                         onChange={() => setPaymentType(method.id)}
//                         disabled={isUnavailable}
//                         className="mt-1 h-4 w-4"
//                       />
//                       <div className="min-w-0 flex-1">
//                         <p className="text-[13px] font-black tracking-tight sm:text-base">{method.label}</p>
//                         <p className={`mt-1.5 text-[11px] leading-5 sm:mt-2 sm:text-sm ${paymentType === method.id ? "text-slate-200" : "text-slate-500"}`}>
//                           {isUnavailable
//                             ? "Unavailable because one or more cart items do not support COD."
//                             : method.description}
//                         </p>
//                       </div>
//                     </div>
//                   </label>
//                 );
//               })}
//             </div>
//           </section>

//           <OrderSummaryPanel
//             items={items}
//             summary={summary}
//             selectedAddressId={selectedAddressId}
//             canProceedToPayment={canProceedToPayment}
//             handleProceedPayment={handleProceedPayment}
//             paying={paying}
//             paymentType={paymentType}
//             loadingSummary={loadingSummary}
//             codUnavailable={paymentType === "cod" && summary?.codAvailable === false}
//             className="xl:hidden"
//           />
//         </div>

//         <OrderSummaryPanel
//           items={items}
//           summary={summary}
//           selectedAddressId={selectedAddressId}
//           canProceedToPayment={canProceedToPayment}
//           handleProceedPayment={handleProceedPayment}
//           paying={paying}
//           paymentType={paymentType}
//           loadingSummary={loadingSummary}
//           codUnavailable={paymentType === "cod" && summary?.codAvailable === false}
//           className="hidden xl:sticky xl:top-6 xl:block xl:self-start"
//         />
//       </div>
//     </section>
//   );
// }



"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  MapPin,
  Percent,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useCart } from "./CartProvider";

function formatPrice(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
}

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  addressType: "home",
  isDefault: true,
};

const PAYMENT_METHODS = [
  {
    id: "online",
    label: "Pay Online",
    description: "Complete payment securely with Razorpay.",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Place the order now and pay when it arrives.",
  },
];

function OrderSummaryPanel({
  items,
  summary,
  selectedAddressId,
  canProceedToPayment,
  handleProceedPayment,
  paying,
  paymentType,
  loadingSummary,
  codUnavailable,
  className = "",
}) {
  return (
    <section
      className={`overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_24px_90px_-70px_rgba(15,23,42,0.8)] sm:rounded-[2rem] ${className}`}
    >
      <div className="bg-[#161f66] p-4 text-white sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55 sm:text-xs sm:tracking-[0.24em]">
              Final Step
            </p>
            <h2 className="mt-1.5 font-display text-lg font-semibold tracking-[-0.03em] sm:text-xl">
              Order summary
            </h2>
          </div>

          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
            <ShieldCheck size={22} />
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              Items
            </p>
            <p className="mt-1 text-xl font-black">{items.length}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              Payment
            </p>
            <p className="mt-1 text-sm font-black">
              {paymentType === "cod" ? "COD" : "Online"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-3 sm:rounded-[1.5rem] sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Products
            </p>
            <p className="text-xs font-bold text-slate-500">
              {items.length} item{items.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.cartId}
                className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-20 sm:w-20">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || "Product image"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                      No image
                    </div>
                  )}

                  <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#161f66] px-1.5 text-[10px] font-black text-white shadow-md">
                    {item.quantity}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[12px] font-black leading-5 text-slate-950 sm:text-sm">
                    {item.title}
                  </p>

                  <p className="mt-1 truncate text-[10px] text-slate-500 sm:text-xs">
                    {item.optionLabel || "Default"} × {item.quantity}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold text-slate-500">
                      {formatPrice(item.price_selling)} each
                    </p>
                    <p className="text-[12px] font-black text-slate-950 sm:text-sm">
                      {formatPrice(item.price_selling * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2.5 rounded-[1.25rem] border border-slate-100 bg-white p-3 text-[12px] shadow-sm sm:rounded-[1.5rem] sm:p-4 sm:text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">
              {formatPrice(summary?.subtotal || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Discount</span>
            <span className="font-bold text-green-600">
              - {formatPrice(summary?.discountAmount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Base shipping</span>
            <span className="font-bold text-slate-900">
              {formatPrice(summary?.baseShippingAmount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Vendor shipping</span>
            <span className="font-bold text-slate-900">
              {formatPrice(summary?.vendorShippingAmount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Shipping total</span>
            <span className="font-bold text-slate-900">
              {formatPrice(summary?.shippingAmount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Platform fee</span>
            <span className="font-bold text-slate-900">
              {formatPrice(summary?.platformFeeAmount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Convenience fee</span>
            <span className="font-bold text-slate-900">
              {formatPrice(summary?.convenienceFeeAmount || 0)}
            </span>
          </div>

          {paymentType === "cod" ? (
            <div className="flex items-center justify-between text-slate-600">
              <span>COD charge</span>
              <span className="font-bold text-slate-900">
                {formatPrice(summary?.codChargeAmount || 0)}
              </span>
            </div>
          ) : null}

          <div className="my-3 border-t border-dashed border-slate-200" />

          <div className="flex items-center justify-between text-base font-black text-slate-950 sm:text-lg">
            <span>Total</span>
            <span className="text-xl text-[#161f66] sm:text-2xl">
              {formatPrice(summary?.totalAmount || 0)}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-[#161f66]/10 bg-[#161f66]/5 p-3 text-[12px] text-slate-700 sm:rounded-[1.5rem] sm:p-4 sm:text-sm">
          <div className="flex items-start gap-3">
            <MapPin size={16} className="mt-1 shrink-0 text-[#161f66]" />
            <p>
              {selectedAddressId
                ? "Selected address is ready for delivery."
                : "Select a saved address or add a new one before payment."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleProceedPayment()}
          disabled={!canProceedToPayment}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#161f66] px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_50px_-28px_rgba(22,31,102,0.8)] transition hover:-translate-y-0.5 hover:bg-[#10184f] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:px-6 sm:py-4 sm:text-sm sm:tracking-[0.18em]"
        >
          {paying
            ? "Processing..."
            : paymentType === "cod"
              ? "Place COD Order"
              : "Proceed to Pay"}
          {!paying ? <ArrowRight size={16} /> : null}
        </button>

        <p className="mt-3 text-center text-xs leading-5 text-slate-400">
          {paymentType === "cod"
            ? "COD orders are placed immediately and payment stays pending until delivery."
            : "Razorpay order is created on the server and payment signature is verified after checkout."}
        </p>

        {!selectedAddressId ? (
          <p className="mt-2 text-center text-xs font-semibold text-[#161f66]">
            Select a delivery address to continue.
          </p>
        ) : null}

        {!summary && !loadingSummary ? (
          <p className="mt-2 text-center text-xs font-semibold text-[#161f66]">
            Checkout summary is unavailable right now. Please refresh coupon totals and try again.
          </p>
        ) : null}

        {codUnavailable ? (
          <p className="mt-2 text-center text-xs font-semibold text-[#161f66]">
            Cash on Delivery is unavailable for one or more products in this cart.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#161f66] focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,31,102,0.08)]"
      />
    </label>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutClient({ user, initialAddresses = [] }) {
  const { items, isHydrated } = useCart();

  const [addresses, setAddresses] = useState(initialAddresses);

  const [selectedAddressId, setSelectedAddressId] = useState(
    initialAddresses.find((address) => address.isDefault)?.id ||
      initialAddresses[0]?.id ||
      ""
  );

  const [isAddingAddress, setIsAddingAddress] = useState(
    initialAddresses.length === 0
  );

  const [addressForm, setAddressForm] = useState({
    ...EMPTY_ADDRESS,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
    phone: "",
    email: user.email || "",
    city: user.city || "",
  });

  const [summary, setSummary] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentType, setPaymentType] = useState("online");

  const cartSignature = items
    .map((item) => `${item.cartId}:${item.quantity}`)
    .join("|");

  const loadInitialSummary = useEffectEvent(() => {
    void refreshSummary(couponCode, paymentType);
  });

  async function refreshSummary(
    nextCouponCode = couponCode,
    nextPaymentType = paymentType
  ) {
    setLoadingSummary(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/checkout/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: nextCouponCode,
          paymentType: nextPaymentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch checkout summary.");
      }

      setSummary(data);
      setCouponMessage(
        data.coupon
          ? `Coupon ${data.coupon.code} applied.`
          : nextCouponCode
            ? ""
            : "No coupon applied."
      );
    } catch (error) {
      setSummary(null);
      setCouponMessage("");
      setErrorMessage(error.message);
    } finally {
      setLoadingSummary(false);
    }
  }

  useEffect(() => {
    if (!isHydrated || !items.length) {
      return;
    }

    loadInitialSummary();
  }, [cartSignature, isHydrated, items.length, paymentType]);

  function updateAddressField(key, value) {
    setAddressForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSaveAddress() {
    setSavingAddress(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/user-addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save address.");
      }

      const nextAddresses = [
        data.address,
        ...addresses.filter((address) => address.id !== data.address.id),
      ];

      setAddresses(nextAddresses);
      setSelectedAddressId(data.address.id);
      setIsAddingAddress(false);

      setAddressForm({
        ...EMPTY_ADDRESS,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
        email: user.email || "",
        city: user.city || "",
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleApplyCoupon() {
    setCouponMessage("");
    await refreshSummary(couponCode);
  }

  async function handleProceedPayment() {
    if (!selectedAddressId) {
      setErrorMessage("Please select or add a delivery address first.");
      return;
    }

    setPaying(true);
    setErrorMessage("");

    try {
      const orderResponse = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          couponCode,
          paymentType,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData?.error || "Failed to create checkout order.");
      }

      if (orderData.paymentType === "cod") {
        window.location.assign(
          `/orders?placed=${encodeURIComponent(orderData.orderNumber)}`
        );
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const razorpay = new window.Razorpay({
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TrustTrove",
        description: `Order ${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          contact: orderData.customer.contact,
        },
        notes: {
          internal_order_id: orderData.internalOrderId,
          order_number: orderData.orderNumber,
        },
        theme: {
          color: "#161f66",
        },
        handler: async function (response) {
          const verifyResponse = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              internalOrderId: orderData.internalOrderId,
              ...response,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok) {
            throw new Error(
              verifyData?.error || "Payment verification failed."
            );
          }

          window.location.assign(
            `/orders?placed=${encodeURIComponent(verifyData.orderNumber)}`
          );
        },
      });

      razorpay.on("payment.failed", function (response) {
        setErrorMessage(
          response?.error?.description ||
            "Payment was not completed. Please try again."
        );
      });

      razorpay.open();
    } catch (error) {
      setSummary(null);
      setErrorMessage(error.message);
    } finally {
      setPaying(false);
    }
  }

  if (!isHydrated) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_-70px_rgba(15,23,42,0.7)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#161f66] text-white">
            <ShoppingBag size={22} />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading checkout...
          </p>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_-70px_rgba(15,23,42,0.7)] sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#161f66] text-white">
            <ShoppingBag size={24} />
          </span>

          <h1 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            Your cart is empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Add products to your cart before continuing to checkout.
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#161f66] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#10184f]"
          >
            Back to Shop
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  const canProceedToPayment =
    Boolean(selectedAddressId) &&
    Boolean(summary) &&
    !loadingSummary &&
    !paying &&
    !(paymentType === "cod" && summary?.codAvailable === false);

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_24px_90px_-75px_rgba(15,23,42,0.8)] sm:mb-8 sm:rounded-[2.25rem] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm sm:text-xs">
              <Sparkles size={14} className="text-[#161f66]" />
              Secure Checkout
            </div>

            <h1 className="mt-4 max-w-4xl font-display text-[1.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-5xl">
              Delivery, coupon, and payment in one flow
            </h1>

            <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Signed in as{" "}
              <span className="font-black text-slate-800">{user.email}</span>.
              Final totals and coupon logic are verified on the server before payment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[430px]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Items
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {items.length}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Payment
              </p>
              <p className="mt-2 text-sm font-black text-slate-950">
                {paymentType === "cod" ? "COD" : "Online"}
              </p>
            </div>

            <div className="col-span-2 rounded-3xl border border-[#161f66] bg-[#161f66] p-4 text-white sm:col-span-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                Status
              </p>
              <p className="mt-2 text-sm font-black">
                {selectedAddressId ? "Address Ready" : "Select Address"}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {errorMessage ? (
        <div className="mb-5 rounded-2xl border border-[#161f66]/15 bg-[#161f66]/5 px-4 py-3 text-sm font-semibold text-[#161f66]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(350px,0.85fr)] xl:items-start xl:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <section className="rounded-[1.4rem] border border-slate-200 bg-white p-3 shadow-[0_20px_80px_-74px_rgba(15,23,42,0.7)] sm:rounded-[2rem] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#161f66]/5 text-[#161f66]">
                  <MapPin size={19} />
                </span>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">
                    Step 1
                  </p>
                  <h2 className="mt-1.5 font-display text-[15px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-lg">
                    Choose delivery address
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingAddress((current) => !current)}
                className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#161f66] transition hover:border-[#161f66] hover:bg-[#161f66]/5 sm:min-h-0 sm:w-auto sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]"
              >
                <Plus size={14} />
                {isAddingAddress ? "Hide Form" : "Add Address"}
              </button>
            </div>

            {addresses.length ? (
              <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-4">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block cursor-pointer rounded-[1.1rem] border p-3 transition hover:-translate-y-0.5 sm:rounded-[1.5rem] sm:p-4 ${
                      selectedAddressId === address.id
                        ? "border-[#161f66] bg-[#161f66] text-white shadow-[0_20px_60px_-38px_rgba(22,31,102,0.75)]"
                        : "border-slate-200 bg-slate-50 text-slate-800 hover:border-[#161f66]/30 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1 h-4 w-4 shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                          <p className="text-[13px] font-black tracking-tight sm:text-base">
                            {address.fullName}
                          </p>

                          {address.isDefault ? (
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                                selectedAddressId === address.id
                                  ? "bg-white/12 text-slate-100"
                                  : "bg-white text-[#161f66]"
                              }`}
                            >
                              Default
                            </span>
                          ) : null}
                        </div>

                        <p
                          className={`mt-1.5 break-words pr-1 text-[11px] leading-5 sm:mt-2 sm:text-sm sm:leading-6 ${
                            selectedAddressId === address.id
                              ? "text-slate-100"
                              : "text-slate-500"
                          }`}
                        >
                          {address.addressLine1}
                          {address.addressLine2
                            ? `, ${address.addressLine2}`
                            : ""}
                          {address.landmark ? `, ${address.landmark}` : ""}
                          <br />
                          {address.city}, {address.state} {address.postalCode}
                          <br />
                          {address.country}
                          <br />
                          Phone: {address.phone}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                No saved addresses yet. Add one below to continue.
              </p>
            )}

            {isAddingAddress ? (
              <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3 sm:rounded-[1.5rem] sm:p-4">
                <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4">
                  <Field
                    label="Full Name"
                    value={addressForm.fullName}
                    onChange={(e) =>
                      updateAddressField("fullName", e.target.value)
                    }
                    placeholder="Akbar Khan"
                  />

                  <Field
                    label="Phone"
                    value={addressForm.phone}
                    onChange={(e) =>
                      updateAddressField("phone", e.target.value)
                    }
                    placeholder="9876543210"
                  />

                  <div className="sm:col-span-2">
                    <Field
                      label="Email"
                      value={addressForm.email}
                      onChange={(e) =>
                        updateAddressField("email", e.target.value)
                      }
                      placeholder="you@example.com"
                      type="email"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Address Line 1"
                      value={addressForm.addressLine1}
                      onChange={(e) =>
                        updateAddressField("addressLine1", e.target.value)
                      }
                      placeholder="House no, street, area"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Address Line 2"
                      value={addressForm.addressLine2}
                      onChange={(e) =>
                        updateAddressField("addressLine2", e.target.value)
                      }
                      placeholder="Apartment, building, floor"
                    />
                  </div>

                  <Field
                    label="Landmark"
                    value={addressForm.landmark}
                    onChange={(e) =>
                      updateAddressField("landmark", e.target.value)
                    }
                    placeholder="Near metro station"
                  />

                  <Field
                    label="City"
                    value={addressForm.city}
                    onChange={(e) =>
                      updateAddressField("city", e.target.value)
                    }
                    placeholder="Mumbai"
                  />

                  <Field
                    label="State"
                    value={addressForm.state}
                    onChange={(e) =>
                      updateAddressField("state", e.target.value)
                    }
                    placeholder="Maharashtra"
                  />

                  <Field
                    label="Postal Code"
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      updateAddressField("postalCode", e.target.value)
                    }
                    placeholder="400001"
                  />

                  <Field
                    label="Country"
                    value={addressForm.country}
                    onChange={(e) =>
                      updateAddressField("country", e.target.value)
                    }
                    placeholder="India"
                  />

                  <Field
                    label="Address Type"
                    value={addressForm.addressType}
                    onChange={(e) =>
                      updateAddressField("addressType", e.target.value)
                    }
                    placeholder="home"
                  />
                </div>

                <label className="mt-4 flex items-center gap-3 text-[13px] text-slate-600 sm:text-sm">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      updateAddressField("isDefault", e.target.checked)
                    }
                    className="h-4 w-4 shrink-0"
                  />
                  Save this as default address
                </label>

                <button
                  type="button"
                  onClick={() => void handleSaveAddress()}
                  disabled={savingAddress}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#161f66] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#10184f] disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm sm:tracking-[0.18em]"
                >
                  {savingAddress ? "Saving Address..." : "Save Address"}
                </button>
              </div>
            ) : null}
          </section>

          <section className="rounded-[1.4rem] border border-slate-200 bg-white p-3 shadow-[0_20px_80px_-74px_rgba(15,23,42,0.7)] sm:rounded-[2rem] sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#161f66]/5 text-[#161f66]">
                <Percent size={19} />
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">
                  Step 2
                </p>
                <h2 className="mt-1.5 font-display text-[15px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-lg">
                  Apply coupon
                </h2>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:flex-row sm:items-center">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#161f66] focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,31,102,0.08)] sm:px-5 sm:py-3 sm:text-sm"
              />

              <button
                type="button"
                onClick={() => void handleApplyCoupon()}
                disabled={loadingSummary}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#161f66] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#10184f] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.18em]"
              >
                {loadingSummary ? "Checking..." : "Apply"}
              </button>
            </div>

            {couponMessage ? (
              <p className="mt-3 text-sm font-semibold text-[#161f66]">
                {couponMessage}
              </p>
            ) : null}
          </section>

          <section className="rounded-[1.4rem] border border-slate-200 bg-white p-3 shadow-[0_20px_80px_-74px_rgba(15,23,42,0.7)] sm:rounded-[2rem] sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#161f66]/5 text-[#161f66]">
                <CreditCard size={19} />
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">
                  Step 3
                </p>
                <h2 className="mt-1.5 font-display text-[15px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-lg">
                  Choose payment method
                </h2>
              </div>
            </div>

            <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-4">
              {PAYMENT_METHODS.map((method) => {
                const isUnavailable =
                  method.id === "cod" && summary?.codAvailable === false;

                return (
                  <label
                    key={method.id}
                    className={`block cursor-pointer rounded-[1.1rem] border p-3 transition hover:-translate-y-0.5 sm:rounded-[1.5rem] sm:p-4 ${
                      paymentType === method.id
                        ? "border-[#161f66] bg-[#161f66] text-white shadow-[0_20px_60px_-38px_rgba(22,31,102,0.75)]"
                        : "border-slate-200 bg-slate-50 text-slate-800 hover:border-[#161f66]/30 hover:bg-white"
                    } ${isUnavailable ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentType"
                        checked={paymentType === method.id}
                        onChange={() => setPaymentType(method.id)}
                        disabled={isUnavailable}
                        className="mt-1 h-4 w-4"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-black tracking-tight sm:text-base">
                          {method.label}
                        </p>

                        <p
                          className={`mt-1.5 text-[11px] leading-5 sm:mt-2 sm:text-sm ${
                            paymentType === method.id
                              ? "text-slate-200"
                              : "text-slate-500"
                          }`}
                        >
                          {isUnavailable
                            ? "Unavailable because one or more cart items do not support COD."
                            : method.description}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <BadgeCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-950">
                    Server verified
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Coupon and payment totals are checked before order creation.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#161f66]/5 text-[#161f66]">
                  <Truck size={18} />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-950">
                    Delivery ready
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Shipping and address details are connected to your order.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <OrderSummaryPanel
            items={items}
            summary={summary}
            selectedAddressId={selectedAddressId}
            canProceedToPayment={canProceedToPayment}
            handleProceedPayment={handleProceedPayment}
            paying={paying}
            paymentType={paymentType}
            loadingSummary={loadingSummary}
            codUnavailable={
              paymentType === "cod" && summary?.codAvailable === false
            }
            className="xl:hidden"
          />
        </div>

        <OrderSummaryPanel
          items={items}
          summary={summary}
          selectedAddressId={selectedAddressId}
          canProceedToPayment={canProceedToPayment}
          handleProceedPayment={handleProceedPayment}
          paying={paying}
          paymentType={paymentType}
          loadingSummary={loadingSummary}
          codUnavailable={
            paymentType === "cod" && summary?.codAvailable === false
          }
          className="hidden xl:sticky xl:top-6 xl:block xl:self-start"
        />
      </div>
    </section>
  );
}
