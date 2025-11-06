import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface EnterExistingPasswordStepProps {
  onNext: (password: string) => void;
  onBack: () => void;
}

export function EnterExistingPasswordStep({ onNext, onBack }: EnterExistingPasswordStepProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    
    onNext(password);
  };

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center">
      <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-mb-4">Enter Password</h2>
      <p className="plasmo-text-gray-500 plasmo-mb-8">Enter your existing password to secure the new wallet.</p>
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="plasmo-mb-4"
      />
      {error && <p className="plasmo-text-red-500 plasmo-mb-4">{error}</p>}
      <div className="plasmo-flex plasmo-w-full plasmo-justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}