import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { BottomNav } from './BottomNav';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
	children: React.ReactNode;
	bottomBar?: React.ReactNode;
	className?: string;
}

export function AppLayout({ children, bottomBar, className }: AppLayoutProps) {
	const location = useLocation();

	return (
		<SidebarProvider defaultOpen={true}>
			<div className={cn('min-h-screen flex w-full', className)}>
				<AppSidebar />
				<div className='flex-1 flex flex-col min-w-0'>
					<main className='flex-1 overflow-y-auto md:h-screen md:overflow-hidden'>
						<AnimatePresence mode='wait' initial={false}>
							<motion.div
								key={location.pathname}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -6 }}
								transition={{ duration: 0.18, ease: 'easeOut' }}
								className='p-6 md:h-full md:overflow-auto'
								style={{
									paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
									paddingBottom: bottomBar
										? 'max(8rem, calc(env(safe-area-inset-bottom) + 8rem))'
										: 'max(calc(4rem + env(safe-area-inset-bottom) + 0.5rem), 1.5rem)',
								}}
							>
								{children}
							</motion.div>
						</AnimatePresence>
					</main>
					{/* Desktop: sticky at bottom */}
					<div className='hidden md:block sticky bottom-0'>{bottomBar}</div>
					{/* Mobile: fixed above BottomNav */}
					{bottomBar && (
						<div
							className='fixed left-0 right-0 z-[51] md:hidden'
							style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 0.75rem)' }}
						>
							{bottomBar}
						</div>
					)}
				</div>
			</div>
			<BottomNav />
		</SidebarProvider>
	);
}
