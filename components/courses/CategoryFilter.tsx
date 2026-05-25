"use client";

import { motion } from "framer-motion";
import { CATEGORIES, type Category } from "@/lib/courses-data";

interface CategoryFilterProps {
  active: Category;
  onChange: (cat: Category) => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        return (
          <motion.button
            key={cat}
            onClick={() => onChange(cat)}
            className="relative flex-shrink-0 px-4 py-1.5 rounded-full text-[0.7rem] font-semibold tracking-wide transition-colors duration-200 cursor-pointer"
            style={{
              color: isActive ? "#080608" : "rgba(255,248,245,0.45)",
              background: isActive
                ? "linear-gradient(135deg, #C4857A, #D4998E)"
                : "rgba(196,133,122,0.07)",
              border: isActive ? "none" : "1px solid rgba(196,133,122,0.15)",
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 600, damping: 32 }}
          >
            {cat}
          </motion.button>
        );
      })}
    </div>
  );
}
