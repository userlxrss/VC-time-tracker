import React, { useState } from 'react';
import { Calendar, Heart, Tag, Search, Filter, ChevronDown } from 'lucide-react';
import './JournalEntries.css';

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: number;
  energy: number;
  gratitude: string[];
  tags: string[];
}

interface JournalEntriesProps {
  entries: JournalEntry[];
}

export const JournalEntries: React.FC<JournalEntriesProps> = ({ entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

  const allTags = Array.from(new Set(entries.flatMap(entry => entry.tags)));

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterTag || entry.tags.includes(filterTag);
    return matchesSearch && matchesFilter;
  });

  const getMoodEmoji = (mood: number) => {
    if (mood <= 3) return '😞';
    if (mood <= 5) return '😐';
    if (mood <= 7) return '😊';
    return '😄';
  };

  const getEnergyEmoji = (energy: number) => {
    if (energy <= 3) return '🔋';
    if (energy <= 6) return '⚡';
    return '🚀';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="journal-entries">
      <div className="entries-header">
        <h2 className="entries-title">Previous Entries</h2>
        <div className="entries-count">{entries.length} entries</div>
      </div>

      {/* Search and Filter */}
      <div className="entries-controls">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-dropdown">
          <button className="filter-btn">
            <Filter size={16} />
            {filterTag || 'All Tags'}
            <ChevronDown size={14} />
          </button>
          {filterTag && (
            <button
              onClick={() => setFilterTag('')}
              className="clear-filter"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tags Filter */}
      {filterTag === '' && allTags.length > 0 && (
        <div className="tags-filter">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className="filter-tag"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Entries List */}
      <div className="entries-list">
        {filteredEntries.length === 0 ? (
          <div className="no-entries">
            <p>No entries found</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              className={`entry-card ${expandedEntry === entry.id ? 'expanded' : ''}`}
              onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
            >
              <div className="entry-header">
                <div className="entry-date">
                  <Calendar size={14} />
                  {formatDate(entry.date)}
                </div>
                <div className="entry-metrics">
                  <span className="metric">
                    {getMoodEmoji(entry.mood)} {entry.mood}
                  </span>
                  <span className="metric">
                    {getEnergyEmoji(entry.energy)} {entry.energy}
                  </span>
                </div>
              </div>

              <h3 className="entry-title">{entry.title}</h3>

              <div className="entry-preview">
                {entry.content.substring(0, 100)}
                {entry.content.length > 100 && '...'}
              </div>

              {expandedEntry === entry.id && (
                <div className="entry-full-content">
                  <p className="entry-content">{entry.content}</p>

                  {entry.gratitude.length > 0 && (
                    <div className="entry-gratitude">
                      <Heart size={14} />
                      <div className="gratitude-list">
                        {entry.gratitude.map((item, index) => (
                          <span key={index} className="gratitude-item">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.tags.length > 0 && (
                    <div className="entry-tags">
                      <Tag size={14} />
                      <div className="tags-list">
                        {entry.tags.map((tag, index) => (
                          <span key={index} className="tag-item">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="entry-footer">
                {entry.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                  </span>
                ))}
                {entry.tags.length > 3 && (
                  <span className="tag-more">+{entry.tags.length - 3}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};