'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface SlotManagerProps {
  value: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export function SlotManager({ value, onChange }: SlotManagerProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: ''
  });

  const generateTimeSlots = (startTime: string, endTime: string, selectedDays: string[]) => {
    const slots: TimeSlot[] = [];
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);

    selectedDays.forEach(day => {
      for (let hour = start; hour < end; hour++) {
        const slotStartTime = `${hour.toString().padStart(2, '0')}:00`;
        const slotEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        slots.push({
          day,
          startTime: slotStartTime,
          endTime: slotEndTime
        });
      }
    });

    return slots;
  };

  const addSlots = () => {
    if (!newSlot.startTime || !newSlot.endTime || selectedDays.length === 0) {
      alert('Please select days and time range');
      return;
    }

    const start = parseInt(newSlot.startTime.split(':')[0]);
    const end = parseInt(newSlot.endTime.split(':')[0]);
    
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    const generatedSlots = generateTimeSlots(newSlot.startTime, newSlot.endTime, selectedDays);
    
    // Check for overlapping slots
    const hasOverlap = generatedSlots.some(newSlot => {
      return value.some(existingSlot => {
        return existingSlot.day === newSlot.day &&
          parseInt(existingSlot.startTime) < parseInt(newSlot.endTime) &&
          parseInt(existingSlot.endTime) > parseInt(newSlot.startTime);
      });
    });

    if (hasOverlap) {
      alert('Some slots overlap with existing slots. Please choose different times.');
      return;
    }

    onChange([...value, ...generatedSlots]);
    setNewSlot({ startTime: '', endTime: '' });
    setSelectedDays([]);
  };

  const removeSlot = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const getSlotsByDay = () => {
    const slotsByDay: { [key: string]: TimeSlot[] } = {};
    
    DAYS.forEach(day => {
      slotsByDay[day] = value
        .filter(slot => slot.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    
    return slotsByDay;
  };

  const slotsByDay = getSlotsByDay();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Available Time Slots
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Select days and time range to generate 1-hour slots automatically.
          </p>

          {/* Add New Slots */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-3">Add Time Slots</h4>
            
            {/* Day Selection */}
            <div className="mb-4">
              <h5 className="text-sm font-medium mb-2">Select Days</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedDays.includes(day)}
                      onCheckedChange={(checked) => {
                        setSelectedDays(
                          checked
                            ? [...selectedDays, day]
                            : selectedDays.filter(d => d !== day)
                        );
                      }}
                    />
                    <label className="text-sm">{day}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Range Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select 
                value={newSlot.startTime} 
                onValueChange={(startTime) => setNewSlot({...newSlot, startTime})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={newSlot.endTime} 
                onValueChange={(endTime) => setNewSlot({...newSlot, endTime})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={addSlots} className="bg-green-500 hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Generate Slots
              </Button>
            </div>
          </div>

          {/* Display Existing Slots by Day */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Current Schedule ({value.length} slots)</h4>
            
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
              {DAYS.map(day => {
                const daySlots = slotsByDay[day];
                return (
                  <div key={day} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{day}</h5>
                      <Badge variant="outline">
                        {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {daySlots.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {daySlots.map((slot, dayIndex) => {
                          const globalIndex = value.findIndex(s => 
                            s.day === slot.day && 
                            s.startTime === slot.startTime && 
                            s.endTime === slot.endTime
                          );
                          
                          return (
                            <div 
                              key={`${slot.day}-${slot.startTime}-${slot.endTime}`}
                              className="flex items-center justify-between bg-green-50 p-2 rounded border group hover:bg-green-100 transition-colors"
                            >
                              <span className="text-sm text-green-800 font-medium">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSlot(globalIndex)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No slots available</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {value.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                No time slots added yet. Add your first slot above.
              </p>
            </div>
          )}

          {value.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                💡 Pro Tips:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Consider peak hours (evenings and weekends) for better bookings</li>
                <li>• Allow buffer time between slots for cleaning and setup</li>
                <li>• Different sports may need different slot durations</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}