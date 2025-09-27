'use client';

import { useVibePoints } from '@/hooks/use-vibe-points';

interface AnnotationRewardProps {
  onAnnotationComplete?: () => void;
  points?: number;
  description?: string;
}

export default function AnnotationReward({ 
  onAnnotationComplete, 
  points = 100,
  description = 'Text annotation completed'
}: AnnotationRewardProps) {
  const { awardVibePoints, isConnected } = useVibePoints();

  const handleAnnotationSubmit = async () => {
    if (!isConnected) {
      return;
    }

    // Award vibe points for completing annotation
    const success = await awardVibePoints(points, description);
    
    if (success && onAnnotationComplete) {
      onAnnotationComplete();
    }
  };

  if (!isConnected) {
    return (
      <button 
        disabled
        className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed"
      >
        Connect wallet to earn rewards
      </button>
    );
  }

  return (
    <button 
      onClick={handleAnnotationSubmit}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors font-medium"
    >
      Complete Annotation (+{points} VP)
    </button>
  );
}
