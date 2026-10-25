import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Compass, Briefcase,
  GitMerge, FileSearch, BookOpen, ClipboardList,
  MessageSquare, BarChart3, Settings, ChevronLeft,
  ChevronRight, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/app' },
  { label: 'Resume Analyzer', icon: FileText, href: '/app/resume-analyzer' },
  { label: 'Career Paths', icon: Compass, href: '/app/career-paths' },
  { label: 'Job Matches', icon: Briefcase, href: '/app/jobs' },
  { label: 'Skill Gaps', icon: GitMerge, href: '/app/skill-gaps' },
  { label: 'Resume Optimizer', icon: FileSearch, href: '/app/resume-optimizer' },
  { label: 'Learning Roadmap', icon: BookOpen, href: '/app/learning-roadmap' },
  { label: 'My Applications', icon: ClipboardList, href: '/app/applications' },
  { label: 'Career Assistant', icon: MessageSquare, href: '/app/assistant' },
  { label: 'Reports', icon: BarChart3, href: '/app/reports' },
  { label: 'Settings', icon: Settings, href: '/app/settings' },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-[#EAEAEA] bg-white transition-all duration-300 ease-in-out h-screen sticky top-0 z-40',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 px-4 border-b border-[#EAEAEA] flex-shrink-0', collapsed && 'justify-center px-0')}>
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#111111] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold text-[#111111] tracking-tight truncate">CareerIQ</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scroll-area">
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                    active
                      ? 'bg-[#F7F8FA] text-[#111111]'
                      : 'text-[#666666] hover:bg-[#F7F8FA] hover:text-[#111111]',
                    collapsed && 'justify-center px-0 w-10 mx-auto'
                  )}
                >
                  <item.icon className={cn('flex-shrink-0', active ? 'w-4 h-4' : 'w-4 h-4')} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[#EAEAEA] flex-shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#858585] hover:bg-[#F7F8FA] hover:text-[#111111] transition-colors',
            collapsed && 'justify-center px-0'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
