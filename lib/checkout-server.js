import "server-only";
import { getSupabaseAdmin } from "./supabase-admin";
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayCheckoutKeyId,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
} from "./razorpay";
import { getCartSnapshotForUser, getOrCreateActiveCart } from "./cart-server";
import { sendOrderUpdateEmail } from "./auth/mail";
import { reserveInventoryForItems, restoreInventoryForItems } from "./inventory-server";
import {
  calculateWukusyShipping,
  calculateWukusyWeightGrams,
  getWukusyPincodeAvailability,
} from "./wukusy-fulfillment";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundCurrency(value) {
  return Math.round(normalizeNumber(value, 0) * 100) / 100;
}

function formatAddress(address) {
  return {
    id: address.id,
    fullName: address.full_name,
    phone: address.phone,
    email: address.email || "",
    addressLine1: address.address_line_1,
    addressLine2: address.address_line_2 || "",
    landmark: address.landmark || "",
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
    addressType: address.address_type,
    isDefault: Boolean(address.is_default),
  };
}

async function getUserContact(userId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("first_name, last_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data || null;
}

function normalizeCoupon(code) {
  return normalizeText(code).toUpperCase();
}

function normalizePaymentType(value) {
  const normalizedValue = normalizeText(value).toLowerCase();

  if (!normalizedValue) {
    return "online";
  }

  if (normalizedValue === "online" || normalizedValue === "cod") {
    return normalizedValue;
  }

  throw new Error("Invalid payment type.");
}

function calculateDiscount(subtotal, coupon) {
  if (!coupon) {
    return 0;
  }

  const value = normalizeNumber(coupon.discount_value, 0);

  if (coupon.discount_type === "fixed") {
    return Math.min(subtotal, value);
  }

  const rawDiscount = subtotal * (value / 100);
  const cappedDiscount = coupon.max_discount_amount
    ? Math.min(rawDiscount, normalizeNumber(coupon.max_discount_amount, rawDiscount))
    : rawDiscount;

  return Math.min(subtotal, Math.round(cappedDiscount * 100) / 100);
}

function sumItemFee(items, key) {
  return roundCurrency(
    items.reduce((total, item) => total + normalizeNumber(item?.[key], 0) * normalizeNumber(item?.quantity, 1), 0)
  );
}

function getCodAvailability(items) {
  const unavailableCodItems = items
    .filter((item) => item?.is_cod_available === false)
    .map((item) => item?.title)
    .filter(Boolean);

  return {
    codAvailable: unavailableCodItems.length === 0,
    unavailableCodItems,
  };
}

function getDeliveryAvailability(postalCode, paymentType) {
  const availability = getWukusyPincodeAvailability(postalCode);

  if (!availability.hasPostalCode) {
    return {
      ...availability,
      codAvailable: true,
      deliveryAvailable: true,
      message: "",
      paymentTypeAllowed: true,
    };
  }

  const paymentTypeAllowed =
    paymentType === "cod" ? availability.codAvailable : availability.prepaidAvailable;

  return {
    ...availability,
    paymentTypeAllowed,
  };
}

function isActiveStatus(value) {
  return String(value || "active").trim().toLowerCase() === "active";
}

function validateCartItemsAvailability(items) {
  const normalizedItems = Array.isArray(items) ? items : [];

  for (const item of normalizedItems) {
    const productTitle = item?.title || "This product";
    const inventoryQuantity = Math.max(0, normalizeNumber(item?.inventory_quantity, 0));
    const requestedQuantity = Math.max(0, normalizeNumber(item?.quantity, 0));

    if (!isActiveStatus(item?.product_status)) {
      throw new Error(`"${productTitle}" is no longer available.`);
    }

    if (!isActiveStatus(item?.variant_status)) {
      throw new Error(`A selected option for "${productTitle}" is no longer available.`);
    }

    if (inventoryQuantity <= 0) {
      throw new Error(`"${productTitle}" is out of stock.`);
    }

    if (requestedQuantity > inventoryQuantity) {
      throw new Error(
        `Only ${inventoryQuantity} unit${inventoryQuantity === 1 ? "" : "s"} available for "${productTitle}".`
      );
    }
  }
}

function validateAddressInput(payload) {
  const data = {
    fullName: normalizeText(payload?.fullName),
    phone: normalizeText(payload?.phone),
    email: normalizeText(payload?.email),
    addressLine1: normalizeText(payload?.addressLine1),
    addressLine2: normalizeText(payload?.addressLine2),
    landmark: normalizeText(payload?.landmark),
    city: normalizeText(payload?.city),
    state: normalizeText(payload?.state),
    postalCode: normalizeText(payload?.postalCode),
    country: normalizeText(payload?.country) || "India",
    addressType: normalizeText(payload?.addressType) || "home",
    isDefault: Boolean(payload?.isDefault),
  };

  const requiredFields = [
    ["fullName", "Full name is required."],
    ["phone", "Phone number is required."],
    ["addressLine1", "Address line 1 is required."],
    ["city", "City is required."],
    ["state", "State is required."],
    ["postalCode", "Postal code is required."],
    ["country", "Country is required."],
  ];

  for (const [key, message] of requiredFields) {
    if (!data[key]) {
      throw new Error(message);
    }
  }

  return data;
}

function generateOrderNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TT-${datePart}-${randomPart}`;
}

function sendOrderEmailIfPossible({ email, firstName, orderNumber, totalAmount, paymentType, status, fulfillmentStatus, subjectLine }) {
  if (!email) {
    return;
  }

  sendOrderUpdateEmail({
    email,
    firstName,
    orderNumber,
    totalAmount,
    paymentType,
    status,
    fulfillmentStatus,
    subjectLine,
  }).catch((error) => {
    console.error("Failed to send order email:", error);
  });
}

function isPaidPaymentStatus(value) {
  const normalizedStatus = normalizeText(value).toLowerCase();
  return normalizedStatus === "captured" || normalizedStatus === "authorized";
}

async function getOrderItemsForInventoryRestore(orderId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("order_items")
    .select("variant_id, quantity, title")
    .eq("order_id", orderId);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((item) => ({
    variantId: item.variant_id,
    quantity: item.quantity,
    title: item.title,
  }));
}

async function restoreReservedInventoryForOrder(orderId) {
  const items = await getOrderItemsForInventoryRestore(orderId);

  if (!items.length) {
    return;
  }

  await restoreInventoryForItems(items);
}

async function reconcileOrderPaymentState(order, { razorpayPaymentId, razorpaySignature, paymentStatus, paidAt }) {
  const supabase = getSupabaseAdmin();
  const normalizedPaymentStatus = normalizeText(paymentStatus).toLowerCase() || "captured";
  const isPaid = isPaidPaymentStatus(normalizedPaymentStatus);
  const wasAlreadyPaid = isPaidPaymentStatus(order.payment_status);
  const wasAlreadyCancelled = normalizeText(order.status).toLowerCase() === "cancelled";
  const nextOrderStatus = isPaid ? "placed" : "cancelled";
  const nextFulfillmentStatus = isPaid ? order.fulfillment_status || "unfulfilled" : "cancelled";
  const shouldReleaseInventory = !isPaid && !wasAlreadyCancelled && !wasAlreadyPaid;

  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({
      status: nextOrderStatus,
      payment_status: normalizedPaymentStatus,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      razorpay_payment_status: normalizedPaymentStatus,
      fulfillment_status: nextFulfillmentStatus,
      paid_at: isPaid ? paidAt || new Date().toISOString() : null,
    })
    .eq("id", order.id);

  if (updateOrderError) {
    throw new Error(updateOrderError.message);
  }

  if (isPaid && !wasAlreadyPaid && order.coupon_id) {
    await incrementCouponUsage(order.coupon_id);
  }

  if (isPaid && order.cart_id) {
    const { error: convertCartError } = await supabase
      .from("carts")
      .update({
        status: "converted",
      })
      .eq("id", order.cart_id);

    if (convertCartError) {
      throw new Error(convertCartError.message);
    }
  }

  if (shouldReleaseInventory) {
    await restoreReservedInventoryForOrder(order.id);
  }

  if (isPaid && !wasAlreadyPaid) {
    const addressEmail = order.address_snapshot?.email || "";
    const addressName = order.address_snapshot?.fullName || "";

    sendOrderEmailIfPossible({
      email: addressEmail,
      firstName: addressName,
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
      paymentType: order.payment_type,
      status: nextOrderStatus,
      fulfillmentStatus: nextFulfillmentStatus,
      subjectLine: `TrustTrove payment confirmed: ${order.order_number}`,
    });
  }

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.order_number,
    paymentStatus: normalizedPaymentStatus,
  };
}

export async function getUserAddresses(userId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(formatAddress);
}

async function clearDefaultAddress(userId) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("user_addresses")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("is_default", true);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createUserAddress(userId, payload) {
  const supabase = getSupabaseAdmin();
  const data = validateAddressInput(payload);

  if (data.isDefault) {
    await clearDefaultAddress(userId);
  }

  const { data: created, error } = await supabase
    .from("user_addresses")
    .insert({
      user_id: userId,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email || null,
      address_line_1: data.addressLine1,
      address_line_2: data.addressLine2 || null,
      landmark: data.landmark || null,
      city: data.city,
      state: data.state,
      postal_code: data.postalCode,
      country: data.country,
      address_type: data.addressType,
      is_default: data.isDefault,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return formatAddress(created);
}

export async function updateUserAddress(userId, addressId, payload) {
  const supabase = getSupabaseAdmin();
  const data = validateAddressInput(payload);

  if (data.isDefault) {
    await clearDefaultAddress(userId);
  }

  const { data: updated, error } = await supabase
    .from("user_addresses")
    .update({
      full_name: data.fullName,
      phone: data.phone,
      email: data.email || null,
      address_line_1: data.addressLine1,
      address_line_2: data.addressLine2 || null,
      landmark: data.landmark || null,
      city: data.city,
      state: data.state,
      postal_code: data.postalCode,
      country: data.country,
      address_type: data.addressType,
      is_default: data.isDefault,
    })
    .eq("id", addressId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!updated) {
    throw new Error("Address not found.");
  }

  return formatAddress(updated);
}

export async function deleteUserAddress(userId, addressId) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

async function getAddressForUser(userId, addressId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Address not found.");
  }

  return data;
}

async function getCouponByCode(code) {
  const normalizedCode = normalizeCoupon(code);

  if (!normalizedCode) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function incrementCouponUsage(couponId) {
  const supabase = getSupabaseAdmin();
  const { data: coupon, error: couponError } = await supabase
    .from("coupons")
    .select("id, used_count")
    .eq("id", couponId)
    .maybeSingle();

  if (couponError) {
    throw new Error(couponError.message);
  }

  if (!coupon) {
    return;
  }

  const { error: updateError } = await supabase
    .from("coupons")
    .update({
      used_count: normalizeNumber(coupon.used_count, 0) + 1,
    })
    .eq("id", coupon.id);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

function validateCoupon(coupon, subtotal) {
  if (!coupon) {
    throw new Error("Coupon not found.");
  }

  if (!coupon.is_active) {
    throw new Error("This coupon is inactive.");
  }

  const now = Date.now();

  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    throw new Error("This coupon is not active yet.");
  }

  if (coupon.ends_at && new Date(coupon.ends_at).getTime() < now) {
    throw new Error("This coupon has expired.");
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    throw new Error("This coupon has reached its usage limit.");
  }

  const minimumOrder = normalizeNumber(coupon.min_order_amount, 0);

  if (subtotal < minimumOrder) {
    throw new Error(`Minimum order amount for this coupon is Rs. ${minimumOrder}.`);
  }

  return coupon;
}

export async function getCheckoutSummary(userId, couponCode = "", paymentType = "online", postalCode = "") {
  const cartSnapshot = await getCartSnapshotForUser(userId);
  const subtotal = cartSnapshot.subtotal;
  const normalizedPaymentType = normalizePaymentType(paymentType);

  if (!cartSnapshot.items.length) {
    throw new Error("Your cart is empty.");
  }

  validateCartItemsAvailability(cartSnapshot.items);

  const coupon = couponCode ? validateCoupon(await getCouponByCode(couponCode), subtotal) : null;
  const discountAmount = calculateDiscount(subtotal, coupon);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const { codAvailable: itemCodAvailable, unavailableCodItems } = getCodAvailability(cartSnapshot.items);
  const deliveryAvailability = getDeliveryAvailability(postalCode, normalizedPaymentType);
  const weightGrams = calculateWukusyWeightGrams(cartSnapshot.items);
  const wukusyShipping = calculateWukusyShipping(weightGrams);
  const baseShippingAmount = roundCurrency(wukusyShipping.amount);
  const vendorShippingAmount = sumItemFee(cartSnapshot.items, "shipping_charge");
  const shippingAmount = roundCurrency(baseShippingAmount + vendorShippingAmount);
  const codAvailable = itemCodAvailable && deliveryAvailability.codAvailable;
  const codChargeAmount =
    normalizedPaymentType === "cod" && codAvailable ? sumItemFee(cartSnapshot.items, "cod_charge") : 0;
  const platformFeeAmount = sumItemFee(cartSnapshot.items, "platform_fee");
  const convenienceFeeAmount = sumItemFee(cartSnapshot.items, "convenience_fee");
  const totalAmount = Math.max(
    0,
    roundCurrency(
      discountedSubtotal +
        shippingAmount +
        codChargeAmount +
        platformFeeAmount +
        convenienceFeeAmount
    )
  );

  return {
    cartId: cartSnapshot.cartId,
    items: cartSnapshot.items,
    totalItems: cartSnapshot.totalItems,
    paymentType: normalizedPaymentType,
    codAvailable,
    unavailableCodItems,
    deliveryAvailable: deliveryAvailability.deliveryAvailable,
    paymentTypeAllowed: deliveryAvailability.paymentTypeAllowed,
    postalCode: deliveryAvailability.postalCode,
    deliveryMessage: deliveryAvailability.message,
    shippingRuleLabel: wukusyShipping.label,
    shippingWeightGrams: wukusyShipping.weightGrams,
    shippingCappedAtHighestSlab: wukusyShipping.isCappedAtHighestSlab,
    subtotal,
    discountAmount,
    baseShippingAmount,
    vendorShippingAmount,
    shippingAmount,
    codChargeAmount,
    platformFeeAmount,
    convenienceFeeAmount,
    totalAmount,
    coupon: coupon
      ? {
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          discountType: coupon.discount_type,
          discountValue: normalizeNumber(coupon.discount_value, 0),
        }
      : null,
  };
}

export async function createCheckoutOrder(userId, { addressId, couponCode = "", paymentType }) {
  const supabase = getSupabaseAdmin();
  const address = await getAddressForUser(userId, addressId);
  const normalizedPaymentType = normalizePaymentType(paymentType);
  const summary = await getCheckoutSummary(
    userId,
    couponCode,
    normalizedPaymentType,
    address.postal_code
  );
  const cart = await getOrCreateActiveCart(userId);
  const orderNumber = generateOrderNumber();
  const isCodOrder = normalizedPaymentType === "cod";
  const userContact = !address.email ? await getUserContact(userId) : null;
  const customerEmail = address.email || userContact?.email || "";
  const orderAddressSnapshot = {
    ...formatAddress(address),
    email: customerEmail,
  };
  let order = null;
  let reservedItems = [];

  if (!summary.deliveryAvailable || !summary.paymentTypeAllowed) {
    throw new Error(summary.deliveryMessage || "Delivery is unavailable for the selected pincode.");
  }

  if (isCodOrder && !summary.codAvailable) {
    throw new Error("Cash on Delivery is not available for one or more items in your cart.");
  }

  try {
    reservedItems = await reserveInventoryForItems(summary.items);

    const { data: createdOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        cart_id: cart.id,
        address_id: address.id,
        coupon_id: summary.coupon?.id || null,
        coupon_code: summary.coupon?.code || null,
        status: isCodOrder ? "placed" : "payment_pending",
        payment_type: normalizedPaymentType,
        payment_status: "pending",
        fulfillment_status: "unfulfilled",
        subtotal: summary.subtotal,
        discount_amount: summary.discountAmount,
        base_shipping_amount: summary.baseShippingAmount,
        vendor_shipping_amount: summary.vendorShippingAmount,
        shipping_amount: summary.shippingAmount,
        cod_charge_amount: summary.codChargeAmount,
        platform_fee_amount: summary.platformFeeAmount,
        convenience_fee_amount: summary.convenienceFeeAmount,
        total_amount: summary.totalAmount,
        currency: "INR",
        items_count: summary.totalItems,
        address_snapshot: orderAddressSnapshot,
      })
      .select("*")
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    order = createdOrder;

    const orderItems = summary.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      title: item.title,
      sku: item.variantSku,
      option_label: item.optionLabel,
      image: item.image,
      quantity: item.quantity,
      unit_price: item.price_selling,
      compare_price: item.price_compare || null,
      line_total: item.price_selling * item.quantity,
      product_snapshot: item,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    if (isCodOrder) {
      if (order.coupon_id) {
        await incrementCouponUsage(order.coupon_id);
      }

      if (order.cart_id) {
        const { error: convertCartError } = await supabase
          .from("carts")
          .update({
            status: "converted",
          })
          .eq("id", order.cart_id);

        if (convertCartError) {
          throw new Error(convertCartError.message);
        }
      }

      sendOrderEmailIfPossible({
        email: customerEmail,
        firstName: address.full_name,
        orderNumber,
        totalAmount: summary.totalAmount,
        paymentType: normalizedPaymentType,
        status: "placed",
        fulfillmentStatus: "unfulfilled",
        subjectLine: `TrustTrove order confirmed: ${orderNumber}`,
      });

      return {
        internalOrderId: order.id,
        orderNumber,
        paymentType: normalizedPaymentType,
        summary,
      };
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(summary.totalAmount * 100),
      receipt: orderNumber,
      notes: {
        internal_order_id: order.id,
        order_number: orderNumber,
        user_id: userId,
      },
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        razorpay_order_id: razorpayOrder.id,
      })
      .eq("id", order.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return {
      internalOrderId: order.id,
      orderNumber,
      paymentType: normalizedPaymentType,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: getRazorpayCheckoutKeyId(),
      customer: {
        name: address.full_name,
        email: customerEmail,
        contact: address.phone,
      },
      summary,
    };
  } catch (error) {
    if (reservedItems.length) {
      try {
        await restoreInventoryForItems(reservedItems);
      } catch (restoreError) {
        console.error("Failed to restore reserved inventory:", restoreError);
      }
    }

    if (order?.id) {
      await supabase
        .from("orders")
        .update({
          status: "cancelled",
          payment_status: "failed",
          fulfillment_status: "cancelled",
        })
        .eq("id", order.id);
    }

    throw error;
  }
}

export async function verifyCheckoutPayment(userId, payload) {
  const supabase = getSupabaseAdmin();
  const internalOrderId = normalizeText(payload?.internalOrderId);
  const razorpayOrderId = normalizeText(payload?.razorpay_order_id);
  const razorpayPaymentId = normalizeText(payload?.razorpay_payment_id);
  const razorpaySignature = normalizeText(payload?.razorpay_signature);

  if (!internalOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new Error("Missing payment verification details.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", internalOrderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (!order) {
    throw new Error("Order not found.");
  }

  const isValidSignature = verifyRazorpaySignature({
    orderId: order.razorpay_order_id,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValidSignature) {
    throw new Error("Invalid Razorpay payment signature.");
  }

  const payment = await fetchRazorpayPayment(razorpayPaymentId);

  if (payment.order_id !== order.razorpay_order_id) {
    throw new Error("Payment does not belong to this order.");
  }

  return reconcileOrderPaymentState(order, {
    razorpayPaymentId,
    razorpaySignature,
    paymentStatus: payment.status || "captured",
    paidAt: payment.captured_at ? new Date(payment.captured_at * 1000).toISOString() : new Date().toISOString(),
  });
}

export async function handleRazorpayWebhook({ payload, signature }) {
  if (!verifyRazorpayWebhookSignature({ payload, signature })) {
    throw new Error("Invalid Razorpay webhook signature.");
  }

  const body = JSON.parse(payload);
  const eventName = normalizeText(body?.event);
  const payment = body?.payload?.payment?.entity;

  if (!payment?.id || !payment?.order_id) {
    return {
      success: true,
      ignored: true,
      reason: "No payment entity found in webhook payload.",
      event: eventName || "unknown",
    };
  }

  const supportedEvents = new Set(["payment.authorized", "payment.captured", "payment.failed"]);

  if (eventName && !supportedEvents.has(eventName)) {
    return {
      success: true,
      ignored: true,
      reason: `Unsupported event: ${eventName}`,
      event: eventName,
    };
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", payment.order_id)
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (!order) {
    throw new Error("Order not found for this Razorpay webhook.");
  }

  return reconcileOrderPaymentState(order, {
    razorpayPaymentId: payment.id,
    razorpaySignature: signature,
    paymentStatus: payment.status || (eventName === "payment.failed" ? "failed" : "captured"),
    paidAt: payment.captured_at ? new Date(payment.captured_at * 1000).toISOString() : null,
  });
}

export async function getOrdersForUser(userId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        title,
        image,
        quantity,
        line_total
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
