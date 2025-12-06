import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Settings, LogOut, Coins, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SidebarLayout() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  function handleLogOut() {
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative">
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-gray-950 border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
           <div className="flex items-center gap-2 text-amber-500 font-bold text-xl">
             <Coins className="w-6 h-6" />
             <span>PokerAI</span>
           </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => {
                    if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'hover:bg-gray-900 text-gray-400 hover:text-gray-100'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-800">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleLogOut}
            >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
            </Button>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
            fixed z-[51] top-4 p-2 
            bg-gray-950 text-gray-400 hover:text-white hover:bg-gray-900
            rounded-md shadow-md
            transition-all duration-300 ease-in-out
            ${isOpen ? 'left-[264px]' : 'left-4'}
        `}
        title="Toggle Sidebar"
      >
        <PanelLeft className="w-5 h-5" />
      </button>

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col min-w-0 min-h-screen
        transition-all duration-300 ease-in-out
        ${isOpen ? 'md:ml-64' : 'ml-0'}
      `}>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}