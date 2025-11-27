'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Pause, Play, SkipForward, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBreak } from '@/contexts/BreakContext';
import { formatBreakTime, getBreakTypeIcon, getBreakTypeLabel, getBreakTypeColor } from '@/lib/break-utils';

interface BreakTimerProps {
  compact?: boolean;
  className?: string;
}

export function BreakTimer({ compact = false, className }: BreakTimerProps) {
  const {
    isOnBreak,
    breakTimer,
    currentActiveBreak,
    endLunchBreak,
    pauseShortBreak,
    resumeShortBreak,
    endShortBreak,
    skipBreak,
  } = useBreak();

  const [isPaused, setIsPaused] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);

  // Handle pause state from localStorage
  useEffect(() => {
    const pausedData = localStorage.getItem('vc-paused-break');
    setIsPaused(!!pausedData);
  }, [isOnBreak]);

  // Calculate progress
  useEffect(() => {
    if (currentActiveBreak?.duration) {
      setTotalDuration(currentActiveBreak.duration * 60);
    }
  }, [currentActiveBreak]);

  if (!isOnBreak || !currentActiveBreak) {
    return null;
  }

  const progress = totalDuration > 0 ? ((totalDuration - breakTimer) / totalDuration) * 100 : 0;
  const isLunchBreak = currentActiveBreak.type === 'lunch';

  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        await resumeShortBreak();
        setIsPaused(false);
      } else if (!isLunchBreak) {
        await pauseShortBreak();
        setIsPaused(true);
      }
    } catch (error) {
      console.error('Error pausing/resuming break:', error);
    }
  };

  const handleEndBreak = async () => {
    try {
      if (isLunchBreak) {
        await endLunchBreak();
      } else {
        await endShortBreak();
      }
      setIsPaused(false);
    } catch (error) {
      console.error('Error ending break:', error);
    }
  };

  const handleSkipBreak = async () => {
    try {
      await skipBreak();
      setIsPaused(false);
    } catch (error) {
      console.error('Error skipping break:', error);
    }
  };

  if (compact) {
    return (
      <Card className={`${getBreakTypeBgColor(currentActiveBreak.type)} border animate-pulse-soft ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-pulse">{getBreakTypeIcon(currentActiveBreak.type)}</span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {getBreakTypeLabel(currentActiveBreak.type)}
                </p>
                <p className={`text-2xl font-bold ${getBreakTypeColor(currentActiveBreak.type)}`}>
                  {formatBreakTime(breakTimer)}
                </p>
              </div>
            </div>

            <div className="flex-1">
              {!isLunchBreak && (
                <Progress value={progress} className="h-2" />
              )}
            </div>

            <div className="flex gap-1">
              {!isLunchBreak && (
                <Button size="sm" variant="outline" onClick={handlePauseResume}>
                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={handleEndBreak}>
                <Square className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${getBreakTypeBgColor(currentActiveBreak.type)} border-2 shadow-lg animate-slide-in ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl animate-pulse">{getBreakTypeIcon(currentActiveBreak.type)}</span>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {getBreakTypeLabel(currentActiveBreak.type)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isLunchBreak ? 'Take your time to recharge' : 'Quick refresh break'}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`${getBreakTypeColor(currentActiveBreak.type)} border-current animate-pulse-soft`}
          >
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Large Timer Display */}
        <div className="text-center">
          <div className={`text-6xl font-bold ${getBreakTypeColor(currentActiveBreak.type)} tabular-nums`}>
            {formatBreakTime(breakTimer)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isPaused ? 'Break paused' : isLunchBreak ? 'No time limit' : 'Time remaining'}
          </p>
        </div>

        {/* Progress Bar for Short Breaks */}
        {!isLunchBreak && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress
              value={isPaused ? 0 : progress}
              className={`h-3 ${isPaused ? 'opacity-50' : ''}`}
            />
          </div>
        )}

        {/* Break Description */}
        {currentActiveBreak.description && (
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              {currentActiveBreak.description}
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isLunchBreak && (
            <>
              <Button
                variant="outline"
                onClick={handlePauseResume}
                className="flex-1"
                disabled={isPaused && isLunchBreak}
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkipBreak}
                className="flex-1"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Skip
              </Button>
            </>
          )}

          <Button
            variant="destructive"
            onClick={handleEndBreak}
            className={isLunchBreak ? 'w-full' : 'flex-1'}
          >
            <Square className="h-4 w-4 mr-2" />
            End {getBreakTypeLabel(currentActiveBreak.type)}
          </Button>
        </div>

        {/* Break Tips */}
        <div className="bg-background/30 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">Break Tips 💡</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {isLunchBreak ? (
              <>
                <li>• Eat a nutritious meal away from your desk</li>
                <li>• Take a short walk to refresh your mind</li>
                <li>• Avoid work-related activities during lunch</li>
              </>
            ) : (
              <>
                <li>• Stand up and stretch your body</li>
                <li>• Look away from the screen (20-20-20 rule)</li>
                <li>• Take deep breaths to reduce stress</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}