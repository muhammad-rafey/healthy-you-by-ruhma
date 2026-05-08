import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[88rem] flex-col items-start justify-center px-6 lg:px-10">
      <p className="text-mauve text-[11px] font-medium tracking-[0.16em] uppercase">404</p>
      <h1 className="font-display text-ink mt-4 text-[clamp(40px,6vw,96px)] leading-[0.95] font-medium tracking-tight">
        Not on the menu.
      </h1>
      <p className="text-ink-soft mt-6 max-w-xl text-base">
        That page doesn&rsquo;t exist — or moved when we rebuilt the site. Try the navigation, or
        start at the beginning.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="bg-ink text-cream hover:bg-mauve-deep rounded-full px-5 py-2.5 text-sm font-medium transition"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
