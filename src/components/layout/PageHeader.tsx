import { PropsWithChildren } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description, children }: PropsWithChildren<PageHeaderProps>) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm md:text-base">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
