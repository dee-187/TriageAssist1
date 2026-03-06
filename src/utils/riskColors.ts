export const getRiskColor = (riskLevel: string) => {
  if (riskLevel === 'Critical Risk' || riskLevel === 'High Risk') {
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
  }
  if (riskLevel === 'Moderate Risk') {
    return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
  }
  if (riskLevel === 'Low Risk' || riskLevel === 'Minimal Risk') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
  }
  return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
};
