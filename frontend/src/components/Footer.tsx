function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white px-4 py-6 text-center dark:border-gray-800 dark:bg-gray-950">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} SwiftBite AI. All rights reserved.
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Designed &amp; Developed by{" "}
        <a
          href="https://owaisfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand hover:underline"
        >
          Owais Khan
        </a>
      </p>
    </footer>
  );
}

export default Footer;
