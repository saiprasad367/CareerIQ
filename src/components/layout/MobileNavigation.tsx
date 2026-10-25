import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Compass, Briefcase,
  GitMerge, BookOpen, ClipboardList, MessageSquare,
  BarChart3, Settings, FileSearch
} from 'lucide-react';
import { cn } from '@/lib/utils';

const primaryNav = [
  { label: 'Home', icon: LayoutDashboard, href: '/app' },
  { label: 'Resume', icon: FileText, href: '/app/resume-analyzer' },
  { label: 'Jobs', icon: Briefcase, href: '/app/jobs' },
  { label: 'Skills', icon: GitMerge, href: '/app/skill-gaps' },
  { label: 'Roadmap', icon: BookOpen, href: '/app/learning-roadmap' },
];

export function MobileNavigation() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EAEAEA] safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {primaryNav.map(item => {
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1',
                active ? 'text-[#111111]' : 'text-[#858585]'
              )}
              aria-label={item.label}
            >
              <item.icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
              <span className={cn('text-[10px] font-medium truncate', active ? 'text-[#111111]' : 'text-[#858585]')}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
