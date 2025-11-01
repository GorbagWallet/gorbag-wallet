import * as React from "react";

import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "plasmo-file:text-foreground plasmo-placeholder:text-muted-foreground plasmo-selection:bg-primary plasmo-selection:text-primary-foreground dark:plasmo-bg-input/30 plasmo-border-input plasmo-h-9 plasmo-w-full plasmo-min-w-0 plasmo-rounded-md plasmo-border plasmo-bg-transparent plasmo-px-3 plasmo-py-1 plasmo-text-base plasmo-shadow-xs plasmo-transition-[color,box-shadow] plasmo-outline-none file:plasmo-inline-flex file:plasmo-h-7 file:plasmo-border-0 file:plasmo-bg-transparent file:plasmo-text-sm file:plasmo-font-medium disabled:plasmo-pointer-events-none disabled:plasmo-cursor-not-allowed disabled:plasmo-opacity-50 md:plasmo-text-sm",
        "focus-visible:plasmo-border-ring focus-visible:plasmo-ring-ring/50 focus-visible:plasmo-ring-[3px]",
        "aria-invalid:plasmo-ring-destructive/20 dark:aria-invalid:plasmo-ring-destructive/40 aria-invalid:plasmo-border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };