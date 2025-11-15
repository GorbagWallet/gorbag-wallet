import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useI18n } from "~/i18n/context";

interface BannerData {
  id: string;
  title: string;
  description: string;
  mini_image: string;
  background_image: string;
  onclick: string;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

interface BannerSectionProps {
  onClickNavigate?: (url: string) => void;
}

export function BannerSection({ onClickNavigate }: BannerSectionProps) {
  const { t } = useI18n();
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        // Use the backend endpoint to fetch banners
        const response = await fetch('https://gorbag-server.vercel.app/api/v1/banners?limit=10');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch banners: ${response.status}`);
        }
        
        const data = await response.json();
        setBanners(data.banners || []);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError(err instanceof Error ? err.message : 'Failed to load banners');
        
        // Fallback to mock data if API fails
        const mockBanners = [
          {
            id: 'mock-1',
            title: "vBridge is Live",
            description: "Bridge $sGOR to $gGOR",
            mini_image: "https://s2.coinmarketcap.com/static/img/coins/64x64/36883.png",
            background_image: "https://www.livebreathescotland.com/article_images/craigellachie-bridge-18.jpg",
            onclick: "https://bridge.gorbagana.wtf",
            priority: 0
          },	
          {
            id: 'mock-2',
            title: "Claim $XYZ Today",
            description: "Check your eligibility and claim $XYZ from the TGE",
            mini_image: "https://pbs.twimg.com/profile_images/1967693862559698944/XTfCXXGa_400x400.jpg",
            background_image: "https://i.pinimg.com/736x/98/32/36/983236a02e5d7e4d62d85c35445b6563.jpg",
            onclick: "https://claim.chain.xyz",
            priority: 1
          },
          {
            id: 'mock-3',
            title: "Special Airdrop Event",
            description: "Participate in our exclusive airdrop for early users",
            mini_image: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
            background_image: "https://static.vecteezy.com/system/resources/thumbnails/014/743/262/small/solana-sol-symbol-logo-on-realistic-isometric-mobile-phone-with-copy-space-for-presentation-of-ui-ux-app-for-banners-mockups-and-website-templates-illustration-vector.jpg",
            onclick: "https://airdrop.chain.xyz",
            priority: 2
          },
          {
            id: 'mock-4',
            title: "Earn Rewards Now",
            description: "Stake your tokens and earn up to 20% APY",
            mini_image: "https://s2.coinmarketcap.com/static/img/coins/200x200/1027.png",
            background_image: "https://www.shutterstock.com/image-vector/modern-black-white-abstract-background-600nw-2603238375.jpg",
            onclick: "https://staking.chain.xyz",
            priority: 3
          }
        ];
        setBanners(mockBanners);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const currentBanner = banners[currentBannerIndex];

  if (loading || !currentBanner) {
    return (
      <div className="plasmo-relative plasmo-mb-6 plasmo-overflow-hidden plasmo-rounded-xl plasmo-bg-gradient-to-r from-primary/10 to-secondary/10 plasmo-min-h-24 plasmo-flex plasmo-items-center plasmo-justify-center">
        <div className="plasmo-text-center plasmo-p-4">
          <div className="plasmo-h-4 plasmo-w-48 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded plasmo-mb-2"></div>
          <div className="plasmo-h-3 plasmo-w-32 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
        </div>
      </div>
    );
  }

  if (error && banners.length === 0) {
    return (
      <div className="plasmo-relative plasmo-mb-6 plasmo-overflow-hidden plasmo-rounded-xl plasmo-bg-gradient-to-r from-primary/10 to-secondary/10 plasmo-min-h-24 plasmo-flex plasmo-items-center plasmo-justify-center">
        <div className="plasmo-text-center plasmo-p-4">
          <p className="plasmo-text-destructive plasmo-text-sm">Error loading banners</p>
        </div>
      </div>
    );
  }

  const handleBannerClick = () => {
    if (onClickNavigate && currentBanner.onclick) {
      onClickNavigate(currentBanner.onclick);
    } else if (currentBanner.onclick) {
      // Fallback to opening in a new tab if no navigation function provided
      window.open(currentBanner.onclick, '_blank');
    }
  };

  const goToNextBanner = () => {
    setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const goToPrevBanner = () => {
    setCurrentBannerIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  return (
    <div className="plasmo-relative plasmo-mb-6 plasmo-overflow-hidden plasmo-rounded-xl plasmo-bg-gradient-to-r from-primary/10 to-secondary/10">
      {/* Banner background */}
      <div 
        className="plasmo-absolute plasmo-inset-0 plasmo-bg-cover plasmo-bg-center plasmo-opacity-20"
        style={{ backgroundImage: `url(${currentBanner.background_image})` }}
      />
      
      <div className="plasmo-relative plasmo-z-10 plasmo-p-4">
        <div className="plasmo-flex plasmo-items-center plasmo-gap-4">
          <div className="plasmo-flex-shrink-0">
            <div 
              className="plasmo-w-16 plasmo-h-16 plasmo-rounded-lg plasmo-bg-cover plasmo-bg-center"
              style={{ backgroundImage: `url(${currentBanner.mini_image})` }}
            />
          </div>
          
          <div className="plasmo-flex-1 plasmo-min-w-0">
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-truncate">
              {currentBanner.title}
            </h3>
            <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-truncate">
              {currentBanner.description}
            </p>
          </div>
          
          <Button 
            onClick={handleBannerClick}
            className="plasmo-flex-shrink-0 plasmo-bg-primary plasmo-text-primary-foreground hover:plasmo-bg-primary/90 plasmo-animate-pop"
          >
            {t("banner.learnMore")}
          </Button>
        </div>
      </div>

      {/* Banner navigation dots */}
      {banners.length > 1 && (
        <div className="plasmo-relative plasmo-z-10 plasmo-flex plasmo-justify-center plasmo-py-2">
          <div className="plasmo-flex plasmo-space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`plasmo-w-2 plasmo-h-2 plasmo-rounded-full ${
                  index === currentBannerIndex 
                    ? 'plasmo-bg-primary' 
                    : 'plasmo-bg-muted'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
