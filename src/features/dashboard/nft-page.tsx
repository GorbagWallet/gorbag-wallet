import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ChevronLeft, Search } from "lucide-react";
import { useI18n } from "~/i18n/context";
import { useWallet } from "~/lib/wallet-context";
import { getWalletTokens } from "~/lib/solana";

// Placeholder for token data structure
interface TokenData {
  id: string;
  mint: string;
  symbol: string;
  name: string;
  amount?: number;
  decimals?: number;
  tokenType?: string;
  image?: string;
  price?: number;
  change24h?: number;
}

// Placeholder for NFT data structure
interface NFTData {
  id: string;
  name: string;
  collection: string;
  image: string;
  attributes?: Array<{trait_type: string, value: string}>;
}

export default function NFTPage({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { network, activeWallet, preferredCurrency } = useWallet();
  const [activeTab, setActiveTab] = useState<"tokens" | "nfts">("nfts");
  const [searchQuery, setSearchQuery] = useState("");
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tokens and NFTs when the component mounts or network changes
  useEffect(() => {
    const fetchAssets = async () => {
      if (!activeWallet?.address) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get tokens based on network
        const heliusApiKey = process.env.PLASMO_PUBLIC_HELIUS_API_KEY || '';
        const walletTokens = await getWalletTokens(activeWallet.address, heliusApiKey, network);

        // Separate tokens and NFTs
        const fungibleTokens = walletTokens.filter(token => 
          token.tokenType !== 'nft' && (token.amount || 0) > 1
        );
        
        const nftTokens = walletTokens.filter(token => 
          token.tokenType === 'nft' || (token.amount === 1 && token.decimals === 0)
        ).map(token => ({
          id: token.mint, // Use mint as ID for NFT
          name: token.name || `NFT ${token.mint.substring(0, 8)}`,
          collection: token.symbol || 'Unknown Collection',
          image: token.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${token.mint}`,
          attributes: []
        }));

        setTokens(fungibleTokens);
        setNfts(nftTokens);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assets");
        console.error("Error fetching assets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [activeWallet?.address, network]);

  // Filter tokens based on search query
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.mint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="plasmo-min-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-flex plasmo-flex-col">
      {/* Header */}
      <header className="plasmo-sticky plasmo-top-0 plasmo-z-10 plasmo-bg-background plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border">
        <div className="plasmo-flex plasmo-items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="plasmo-rounded-xl plasmo-animate-pop">
            <ChevronLeft className="plasmo-h-5 plasmo-w-5" />
          </Button>
          <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-flex-1 plasmo-text-center">
            {activeTab === "tokens" ? t("wallet.tokens") : t("nft.title")}
          </h1>
          <div className="plasmo-w-10" />
        </div>

        {/* Tab Selector */}
        <div className="plasmo-flex plasmo-bg-card plasmo-rounded-xl plasmo-p-1 plasmo-mt-4">
          <button 
            className={`plasmo-flex-1 plasmo-py-2 plasmo-px-4 plasmo-rounded-lg plasmo-text-sm plasmo-font-medium ${
              activeTab === "tokens" 
                ? "plasmo-bg-primary plasmo-text-primary-foreground" 
                : "plasmo-text-foreground"
            }`}
            onClick={() => setActiveTab("tokens")}
          >
            {t("wallet.tokens")}
          </button>
          <button 
            className={`plasmo-flex-1 plasmo-py-2 plasmo-px-4 plasmo-rounded-lg plasmo-text-sm plasmo-font-medium ${
              activeTab === "nfts" 
                ? "plasmo-bg-primary plasmo-text-primary-foreground" 
                : "plasmo-text-foreground"
            }`}
            onClick={() => setActiveTab("nfts")}
          >
            {t("nft.title")}
          </button>
        </div>

        {/* Search Bar (only shown on Tokens tab) */}
        {activeTab === "tokens" && (
          <div className="plasmo-relative plasmo-mt-4">
            <Search className="plasmo-absolute plasmo-left-3 plasmo-top-1/2 plasmo-transform plasmo--translate-y-1/2 plasmo-h-4 plasmo-w-4 plasmo-text-muted-foreground" />
            <Input
              placeholder={t("wallet.searchTokens")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="plasmo-pl-10 plasmo-rounded-xl"
            />
          </div>
        )}
      </header>

      <div className="plasmo-flex-1 plasmo-overflow-y-auto plasmo-pt-4 plasmo-px-4 plasmo-pb-6">
        {loading ? (
          <div className="plasmo-flex plasmo-justify-center plasmo-items-center plasmo-h-64">
            <div className="plasmo-text-center">
              <div className="plasmo-h-4 plasmo-w-48 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded plasmo-mb-2"></div>
              <div className="plasmo-h-3 plasmo-w-32 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="plasmo-flex plasmo-justify-center plasmo-items-center plasmo-h-64">
            <div className="plasmo-text-center plasmo-p-4">
              <p className="plasmo-text-destructive plasmo-mb-2">{t("errors.networkError")}</p>
              <p className="plasmo-text-sm plasmo-text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : activeTab === "tokens" ? (
          <div className="plasmo-space-y-3">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <div 
                  key={token.id} 
                  className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4 plasmo-flex plasmo-items-center plasmo-gap-3 hover:plasmo-bg-accent plasmo-transition-colors"
                >
                  <div className="plasmo-flex-shrink-0">
                    <img 
                      src={token.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${token.mint}`} 
                      alt={token.name} 
                      className="plasmo-w-12 plasmo-h-12 plasmo-rounded-full plasmo-object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${token.mint}`;
                      }}
                    />
                  </div>
                  <div className="plasmo-flex-1 min-w-0">
                    <h3 className="plasmo-font-semibold plasmo-text-foreground truncate">{token.name}</h3>
                    <p className="plasmo-text-sm plasmo-text-muted-foreground">{token.symbol}</p>
                  </div>
                  <div className="plasmo-text-right">
                    <p className="plasmo-font-medium plasmo-text-foreground">
                      {token.amount !== undefined ? token.amount.toFixed(4) : '0.0000'}
                    </p>
                    {token.change24h !== undefined && (
                      <p className={`plasmo-text-sm ${
                        token.change24h >= 0 ? "plasmo-text-green-500" : "plasmo-text-destructive"
                      }`}>
                        {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="plasmo-text-center plasmo-py-8">
                <div className="plasmo-text-5xl plasmo-mb-4">🔍</div>
                <h3 className="plasmo-text-lg plasmo-font-medium plasmo-text-foreground">{t("wallet.noTokensFound")}</h3>
                <p className="plasmo-text-muted-foreground plasmo-mt-2">{t("wallet.noTokensFoundDescription")}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="plasmo-space-y-6">
            {/* User NFTs */}
            <div>
              <h2 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-mb-4">
                {t("nft.yourNFTs")}
              </h2>
              
              {nfts.length > 0 ? (
                <div className="grid grid-cols-2 plasmo-gap-4">
                  {nfts.map((nft) => (
                    <div key={nft.id} className="plasmo-bg-card plasmo-rounded-xl plasmo-overflow-hidden">
                      <img 
                        src={nft.image} 
                        alt={nft.name} 
                        className="plasmo-w-full plasmo-h-40 plasmo-object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${nft.id}`;
                        }}
                      />
                      <div className="plasmo-p-3">
                        <h3 className="plasmo-font-medium plasmo-text-foreground truncate">{nft.name}</h3>
                        <p className="plasmo-text-xs plasmo-text-muted-foreground">{nft.collection}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="plasmo-text-center plasmo-py-8">
                  <div className="plasmo-text-5xl plasmo-mb-4">艺术品</div>
                  <h3 className="plasmo-text-lg plasmo-font-medium plasmo-text-foreground">{t("nft.noNFTs")}</h3>
                  <p className="plasmo-text-muted-foreground plasmo-mt-2">{t("nft.noNFTsDescription")}</p>
                </div>
              )}
            </div>

            {/* Gorbagio NFT Section */}
            <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
              <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-mb-2">
                {t("nft.getGorbagioNFT")}
              </h3>
              <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-4">
                {t("nft.getGorbagioNFTDescription")}
              </p>
              <Button 
                className="plasmo-w-full"
                onClick={() => window.open("https://magiceden.io/marketplace/gorbagio", "_blank")}
              >
                {t("nft.getOnMagicEden")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}