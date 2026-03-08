import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  path: { label: string; id: string | null }[];
  onNavigate: (id: string | null) => void;
}

function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm mb-5 mt-1 overflow-hidden">
      {path.map((item, i) => {
        const isLast = i === path.length - 1;
        return (
          <span key={i} className={cn("flex items-center gap-1.5", isLast ? "min-w-0" : "shrink-0")}>
            {i > 0 && <span className="text-muted-foreground/40 shrink-0">/</span>}
            <button
              type='button'
              onClick={() => onNavigate(item.id)}
              className={cn(
                "hover:text-primary transition-colors",
                isLast
                  ? "font-semibold text-foreground truncate max-w-full"
                  : "shrink-0 text-muted-foreground whitespace-nowrap"
              )}
            >
              {item.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}

export default Breadcrumb;