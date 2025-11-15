import React, { useState } from "react";

interface HistoricalDataPoint {
  time: string;
  value: number;
}

interface SimpleChartProps {
  data: HistoricalDataPoint[];
  title?: string;
  color?: string;
  timeRange?: string; // e.g., "24h", "7d", "30d", etc.
}

export function SimpleChart({ data, title, color = "plasmo-text-primary", timeRange }: SimpleChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{index: number, x: number, y: number} | null>(null);
  
  if (!data || data.length === 0) {
    return (
      <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
        <div className="plasmo-text-center plasmo-py-4">
          <p className="plasmo-text-muted-foreground">No chart data available</p>
        </div>
      </div>
    );
  }

  // Find min and max values for scaling
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1; // Avoid division by zero

  // Calculate chart dimensions
  const chartHeight = 100;
  const chartWidth = 100;
  const pointSpacing = chartWidth / (data.length - 1);
  
  // Create SVG path for the line
  let pathData = "";
  data.forEach((point, index) => {
    const x = (index * pointSpacing).toFixed(2);
    // Calculate y position (inverted because SVG y=0 is at the top)
    const normalizedValue = (point.value - minValue) / range;
    const y = (chartHeight - (normalizedValue * chartHeight)).toFixed(2);
    
    if (index === 0) {
      pathData += `M ${x} ${y} `;
    } else {
      pathData += `L ${x} ${y} `;
    }
  });

  // Determine if the trend is up or down for coloring
  const trendColor = data.length > 1 && data[0].value <= data[data.length - 1].value 
    ? "plasmo-text-green-500" 
    : "plasmo-text-destructive";

  return (
    <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
      <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-mb-3">
        <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">
          {title || "Price Chart"}
        </h3>
        {timeRange && (
          <span className="plasmo-text-xs plasmo-text-muted-foreground">{timeRange}</span>
        )}
      </div>
      
      <div className="plasmo-relative plasmo-h-32">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          preserveAspectRatio="none"
          className="plasmo-w-full plasmo-h-full"
        >
          {/* Grid lines */}
          <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
          <line x1="0" y1="25" x2={chartWidth} y2="25" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
          <line x1="0" y1="50" x2={chartWidth} y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
          <line x1="0" y1="75" x2={chartWidth} y2="75" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
          
          {/* Chart line */}
          <path 
            d={pathData} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            className={trendColor}
            onMouseLeave={() => setHoveredPoint(null)}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index * pointSpacing);
            const normalizedValue = (point.value - minValue) / range;
            const y = (chartHeight - (normalizedValue * chartHeight));
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill="currentColor"
                className={trendColor}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredPoint({ index, x: rect.left, y: rect.top });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
          
          {/* Hover effect line across the chart */}
          {hoveredPoint && (
            <line 
              x1={hoveredPoint.index * pointSpacing} 
              y1="0" 
              x2={hoveredPoint.index * pointSpacing} 
              y2={chartHeight} 
              stroke="currentColor" 
              strokeOpacity="0.5" 
              strokeWidth="0.5" 
              strokeDasharray="2,2"
              className="plasmo-text-muted-foreground"
            />
          )}
        </svg>
        
        {/* Hover tooltip */}
        {hoveredPoint && (
          <div 
            className="plasmo-absolute plasmo-bg-popover plasmo-text-popover-foreground plasmo-px-2 plasmo-py-1 plasmo-text-xs plasmo-rounded-md plasmo-shadow-lg plasmo-z-10 plasmo-pointer-events-none"
            style={{ 
              left: `${hoveredPoint.x}px`, 
              top: `${hoveredPoint.y - 40}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="plasmo-whitespace-nowrap">
              <div>{data[hoveredPoint.index].time}</div>
              <div className={`plasmo-font-medium ${trendColor}`}>
                ${data[hoveredPoint.index].value.toFixed(6)}
              </div>
            </div>
          </div>
        )}
        
        {/* Value labels */}
        <div className="plasmo-flex plasmo-justify-between plasmo-text-xs plasmo-text-muted-foreground plasmo-mt-2">
          <span>${minValue.toFixed(4)}</span>
          <span>${maxValue.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}