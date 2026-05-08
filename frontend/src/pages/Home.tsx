import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <>
    <Navbar />
    <section className="relative min-h-[calc(100vh-4rem)] sm:min-h-screen flex items-center justify-center overflow-hidden py-8 sm:py-12">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Master Poker Against
            <span className="block text-transparent bg-clip-text bg-yellow-500">
              Intelligent AI Opponents
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto px-2">
            Practice Texas Hold'em anytime, anywhere. No downloads. No real money. Just pure poker skill improvement against advanced AI players.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mt-8 sm:mt-12">
          <Button size="lg" className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 bg-yellow-600 hover:bg-amber-500 text-white shadow-2xl transform hover:scale-105 transition-all w-full sm:w-auto">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            Play Free Now
          </Button>
          <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 border-2 border-yellow-600 text-yellow-500 hover:bg-yellow-500/10 w-full sm:w-auto">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            View AI Profiles
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-10 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-400">100%</div>
            <div className="text-xs sm:text-sm md:text-base text-gray-400 mt-1">Free to Play</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-400">8</div>
            <div className="text-xs sm:text-sm md:text-base text-gray-400 mt-1">Unique AI Opponents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-400">24/7</div>
            <div className="text-xs sm:text-sm md:text-base text-gray-400 mt-1">Instant Play</div>
          </div>
        </div>
      </div>
    </section>
    </>    
  );
}