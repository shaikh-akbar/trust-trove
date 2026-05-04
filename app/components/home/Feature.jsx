import { Truck, ShieldCheck, Zap } from 'lucide-react';

export default function Features() {
  return (
    <section className="border-y border-slate-100 bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureItem icon={<Truck />} title="Free Shipping" desc="On all prepaid orders" />
          <FeatureItem icon={<ShieldCheck />} title="100% Secure" desc="Cash on Delivery available" border />
          <FeatureItem icon={<Zap />} title="Quick Dispatch" desc="Within 24-48 hours" />
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ icon, title, desc, border }) {
  return (
    <div className={`flex items-center justify-center space-x-4 ${border ? 'border-y md:border-y-0 md:border-x border-slate-100 py-8 md:py-0' : ''}`}>
      <div className="p-3 bg-slate-50 rounded-xl text-slate-900">{icon}</div>
      <div>
        <h4 className="font-bold text-sm uppercase tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}