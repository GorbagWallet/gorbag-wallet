import { useState } from "react";
import { CreateWalletFlow } from "./onboarding/create-wallet-flow";
import { ImportWalletFlow } from "./onboarding/import-wallet-flow";
import { Welcome } from "./onboarding/welcome";

interface OnboardingProps {
  onDashboard: () => void; // New prop
}

export const Onboarding = ({ onDashboard }: OnboardingProps) => {
  const [view, setView] = useState<"welcome" | "create" | "import">("welcome");

  switch (view) {
    case "create":
      return <CreateWalletFlow onBack={() => setView("welcome")} onDashboard={onDashboard} />;
    case "import":
      return <ImportWalletFlow onBack={() => setView("welcome")} onDashboard={onDashboard} />;
    case "welcome":
    default:
      return (
        <Welcome
          onSelectCreate={() => setView("create")}
          onSelectImport={() => setView("import")}
        />
      );
  }
};
