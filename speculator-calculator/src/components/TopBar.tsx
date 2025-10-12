"use client";
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {useTheme} from 'next-themes';
import {usePathname} from 'next/navigation';
import { useState } from 'react';

export function TopBar() {
  const tnav = useTranslations('nav');
  const tlang = useTranslations('lang');
  const {setTheme, theme} = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 sticky top-0 z-40 backdrop-blur bg-[color:var(--background)]/85">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button className="sm:hidden border rounded px-2 py-1" aria-label="Menu" onClick={()=>setOpen(!open)}>
            <span className="inline-block w-4 h-0.5 bg-current mb-0.5" />
            <span className="inline-block w-4 h-0.5 bg-current mb-0.5" />
            <span className="inline-block w-4 h-0.5 bg-current" />
          </button>
          <div className="flex flex-col">
            <Link href="/zh" className="font-semibold leading-tight">投机计算器</Link>
            <span className="text-[11px] text-muted-foreground leading-tight">北辰团队专注量化.风险管理</span>
          </div>
          <nav className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/zh" className="hover:underline">{tnav('calculator')}</Link>
            <Link href="/zh/pricing" className="hover:underline">{tnav('pricing')}</Link>
            <Link href="/zh/account" className="hover:underline">{tnav('account')}</Link>
            <Link href="/zh/admin" className="hover:underline">{tnav('admin')}</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-transparent border rounded px-2 py-1 text-sm"
          >
            <option value="theme-classic">Classic</option>
            <option value="theme-darkgold">DarkGold</option>
            <option value="theme-terminal">Terminal</option>
          </select>
          <select
            aria-label="Language"
            onChange={(e) => {
              const to = `/${e.target.value}`;
              window.location.assign(to);
            }}
            className="bg-transparent border rounded px-2 py-1 text-sm"
            defaultValue={pathname?.split('/')[1] || 'zh'}
          >
            <option value="zh">{tlang('zh')}</option>
            <option value="en">{tlang('en')}</option>
            <option value="ko">{tlang('ko')}</option>
          </select>
        </div>
      </div>
      {open && (
        <div className="sm:hidden border-t">
          <div className="px-4 py-3 flex flex-col gap-2 text-sm">
            <Link href="/zh" onClick={()=>setOpen(false)}>{tnav('calculator')}</Link>
            <Link href="/zh/pricing" onClick={()=>setOpen(false)}>{tnav('pricing')}</Link>
            <Link href="/zh/account" onClick={()=>setOpen(false)}>{tnav('account')}</Link>
            <Link href="/zh/admin" onClick={()=>setOpen(false)}>{tnav('admin')}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
