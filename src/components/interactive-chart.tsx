import React, { useState, useEffect } from "react";

interface HistoricalDataPoint {
  time: string;
  value: number;
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

interface InteractiveChartProps {
  symbol: string;
  currency: string;
  network: "solana" | "gorbagana";
  initialDays?: number;
  title?: string;
}

export function InteractiveChart({ symbol, currency, network, initialDays = 7, title }: InteractiveChartProps) {
  const [timeRange, setTimeRange] = useState(initialDays);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time range options
  const timeRanges: TimeRange[] = [
    { label: "24H", value: "24h", days: 1 },
    { label: "7D", value: "7d", days: 7 },
    { label: "30D", value: "30d", days: 30 },
    { label: "90D", value: "90d", days: 90 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { cryptoDataService } = await import("~/lib/crypto-data-service");
        const data = await cryptoDataService.getHistoricalData(symbol, currency, timeRange, 'daily', network);
        setHistoricalData(data);
      } catch (err) {
        console.error("Error fetching historical data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, currency, network, timeRange]);

  // Find min and max values for scaling
  const values = historicalData.map(d => d.value);
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const range = maxValue - minValue || 1; // Avoid division by zero

  // Calculate chart dimensions
  const chartHeight = 100;
  const chartWidth = 100;
  const pointSpacing = historicalData.length > 1 ? chartWidth / (historicalData.length - 1) : 0;

  // Create SVG path for the line
  let pathData = "";
  historicalData.forEach((point, index) => {
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
  const hasData = historicalData.length > 0;
  const isTrendingUp = hasData && historicalData.length > 1 && 
    historicalData[0].value <= historicalData[historicalData.length - 1].value;
  const trendColor = isTrendingUp ? "plasmo-text-green-500" : "plasmo-text-destructive";

  if (loading) {
    return (
      <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
        <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-mb-3">
          <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">
            {title || `${symbol} Price Chart`}
          </h3>
        </div>
        <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-32">
          <div className="plasmo-text-muted-foreground plasmo-text-sm">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
        <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-mb-3">
          <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">
            {title || `${symbol} Price Chart`}
          </h3>
        </div>
        <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-32">
          <div className="plasmo-text-destructive plasmo-text-sm">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
        <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-mb-3">
          <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">
            {title || `${symbol} Price Chart`}
          </h3>
        </div>
        <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-32">
          <div className="plasmo-text-muted-foreground plasmo-text-sm">No chart data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
      <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-mb-3">
        <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">
          {title || `${symbol} Price Chart`}
        </h3>
        <div className="plasmo-flex plasmo-gap-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              className={`plasmo-px-2 plasmo-py-1 plasmo-text-xs plasmo-rounded-md plasmo-transition-colors ${
                timeRange === range.days
                  ? "plasmo-bg-primary plasmo-text-primary-foreground"
                  : "plasmo-bg-muted plasmo-text-muted-foreground hover:plasmo-bg-muted/80"
              }`}
              onClick={() => setTimeRange(range.days)}
            >
              {range.label}
            </button>
          ))}
        </div>
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
          />
          
          {/* Data points */}
          {historicalData.map((point, index) => {
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
              />
            );
          })}
        </svg>
        
        {/* Value labels */}
        <div className="plasmo-flex plasmo-justify-between plasmo-text-xs plasmo-text-muted-foreground plasmo-mt-2">
          <span>${minValue.toFixed(4)}</span>
          <span>${maxValue.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}