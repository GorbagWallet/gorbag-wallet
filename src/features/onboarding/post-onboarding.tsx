import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";
import { useWallet } from "~/lib/wallet-context";
import { useI18n } from "~/i18n/context";
import { OnboardingTour } from "./onboarding-tour"; // New import
import welcomeArt from "data-base64:~assets/tour-images/welcome-art.png";

interface PostOnboardingProps {
  nickname: string;
  onComplete: () => void;
}

export function PostOnboarding({ nickname, onComplete }: PostOnboardingProps) {
  const { t } = useI18n();
  const { activeWallet, setActiveWallet, wallets, unlockWallet } = useWallet();
  const [isTakeTourAnimating, setTakeTourAnimating] = useState(false);
  const [isSkipAnimating, setSkipAnimating] = useState(false);
  const [showTour, setShowTour] = useState(false); // New state

  const handleTakeTourClick = () => {
    setTakeTourAnimating(true);
    setTimeout(() => {
      setTakeTourAnimating(false);
      setShowTour(true); // Show the tour
    }, 300);
  };

  const handleSkipClick = async () => {
    setSkipAnimating(true);
    setTimeout(async () => {
      setSkipAnimating(false);
      // Set the most recently added wallet as active
      const lastWallet = wallets[wallets.length - 1];
      if (lastWallet) {
        setActiveWallet(lastWallet);
      }
      // Complete onboarding first to navigate to dashboard
      onComplete();
    }, 300);
  };

  // Handle tour completion with session creation
  const handleTourComplete = async () => {
    // Set the most recently added wallet as active
    const lastWallet = wallets[wallets.length - 1];
    if (lastWallet) {
      setActiveWallet(lastWallet);
    }
    // Complete onboarding to navigate to dashboard
    onComplete();
  };

  if (showTour) {
    return <OnboardingTour onComplete={handleTourComplete} />; // Pass the updated complete function
  }

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-screen plasmo-p-4">
      <div className="plasmo-flex-1 plasmo-w-full plasmo-flex plasmo-rounded-md plasmo-items-center plasmo-justify-center plasmo-mb-3">
        <img src={welcomeArt} alt={t("common.welcome")} className="plasmo-w-full plasmo-rounded-md plasmo-h-full plasmo-object-contain" />
      </div>

      <div className="plasmo-text-center plasmo-mb-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="plasmo-text-3xl plasmo-font-bold plasmo-text-foreground"
        >
          {t("onboarding.welcomeMessage", { nickname })}
        </motion.h1>
        {/* <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="plasmo-text-muted-foreground plasmo-text-lg"
        >
          Ready to explore the wasteland?
        </motion.p> */}
      </div>

      <div className="plasmo-flex plasmo-gap-3 plasmo-w-full plasmo-max-w-sm plasmo-mb-4">
        <Button
          onClick={handleTakeTourClick}
          size="lg"
          className={`plasmo-flex-1 plasmo-h-12 plasmo-text-base ${
            isTakeTourAnimating ? "animate-pop" : ""
          }`}>
          {t("onboarding.takeTour")}
        </Button>
        <Button
          onClick={handleSkipClick}
          variant="outline"
          size="lg"
          className={`plasmo-flex-1 plasmo-h-12 plasmo-text-base plasmo-bg-transparent ${
            isSkipAnimating ? "animate-pop" : ""
          }`}>
          {t("onboarding.skip")}
        </Button>
      </div>
    </div>
  );
}
