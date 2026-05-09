"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { LoaderCircle, MapPin, Navigation, ShieldCheck, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "trusttrove_location";
const LocationContext = createContext(null);

function normalizePostalCode(value) {
  const digitsOnly = String(value || "").replace(/\D/g, "");
  return digitsOnly.slice(0, 6);
}

function persistLocation(location) {
  if (typeof window === "undefined") {
    return;
  }

  if (!location) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

function subscribeToLocationStore(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event) {
    if (!event || event.key === STORAGE_KEY) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

function getLocationStorageSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

function getLocationStorageServerSnapshot() {
  return null;
}

async function verifyPincode(postalCode) {
  const response = await fetch("/api/location/pincode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postalCode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to verify pincode.");
  }

  return data;
}

function PincodeLocationModal({
  open,
  onClose,
  onSubmit,
  loading,
  errorMessage,
  formPostalCode,
  setFormPostalCode,
  location,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-[3px]">
      <div className="relative flex max-h-[86vh] w-full max-w-[52rem] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_36px_120px_-48px_rgba(15,23,42,0.75)] sm:rounded-[2rem]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#161f66_52%,#334155_100%)] px-5 pb-5 pt-5 text-white sm:px-7 sm:pb-6 sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close location modal"
          >
            <X size={16} />
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/75">
            <Sparkles size={13} />
            Delivery Check
          </div>

          <div className="mt-4 flex items-start gap-3 sm:gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-white/10 text-white shadow-inner sm:h-14 sm:w-14 sm:rounded-[1.25rem]">
              <Navigation size={22} />
            </span>

            <div>
              <h2 className="font-display text-[1.75rem] font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">
                Choose your location
              </h2>
              <p className="mt-1.5 max-w-md text-[13px] leading-6 text-white/72 sm:text-sm">
                Enter your pincode to check whether delivery and Cash on Delivery are available for your area.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 p-3.5 sm:rounded-[1.25rem] sm:p-4">
              <MapPin size={17} className="text-[#161f66]" />
              <p className="mt-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                Pincode
              </p>
              <p className="mt-1 text-[13px] font-black text-slate-950 sm:text-sm">
                6-digit check
              </p>
            </div>

            <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 p-3.5 sm:rounded-[1.25rem] sm:p-4">
              <TruckIcon />
              <p className="mt-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                Delivery
              </p>
              <p className="mt-1 text-[13px] font-black text-slate-950 sm:text-sm">
                Prepaid coverage
              </p>
            </div>

            <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 p-3.5 sm:rounded-[1.25rem] sm:p-4">
              <ShieldCheck size={17} className="text-[#161f66]" />
              <p className="mt-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                COD
              </p>
              <p className="mt-1 text-[13px] font-black text-slate-950 sm:text-sm">
                Separate eligibility
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-4">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-800">
                Delivery pincode
              </span>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={formPostalCode}
                  onChange={(event) => setFormPostalCode(normalizePostalCode(event.target.value))}
                  placeholder="Enter 6-digit pincode"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-[15px] font-semibold tracking-[0.08em] text-slate-950 outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#161f66] focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,31,102,0.08)] sm:py-3.5 sm:text-base"
                />

                <button
                  type="submit"
                  disabled={loading || formPostalCode.length !== 6}
                  className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-full bg-[#161f66] px-6 py-3 text-[13px] font-black uppercase tracking-[0.14em] text-white shadow-[0_22px_60px_-32px_rgba(22,31,102,0.8)] transition hover:-translate-y-0.5 hover:bg-[#10184f] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:min-w-[170px] sm:py-3.5 sm:text-sm sm:tracking-[0.16em]"
                >
                  {loading ? <LoaderCircle size={16} className="animate-spin" /> : <MapPin size={16} />}
                  {loading ? "Checking..." : "Check Now"}
                </button>
              </div>
            </label>
          </form>

          {errorMessage ? (
            <div className="mt-4 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {location?.postalCode ? (
            <div className="mt-4 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.5rem]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                Latest Result
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-700">
                  {location.postalCode}
                </span>
                <StatusBadge
                  active={location.deliveryAvailable}
                  activeLabel="Delivery Available"
                  inactiveLabel="Not Deliverable"
                />
                <StatusBadge
                  active={location.codAvailable}
                  activeLabel="COD Available"
                  inactiveLabel="COD Unavailable"
                />
              </div>

              <p className="mt-3 text-[13px] leading-6 text-slate-600 sm:text-sm">
                {location.message || "Great news. Your location is serviceable for checkout."}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TruckIcon() {
  return (
    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#161f66] text-[10px] font-black text-white">
      D
    </span>
  );
}

function StatusBadge({ active, activeLabel, inactiveLabel }) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function LocationProvider({ children }) {
  const storedLocationRaw = useSyncExternalStore(
    subscribeToLocationStore,
    getLocationStorageSnapshot,
    getLocationStorageServerSnapshot
  );
  const storedLocation = useMemo(() => {
    if (!storedLocationRaw) {
      return null;
    }

    try {
      return JSON.parse(storedLocationRaw);
    } catch {
      return null;
    }
  }, [storedLocationRaw]);
  const [locationOverride, setLocationOverride] = useState(null);
  const location = locationOverride || storedLocation;
  const [formPostalCode, setFormPostalCode] = useState("");
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const hasLocation = Boolean(location?.postalCode);
  const modalOpen = manualModalOpen || (!hasLocation && !modalDismissed);

  const closeModal = useCallback(() => {
    setManualModalOpen(false);
    setModalDismissed(true);
    setErrorMessage("");
  }, []);

  const openModal = useCallback(() => {
    setManualModalOpen(true);
    setModalDismissed(false);
    setErrorMessage("");
    setFormPostalCode((current) => current || location?.postalCode || "");
  }, [location?.postalCode]);

  const savePincode = useCallback(async (postalCode) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const nextLocation = await verifyPincode(postalCode);
      setLocationOverride(nextLocation);
      setFormPostalCode(nextLocation.postalCode);
      persistLocation(nextLocation);
      setManualModalOpen(false);
      setModalDismissed(false);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await savePincode(formPostalCode);
  }

  const value = useMemo(
    () => ({
      location,
      hasLocation,
      modalOpen,
      loading,
      errorMessage,
      openModal,
      closeModal,
      setLocationFromPostalCode: savePincode,
    }),
    [closeModal, errorMessage, hasLocation, loading, location, modalOpen, openModal, savePincode]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
      <PincodeLocationModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={loading}
        errorMessage={errorMessage}
        formPostalCode={formPostalCode}
        setFormPostalCode={setFormPostalCode}
        location={location}
      />
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used within LocationProvider.");
  }

  return context;
}
