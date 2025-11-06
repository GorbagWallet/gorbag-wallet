/**
 * This content script is the bridge between the main world script (`inject.ts`)
 * and the extension's background service worker.
 * 
 * It has no direct access to the page's `window` object, but it can pass messages
 * to and from the `inject.ts` script, which does.
 */
import type { PlasmoCSConfig } from "plasmo";

// Configures the content script to run at document_start.
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
  all_frames: true, // Required to communicate with iframes
};

// --- Message Bridge ---

// 1. Listen for requests from the injected script (dApp -> provider -> content script).
window.addEventListener("message", (event) => {
  if (
    event.source === window &&
    event.data?.source === "gorbag-injected-script-request"
  ) {
    const { id, method, params } = event.data;

    // Forward the request to the background script for processing.
    chrome.runtime
      .sendMessage({
        source: "gorbag-content-script",
        method,
        params,
      })
      .then((response) => {
        // Success: Send the response back to the injected script.
        window.postMessage(
          {
            source: "gorbag-extension-response",
            id: id,
            result: response,
          },
          window.location.origin
        );
      })
      .catch((error) => {
        // Error: Send a structured error back to the injected script.
        window.postMessage(
          {
            source: "gorbag-extension-response",
            id: id,
            error: { message: error.message },
          },
          window.location.origin
        );
      });
  }
});

// 2. Listen for events pushed from the background script (e.g., account changes).
chrome.runtime.onMessage.addListener((message) => {
  if (message.source === "gorbag-background-event") {
    // Forward the event to the injected script.
    window.postMessage(
      {
        source: "gorbag-extension-response", // Use the same source for simplicity.
        eventName: message.eventName,
        eventParams: message.eventParams,
      },
      window.location.origin
    );
  }
  // Return true to indicate you wish to send a response asynchronously.
  return true;
});

// This content script is for logic only; no UI is rendered.
export default function Content() {
  return null;
}