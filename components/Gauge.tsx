
import React from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  type: 'cmv' | 'progress';
  threshold?: number;
}

const Gauge: React.FC<GaugeProps> = ({ value, max, label, unit, type, threshold }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Speedometer segments colors
  const colors = {
    green: '#22c55e',
    lightGreen: '#a3e635',
    yellow: '#eab308',
    orange: '#f97316',
    red: '#ef4444'
  };

  // Determine segment colors based on type
  const segments = type === 'cmv' 
    ? [colors.green, colors.lightGreen, colors.yellow, colors.orange, colors.red]
    : [colors.red, colors.orange, colors.yellow, colors.lightGreen, colors.green];

  // Needle rotation: -90deg is 0%, 90deg is 100%
  const needleRotation = (percentage * 1.8) - 90;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 w-full relative overflow-hidden">
      <h3 className="text-slate-400 font-bold mb-6 text-xs uppercase tracking-widest">{label}</h3>
      
      <div className="relative w-64 h-32 mb-4">
        {/* SVG Speedometer Background */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Segments */}
          {segments.map((color, i) => {
            const startAngle = -180 + (i * 36);
            const endAngle = startAngle + 34; // 2 degree gap
            
            const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
              const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
              return {
                x: centerX + radius * Math.cos(angleInRadians),
                y: centerY + radius * Math.sin(angleInRadians)
              };
            };

            const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
              const start = polarToCartesian(x, y, radius, endAngle);
              const end = polarToCartesian(x, y, radius, startAngle);
              const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
              return [
                "M", start.x, start.y, 
                "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
              ].join(" ");
            };

            return (
              <path
                key={i}
                d={describeArc(100, 95, 85, startAngle, endAngle)}
                fill="none"
                stroke={color}
                strokeWidth="18"
                strokeLinecap="butt"
              />
            );
          })}

          {/* Needle Base Circle */}
          <circle cx="100" cy="95" r="6" fill="#1e293b" />
          
          {/* Needle */}
          <g transform={`rotate(${needleRotation}, 100, 95)`}>
            <path
              d="M 97 95 L 100 20 L 103 95 Z"
              fill="#1e293b"
            />
          </g>
        </svg>

        {/* Value Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
           <span className="text-4xl font-black text-slate-800 tracking-tighter">
             {value.toLocaleString('pt-BR', { maximumFractionDigits: type === 'cmv' ? 1 : 0 })}
             <span className="text-xl ml-0.5 text-slate-400">{unit}</span>
           </span>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-1">
        {type === 'progress' && (
          <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
            {percentage.toFixed(1)}% atingido
          </div>
        )}
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          {type === 'cmv' ? `Referência: ${threshold}%` : `Objetivo: R$ ${max.toLocaleString('pt-BR')}`}
        </div>
      </div>
    </div>
  );
};

export default Gauge;
