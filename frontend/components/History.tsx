import React from 'react';
import { MigraineEntry } from '../types';
import { Trash2, AlertTriangle, Pencil } from 'lucide-react';

interface HistoryProps {
  entries: MigraineEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: MigraineEntry) => void;
}

export const History: React.FC<HistoryProps> = ({ entries, onDelete, onEdit }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
        No history available.
      </div>
    );
  }

  // Sort descending by date
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {sortedEntries.map((entry) => {
        const dateObj = new Date(entry.date);
        const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

        return (
          <div key={entry.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors relative group">
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit(entry)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Edit entry"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  if(window.confirm('Are you sure you want to delete this entry?')) {
                    onDelete(entry.id);
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Delete entry"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pr-20">
              
              {/* Left Col: Date & Core Stats */}
              <div className="flex-shrink-0 md:w-48">
                <div className="font-semibold text-slate-900">{dateStr}</div>
                <div className="text-sm text-slate-500 mb-2">{timeStr}</div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-800">
                    {entry.durationHours} hrs
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                    entry.severity >= 8 ? 'bg-red-100 text-red-800' : 
                    entry.severity >= 5 ? 'bg-amber-100 text-amber-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    Severity: {entry.severity}/10
                  </span>
                </div>
                
                {entry.prostrating && (
                  <div className="mt-3 inline-flex items-center text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    PROSTRATING
                  </div>
                )}
              </div>

              {/* Right Col: Details */}
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Symptoms</h4>
                  <p className="text-slate-600">{entry.symptoms.length > 0 ? entry.symptoms.join(', ') : 'None recorded'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Triggers</h4>
                  <p className="text-slate-600">{entry.triggers.length > 0 ? entry.triggers.join(', ') : 'None recorded'}</p>
                </div>
                {entry.medication && (
                  <div className="sm:col-span-2">
                    <h4 className="font-medium text-slate-700 mb-1">Medication</h4>
                    <p className="text-slate-600">{entry.medication}</p>
                  </div>
                )}
                {entry.notes && (
                  <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <h4 className="font-medium text-slate-700 mb-1">Notes</h4>
                    <p className="text-slate-600 italic">{entry.notes}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
