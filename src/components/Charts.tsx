import React, { useState } from 'react';
import { Category, Expense } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface CategoryDonutChartProps {
  expenses: Expense[];
  categories: Category[];
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ expenses, categories }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Group expenses by category
  const categoryTotals: { [catId: string]: number } = {};
  let totalAmount = 0;

  expenses.forEach((e) => {
    categoryTotals[e.category_id] = (categoryTotals[e.category_id] || 0) + e.amount;
    totalAmount += e.amount;
  });

  const categoryData = categories
    .map((cat) => ({
      ...cat,
      total: categoryTotals[cat.id] || 0,
      percentage: totalAmount > 0 ? ((categoryTotals[cat.id] || 0) / totalAmount) * 100 : 0,
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  if (totalAmount === 0 || categoryData.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
        Žiadne výdavky za tento mesiac
      </div>
    );
  }

  // Calculate SVG Pie/Donut slices
  let accumulatedAngle = 0;
  const radius = 70;
  const strokeWidth = 24;
  const center = 90;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90 transform">
          {categoryData.map((item) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (item.percentage / 100) * circumference;

            const isSelected = selectedCategoryId === item.id;

            return (
              <circle
                key={item.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                onClick={() =>
                  setSelectedCategoryId(selectedCategoryId === item.id ? null : item.id)
                }
              />
            );
          })}
        </svg>

        {/* Center Total / Selected info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {selectedCategoryId ? (
            (() => {
              const selected = categoryData.find((c) => c.id === selectedCategoryId);
              return (
                <>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 truncate max-w-[100px]">
                    {selected?.name}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {selected?.total.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-sky-500 font-medium">
                    {selected?.percentage.toFixed(0)}% z celku
                  </span>
                </>
              );
            })()
          ) : (
            <>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Spolu
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {totalAmount.toFixed(2)} €
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {expenses.length} {expenses.length === 1 ? 'výdavok' : 'výdavkov'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Legend List */}
      <div className="w-full mt-4 space-y-2">
        {categoryData.map((item) => {
          const isSelected = selectedCategoryId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedCategoryId(isSelected ? null : item.id)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left ${
                isSelected
                  ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-slate-700'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  <CategoryIcon name={item.iconName} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {item.percentage.toFixed(1)}% z rozpočtu
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums shrink-0 ml-2">
                {item.total.toFixed(2)} €
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface MonthlyTrendChartProps {
  expenses: Expense[];
  currentMonth: string;
  onSelectMonth: (month: string) => void;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  expenses,
  currentMonth,
  onSelectMonth,
}) => {
  // Generate last 6 months list
  const months: { label: string; key: string }[] = [];
  const [currY, currM] = currentMonth.split('-').map(Number);
  const now = new Date(currY, currM - 1, 1);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[d.getMonth()]}`;
    months.push({ label, key });
  }

  // Calculate totals per month
  const monthlyTotals: { [key: string]: number } = {};
  expenses.forEach((e) => {
    const mKey = e.date.substring(0, 7);
    monthlyTotals[mKey] = (monthlyTotals[mKey] || 0) + e.amount;
  });

  const maxTotal = Math.max(...months.map((m) => monthlyTotals[m.key] || 0), 100);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 h-32 pt-4 pb-1 px-1">
        {months.map((m) => {
          const val = monthlyTotals[m.key] || 0;
          const heightPercent = Math.max((val / maxTotal) * 100, 6);
          const isSelected = m.key === currentMonth;

          return (
            <button
              key={m.key}
              onClick={() => onSelectMonth(m.key)}
              className="flex-1 flex flex-col items-center gap-1 group transition-all"
            >
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                {val > 0 ? `${Math.round(val)}€` : ''}
              </span>

              <div className="w-full flex justify-center items-end h-20">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-t from-sky-600 to-rose-500 shadow-md shadow-sky-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                />
              </div>

              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isSelected
                    ? 'text-sky-600 dark:text-sky-400 font-bold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
