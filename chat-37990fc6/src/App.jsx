import React, { useState } from 'react';
import { Mic, Save, X, Calendar, Heart, BookOpen, Target } from 'lucide-react';
import VoiceModal from './components/VoiceModal';
import './App.css';

function App() {
  const [reflections, setReflections] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [goals, setGoals] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [currentField, setCurrentField] = useState('');

  const templates = {
    reflections: `Today was...
What went well:
What I learned:

`,
    gratitude: `Today I'm grateful for...
Three things that made me smile:
1.
2.
3.
What brought me joy:

`,
    goals: `My goals for today:
Priority task:
Secondary task:
Personal growth:
`

  };

  const handleVoiceInput = (field) => {
    setCurrentField(field);
    setShowVoiceModal(true);
  };

  const handleVoiceResult = (transcript) => {
    // Final safety check: ensure we're not saving exact template phrases
    const exactTemplatePhrases = [
      'today was',
      'what went well',
      'what i learned',
      "today i'm grateful for",
      'three things that made me smile',
      'what brought me joy',
      'my goals for today',
      'priority task',
      'secondary task',
      'personal growth'
    ];

    // Only block if the transcript starts with or is mostly template content
    const hasTemplateContent = exactTemplatePhrases.some(phrase => {
      const regex = new RegExp(`^\\s*${phrase}`, 'i');
      return regex.test(transcript.trim());
    });

    // Only save if there's no leading template content and transcript has meaningful content
    if (!hasTemplateContent && transcript.trim().split(/\s+/).length >= 3) {
      if (currentField === 'reflections') {
        setReflections(prev => `${prev ? prev + '\n' : ''}${transcript}`);
      } else if (currentField === 'gratitude') {
        setGratitude(prev => `${prev ? prev + '\n' : ''}${transcript}`);
      } else if (currentField === 'goals') {
        setGoals(prev => `${prev ? prev + '\n' : ''}${transcript}`);
      }
    }
    setShowVoiceModal(false);
  };

  const handleSaveJournal = () => {
    const journalEntry = {
      date: new Date().toISOString(),
      reflections,
      gratitude,
      goals
    };

    console.log('Saving journal entry:', journalEntry);
    // Here you would typically save to a database or local storage

    // Clear form after saving
    setReflections('');
    setGratitude('');
    setGoals('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Daily Journal
          </h1>
          <p className="text-gray-600">
            Record your thoughts and gratitude with voice or text
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {/* Reflections Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Reflections
                </h2>
              </div>
              <button
                onClick={() => handleVoiceInput('reflections')}
                className="mic-button idle flex items-center gap-2 px-4 py-2 text-white"
                title="Add voice entry"
              >
                <Mic className="w-4 h-4" />
                Voice
              </button>
            </div>

            <textarea
              value={reflections}
              onChange={(e) => setReflections(e.target.value)}
              placeholder={templates.reflections}
              className="w-full h-40 p-4 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-400 transition-colors"
            />
          </section>

          {/* Gratitude Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Gratitude
                </h2>
              </div>
              <button
                onClick={() => handleVoiceInput('gratitude')}
                className="mic-button idle flex items-center gap-2 px-4 py-2 text-white"
                title="Add voice entry"
              >
                <Mic className="w-4 h-4" />
                Voice
              </button>
            </div>

            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder={templates.gratitude}
              className="w-full h-40 p-4 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-pink-400 transition-colors"
            />
          </section>

          {/* Goals Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Goals
                </h2>
              </div>
              <button
                onClick={() => handleVoiceInput('goals')}
                className="mic-button idle flex items-center gap-2 px-4 py-2 text-white"
                title="Add voice entry"
              >
                <Mic className="w-4 h-4" />
                Voice
              </button>
            </div>

            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder={templates.goals}
              className="w-full h-40 p-4 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-purple-400 transition-colors"
            />
          </section>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSaveJournal}
              disabled={!reflections && !gratitude && !goals}
              className="flex items-center gap-3 px-8 py-4 bg-green-500 text-white rounded-lg font-semibold
                         hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              Save Journal Entry
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </footer>
      </div>

      {/* Voice Modal */}
      {showVoiceModal && (
        <VoiceModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onResult={handleVoiceResult}
          fieldName={currentField}
          template={templates[currentField]}
        />
      )}
    </div>
  );
}

export default App;