import { motion } from "framer-motion";
import { HiSun, HiMoon } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="relative flex h-8 w-14 items-center rounded-full bg-gray-200 px-1 transition-colors dark:bg-gray-700"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
        style={{ marginLeft: isDark ? "auto" : 0 }}
      >
        {isDark ? (
          <HiMoon className="h-3.5 w-3.5 text-brand" />
        ) : (
          <HiSun className="h-3.5 w-3.5 text-amber-500" />
        )}
      </motion.span>
    </motion.button>
  );
}

export default ThemeToggle;
