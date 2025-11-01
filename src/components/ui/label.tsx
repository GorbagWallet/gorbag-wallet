import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "~/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-text-sm plasmo-leading-none plasmo-font-medium plasmo-select-none group-data-[disabled=true]:plasmo-pointer-events-none group-data-[disabled=true]:plasmo-opacity-50 peer-disabled:plasmo-cursor-not-allowed peer-disabled:plasmo-opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };