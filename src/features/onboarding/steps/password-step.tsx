import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface PasswordStepProps {
  onNext: (password: string) => void;
  onBack: () => void;
}

export function PasswordStep({ onNext, onBack }: PasswordStepProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    onNext(password);
  };

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center">
      <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-mb-4">Create Password</h2>
      <p className="plasmo-text-gray-500 plasmo-mb-8">You will use this password to unlock your wallet.</p>
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="plasmo-mb-4"
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
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
