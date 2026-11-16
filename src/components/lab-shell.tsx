import { Link, useLocation } from '@tanstack/react-router';
import { Atom, LayoutDashboard, FlaskConical, SlidersHorizontal, ChartNoAxesCombined, BookOpen, ArrowUpRight, ChevronRight, GraduationCap, Circle, Cable } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/simulator', label: 'BB84 Simulator', icon: SlidersHorizontal },
  { to: '/experiments', label: 'Experiments', icon: FlaskConical },
  { to: '/results', label: 'Results', icon: ChartNoAxesCombined },
  { to: '/fibre', label: 'Fibre Analysis', icon: Cable },
  { to: '/about', label: 'About BB84', icon: BookOpen },
] as const;
export function LabShell({ children }: { children: ReactNode }) {
  const path = useLocation({ select: l => l.pathname });
  const title = navigation.find(n => n.to === path)?.label ?? 'Quantum Lab';
  return <div>
    <aside className="lab-sidebar">
      <Link to="/" className="flex items-center gap-3 px-7 pt-8 pb-7"><Atom className="quantum-orbit" strokeWidth={1.5}/><div><span className="text-xl font-semibold">quantum<span className="text-primary">lab</span></span><div className="mt-1 text-[9px] text-sidebar-dim">QUANTUM KEY DISTRIBUTION</div></div></Link>
      <div className="mx-6 border-t border-sidebar-border"/>
      <div className="px-7 mt-7 mb-3 text-[10px] text-sidebar-dim">WORKSPACE</div>
      <nav className="flex flex-col gap-2 px-4">{navigation.map(n => <Button key={n.to} asChild variant="nav" className="justify-start h-11 px-4" data-active={path === n.to}><Link to={n.to}><n.icon size={17}/>{n.label}{path === n.to && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"/>}</Link></Button>)}</nav>
      <div className="mx-6 mt-8 border-t border-sidebar-border"/>
      <div className="px-7 mt-6 text-[10px] text-sidebar-dim">PROJECT</div>
      <div className="flex items-center gap-3 px-7 mt-4 text-xs text-sidebar-dim"><span className="h-1.5 w-1.5 rounded-full bg-primary"/>Phase 1 · BB84 Simulation</div>
      <Link to="/fibre" className="flex items-center gap-3 px-7 mt-4 text-xs text-sidebar-dim hover:text-sidebar-foreground"><Circle size={6}/>Phase 2 · Fibre Analysis</Link>
      <div className="mt-auto px-6 pb-6"><div className="border-t border-sidebar-border pt-5 flex gap-3 items-start"><GraduationCap size={20} className="text-sidebar-dim"/><div className="text-xs">University Research Project<p className="mt-1.5 text-[10px] text-sidebar-dim">Quantum Computing · BB84</p></div></div></div>
    </aside>
    <main className="lab-main">
      <header className="lab-topbar"><div className="flex items-center gap-3 text-xs"><Atom size={16} className="text-success"/><span className="text-muted-foreground hidden sm:inline">Workspace</span><ChevronRight size={13} className="text-muted-foreground hidden sm:inline"/><span className="font-medium">{title}</span></div><div className="flex items-center gap-4"><span className="hidden sm:flex gap-2 items-center text-[11px] text-success"><span className="h-1.5 w-1.5 rounded-full bg-success"/>BB84 + fibre lab</span><span className="border border-border rounded px-2.5 py-1 text-[10px] font-mono text-muted-foreground">PHASE 02</span></div></header>
      <nav className="mobile-nav">{navigation.map(n => <Button key={n.to} asChild size="sm" variant={path === n.to ? 'secondary' : 'ghost'}><Link to={n.to}><n.icon/>{n.label}</Link></Button>)}</nav>
      <div className="lab-content">{children}<footer className="mt-8 pt-5 border-t border-border flex flex-wrap justify-between gap-3 text-[10px] text-muted-foreground"><span>BB84 Quantum Key Distribution · University Project</span><Link to="/about" className="flex items-center gap-1">Understanding the protocol <ArrowUpRight size={12}/></Link></footer></div>
    </main>
  </div>;
}