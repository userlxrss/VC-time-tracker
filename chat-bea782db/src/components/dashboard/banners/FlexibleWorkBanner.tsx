/**
 * Flexible Work Banner Component
 *
 * Displays motivational messaging focused on flexible work culture,
 * celebrating different work patterns and encouraging productivity.
 */

import React from 'react';

interface FlexibleWorkBannerProps {
  message: string;
  workPattern: 'early-bird' | 'night-owl' | 'flexer' | 'newcomer';
}

const FlexibleWorkBanner: React.FC<FlexibleWorkBannerProps> = ({
  message,
  workPattern
}) => {
  const getBannerContent = () => {
    switch (workPattern) {
      case 'early-bird':
        return {
          bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-200',
          icon: '🌅',
          title: 'Early Bird Energy',
          description: 'You\'re crushing it in the morning! Your focus and dedication shine bright.'
        };
      case 'night-owl':
        return {
          bgColor: 'bg-gradient-to-r from-indigo-50 to-purple-50',
          borderColor: 'border-indigo-200',
          icon: '🦉',
          title: 'Night Owl Productivity',
          description: 'Your quiet focus hours are paying off! Great work finding your rhythm.'
        };
      case 'flexer':
        return {
          bgColor: 'bg-gradient-to-r from-green-50 to-teal-50',
          borderColor: 'border-green-200',
          icon: '🌈',
          title: 'Flexible Worker Excellence',
          description: 'Your adaptability and results-driven approach are inspiring!'
        };
      default:
        return {
          bgColor: 'bg-gradient-to-r from-blue-50 to-purple-50',
          borderColor: 'border-blue-200',
          icon: '🌟',
          title: 'Building Your Success',
          description: 'Every hour worked builds your unique success story!'
        };
    }
  };

  const bannerContent = getBannerContent();

  return (
    <div className={`${bannerContent.bgColor} border ${bannerContent.borderColor} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <span className="text-4xl">{bannerContent.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {bannerContent.title}
          </h3>
          <p className="text-gray-700 mb-2">
            {bannerContent.description}
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 italic">
              "{message}"
            </p>
          </div>
        </div>
      </div>

      {/* Flexible Work Philosophy Statement */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <span className="text-lg">🏆</span>
            <span>Results matter</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <span className="text-lg">⏰</span>
            <span>Flexible hours</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <span className="text-lg">💪</span>
            <span>Your pace</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <span className="text-lg">🎯</span>
            <span>Goals focused</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexibleWorkBanner;