import { useEffect, useState } from "react";
import { useWallet } from "~/lib/wallet-context";

interface TokenDetailsProps {
  tokenSymbol: string;
  tokenAmount: number;
  tokenDecimals: number;
  preferredCurrency: string;
}

export function TokenDetails({ tokenSymbol, tokenAmount, tokenDecimals, preferredCurrency }: TokenDetailsProps) {
  const { network } = useWallet();
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { getTokenDetails } = await import("~/lib/currency");
        const details = await getTokenDetails(tokenSymbol, preferredCurrency);
        
        if (details) {
          setTokenDetails(details);
        } else {
          setError("Failed to fetch token details");
        }
      } catch (err) {
        console.error("Error fetching token details:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch token details");
      } finally {
        setLoading(false);
      }
    };

    if (tokenSymbol) {
      fetchTokenDetails();
    }
  }, [tokenSymbol, preferredCurrency]);

  if (loading) {
    return (
      <div className="plasmo-space-y-4">
        <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
          <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-mb-3">
            <div className="plasmo-h-4 plasmo-w-24 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
          </div>
          <div className="plasmo-space-y-3">
            <div className="plasmo-flex plasmo-justify-between">
              <div className="plasmo-h-3 plasmo-w-16 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
              <div className="plasmo-h-3 plasmo-w-20 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
            </div>
            <div className="plasmo-flex plasmo-justify-between">
              <div className="plasmo-h-3 plasmo-w-16 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
              <div className="plasmo-h-3 plasmo-w-24 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
            </div>
            <div className="plasmo-flex plasmo-justify-between">
              <div className="plasmo-h-3 plasmo-w-20 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
              <div className="plasmo-h-3 plasmo-w-16 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
            </div>
            <div className="plasmo-flex plasmo-justify-between">
              <div className="plasmo-h-3 plasmo-w-24 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
              <div className="plasmo-h-3 plasmo-w-20 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
            </div>
          </div>
        </div>

        <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
          <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-mb-3">
            <div className="plasmo-h-4 plasmo-w-24 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
          </div>
          <div className="plasmo-space-y-3">
            <div className="plasmo-flex plasmo-justify-between">
              <div className="plasmo-h-3 plasmo-w-16 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
              <div className="plasmo-h-3 plasmo-w-20 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
            </div>
            <div className="plasmo-flex plasmo-justify-between">
              <div className="plasmo-h-3 plasmo-w-20 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
              <div className="plasmo-h-3 plasmo-w-16 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
            </div>
            <div className="plasmo-flex plasmo-justify-between">
              <div className="plasmo-h-3 plasmo-w-24 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
              <div className="plasmo-h-3 plasmo-w-20 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
        <div className="plasmo-text-center plasmo-py-4">
          <p className="plasmo-text-destructive plasmo-text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!tokenDetails) {
    return (
      <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
        <div className="plasmo-text-center plasmo-py-4">
          <p className="plasmo-text-muted-foreground plasmo-text-sm">No details available</p>
        </div>
      </div>
    );
  }

  // Calculate token value from token amount and price
  const tokenValue = tokenDetails.price ? tokenDetails.price * (tokenAmount / Math.pow(10, tokenDecimals)) : 0;

  return (
    <div className="plasmo-space-y-4">
      {/* Token Info Section */}
      <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
        <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3">Token Info</h3>
        <div className="plasmo-space-y-3">
          <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
            <span className="plasmo-text-muted-foreground">Symbol</span>
            <span className="plasmo-text-foreground">{tokenSymbol}</span>
          </div>
          <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
            <span className="plasmo-text-muted-foreground">Name</span>
            <span className="plasmo-text-foreground">{tokenDetails.name || tokenSymbol}</span>
          </div>
          <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
            <span className="plasmo-text-muted-foreground">Network</span>
            <span className="plasmo-text-foreground">{network.charAt(0).toUpperCase() + network.slice(1)}</span>
          </div>
          <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
            <span className="plasmo-text-muted-foreground">Decimals</span>
            <span className="plasmo-text-foreground">{tokenDecimals}</span>
          </div>
        </div>
      </div>

      {/* Price Info Section */}
      <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
        <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3">Price Info</h3>
        <div className="plasmo-space-y-3">
          <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
            <span className="plasmo-text-muted-foreground">Current Price</span>
            <span className="plasmo-text-foreground">
              {tokenDetails.price 
                ? new Intl.NumberFormat(undefined, { 
                    style: 'currency', 
                    currency: preferredCurrency 
                  }).format(tokenDetails.price)
                : 'N/A'}
            </span>
          </div>
          <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
            <span className="plasmo-text-muted-foreground">24h Change</span>
            <span className={`plasmo-text-foreground ${
              tokenDetails.priceChange24h !== undefined && tokenDetails.priceChange24h >= 0 
                ? "plasmo-text-green-500" 
                : "plasmo-text-destructive"
            }`}>
              {tokenDetails.priceChange24h !== undefined 
                ? `${tokenDetails.priceChange24h > 0 ? '+' : ''}${tokenDetails.priceChange24h.toFixed(2)}%` 
                : 'N/A'}
            </span>
          </div>
          <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
            <span className="plasmo-text-muted-foreground">Market Cap</span>
            <span className="plasmo-text-foreground">
              {tokenDetails.marketCap 
                ? new Intl.NumberFormat(undefined, { 
                    style: 'currency', 
                    currency: preferredCurrency,
                    notation: tokenDetails.marketCap >= 1e9 ? 'compact' : 'standard'
                  }).format(tokenDetails.marketCap)
                : 'N/A'}
            </span>
          </div>
          <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
            <span className="plasmo-text-muted-foreground">Total Supply</span>
            <span className="plasmo-text-foreground">
              {tokenDetails.totalSupply 
                ? tokenDetails.totalSupply > 1e9 
                  ? `${(tokenDetails.totalSupply / 1e9).toFixed(2)}B` 
                  : tokenDetails.totalSupply.toLocaleString() 
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}