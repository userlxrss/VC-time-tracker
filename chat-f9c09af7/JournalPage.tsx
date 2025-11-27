import React, { useState } from 'react';
import { JournalWeeklyInsight } from './components/JournalWeeklyInsight';
import { NewEntryForm } from './components/NewEntryForm';
import { JournalEntries } from './components/JournalEntries';
import './JournalPage.css';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: '2024-01-15',
      title: 'Project Milestone Achieved',
      content: 'Today we successfully launched the new feature after weeks of hard work.',
      mood: 8,
      energy: 7,
      gratitude: ['Supportive team', 'Clear requirements', 'Good coffee'],
      tags: ['work', 'achievement', 'team']
    },
    {
      id: 2,
      date: '2024-01-14',
      title: 'Learning New Framework',
      content: 'Started exploring React Server Components and the possibilities they offer.',
      mood: 6,
      energy: 5,
      gratitude: ['Learning opportunities', 'Good documentation', 'Patient mentors'],
      tags: ['learning', 'react', 'development']
    }
  ]);

  const handleNewEntry = (entry: any) => {
    const newEntry = {
      ...entry,
      id: entries.length + 1
    };
    setEntries([newEntry, ...entries]);
  };

  return (
    <div className="journal-page">
      <div className="journal-header">
        <h1 className="journal-title">Journal</h1>
        <p className="journal-subtitle">Track your thoughts, mood, and daily reflections</p>
      </div>

      <div className="journal-content">
        <div className="journal-main">
          <JournalWeeklyInsight />
          <NewEntryForm onSubmit={handleNewEntry} />
        </div>

        <div className="journal-sidebar">
          <JournalEntries entries={entries} />
        </div>
      </div>
    </div>
  );
};