function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white px-4 py-6 text-center dark:border-gray-800 dark:bg-gray-950">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Elixir® All rights reserved.
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Designed &amp; Developed by <span className="font-semibold text-gray-700 dark:text-gray-300">Owais Khan</span>
      </p>
    </footer>
  );
}

export default Footer;
