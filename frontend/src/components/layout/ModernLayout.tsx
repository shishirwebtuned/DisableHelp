"use client";

import { useState } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { UserButton } from './UserButton';
import NotificationsCenter from '@/components/common/NotificationsCenter';

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
    display: 'swap',
});

export default function ModernLayout({ children }: { children: React.ReactNode }) {
    const { user } = useSelector((state: RootState) => state.auth);
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = user?.role && NAV_ITEMS[user.role as keyof typeof NAV_ITEMS]
        ? NAV_ITEMS[user.role as keyof typeof NAV_ITEMS]
        : NAV_ITEMS.worker;

    

    const SidebarContent = () => (
        <div className={`h-full flex flex-col p-3 ${plusJakarta.className}`}>
                <div className="mb-4 flex items-center">
                    <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        D
                    </div>
                    <span className="ml-3 font-bold text-lg text-foreground">
                        DisableHelp
                    </span>
                </div>

            <nav className="flex-1 w-full space-y-1">
                {navItems.map((item: any, idx: number) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                        <Link key={idx} href={item.href} className="w-full">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start h-10 ${active ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                <span>{item.label}</span>
                            </Button>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-white dark:bg-slate-950   gap-2 sm:gap-3 overflow-hidden">
            {/* Floating Sidebar - Desktop */}
            <div className={`hidden md:flex h-full ${sidebarOpen ? 'w-20 lg:w-64' : 'w-20'} flex-col items-center lg:items-start p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded transition-all duration-200 ${plusJakarta.className}`}>
                <div className="mb-4 flex items-center justify-center w-full">
                    <div className= { `${sidebarOpen ? "h-9 w-9" : "hidden"} bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                        D
                    </div>
                    <span className={`ml-3 font-bold text-lg hidden lg:block text-foreground ${sidebarOpen ? '' : 'opacity-0 pointer-events-none'}`}>
                        DisableHelp
                    </span>
                </div>

                <nav className="flex-1 w-full space-y-1">
                    {navItems.map((item: any, idx: number) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                            <Link key={idx} href={item.href} className="w-full">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start h-10 ${active ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                    <Icon className="h-5 w-5 mr-0 lg:mr-3" />
                                    {sidebarOpen && <span className="hidden lg:inline">{item.label}</span>}
                                </Button>
                            </Link>
                        );
                    })}


                     <button
                    // variant="ghost"
                    // size="icon"
                    className="mt-2 hidden  self-center lg:flex   text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <ChevronLeft className="h-6 w-6 text-blue-600" /> : <ChevronRight className="h-6 w-6 text-blue-600" />}
                </button>
                </nav>

                {/* Sidebar Toggle (desktop) */}
               
            </div>

            {/* Main Content Area */}
            <main className="flex-1 h-full rounded sm:rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                    
                    <span className="md:hidden font-bold text-sm">DisableHelp</span>
                    
                    <div className="ml-auto flex items-center space-x-2">
                        <NotificationsCenter />
                        <UserButton variant="minimal" />
                    </div>
                </div>
                <ScrollArea className="h-[calc(100%-3.5rem)] p-2 sm:p-2">
                    {children}
                </ScrollArea>
            </main>
        </div>
    );
}
