import * as React from "react";

import { cn } from "~/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "plasmo-border-input placeholder:plasmo-text-muted-foreground focus-visible:plasmo-border-ring focus-visible:plasmo-ring-ring/50 aria-invalid:plasmo-ring-destructive/20 dark:aria-invalid:plasmo-ring-destructive/40 aria-invalid:plasmo-border-destructive dark:plasmo-bg-input/30 plasmo-flex plasmo-field-sizing-content plasmo-min-h-16 plasmo-w-full plasmo-rounded-md plasmo-border plasmo-bg-transparent plasmo-px-3 plasmo-py-2 plasmo-text-base plasmo-shadow-xs plasmo-transition-[color,box-shadow] plasmo-outline-none focus-visible:plasmo-ring-[3px] disabled:plasmo-cursor-not-allowed disabled:plasmo-opacity-50 md:plasmo-text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };