import "server-only";
import fs from "node:fs";
import path from "node:path";

const dataFilePath = path.join(process.cwd(), "data", "wukusy-pincodes.json");

const SHIPPING_SLABS = [
  { maxWeightGrams: 500, amount: 40, label: "0 to 0.5kg" },
  { maxWeightGrams: 1000, amount: 70, label: "0.5kg to 1kg" },
  { maxWeightGrams: 2000, amount: 90, label: "1kg to 2kg" },
  { maxWeightGrams: 3000, amount: 100, label: "2kg to 3kg" },
  { maxWeightGrams: 4000, amount: 120, label: "3kg to 4kg" },
  { maxWeightGrams: 5000, amount: 140, label: "4kg to 5kg" },
  { maxWeightGrams: 10000, amount: 200, label: "5kg to 10kg" },
];

let cachedPincodes = null;

function readPincodeData() {
  if (cachedPincodes) {
    return cachedPincodes;
  }

  if (!fs.existsSync(dataFilePath)) {
    cachedPincodes = {
      cod: new Set(),
      prepaid: new Set(),
    };
    return cachedPincodes;
  }

  const raw = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  cachedPincodes = {
    cod: new Set(Array.isArray(raw?.cod) ? raw.cod.map(String) : []),
    prepaid: new Set(Array.isArray(raw?.prepaid) ? raw.prepaid.map(String) : []),
  };

  return cachedPincodes;
}

export function normalizePostalCode(value) {
  const onlyDigits = String(value || "").replace(/\D/g, "");
  return onlyDigits.length === 6 ? onlyDigits : "";
}

export function calculateWukusyWeightGrams(items = []) {
  return items.reduce((total, item) => {
    const quantity = Math.max(1, Number(item?.quantity || 1));
    const weight = Math.max(0, Number(item?.weight_grams || 0));
    return total + quantity * weight;
  }, 0);
}

export function calculateWukusyShipping(weightGrams) {
  const normalizedWeight = Math.max(0, Number(weightGrams || 0));
  const matchedSlab =
    SHIPPING_SLABS.find((slab) => normalizedWeight <= slab.maxWeightGrams) ||
    SHIPPING_SLABS[SHIPPING_SLABS.length - 1];

  return {
    amount: matchedSlab.amount,
    label: matchedSlab.label,
    weightGrams: normalizedWeight,
    isCappedAtHighestSlab:
      normalizedWeight > SHIPPING_SLABS[SHIPPING_SLABS.length - 1].maxWeightGrams,
  };
}

export function getWukusyPincodeAvailability(postalCode) {
  const normalizedPostalCode = normalizePostalCode(postalCode);

  if (!normalizedPostalCode) {
    return {
      postalCode: "",
      hasPostalCode: false,
      prepaidAvailable: true,
      codAvailable: true,
      deliveryAvailable: true,
      message: "",
    };
  }

  const { cod, prepaid } = readPincodeData();
  const prepaidAvailable = prepaid.has(normalizedPostalCode);
  const codAvailable = cod.has(normalizedPostalCode);
  const deliveryAvailable = prepaidAvailable || codAvailable;

  let message = "";
  if (!deliveryAvailable) {
    message = `Delivery is currently unavailable for pincode ${normalizedPostalCode}.`;
  } else if (!codAvailable) {
    message = `Cash on Delivery is unavailable for pincode ${normalizedPostalCode}.`;
  }

  return {
    postalCode: normalizedPostalCode,
    hasPostalCode: true,
    prepaidAvailable,
    codAvailable,
    deliveryAvailable,
    message,
  };
}
