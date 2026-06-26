import { useLocation, useNavigate } from 'react-router-dom';

import { navItems } from '@/constants/nav-items';
import { cn } from '@/lib/utils';

export function BottomNav() {
	const location = useLocation();
	const navigate = useNavigate();

	const isActive = (item: (typeof navItems)[0]) =>
		item.exact
			? location.pathname === item.url
			: location.pathname.startsWith(item.url);

	return (
		<nav
			className='fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border'
			style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
		>
			<div className='flex items-stretch h-16'>
				{navItems.map((item) => {
					const active = isActive(item);
					return (
						<button
							key={item.title}
							onClick={() => navigate(item.url)}
							aria-label={item.title}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'flex-1 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
								active
									? 'text-primary'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							<item.icon className='h-6 w-6 shrink-0' />
						</button>
					);
				})}
			</div>
		</nav>
	);
}
