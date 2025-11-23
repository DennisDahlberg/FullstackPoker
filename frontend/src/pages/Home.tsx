import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-900/20 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Master Poker Against
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
              Intelligent AI Opponents
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Practice Texas Hold'em anytime, anywhere. No downloads. No real money. Just pure poker skill improvement against advanced AI players.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-2xl transform hover:scale-105 transition-all">
            <Play className="w-6 h-6 mr-3" />
            Play Free Now
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
            <Sparkles className="w-6 h-6 mr-3" />
            View AI Profiles
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400">100%</div>
            <div className="text-gray-400">Free to Play</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400">8</div>
            <div className="text-gray-400">Unique AI Opponents</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400">24/7</div>
            <div className="text-gray-400">Instant Play</div>
          </div>
        </div>
      </div>
    </section>
  );
}