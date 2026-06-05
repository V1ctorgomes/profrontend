interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="z-10 flex shrink-0 flex-col justify-between gap-6 px-6 pt-8 pb-6 md:px-8 md:pt-10 xl:flex-row xl:items-end">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-950">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}
