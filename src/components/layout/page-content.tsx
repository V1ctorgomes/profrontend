interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div
      className={`flex flex-col gap-6 px-6 pb-12 md:px-8 animate-in fade-in duration-500 ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
