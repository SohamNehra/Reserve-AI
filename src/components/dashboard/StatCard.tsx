import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;
  glowColor?: string;
};

export default function StatCard({ title, value, sub, icon: Icon, iconColor = "text-violet-400", glowColor = "rgba(124,58,237,0.3)" }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06]">
      {/* Gradient orb in corner */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl"
        style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between">
        <p className="text-xs font-medium text-white/35 uppercase tracking-wider">{title}</p>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>

      <div className="relative mt-4">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {sub && (
          <p className="mt-1 text-xs text-white/30">{sub}</p>
        )}
      </div>
    </div>
  );
}
