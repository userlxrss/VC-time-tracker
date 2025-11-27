'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Coffee, Utensils, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBreak } from '@/contexts/BreakContext';
import { formatBreakDuration, getBreakTypeIcon, getBreakTypeLabel, getBreakTypeColor } from '@/lib/break-utils';
import { formatDate, formatTime } from '@/lib/utils';

interface BreakHistoryProps {
  days?: number;
  showExport?: boolean;
  className?: string;
}

export function BreakHistory({ days = 7, showExport = true, className }: BreakHistoryProps) {
  const { getBreaksHistory, exportBreakData } = useBreak();
  const [filterType, setFilterType] = useState<'all' | 'lunch' | 'short'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const breaks = useMemo(() => {
    return getBreaksHistory(days);
  }, [getBreaksHistory, days]);

  const filteredBreaks = useMemo(() => {
    return breaks.filter(breakItem => {
      const matchesType = filterType === 'all' || breakItem.type === filterType;
      const matchesSearch = !searchTerm ||
        breakItem.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [breaks, filterType, searchTerm]);

  const handleExport = () => {
    const data = exportBreakData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `break-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const groupedBreaks = useMemo(() => {
    const groups: { [date: string]: typeof filteredBreaks } = {};
    filteredBreaks.forEach(breakItem => {
      const date = formatDate(new Date(breakItem.startTime));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(breakItem);
    });
    return groups;
  }, [filteredBreaks]);

  if (breaks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Break History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No break history found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your break history will appear here once you start taking breaks
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Break History ({days} days)
          </CardTitle>
          {showExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search break descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-32">
            <Label htmlFor="filter">Filter by</Label>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger id="filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Breaks</p>
            <p className="text-2xl font-bold">{filteredBreaks.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold">
              {formatBreakDuration(
                filteredBreaks.reduce((sum, b) => sum + (b.duration || 0), 0)
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Average Length</p>
            <p className="text-2xl font-bold">
              {formatBreakDuration(
                Math.round(
                  filteredBreaks.reduce((sum, b) => sum + (b.duration || 0), 0) /
                  filteredBreaks.length || 0
                )
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Lunch Breaks</p>
            <p className="text-2xl font-bold">
              {filteredBreaks.filter(b => b.type === 'lunch').length}
            </p>
          </div>
        </div>

        {/* Break List Grouped by Date */}
        <div className="space-y-4">
          {Object.entries(groupedBreaks).map(([date, dateBreaks]) => (
            <div key={date} className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">{date}</h4>
              <div className="space-y-2">
                {dateBreaks.map((breakItem) => (
                  <BreakItem key={breakItem.id} break={breakItem} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredBreaks.length === 0 && breaks.length > 0 && (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No breaks match your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setFilterType('all');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BreakItemProps {
  break: {
    id: string;
    type: 'lunch' | 'short';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    description?: string;
    isActive: boolean;
    date: string;
  };
}

function BreakItem({ break: breakItem }: BreakItemProps) {
  const isLunchBreak = breakItem.type === 'lunch';
  const isActive = breakItem.isActive;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        {/* Break Icon */}
        <div className={`text-2xl ${isActive ? 'animate-pulse' : ''}`}>
          {getBreakTypeIcon(breakItem.type)}
        </div>

        {/* Break Details */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={isLunchBreak ? 'secondary' : 'outline'}
              className={getBreakTypeColor(breakItem.type)}
            >
              {getBreakTypeLabel(breakItem.type)}
            </Badge>
            {isActive && (
              <Badge variant="outline" className="animate-pulse-soft">
                Active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(new Date(breakItem.startTime))}
            </span>
            {breakItem.endTime && (
              <span>- {formatTime(new Date(breakItem.endTime))}</span>
            )}
            {breakItem.duration && (
              <span className="font-medium">
                ({formatBreakDuration(breakItem.duration)})
              </span>
            )}
          </div>

          {breakItem.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {breakItem.description}
            </p>
          )}
        </div>
      </div>

      {/* Duration Badge */}
      {breakItem.duration && (
        <Badge variant="outline" className="text-lg px-3 py-1">
          {formatBreakDuration(breakItem.duration)}
        </Badge>
      )}
    </div>
  );
}