interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

