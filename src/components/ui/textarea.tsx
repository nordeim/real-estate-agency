import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The original app's Textarea primitive — the OLD shadcn v1-style base
 * (measured on the live original): min-h-[60px], py-2, shadow-sm,
 * focus-visible:ring-1, no file: utilities (textareas accept no files).
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
