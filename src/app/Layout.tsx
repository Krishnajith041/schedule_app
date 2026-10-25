import { Outlet, NavLink } from "react-router";
import { CateringProvider } from "./context";
import { ChefHat, Calendar, UtensilsCrossed, Clock, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Toaster } from "sonner";

export function Layout() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <CateringProvider>
      <div className="min-h-screen text-white w-full max-w-[100vw] overflow-x-hidden pb-24">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-8 bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 sm:p-3 rounded-xl shadow-[0_4px_10px_rgba(234,88,12,0.3)] border border-orange-300/30">
                <ChefHat className="size-6 sm:size-8 text-white" />
              </div>
              <div>
                <h1 className="text-white text-lg sm:text-2xl font-semibold drop-shadow-md">Catering Scheduler</h1>
                <p className="text-orange-200/80 text-xs sm:text-sm">Manage your catering events and menu items</p>
              </div>
            </div>
            {isInstallable && (
              <Button 
                onClick={handleInstallClick} 
                size="sm"
                className="shrink-0"
              >
                <Download className="size-4 mr-2 hidden sm:inline-block" />
                Install App
              </Button>
            )}
          </div>

          <Outlet />

          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.5)] pb-safe">
            <div className="flex h-16 w-full items-center justify-around px-2">
              <NavLink 
                to="/"
                end
                className={({ isActive }) => `flex flex-col flex-1 items-center justify-center h-full transition-all duration-200 border-t-2 ${isActive ? 'text-orange-500 border-orange-500 scale-110 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
                aria-label="Schedule Events"
              >
                <Calendar className="size-6" />
              </NavLink>
              
              <NavLink 
                to="/upcoming"
                className={({ isActive }) => `flex flex-col flex-1 items-center justify-center h-full transition-all duration-200 border-t-2 ${isActive ? 'text-orange-500 border-orange-500 scale-110 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
                aria-label="Upcoming Events"
              >
                <Clock className="size-6" />
              </NavLink>

              <NavLink 
                to="/food-items"
                className={({ isActive }) => `flex flex-col flex-1 items-center justify-center h-full transition-all duration-200 border-t-2 ${isActive ? 'text-orange-500 border-orange-500 scale-110 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
                aria-label="Food Items"
              >
                <UtensilsCrossed className="size-6" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      <Toaster theme="dark" />
    </CateringProvider>
  );
}
