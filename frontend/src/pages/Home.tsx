import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Master Poker Against
            <span className="block text-transparent bg-clip-text bg-yellow-500">
              Intelligent AI Opponents
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Practice Texas Hold'em anytime, anywhere. No downloads. No real money. Just pure poker skill improvement against advanced AI players.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Button size="lg" className="text-lg px-8 py-6 bg-yellow-600 hover:bg-amber-500 text-white shadow-2xl transform hover:scale-105 transition-all">
            <Play className="w-6 h-6 mr-3" />
            Play Free Now
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-yellow-600 text-yellow-500 hover:bg-yellow-500/10">
            <Sparkles className="w-6 h-6 mr-3" />
            View AI Profiles
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400">100%</div>
            <div className="text-gray-400">Free to Play</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400">8</div>
            <div className="text-gray-400">Unique AI Opponents</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400">24/7</div>
            <div className="text-gray-400">Instant Play</div>
          </div>
        </div>
      </div>
    </section>
  );
}