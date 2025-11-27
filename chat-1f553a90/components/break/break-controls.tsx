'use client';

import React, { useState } from 'react';
import { Coffee, Utensils, Clock, Plus, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBreak } from '@/contexts/BreakContext';
import { formatBreakDuration, getBreakTypeIcon, validateBreakTime } from '@/lib/break-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BreakControlsProps {
  compact?: boolean;
  className?: string;
}

export function BreakControls({ compact = false, className }: BreakControlsProps) {
  // Mock user for demo purposes
  const mockUser = { id: 'demo-user-id', name: 'Demo User' };
  const {
    isOnBreak,
    stats,
    startLunchBreak,
    startShortBreak,
    endLunchBreak,
    endShortBreak,
    skipBreak,
  } = useBreak();

  const [lunchModalOpen, setLunchModalOpen] = useState(false);
  const [shortBreakModalOpen, setShortBreakModalOpen] = useState(false);
  const [lunchDescription, setLunchDescription] = useState('');
  const [shortBreakDuration, setShortBreakDuration] = useState(15);
  const [shortBreakDescription, setShortBreakDescription] = useState('');

  const presetDurations = [5, 10, 15, 20];

  if (!user) {
    return null;
  }

  const handleStartLunchBreak = async () => {
    try {
      await startLunchBreak(lunchDescription || undefined);
      setLunchDescription('');
      setLunchModalOpen(false);
    } catch (error) {
      console.error('Error starting lunch break:', error);
    }
  };

  const handleStartShortBreak = async (duration: number) => {
    try {
      await startShortBreak(duration, shortBreakDescription || undefined);
      setShortBreakDescription('');
      setShortBreakModalOpen(false);
    } catch (error) {
      console.error('Error starting short break:', error);
    }
  };

  if (isOnBreak) {
    return (
      <Card className={`border-warning bg-warning/10 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                {getBreakTypeIcon('short')}
              </div>
              <div>
                <p className="font-medium">Currently on break</p>
                <p className="text-sm text-muted-foreground">
                  Take your time to recharge
                </p>
              </div>
            </div>
            <Button variant="destructive" onClick={skipBreak}>
              End Break
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {/* Quick Lunch Break Button */}
        <Dialog open={lunchModalOpen} onOpenChange={setLunchModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex-1"
              disabled={stats.lunchBreakTaken}
            >
              <Utensils className="h-4 w-4 mr-2" />
              Lunch
              {stats.lunchBreakTaken && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  ✓
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Lunch Break</DialogTitle>
              <DialogDescription>
                Take a 30-60 minute lunch break to recharge.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lunch-description">Description (optional)</Label>
                <Textarea
                  id="lunch-description"
                  placeholder="e.g., Team lunch at cafe, Running errands..."
                  value={lunchDescription}
                  onChange={(e) => setLunchDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setLunchModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStartLunchBreak} className="flex-1">
                  <Utensils className="h-4 w-4 mr-2" />
                  Start Lunch Break
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Short Break Presets */}
        <div className="flex gap-1">
          {presetDurations.map((duration) => (
            <Button
              key={duration}
              variant="outline"
              size="sm"
              onClick={() => handleStartShortBreak(duration)}
            >
              {duration}m
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Break Management
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Today's Break Stats */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Today's Break Activity</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Breaks</p>
              <p className="text-2xl font-bold">{stats.totalBreaksToday}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="text-2xl font-bold">{formatBreakDuration(stats.totalBreakTimeToday)}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span className="text-sm">Lunch: {stats.lunchBreakTaken ? '✓ Taken' : 'Not taken'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              <span className="text-sm">Short: {stats.shortBreaksToday}</span>
            </div>
          </div>
        </div>

        {/* Lunch Break Section */}
        <div className="space-y-3">
          <Dialog open={lunchModalOpen} onOpenChange={setLunchModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                size="lg"
                variant={stats.lunchBreakTaken ? "secondary" : "default"}
                disabled={stats.lunchBreakTaken}
              >
                <Utensils className="h-5 w-5 mr-3" />
                {stats.lunchBreakTaken ? 'Lunch Break Already Taken' : 'Start Lunch Break'}
                {!stats.lunchBreakTaken && (
                  <span className="ml-auto text-sm opacity-75">(30-60 min)</span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start Lunch Break</DialogTitle>
                <DialogDescription>
                  Take a 30-60 minute lunch break to recharge and refuel.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lunch-description">Description (optional)</Label>
                  <Textarea
                    id="lunch-description"
                    placeholder="e.g., Team lunch at the cafe, Running errands, Home-cooked meal..."
                    value={lunchDescription}
                    onChange={(e) => setLunchDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    <strong>Remember:</strong> Step away from your desk during lunch to maximize the benefits of your break.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setLunchModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStartLunchBreak} className="flex-1">
                    <Utensils className="h-4 w-4 mr-2" />
                    Start Lunch Break
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Short Break Section */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            Short Breaks
          </h4>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {presetDurations.map((duration) => (
              <Button
                key={duration}
                variant="outline"
                onClick={() => handleStartShortBreak(duration)}
                className="h-12"
              >
                <Timer className="h-4 w-4 mr-2" />
                {duration} Minutes
              </Button>
            ))}
          </div>

          {/* Custom Short Break */}
          <Dialog open={shortBreakModalOpen} onOpenChange={setShortBreakModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Custom Short Break
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Custom Short Break</DialogTitle>
                <DialogDescription>
                  Set a custom duration for your short break (5-30 minutes).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="30"
                    value={shortBreakDuration}
                    onChange={(e) => setShortBreakDuration(parseInt(e.target.value) || 15)}
                  />
                  {validateBreakTime('short', shortBreakDuration).message && (
                    <p className="text-sm text-destructive mt-1">
                      {validateBreakTime('short', shortBreakDuration).message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="short-description">Description (optional)</Label>
                  <Textarea
                    id="short-description"
                    placeholder="e.g., Quick walk, Stretch break, Coffee run..."
                    value={shortBreakDescription}
                    onChange={(e) => setShortBreakDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShortBreakModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleStartShortBreak(shortBreakDuration)}
                    disabled={!validateBreakTime('short', shortBreakDuration).valid}
                    className="flex-1"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    Start Short Break
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Break Guidelines */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Break Guidelines</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Take short breaks every 60-90 minutes</li>
            <li>• Use lunch break for proper meal and rest</li>
            <li>• Avoid work activities during breaks</li>
            <li>• Step away from screen to reduce eye strain</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}