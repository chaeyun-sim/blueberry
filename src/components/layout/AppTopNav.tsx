import { LogIn, Plus, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoImg from '@/assets/logo.webp';
import { navItems } from '@/constants/nav-items';
import { cn } from '@/lib/utils';
import { useAuth } from '@/provider/AuthContext';

// 데스크톱 전용 상단 내비게이션 — 모바일은 BottomNav가 담당
export function AppTopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? location.pathname === item.url : location.pathname.startsWith(item.url);

  if (authLoading) return null;

  return (
    <header className='sticky top-0 z-40 hidden items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-md md:flex'>
      {/* 로고 */}
      <button
        onClick={() => navigate('/')}
        className='flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80'
        aria-label='BlueBerry 홈'
      >
        <img src={logoImg} alt='BlueBerry 로고' className='h-7 w-7 object-contain' />
        <span className='hidden font-display text-lg font-bold tracking-tight lg:inline'>
          BlueBerry
        </span>
      </button>

      {/* 메뉴 필 그룹 */}
      <nav
        aria-label='주 메뉴'
        className='flex items-center gap-1 rounded-full border bg-card p-1 shadow-sm'
      >
        {navItems.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.url)}
            className={cn(
              'flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] lg:px-4',
              isActive(item)
                ? 'bg-foreground font-semibold text-background shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <item.icon className='h-4 w-4 shrink-0' />
            <span className='hidden lg:inline'>{item.title}</span>
          </button>
        ))}
      </nav>

      {/* 우측 액션 */}
      <div className='flex shrink-0 items-center gap-2'>
        <button
          onClick={() => navigate('/new')}
          className='flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-85 active:scale-[0.98]'
        >
          <Plus className='h-4 w-4' />
          <span className='hidden lg:inline'>새 의뢰</span>
        </button>
        {session ? (
          <button
            onClick={() => navigate('/settings')}
            aria-label='설정'
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              location.pathname.startsWith('/settings')
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Settings className='h-[18px] w-[18px]' />
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            aria-label='로그인'
            className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <LogIn className='h-[18px] w-[18px]' />
          </button>
        )}
      </div>
    </header>
  );
}
