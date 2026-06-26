import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  path: { label: string; id: string | null }[];
  onNavigate: (id: string | null) => void;
}

function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  if (path.length <= 1) return null;

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm mb-4 mt-1 overflow-hidden">
      {path.map((item, i) => {
        const isLast = i === path.length - 1;
        return (
          <span key={i} className={cn("flex items-center gap-1", isLast ? "min-w-0" : "shrink-0")}>
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" aria-hidden="true" />
            )}
            <button
              type='button'
              onClick={() => onNavigate(item.id)}
              className={cn(
                "transition-colors rounded px-1 py-0.5 -mx-1",
                isLast
                  ? "font-semibold text-foreground truncate max-w-[200px] md:max-w-full cursor-default"
                  : "shrink-0 text-muted-foreground whitespace-nowrap hover:text-foreground"
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.label}
            </button>
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;