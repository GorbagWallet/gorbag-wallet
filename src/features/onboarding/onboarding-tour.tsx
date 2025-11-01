import { useState } from "react";
import { Button } from "~/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import sendImage from "data-base64:~assets/tour-images/send.png";
import receiveImage from "data-base64:~assets/tour-images/receive.png";
import swapImage from "data-base64:~assets/tour-images/swap.png";
import nftsImage from "data-base64:~assets/tour-images/NFTs.png";

interface OnboardingTourProps {
  onComplete: () => void;
}

const tourSlides = [
  {
    title: "Sending Funds",
    description: "Easily send tokens to your friends and family.",
    image: sendImage,
  },
  {
    title: "Receiving Funds",
    description: "Receive tokens from anyone, anywhere.",
    image: receiveImage,
  },
  {
    title: "Making a Swap",
    description: "Swap between different tokens seamlessly.",
    image: swapImage,
  },
  {
    title: "NFTs Coming Soon",
    description: "Manage your NFTs directly from your wallet.",
    image: nftsImage,
  },
];

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < tourSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete(); // End of tour, go to dashboard
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkipTour = () => {
    onComplete();
  };

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-screen plasmo-p-4">
      <div className="plasmo-relative plasmo-w-full plasmo-max-w-md plasmo-h-2/3 plasmo-mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="plasmo-absolute plasmo-inset-0 plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-bg-card plasmo-rounded-lg plasmo-p-4">
            <img
              src={tourSlides[currentSlide].image}
              alt={tourSlides[currentSlide].title}
              className="plasmo-w-full plasmo-h-1/2 plasmo-object-contain plasmo-mb-4"
            />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2"
            >
              {tourSlides[currentSlide].title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="plasmo-text-muted-foreground plasmo-text-center"
            >
              {tourSlides[currentSlide].description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="plasmo-flex plasmo-justify-between plasmo-w-full plasmo-max-w-sm plasmo-mb-4">
        <Button onClick={handlePrev} disabled={currentSlide === 0} variant="outline">
          <ChevronLeft className="plasmo-h-4 plasmo-w-4" />
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentSlide === tourSlides.length - 1 ? "Finish" : "Next"}
          <ChevronRight className="plasmo-h-4 plasmo-w-4" />
        </Button>
      </div>

      <Button variant="ghost" onClick={handleSkipTour} className="plasmo-text-muted-foreground">
        Skip Tour
      </Button>
    </div>
  );
}