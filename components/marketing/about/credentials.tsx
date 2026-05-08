interface CredentialsProps {
  items: string[];
  label?: string;
}

export function Credentials({ items, label = "Credentials" }: CredentialsProps) {
  return (
    <div>
      <p className="type-eyebrow">{label}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="border-ink/10 bg-paper text-ink-soft hover:border-mauve/40 hover:text-mauve inline-flex items-center rounded-full border px-3 py-1.5 text-[13px] leading-none transition-colors"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
