export const cardEffects =
  'transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200';

export const boxEffects = 'transition-all duration-200 hover:-translate-y-px';

export const inputClass =
  'flex h-10 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-ink transition-all duration-200 placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

export const selectClass = inputClass;

export const btnPrimaryClass =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-900 px-4 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-brand-700 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-brand-900 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

export const btnSecondaryClass =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-brand-900 transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60';

export const btnDangerClass =
  'inline-flex h-9 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-[0.98]';

export const cardClass = `rounded-xl border border-slate-200 bg-white shadow-sm ${cardEffects}`;

export const statCardClass = `group ${cardClass} p-5`;

export const modalClass = `rounded-xl border border-slate-200 bg-white p-6 shadow-lg ${cardEffects}`;

export const metricBoxClass = `rounded-lg bg-slate-50 px-4 py-3 ${boxEffects}`;

export const tableClass = 'data-table w-full text-left text-sm';

export const loadingClass =
  'flex items-center justify-center py-16 text-slate-500';

export const tableHeadClass =
  'border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500';

export const tabButtonActiveClass =
  'rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200';

export const tabButtonInactiveClass =
  'rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition-all duration-200 hover:-translate-y-px hover:bg-slate-50';
