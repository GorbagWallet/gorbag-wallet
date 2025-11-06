import "../style.css"
import React from "react";
import { DappConnectionProvider } from "../features/dapp-connection/context";
import ConfirmationPage from "./confirm-page";

// This file now simply exports the component tree
export default function ConfirmTabContent() {
  return (
    <React.StrictMode>
      <DappConnectionProvider>
        <ConfirmationPage />
      </DappConnectionProvider>
    </React.StrictMode>
  );
}