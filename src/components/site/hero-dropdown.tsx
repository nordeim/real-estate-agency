"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface HeroDropdownProps {
  /** Accessible description appended to the button label. */
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * The original app's sentence-style hero picker: an inline serif-italic
 * label with an underline and chevron that opens a glass popover menu.
 * (Not a native select — the styling is unachievable cross-browser.)
 */
export function HeroDropdown({
  label,
  options,
  value,
  onChange,
}: HeroDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value}`}
        className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors border-b border-white/30 pb-1"
      >
        <span className="font-display text-lg md:text-xl italic">{value}</span>
        <ChevronDown
          size={14}
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute top-full left-0 mt-2 bg-white backdrop-blur-xl border border-white/20 shadow-lg min-w-[200px] z-10 rounded"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-3 font-body text-sm text-foreground hover:bg-accent/10 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
