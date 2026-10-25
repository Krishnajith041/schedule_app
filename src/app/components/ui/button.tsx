import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 active:shadow-[0_2px_5px_0_rgba(0,0,0,0.39)] active:translate-y-0.5 border border-white/10",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-orange-500 to-orange-700 text-white hover:from-orange-400 hover:to-orange-600 shadow-[0_4px_0_0_#9a3412] active:shadow-none active:translate-y-[4px]",
        destructive:
          "bg-gradient-to-b from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600 shadow-[0_4px_0_0_#7f1d1d] active:shadow-none active:translate-y-[4px]",
        outline:
          "border bg-black/40 backdrop-blur-sm text-white hover:bg-white/10 shadow-[0_4px_0_0_rgba(255,255,255,0.1)] active:shadow-none active:translate-y-[4px]",
        secondary:
          "bg-gradient-to-b from-gray-700 to-gray-900 text-white hover:from-gray-600 hover:to-gray-800 shadow-[0_4px_0_0_#1f2937] active:shadow-none active:translate-y-[4px]",
        ghost:
          "hover:bg-white/10 text-white shadow-none hover:shadow-none hover:translate-y-0 active:translate-y-0 active:shadow-none border-none",
        link: "text-orange-400 underline-offset-4 hover:underline shadow-none hover:shadow-none hover:translate-y-0 active:translate-y-0 active:shadow-none border-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };