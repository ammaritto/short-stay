import React from 'react';
import { MapPin, Calendar, Users, ArrowRight, Star, Sparkles, Heart, Shield } from 'lucide-react';

interface HeroSectionProps {
  onScrollToSearch: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToSearch }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 rounded-full">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-2" />
            <span className="text-sm font-medium">Trusted by 1,000+ guests</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="text-gray-800">Your Stay Awaits</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Discover our short stays at Allihoop
        </p>

        <button
          onClick={onScrollToSearch}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Find Your Stay
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
        
        
      </div>
    </div>
  );
};

export default HeroSection;