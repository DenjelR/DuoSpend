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

  // Handle any custom or unmapped categories
  const mappedIds = new Set(categories.map((c) => c.id));
  let unmappedTotal = 0;
  expenses.forEach((e) => {
    if (!mappedIds.has(e.category_id)) {
      unmappedTotal += e.amount;
    }
  });

  if (unmappedTotal > 0) {
    categoryData.push({
      id: 'unmapped',
      name: 'Ostatné / Vlastné',
      iconName: 'Tag',
      color: '#64748b',
      subcategories: [],
      total: unmappedTotal,
      percentage: totalAmount > 0 ? (unmappedTotal / totalAmount) * 100 : 0,
    });
  }

  if (totalAmount === 0 || categoryData.length === 0) {
    return (
      <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
        Zatiaľ žiadne zaevidované výdavky pre tento projekt.
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
                strokeLinecap={categoryData.length === 1 ? 'butt' : 'round'}
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
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 truncate max-w-[110px]">
                    {selected?.name}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {selected?.total.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-sky-500 font-medium">
                    {selected?.percentage.toFixed(0)}% z projektu
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
