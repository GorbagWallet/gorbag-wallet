import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "plasmo-inline-flex plasmo-items-center plasmo-justify-center plasmo-gap-2 plasmo-whitespace-nowrap plasmo-rounded-md plasmo-text-sm plasmo-font-medium plasmo-transition-all disabled:plasmo-pointer-events-none disabled:plasmo-opacity-50 [&_svg]:plasmo-pointer-events-none [&_svg:not([class*='size-'])]:plasmo-size-4 plasmo-shrink-0 [&_svg]:plasmo-shrink-0 plasmo-outline-none focus-visible:plasmo-border-ring focus-visible:plasmo-ring-ring/50 focus-visible:plasmo-ring-[3px] aria-invalid:plasmo-ring-destructive/20 dark:aria-invalid:plasmo-ring-destructive/40 aria-invalid:plasmo-border-destructive",
  {
    variants: {
      variant: {
        default: "plasmo-bg-primary plasmo-text-primary-foreground hover:plasmo-bg-primary/90",
        destructive:
          "plasmo-bg-destructive plasmo-text-white hover:plasmo-bg-destructive/90 focus-visible:plasmo-ring-destructive/20 dark:focus-visible:plasmo-ring-destructive/40 dark:plasmo-bg-destructive/60",
        outline:
          "plasmo-border plasmo-bg-background plasmo-shadow-xs hover:plasmo-bg-accent hover:plasmo-text-accent-foreground dark:plasmo-bg-input/30 dark:plasmo-border-input dark:hover:plasmo-bg-input/50",
        secondary:
          "plasmo-bg-secondary plasmo-text-secondary-foreground hover:plasmo-bg-secondary/80",
        ghost:
          "hover:plasmo-bg-accent hover:plasmo-text-accent-foreground dark:hover:plasmo-bg-accent/50",
        link: "plasmo-text-primary plasmo-underline-offset-4 hover:plasmo-underline",
      },
      size: {
        default: "plasmo-h-9 plasmo-px-4 plasmo-py-2 has-[>svg]:plasmo-px-3",
        sm: "plasmo-h-8 plasmo-rounded-md plasmo-gap-1.5 plasmo-px-3 has-[>svg]:plasmo-px-2.5",
        lg: "plasmo-h-10 plasmo-rounded-md plasmo-px-6 has-[>svg]:plasmo-px-4",
        icon: "plasmo-size-9",
        "icon-sm": "plasmo-size-8",
        "icon-lg": "plasmo-size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean; }>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
