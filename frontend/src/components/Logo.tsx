interface Props {
  size?: "sm" | "lg";
}

function Logo({ size = "sm" }: Props) {
  const isLg = size === "lg";
  return (
    <span className="flex items-center gap-2 select-none">
      <span
        className={`flex items-center justify-center rounded-xl bg-linear-to-br from-[#ff5a5f] to-brand shadow-sm ${
          isLg ? "h-12 w-12 text-2xl" : "h-8 w-8 text-base"
        }`}
      >
        🍔
      </span>
      <span className={`font-extrabold tracking-tight text-brand ${isLg ? "text-4xl" : "text-2xl"}`}>
        SwiftBite
        <span
          className={`ml-1.5 rounded-md bg-brand align-middle font-bold text-white ${
            isLg ? "px-2 py-0.5 text-sm" : "px-1.5 py-0.5 text-[10px]"
          }`}
        >
          AI
        </span>
      </span>
    </span>
  );
}

export default Logo;
