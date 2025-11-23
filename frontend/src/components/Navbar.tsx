import { Button } from '@/components/ui/button';
import { Coins, Menu, X, Play } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-green-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              PokerAI
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-to-play" className="text-gray-300 hover:text-emerald-400 transition-colors">How to Play</a>
            <a href="#ai-opponents" className="text-gray-300 hover:text-emerald-400 transition-colors">AI Opponents</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg">
              <Play className="w-4 h-4 mr-2" />
              Play Now
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-green-900/50">
          <div className="px-4 py-6 space-y-4">
            <a href="#features" className="block text-gray-300 hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-to-play" className="block text-gray-300 hover:text-emerald-400 transition-colors">How to Play</a>
            <a href="#ai-opponents" className="block text-gray-300 hover:text-emerald-400 transition-colors">AI Opponents</a>
            <div className="pt-4 space-y-3">
              <Button variant="outline" className="w-full border-emerald-500 text-emerald-400">Sign In</Button>
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600">
                <Play className="w-4 h-4 mr-2" /> Play Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}