type HeaderSize = 'lg' | 'md' | 'sm';

interface HeaderProps {
  title: string;
  subtitle?: string;
  size?: HeaderSize;
}

const TITLE_SIZES: Record<HeaderSize, string> = {
  lg: 'text-4xl',
  md: 'text-2xl',
  sm: 'text-xl',
};

const SUBTITLE_SIZES: Record<HeaderSize, string> = {
  lg: 'text-lg',
  md: 'text-base',
  sm: 'text-sm',
};

export default function Header({ title, subtitle, size = 'lg' }: HeaderProps) {
  return (
    <div className="w-full">
      <h1 className={`${TITLE_SIZES[size]} font-bold mb-1 text-black dark:text-zinc-50`}>
        {title}
      </h1>
      {subtitle && (
        <p className={`${SUBTITLE_SIZES[size]} text-zinc-600 dark:text-zinc-400`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

