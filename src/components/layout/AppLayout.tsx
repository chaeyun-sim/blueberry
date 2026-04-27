import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Menu } from 'lucide-react';
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
					<header
						className='sticky top-0 z-50 bg-background flex items-end px-4 border-b border-border md:hidden'
						style={{
							paddingTop: 'env(safe-area-inset-top)',
							height: 'calc(3rem + env(safe-area-inset-top))',
						}}
					>
						<div className='flex items-center h-12'>
							<SidebarTrigger
								className='p-2 rounded-lg hover:bg-muted transition-colors'
								aria-label='사이드바 열기'
							>
								<Menu className='h-5 w-5' />
							</SidebarTrigger>
						</div>
					</header>
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
									paddingBottom: bottomBar
										? 'max(5rem, calc(env(safe-area-inset-bottom) + 5rem))'
										: 'max(1.5rem, env(safe-area-inset-bottom))',
								}}
							>
								{children}
							</motion.div>
						</AnimatePresence>
					</main>
					{bottomBar}
				</div>
			</div>
		</SidebarProvider>
	);
}
