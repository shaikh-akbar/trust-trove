"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, LoaderCircle, Mail, MapPin, Phone, Plus, Trash2, User, X } from "lucide-react";

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
  isDefault: false,
};

function MiniStatCard({ label, value }) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--line)] bg-[linear-gradient(135deg,#ffffff_0%,#f6f9ff_100%)] p-5 shadow-[0_18px_40px_-38px_rgba(22,31,102,0.4)]">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon: Icon, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 transition focus-within:border-[#161f66] focus-within:bg-white">
        <Icon size={18} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-5 py-8 text-center">
      <p className="text-lg font-black tracking-tight text-slate-950">No delivery address saved</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Add a home or work address so checkout is faster the next time you shop.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952]"
      >
        <Plus size={16} />
        Add new address
      </button>
    </div>
  );
}

function AddressModal({
  open,
  mode,
  form,
  saving,
  errorMessage,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-full w-full items-start justify-center sm:items-center">
        <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-[1.6rem] border border-white/20 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] sm:rounded-[2rem] md:max-h-[90vh]">
        <div className="shrink-0 bg-[linear-gradient(135deg,#161f66_0%,#27318e_55%,#dcb86a_150%)] px-5 py-4 text-white sm:px-7 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">Account Center</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                {mode === "edit" ? "Edit address" : "Add new address"}
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Save delivery details right inside the dashboard.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/12 p-2 text-white transition hover:bg-white/20"
              aria-label="Close address editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" value={form.fullName} onChange={(e) => onChange("fullName", e.target.value)} placeholder="Akbar Ahmed" icon={User} />
            <Field label="Phone Number" type="tel" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="+91 98765 43210" icon={Phone} />
            <div className="sm:col-span-2">
              <Field label="Email Address" type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="you@example.com" icon={Mail} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Address Line 1" value={form.addressLine1} onChange={(e) => onChange("addressLine1", e.target.value)} placeholder="House no, street, area" icon={MapPin} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Address Line 2" value={form.addressLine2} onChange={(e) => onChange("addressLine2", e.target.value)} placeholder="Apartment, building, floor" icon={MapPin} />
            </div>
            <Field label="Landmark" value={form.landmark} onChange={(e) => onChange("landmark", e.target.value)} placeholder="Near metro station" icon={MapPin} />
            <Field label="City" value={form.city} onChange={(e) => onChange("city", e.target.value)} placeholder="Mumbai" icon={MapPin} />
            <Field label="State" value={form.state} onChange={(e) => onChange("state", e.target.value)} placeholder="Maharashtra" icon={MapPin} />
            <Field label="Postal Code" value={form.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} placeholder="400001" icon={MapPin} />
            <Field label="Country" value={form.country} onChange={(e) => onChange("country", e.target.value)} placeholder="India" icon={MapPin} />
            <Field label="Address Type" value={form.addressType} onChange={(e) => onChange("addressType", e.target.value)} placeholder="home" icon={MapPin} />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => onChange("isDefault", e.target.checked)}
              className="h-4 w-4 accent-[#161f66]"
            />
            Save this as default address
          </label>

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <LoaderCircle size={16} className="mr-2 animate-spin" /> : null}
              {mode === "edit" ? "Save changes" : "Add address"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

function AddressCard({ address, onEdit, onDelete, deletingId }) {
  const lines = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    `${address.city}, ${address.state} - ${address.postalCode}`,
    address.country,
  ].filter(Boolean);

  const isDeleting = deletingId === address.id;

  return (
    <div className="rounded-[1.7rem] border border-[var(--line)] bg-white p-5 shadow-[0_20px_50px_-42px_rgba(22,31,102,0.42)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {address.isDefault ? (
              <span className="rounded-full bg-[#161f66] px-3 py-1 text-xs font-bold text-white">Default</span>
            ) : null}
            <p className="text-lg font-black tracking-tight text-slate-950">{address.fullName}</p>
          </div>
          <p className="mt-1 text-sm capitalize text-slate-500">{address.addressType || "home"}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--line-soft)] pt-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <Phone size={15} className="text-[#161f66]" />
          {address.phone}
        </span>
        {address.email ? (
          <span className="inline-flex items-center gap-2">
            <Mail size={15} className="text-[#161f66]" />
            {address.email}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onEdit(address)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-[#161f66] hover:border-[#161f66] hover:bg-slate-50"
        >
          <Edit3 size={16} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(address)}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isDeleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Delete
        </button>
      </div>
    </div>
  );
}

export default function AccountAddressesClient({ initialAddresses, profile }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    ...EMPTY_ADDRESS,
    fullName: profile.fullName || "",
    email: profile.email || "",
  });

  const defaultCount = addresses.filter((address) => address.isDefault).length;
  const otherCount = Math.max(0, addresses.length - defaultCount);

  function refreshRoute() {
    startTransition(() => {
      router.refresh();
    });
  }

  function openAddModal() {
    setModalMode("add");
    setEditingId("");
    setErrorMessage("");
    setForm({
      ...EMPTY_ADDRESS,
      fullName: profile.fullName || "",
      email: profile.email || "",
    });
    setModalOpen(true);
  }

  function openEditModal(address) {
    setModalMode("edit");
    setEditingId(address.id);
    setErrorMessage("");
    setForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      email: address.email || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      addressType: address.addressType || "home",
      isDefault: Boolean(address.isDefault),
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setErrorMessage("");
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        modalMode === "edit" ? `/api/user-addresses/${editingId}` : "/api/user-addresses",
        {
          method: modalMode === "edit" ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save address.");
      }

      const savedAddress = data.address;
      const nextAddresses =
        modalMode === "edit"
          ? addresses.map((address) => (address.id === savedAddress.id ? savedAddress : address))
          : [savedAddress, ...addresses.filter((address) => address.id !== savedAddress.id)];

      setAddresses(
        nextAddresses.sort((left, right) => {
          if (left.isDefault === right.isDefault) {
            return 0;
          }

          return left.isDefault ? -1 : 1;
        })
      );
      setModalOpen(false);
      refreshRoute();
    } catch (error) {
      setErrorMessage(error.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(address) {
    const confirmed = window.confirm(`Delete the address for ${address.fullName}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(address.id);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/user-addresses/${address.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete address.");
      }

      setAddresses((current) => current.filter((item) => item.id !== address.id));
      refreshRoute();
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete address.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952]"
        >
          <Plus size={16} />
          Add New
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MiniStatCard label="Total" value={addresses.length} />
        <MiniStatCard label="Default" value={defaultCount} />
        <MiniStatCard label="Others" value={otherCount} />
      </div>

      {errorMessage && !modalOpen ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {addresses.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEditModal}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAdd={openAddModal} />
      )}

      <AddressModal
        open={modalOpen}
        mode={modalMode}
        form={form}
        saving={saving}
        errorMessage={errorMessage}
        onClose={closeModal}
        onChange={updateField}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
