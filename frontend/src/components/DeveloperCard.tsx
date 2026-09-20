import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiArrowTopRightOnSquare } from "react-icons/hi2";

function DeveloperCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full mb-3 w-72 rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <HiXMark className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <img
                src="/owais.jpeg"
                alt="Owais Khan"
                className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-brand/30"
              />
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white">Owais Khan</h3>
                <p className="text-sm font-semibold text-brand">Full Stack Developer</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Built SwiftBite AI end-to-end. Check out my other projects and work!
            </p>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              href="https://owaisfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
            >
              View Portfolio
              <HiArrowTopRightOnSquare className="h-4 w-4" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="group relative">
        <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700">
          Meet the creator
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
        </span>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setOpen((v) => !v)}
          aria-label="About the developer"
          className="h-14 w-14 overflow-hidden rounded-full ring-2 ring-brand shadow-lg"
        >
          <img
            src="/owais.jpeg"
            alt="Owais Khan"
            className="h-full w-full object-cover blur-sm transition duration-300 group-hover:blur-none"
          />
        </motion.button>
      </div>
    </div>
  );
}

export default DeveloperCard;
