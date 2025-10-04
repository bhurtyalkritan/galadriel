'use client';

import React, { useState, useEffect } from 'react';
import { Schedule } from '@/types';
import { Clock, Calendar, Repeat, X, Check } from 'lucide-react';

interface ScheduleEditorProps {
  schedule?: Schedule;
  onSave: (schedule: Schedule) => void;
  onClose: () => void;
}

export function ScheduleEditor({ schedule, onSave, onClose }: ScheduleEditorProps) {
  const [enabled, setEnabled] = useState(schedule?.enabled || false);
  const [type, setType] = useState<Schedule['type']>(schedule?.type || 'interval');
  
  // Interval states
  const [intervalValue, setIntervalValue] = useState(schedule?.intervalValue || 1);
  const [intervalUnit, setIntervalUnit] = useState<'minutes' | 'hours' | 'days'>(
    schedule?.intervalUnit || 'hours'
  );
  
  // Daily states
  const [dailyTime, setDailyTime] = useState(schedule?.dailyTime || '09:00');
  
  // Weekly states
  const [weeklyDays, setWeeklyDays] = useState<number[]>(schedule?.weeklyDays || [1]);
  const [weeklyTime, setWeeklyTime] = useState(schedule?.weeklyTime || '09:00');
  
  // Monthly states
  const [monthlyDays, setMonthlyDays] = useState<number[]>(schedule?.monthlyDays || [1]);
  const [monthlyTime, setMonthlyTime] = useState(schedule?.monthlyTime || '09:00');
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const toggleWeeklyDay = (day: number) => {
    setWeeklyDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };
  
  const toggleMonthlyDay = (day: number) => {
    setMonthlyDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };
  
  const handleSave = () => {
    const newSchedule: Schedule = {
      enabled,
      type,
    };
    
    if (type === 'interval') {
      newSchedule.intervalValue = intervalValue;
      newSchedule.intervalUnit = intervalUnit;
    } else if (type === 'daily') {
      newSchedule.dailyTime = dailyTime;
    } else if (type === 'weekly') {
      newSchedule.weeklyDays = weeklyDays;
      newSchedule.weeklyTime = weeklyTime;
    } else if (type === 'monthly') {
      newSchedule.monthlyDays = monthlyDays;
      newSchedule.monthlyTime = monthlyTime;
    }
    
    onSave(newSchedule);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200]">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Schedule Settings</h2>
              <p className="text-sm text-gray-400">Configure automatic execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div>
              <p className="text-sm font-medium text-white">Enable Scheduling</p>
              <p className="text-xs text-gray-400 mt-1">Automatically run this node/group</p>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                enabled ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  enabled ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
          
          {/* Schedule Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Schedule Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'interval', label: 'Interval', icon: Repeat },
                { value: 'daily', label: 'Daily', icon: Clock },
                { value: 'weekly', label: 'Weekly', icon: Calendar },
                { value: 'monthly', label: 'Monthly', icon: Calendar },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setType(value as Schedule['type'])}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    type === value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                  disabled={!enabled}
                >
                  <Icon className={`w-5 h-5 ${type === value ? 'text-purple-400' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${type === value ? 'text-white' : 'text-gray-300'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Interval Configuration */}
          {type === 'interval' && (
            <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <label className="text-sm font-medium text-white">Run Every</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(parseInt(e.target.value) || 1)}
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  disabled={!enabled}
                />
                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value as any)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  disabled={!enabled}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              <p className="text-xs text-gray-400">
                Will run every {intervalValue} {intervalUnit}
              </p>
            </div>
          )}
          
          {/* Daily Configuration */}
          {type === 'daily' && (
            <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Time of Day
              </label>
              <input
                type="time"
                value={dailyTime}
                onChange={(e) => setDailyTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg focus:border-purple-500 focus:outline-none"
                disabled={!enabled}
              />
              <p className="text-xs text-gray-400">
                Will run every day at {dailyTime}
              </p>
            </div>
          )}
          
          {/* Weekly Configuration */}
          {type === 'weekly' && (
            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Days of Week
              </label>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => toggleWeeklyDay(index)}
                    className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                      weeklyDays.includes(index)
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                    disabled={!enabled}
                  >
                    <span className={`text-xs font-medium ${
                      weeklyDays.includes(index) ? 'text-purple-400' : 'text-gray-400'
                    }`}>
                      {day}
                    </span>
                  </button>
                ))}
              </div>
              
              <label className="text-sm font-medium text-white flex items-center gap-2 mt-4">
                <Clock className="w-4 h-4 text-purple-400" />
                Time
              </label>
              <input
                type="time"
                value={weeklyTime}
                onChange={(e) => setWeeklyTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg focus:border-purple-500 focus:outline-none"
                disabled={!enabled}
              />
              <p className="text-xs text-gray-400">
                Will run on {weeklyDays.map(d => dayNames[d]).join(', ')} at {weeklyTime}
              </p>
            </div>
          )}
          
          {/* Monthly Configuration */}
          {type === 'monthly' && (
            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Days of Month
              </label>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleMonthlyDay(day)}
                    className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center ${
                      monthlyDays.includes(day)
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                    disabled={!enabled}
                  >
                    <span className={`text-xs font-medium ${
                      monthlyDays.includes(day) ? 'text-purple-400' : 'text-gray-400'
                    }`}>
                      {day}
                    </span>
                  </button>
                ))}
              </div>
              
              <label className="text-sm font-medium text-white flex items-center gap-2 mt-4">
                <Clock className="w-4 h-4 text-purple-400" />
                Time
              </label>
              <input
                type="time"
                value={monthlyTime}
                onChange={(e) => setMonthlyTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg focus:border-purple-500 focus:outline-none"
                disabled={!enabled}
              />
              <p className="text-xs text-gray-400">
                Will run on day {monthlyDays.join(', ')} of each month at {monthlyTime}
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
