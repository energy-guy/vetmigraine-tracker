import React, { useState, useEffect } from 'react';
import { MigraineEntry } from '../types';
import { SYMPTOMS, TRIGGERS } from '../constants';
import { Info, Save, X } from 'lucide-react';

interface EntryFormProps {
  initialData?: MigraineEntry | null;
  onSave: (entry: Omit<MigraineEntry, 'id'>, id?: string) => void;
  onCancel?: () => void;
}

// Helper to get local datetime string for the input field
const getLocalDatetime = (dateString?: string) => {
  const d = dateString ? new Date(dateString) : new Date();
  const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

export const EntryForm: React.FC<EntryFormProps> = ({ initialData, onSave, onCancel }) => {
  const [date, setDate] = useState(getLocalDatetime());
  const [durationHours, setDurationHours] = useState<number | ''>('');
  const [severity, setSeverity] = useState<number>(5);
  const [prostrating, setProstrating] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [medication, setMedication] = useState('');
  const [notes, setNotes] = useState('');

  // Populate form if editing an existing entry
  useEffect(() => {
    if (initialData) {
      setDate(getLocalDatetime(initialData.date));
      setDurationHours(initialData.durationHours);
      setSeverity(initialData.severity);
      setProstrating(initialData.prostrating);
      setSelectedSymptoms(initialData.symptoms);
      setSelectedTriggers(initialData.triggers);
      setMedication(initialData.medication);
      setNotes(initialData.notes);
    } else {
      // Reset to defaults if switching to "Add" mode
      setDate(getLocalDatetime());
      setDurationHours('');
      setSeverity(5);
      setProstrating(false);
      setSelectedSymptoms([]);
      setSelectedTriggers([]);
      setMedication('');
      setNotes('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date: new Date(date).toISOString(), // Convert back to standard ISO string
      durationHours: Number(durationHours) || 0,
      severity,
      prostrating,
      symptoms: selectedSymptoms,
      triggers: selectedTriggers,
      medication,
      notes
    }, initialData?.id);
  };

  const toggleArrayItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">
      
      {/* Date & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date & Time of Onset</label>
          <input 
            type="datetime-local" 
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Hours)</label>
          <input 
            type="number" 
            min="0"
            step="0.5"
            required
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g., 4.5"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Severity */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-700">Severity (1-10)</label>
          <span className="text-lg font-bold text-blue-600">{severity}</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>1 (Mild)</span>
          <span>5 (Moderate)</span>
          <span>10 (Severe)</span>
        </div>
      </div>

      {/* Prostrating Toggle - CRITICAL FOR VA */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input 
              id="prostrating" 
              type="checkbox" 
              checked={prostrating}
              onChange={(e) => setProstrating(e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="prostrating" className="font-bold text-slate-900 cursor-pointer text-base">
              Was this a Prostrating attack?
            </label>
            <p className="text-slate-600 mt-1 flex items-start">
              <Info className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 text-blue-500" />
              <span>VA Definition: An attack so severe it requires you to stop all activity and seek a dark, quiet room to rest. This is a key factor in disability ratings.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Symptoms & Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Symptoms</label>
          <div className="space-y-2">
            {SYMPTOMS.map(symptom => (
              <label key={symptom} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={selectedSymptoms.includes(symptom)}
                  onChange={() => toggleArrayItem(selectedSymptoms, setSelectedSymptoms, symptom)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{symptom}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Potential Triggers</label>
          <div className="space-y-2">
            {TRIGGERS.map(trigger => (
              <label key={trigger} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={selectedTriggers.includes(trigger)}
                  onChange={() => toggleArrayItem(selectedTriggers, setSelectedTriggers, trigger)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{trigger}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Medication & Notes */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Medication Taken & Effectiveness</label>
          <input 
            type="text" 
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            placeholder="e.g., Sumatriptan 50mg - helped after 2 hours"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any other details about the attack, impact on work/life, etc."
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
        <button 
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center"
        >
          <Save className="w-5 h-5 mr-2" />
          {initialData ? 'Update Entry' : 'Save Entry'}
        </button>
        
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
