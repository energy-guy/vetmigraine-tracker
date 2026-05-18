import React, { useState, useEffect } from 'react';
import { MigraineEntry, TabType } from './types';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { History } from './components/History';
import { generateVAPdf } from './utils/pdfExport';
import { Activity, PlusCircle, List, Download, ShieldAlert, Pencil, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'vetmigraine_data';

export default function App() {
  const [entries, setEntries] = useState<MigraineEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [editingEntry, setEditingEntry] = useState<MigraineEntry | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  // Load data on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored entries", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Helper to synchronously save to local storage
  const persistEntries = (newEntries: MigraineEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    
    // Show a brief "Saved" indicator
    setShowSavedIndicator(true);
    setTimeout(() => setShowSavedIndicator(false), 3000);
  };

  const handleSaveEntry = (entryData: Omit<MigraineEntry, 'id'>, id?: string) => {
    let updatedEntries: MigraineEntry[];
    
    if (id) {
      // Update existing entry
      updatedEntries = entries.map(e => e.id === id ? { ...entryData, id } : e);
    } else {
      // Add new entry
      const newEntry: MigraineEntry = {
        ...entryData,
        id: crypto.randomUUID()
      };
      updatedEntries = [...entries, newEntry];
    }
    
    setEntries(updatedEntries);
    persistEntries(updatedEntries); // Save immediately to prevent data loss if closed quickly
    setEditingEntry(null);
    setActiveTab('history'); // Redirect to history after saving
  };

  const handleEditEntry = (entry: MigraineEntry) => {
    setEditingEntry(entry);
    setActiveTab('add');
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(e => e.id !== id);
    setEntries(updatedEntries);
    persistEntries(updatedEntries); // Save immediately
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setActiveTab('history');
  };

  const handleExportPDF = () => {
    if (entries.length === 0) {
      alert("No entries to export.");
      return;
    }
    generateVAPdf(entries);
  };

  if (!isLoaded) return null; // Prevent hydration mismatch or flash

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">VetMigraine Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Saved Indicator */}
            <div className={`flex items-center text-green-400 text-sm font-medium transition-opacity duration-300 ${showSavedIndicator ? 'opacity-100' : 'opacity-0'}`}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Saved Locally</span>
            </div>
            
            <button 
              onClick={handleExportPDF}
              disabled={entries.length === 0}
              className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-medium rounded-md transition-colors border border-slate-600"
              title="Export to PDF for VA Claim"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export VA Report</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => { setActiveTab('dashboard'); setEditingEntry(null); }}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Activity className="w-5 h-5 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('history'); setEditingEntry(null); }}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <List className="w-5 h-5 mr-2" />
                History ({entries.length})
              </button>
            </nav>

            {/* Prominent Log Episode Button */}
            <button
              onClick={() => { setActiveTab('add'); setEditingEntry(null); }}
              className={`flex items-center px-5 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm ${
                activeTab === 'add'
                  ? 'bg-blue-800 text-white ring-2 ring-offset-2 ring-blue-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
              }`}
            >
              {editingEntry && activeTab === 'add' ? (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Episode
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Log Episode
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard entries={entries} />}
        {activeTab === 'add' && (
          <EntryForm 
            initialData={editingEntry} 
            onSave={handleSaveEntry} 
            onCancel={editingEntry ? handleCancelEdit : undefined} 
          />
        )}
        {activeTab === 'history' && (
          <History 
            entries={entries} 
            onDelete={handleDeleteEntry} 
            onEdit={handleEditEntry} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>This tool is designed to help veterans track migraines for VA disability claims.</p>
          <p className="mt-1 font-medium text-slate-600">Data is automatically saved locally to your device. Ensure you export regularly.</p>
        </div>
      </footer>
    </div>
  );
}
