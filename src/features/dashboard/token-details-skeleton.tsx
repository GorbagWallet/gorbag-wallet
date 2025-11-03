import { TokenDetails } from "./token-details";

interface TokenDetailsSkeletonProps {
  tokenSymbol: string;
  tokenAmount: number;
  tokenDecimals: number;
  preferredCurrency: string;
}

export function TokenDetailsSkeleton({ tokenSymbol, tokenAmount, tokenDecimals, preferredCurrency }: TokenDetailsSkeletonProps) {
  return (
    <TokenDetails 
      tokenSymbol={tokenSymbol}
      tokenAmount={tokenAmount}
      tokenDecimals={tokenDecimals}
      preferredCurrency={preferredCurrency}
    />
  );
}