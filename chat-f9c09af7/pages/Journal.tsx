import React, { useState } from 'react';
import { Calendar } from '../components/Calendar';
import { Button } from '../components/Button';
import { Search, Plus, Filter, BookOpen, Tag } from 'lucide-react';
import './Journal.css';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
}

export const Journal: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [entries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'Project Launch Success',
      content: 'Successfully launched the new AI assistant platform. User feedback has been overwhelmingly positive.',
      date: new Date(),
      tags: ['work', 'achievement', 'AI'],
      mood: 'great'
    },
    {
      id: '2',
      title: 'Team Meeting Notes',
      content: 'Discussed Q4 goals and upcoming features. Team is excited about the new calendar widget improvements.',
      date: new Date(Date.now() - 86400000),
      tags: ['work', 'meetings'],
      mood: 'good'
    },
    {
      id: '3',
      title: 'Design Review',
      content: 'Reviewed new dark mode designs. The calendar widget looks much better with the slate-800 background.',
      date: new Date(Date.now() - 172800000),
      tags: ['design', 'dark-mode'],
      mood: 'good'
    }
  ]);

  const availableTags = Array.from(new Set(entries.flatMap(entry => entry.tags)));

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || entry.tags.includes(selectedTag);
    const matchesDate = entry.date.toDateString() === selectedDate.toDateString();

    return matchesSearch && matchesTag && matchesDate;
  });

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'var(--accent-success)';
      case 'good': return 'var(--accent-info)';
      case 'neutral': return 'var(--text-tertiary)';
      case 'bad': return 'var(--accent-warning)';
      case 'terrible': return 'var(--accent-danger)';
      default: return 'var(--text-tertiary)';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great': return '😊';
      case 'good': return '🙂';
      case 'neutral': return '😐';
      case 'bad': return '😔';
      case 'terrible': return '😢';
      default: return '😐';
    }
  };

  return (
    <div className="journal-page">
      {/* Journal Header */}
      <div className="journal-header">
        <div className="journal-title-section">
          <h1 className="journal-title">
            <BookOpen size={28} className="journal-title-icon" />
            Journal
          </h1>
          <p className="journal-subtitle">Track your thoughts and progress</p>
        </div>

        <div className="journal-actions">
          <Button variant="secondary" icon={<Plus size={20} />}>
            New Entry
          </Button>
        </div>
      </div>

      <div className="journal-content">
        {/* Sidebar with Calendar */}
        <aside className="journal-sidebar">
          <div className="journal-calendar-container">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              showEvents={true}
              compact={false}
            />
          </div>

          {/* Tags Filter */}
          <div className="journal-tags-section">
            <h3 className="journal-section-title">
              <Tag size={16} />
              Tags
            </h3>
            <div className="journal-tags">
              <button
                className={`journal-tag ${!selectedTag ? 'active' : ''}`}
                onClick={() => setSelectedTag(null)}
              >
                All
              </button>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  className={`journal-tag ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="journal-main">
          {/* Search Bar */}
          <div className="journal-search">
            <div className="journal-search-input">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <Button variant="ghost" icon={<Filter size={20} />}>
              Filter
            </Button>
          </div>

          {/* Entries List */}
          <div className="journal-entries">
            {filteredEntries.length === 0 ? (
              <div className="journal-empty">
                <BookOpen size={48} className="empty-icon" />
                <h3>No entries found</h3>
                <p>
                  {searchTerm || selectedTag
                    ? 'Try adjusting your search or filters'
                    : 'Start by creating your first journal entry'
                  }
                </p>
                {!searchTerm && !selectedTag && (
                  <Button variant="primary" icon={<Plus size={20} />}>
                    Create Entry
                  </Button>
                )}
              </div>
            ) : (
              filteredEntries.map(entry => (
                <article key={entry.id} className="journal-entry">
                  <div className="journal-entry-header">
                    <div className="journal-entry-meta">
                      <h3 className="journal-entry-title">{entry.title}</h3>
                      <div className="journal-entry-date">
                        {entry.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="journal-entry-mood">
                      <span
                        className="mood-indicator"
                        style={{ color: getMoodColor(entry.mood) }}
                      >
                        {getMoodEmoji(entry.mood)}
                      </span>
                    </div>
                  </div>

                  <div className="journal-entry-content">
                    {entry.content}
                  </div>

                  {entry.tags.length > 0 && (
                    <div className="journal-entry-tags">
                      {entry.tags.map(tag => (
                        <span key={tag} className="journal-entry-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};