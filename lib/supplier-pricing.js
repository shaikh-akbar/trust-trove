import "server-only";

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundCurrency(value) {
  return Math.round(normalizeNumber(value, 0) * 100) / 100;
}

export const DEFAULT_MARGIN_AMOUNT = 50;
export const DEFAULT_GST_PERCENT = 18;
export const DEFAULT_SHIPPING_TAX_PERCENT = 18;

const SHIPPING_SLABS = [
  { maxWeightGrams: 500, amount: 40 },
  { maxWeightGrams: 1000, amount: 70 },
  { maxWeightGrams: 2000, amount: 90 },
  { maxWeightGrams: 3000, amount: 100 },
  { maxWeightGrams: 4000, amount: 120 },
  { maxWeightGrams: 5000, amount: 140 },
  { maxWeightGrams: 10000, amount: 200 },
];

export function estimateShippingShare(weightGrams) {
  const normalizedWeight = Math.max(0, normalizeNumber(weightGrams, 0));
  const slab =
    SHIPPING_SLABS.find((entry) => normalizedWeight <= entry.maxWeightGrams) ||
    SHIPPING_SLABS[SHIPPING_SLABS.length - 1];

  return roundCurrency(slab?.amount || 0);
}

export function calculateSupplierDisplayPrice({
  costPrice,
  gstPercent = DEFAULT_GST_PERCENT,
  weightGrams = 0,
  marginAmount = DEFAULT_MARGIN_AMOUNT,
}) {
  const supplierCost = Math.max(0, normalizeNumber(costPrice, 0));
  const resolvedGstPercent = normalizeNumber(gstPercent, DEFAULT_GST_PERCENT) || DEFAULT_GST_PERCENT;
  const shippingShare = estimateShippingShare(weightGrams);
  const gstAmount = roundCurrency(supplierCost * (resolvedGstPercent / 100));
  const shippingTaxAmount = roundCurrency(shippingShare * (DEFAULT_SHIPPING_TAX_PERCENT / 100));
  const resolvedMarginAmount = roundCurrency(marginAmount);
  const displayPriceFinal = Math.ceil(
    roundCurrency(supplierCost + gstAmount + shippingShare + shippingTaxAmount + resolvedMarginAmount)
  );

  return {
    costPrice: supplierCost,
    gstPercent: resolvedGstPercent,
    gstAmount,
    estimatedShippingShare: shippingShare,
    shippingTaxAmount,
    marginAmount: resolvedMarginAmount,
    displayPriceFinal,
  };
}

export function resolveEffectiveSellingPrice({
  priceSelling,
  costPrice: _costPrice,
  gstPercent = DEFAULT_GST_PERCENT,
  weightGrams = 0,
  marginAmount = DEFAULT_MARGIN_AMOUNT,
}) {
  void _costPrice;
  const currentSellingPrice = Math.max(0, normalizeNumber(priceSelling, 0));
  const normalizedGstPercent = normalizeNumber(gstPercent, DEFAULT_GST_PERCENT) || DEFAULT_GST_PERCENT;
  const shippingShare = estimateShippingShare(weightGrams);
  const itemTaxAmount = roundCurrency(currentSellingPrice * (normalizedGstPercent / 100));
  const shippingTaxAmount = roundCurrency(shippingShare * (DEFAULT_SHIPPING_TAX_PERCENT / 100));
  const resolvedMarginAmount = roundCurrency(marginAmount);
  const effectiveSellingPrice = Math.ceil(
    roundCurrency(
      currentSellingPrice +
        itemTaxAmount +
        shippingShare +
        shippingTaxAmount +
        resolvedMarginAmount
    )
  );

  return Math.max(currentSellingPrice, effectiveSellingPrice);
}
