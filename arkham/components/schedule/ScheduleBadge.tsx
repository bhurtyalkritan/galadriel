'use client';

import React from 'react';
import { Schedule } from '@/types';
import { Clock, Calendar, Repeat, CheckCircle2 } from 'lucide-react';

interface ScheduleBadgeProps {
  schedule?: Schedule;
  onClick?: () => void;
}

export function ScheduleBadge({ schedule, onClick }: ScheduleBadgeProps) {
  if (!schedule?.enabled) {
    return (
      <button
        onClick={onClick}
        className="px-2 py-1 text-xs text-gray-400 hover:text-gray-300 border border-gray-700 hover:border-gray-600 rounded transition-colors flex items-center gap-1"
        title="Configure schedule"
      >
        <Clock className="w-3 h-3" />
        <span>No schedule</span>
      </button>
    );
  }
  
  const getScheduleText = () => {
    switch (schedule.type) {
      case 'interval':
        return `Every ${schedule.intervalValue} ${schedule.intervalUnit}`;
      case 'daily':
        return `Daily at ${schedule.dailyTime}`;
      case 'weekly': {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = schedule.weeklyDays?.map(d => dayNames[d]).join(', ') || '';
        return `${days} at ${schedule.weeklyTime}`;
      }
      case 'monthly': {
        const days = schedule.monthlyDays?.join(', ') || '';
        return `Day ${days} at ${schedule.monthlyTime}`;
      }
      default:
        return 'Scheduled';
    }
  };
  
  const getIcon = () => {
    switch (schedule.type) {
      case 'interval':
        return Repeat;
      case 'daily':
        return Clock;
      case 'weekly':
      case 'monthly':
        return Calendar;
      default:
        return Clock;
    }
  };
  
  const Icon = getIcon();
  
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/50 rounded transition-colors flex items-center gap-1.5"
      title={`Click to edit schedule: ${getScheduleText()}`}
    >
      <Icon className="w-3 h-3" />
      <span className="max-w-[120px] truncate">{getScheduleText()}</span>
      <CheckCircle2 className="w-3 h-3" />
    </button>
  );
}
