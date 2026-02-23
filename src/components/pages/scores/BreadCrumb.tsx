import { cn } from '@/lib/utils';

function Breadcrumb({
  path,
  onNavigate,
}: {
  path: { label: string; id: string | null }[];
  onNavigate: (id: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm mb-5 mt-1">
      {path.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground/40">/</span>}
          <button
            onClick={() => onNavigate(item.id)}
            className={cn(
              "hover:text-primary transition-colors",
              i === path.length - 1
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </button>
        </span>
      ))}
    </div>
  );
}

export default Breadcrumb;