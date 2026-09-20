import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The original app's Input primitive — the OLD shadcn v1-style base
 * (measured on the live original): py-1, shadow-sm, transition-colors,
 * focus-visible:ring-1. Usages append their own tails (bg/border/
 * font/height/rounded) via cn; rounded-md merges away when a tail
 * passes rounded-[6px] (the contact forms do).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex w-full rounded-md border px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
