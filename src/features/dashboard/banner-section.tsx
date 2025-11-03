import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useI18n } from "~/i18n/context";

interface BannerData {
  title: string;
  description: string;
  mini_image: string;
  background_image: string;
  onclick: string;
}

interface BannerSectionProps {
  onClickNavigate?: (url: string) => void;
}

export function BannerSection({ onClickNavigate }: BannerSectionProps) {
  const { t } = useI18n();
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Mock banner data - in a real implementation, this would come from an API
  useEffect(() => {
    const mockBanners: BannerData[] = [
      {
        title: "Claim $XYZ Today",
        description: "Check your eligibility and claim $XYZ from the TGE",
        mini_image: "https://pbs.twimg.com/profile_images/1967693862559698944/XTfCXXGa_400x400.jpg",
        background_image: "https://i.pinimg.com/736x/98/32/36/983236a02e5d7e4d62d85c35445b6563.jpg",
        onclick: "https://claim.chain.xyz"
      },
      {
        title: "Special Airdrop Event",
        description: "Participate in our exclusive airdrop for early users",
        mini_image: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
        background_image: "https://static.vecteezy.com/system/resources/thumbnails/014/743/262/small/solana-sol-symbol-logo-on-realistic-isometric-mobile-phone-with-copy-space-for-presentation-of-ui-ux-app-for-banners-mockups-and-website-templates-illustration-vector.jpg",
        onclick: "https://airdrop.chain.xyz"
      },
      {
        title: "Earn Rewards Now",
        description: "Stake your tokens and earn up to 20% APY",
        mini_image: "https://s2.coinmarketcap.com/static/img/coins/200x200/1027.png",
        background_image: "https://www.shutterstock.com/image-vector/modern-black-white-abstract-background-600nw-2603238375.jpg",
        onclick: "https://staking.chain.xyz"
      }
    ];
    
    setBanners(mockBanners);
  }, []);

  const currentBanner = banners[currentBannerIndex];

  if (!currentBanner) {
    return null;
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
