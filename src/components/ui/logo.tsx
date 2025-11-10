export function KannyLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`relative ${sizes[size]}`}>
      <div className="absolute inset-0 bg-black rounded-full"></div>
      <div className="absolute inset-0 bg-black rounded-full translate-x-1 translate-y-1"></div>
    </div>
  );
}

