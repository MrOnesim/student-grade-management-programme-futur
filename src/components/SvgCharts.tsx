import { useState } from 'react';

interface DonutData {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({ data, total }: { data: DonutData[]; total?: number }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const sum = total || data.reduce((acc, d) => acc + d.value, 0);
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.91

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-2">
      <div className="relative w-40 h-40 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f3f4f6" strokeWidth="10" />
          {data.map((item, idx) => {
            if (sum === 0) return null;
            const percent = item.value / sum;
            const strokeLength = percent * circumference;
            const strokeOffset = -(accumulatedPercent * circumference);
            accumulatedPercent += percent;

            const isActive = activeIndex === idx;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isActive ? 13 : 10}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer origin-center hover:scale-[1.02]"
                style={{ transition: 'stroke-width 0.2s, stroke 0.2s' }}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          {activeIndex !== null ? (
            <>
              <span className="text-[10px] text-gray-500 font-semibold truncate max-w-[80px] text-center">
                {data[activeIndex].name}
              </span>
              <span className="text-lg font-bold text-gray-900 leading-none my-1">
                {data[activeIndex].value}
              </span>
              <span className="text-[10px] text-indigo-600 font-bold">
                {((data[activeIndex].value / sum) * 100).toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-gray-400 font-medium">Total</span>
              <span className="text-2xl font-extrabold text-gray-900 leading-none my-0.5">
                {sum}
              </span>
              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">
                Élèves
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-1.5 w-full">
        {data.map((item, idx) => {
          const percent = sum > 0 ? (item.value / sum) * 100 : 0;
          const isActive = activeIndex === idx;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between px-2 py-1 rounded-lg transition-all cursor-pointer ${
                isActive ? 'bg-indigo-50/70 translate-x-1 shadow-sm' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-xs font-bold text-gray-900">{item.value}</span>
                <span className="text-[10px] text-gray-400 w-10 font-mono">{percent.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface BarData {
  name: string;
  value: number;
  displayValue?: string;
  color?: string;
}

export function BarChart({ data, max = 20 }: { data: BarData[]; max?: number }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4 w-full">
      <div className="relative h-44 flex items-end justify-between gap-1 pt-6 px-1 border-b border-gray-200">
        {/* Y-axis grid lines */}
        {[0, 5, 10, 15, 20].map((val) => {
          const bottomPercent = (val / max) * 100;
          return (
            <div
              key={val}
              className="absolute left-0 right-0 border-t border-dashed border-gray-100 flex items-center pointer-events-none"
              style={{ bottom: `${bottomPercent}%` }}
            >
              <span className="text-[8px] text-gray-400 -mt-2.5 bg-white px-1 select-none font-mono">
                {val}
              </span>
            </div>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const heightPercent = Math.min(100, (item.value / max) * 100);
          const barColor = item.color || (item.value >= 10 ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-red-400 hover:bg-red-500');
          const isHovered = hoverIndex === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center group relative cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Tooltip */}
              <div
                className={`absolute -top-7 z-10 px-2 py-0.5 bg-gray-900 text-white text-[9px] rounded font-semibold shadow-md pointer-events-none transition-all duration-200 ${
                  isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
                }`}
              >
                {item.displayValue || `${item.value.toFixed(2)}/20`}
              </div>

              {/* Bar container */}
              <div className="w-full max-w-[24px] bg-gray-50/50 rounded-t-sm h-full flex items-end">
                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ${barColor} ${
                    isHovered ? 'shadow-md scale-x-[1.05]' : ''
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    animation: `growUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`
                  }}
                />
              </div>

              {/* Label */}
              <span className="text-[9px] text-gray-500 font-semibold truncate max-w-[45px] mt-2 block text-center select-none" title={item.name}>
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes growUp {
          from { transform: scaleY(0); transform-origin: bottom; }
          to { transform: scaleY(1); transform-origin: bottom; }
        }
      `}</style>
    </div>
  );
}
