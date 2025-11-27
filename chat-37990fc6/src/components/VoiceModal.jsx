import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, CheckCircle, X, AlertCircle, Play, Square, ThumbsUp } from 'lucide-react';
import { BulletproofSpeechRecognition } from '../../bulletproofSpeechRecognition';

const VoiceModal = ({ isOpen, onClose, onResult, fieldName, template }) => {
  const [recordingState, setRecordingState] = useState('idle'); // idle, ready, recording, processing, completed
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState('');
  const [recognitionActive, setRecognitionActive] = useState(false);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle close with cleanup
  const handleClose = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    resetModal();
    onClose();
  };

  const resetModal = () => {
    setRecordingState('idle');
    setLiveTranscript('');
    setFinalTranscript('');
    setError('');
    setRecognitionActive(false);
    finalTranscriptRef.current = '';
  };

  // More precise transcript filtering to remove template content while preserving user speech
  const filterTranscript = (rawTranscript) => {
    if (!rawTranscript) return '';

    // Exact template phrases to filter out (case-insensitive)
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

    // Template structural elements
    const structuralElements = ['1.', '2.', '3.', '•', '·'];

    let filteredTranscript = rawTranscript;

    // Remove exact template phrases
    exactTemplatePhrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      filteredTranscript = filteredTranscript.replace(regex, '');
    });

    // Remove structural elements
    structuralElements.forEach(element => {
      const regex = new RegExp(`\\s*${element.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'gi');
      filteredTranscript = filteredTranscript.replace(regex, ' ');
    });

    // Clean up extra spaces and trim
    filteredTranscript = filteredTranscript.replace(/\s+/g, ' ').trim();

    // Only return if there's meaningful content (at least 3 words)
    const words = filteredTranscript.split(/\s+/);
    if (words.length < 3) {
      return '';
    }

    return filteredTranscript;
  };

  // Handle speech recognition results with proper accumulation
  const handleRecognitionResult = (result) => {
    if (result.isFinal) {
      // Final result - filter and add to our accumulated transcript
      const filteredText = filterTranscript(result.transcript);
      if (filteredText) {
        // Add proper spacing and punctuation
        const separator = finalTranscriptRef.current && !finalTranscriptRef.current.match(/[.!?]\s*$/) ? '. ' : ' ';
        finalTranscriptRef.current += separator + filteredText;
        setFinalTranscript(finalTranscriptRef.current);
        setLiveTranscript(''); // Clear live transcript when we get final result
      }
    } else {
      // Interim result - show as live transcript (also filtered for preview)
      const filteredInterim = filterTranscript(result.transcript);
      setLiveTranscript(filteredInterim);
    }
  };

  // Handle recognition errors
  const handleRecognitionError = (errorMessage) => {
    setError(errorMessage);
    setRecordingState('idle');
    setRecognitionActive(false);
  };

  // Handle recognition status changes
  const handleStatusChange = (newStatus) => {
    if (newStatus === 'listening') {
      setRecordingState('recording');
    } else if (newStatus === 'processing') {
      setRecordingState('processing');
    } else if (newStatus === 'success') {
      setRecordingState('completed');
      setRecognitionActive(false);
    } else if (newStatus === 'error') {
      setRecordingState('idle');
      setRecognitionActive(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!BulletproofSpeechRecognition.isAvailable()) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    try {
      setError('');
      finalTranscriptRef.current = '';
      setFinalTranscript('');
      setLiveTranscript('');

      const recognition = new BulletproofSpeechRecognition({
        onResult: handleRecognitionResult,
        onError: handleRecognitionError,
        onStart: () => {
          setRecordingState('recording');
          setRecognitionActive(true);
        },
        onEnd: () => {
          setRecognitionActive(false);
          if (finalTranscriptRef.current) {
            setRecordingState('completed');
          } else {
            setRecordingState('ready');
          }
        },
        onStatusChange: handleStatusChange
      });

      recognitionRef.current = recognition;
      await recognition.start(fieldName);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setError('Failed to start voice recording. Please try again.');
      setRecordingState('idle');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecognitionActive(false);
    setRecordingState('processing');
  };

  // Approve and save transcript
  const approveTranscript = () => {
    const finalText = finalTranscript.trim();
    if (finalText) {
      onResult(finalText);
      handleClose();
    } else {
      setError('No speech detected. Please try recording again.');
      setRecordingState('ready');
    }
  };

  // Edit transcript manually
  const handleTranscriptEdit = (e) => {
    const text = e.target.value;
    setFinalTranscript(text);
    finalTranscriptRef.current = text;
  };

  if (!isOpen) return null;

  const getFieldTitle = () => {
    switch (fieldName) {
      case 'reflections':
        return 'Reflections';
      case 'gratitude':
        return 'Gratitude';
      case 'goals':
        return 'Goals';
      default:
        return fieldName;
    }
  };

  const getFieldColor = () => {
    switch (fieldName) {
      case 'reflections':
        return 'blue';
      case 'gratitude':
        return 'pink';
      case 'goals':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const color = getFieldColor();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🎙️ Voice Recording – {getFieldTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Template Guide */}
        <div className={`mb-6 p-4 bg-${color}-50 rounded-lg border border-${color}-200`}>
          <h3 className={`text-sm font-semibold text-${color}-800 mb-2`}>
            📝 Template Guide:
          </h3>
          <pre className={`text-sm text-${color}-700 whitespace-pre-wrap font-mono`}>
            {template}
          </pre>
          <p className={`text-xs text-${color}-600 mt-2`}>
            💡 This template is just for guidance and won't be saved to your journal.
          </p>
        </div>

        {/* Recording Controls */}
        {recordingState === 'idle' && (
          <div className="text-center py-8">
            <button
              onClick={() => setRecordingState('ready')}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {recordingState === 'ready' && (
          <div className="text-center py-8">
            <button
              onClick={startRecording}
              className="group relative w-24 h-24 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
            >
              <Mic className="w-10 h-10 text-white" />
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
            </button>
            <p className="mt-4 text-gray-600 font-medium">Click to start recording</p>
          </div>
        )}

        {recordingState === 'recording' && (
          <div className="text-center py-8">
            <button
              onClick={stopRecording}
              className="group relative w-24 h-24 bg-red-500 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-red-500/50 animate-pulse-slow"
            >
              <Square className="w-8 h-8 text-white" />
            </button>
            <p className="mt-4 text-red-500 font-semibold animate-pulse">🎤 Listening...</p>
            <div className="flex justify-center gap-1 mt-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {recordingState === 'processing' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-500/50">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <p className="mt-4 text-orange-500 font-semibold">Processing...</p>
          </div>
        )}

        {/* Transcript Display */}
        {(recordingState === 'recording' || recordingState === 'completed' || recordingState === 'processing') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Live Transcript:
            </label>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] border-2 border-gray-200">
              {liveTranscript && (
                <div className="text-gray-400 italic">
                  {liveTranscript}
                </div>
              )}
              {finalTranscript && (
                <div className="text-gray-800">
                  {finalTranscript}
                </div>
              )}
              {!liveTranscript && !finalTranscript && (
                <div className="text-gray-400 italic">
                  {recordingState === 'recording' ? 'Speak now...' : 'No speech detected yet'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Transcript (when completed) */}
        {recordingState === 'completed' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edit Transcript (Optional):
            </label>
            <textarea
              value={finalTranscript}
              onChange={handleTranscriptEdit}
              className="w-full h-32 p-3 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="Your speech will appear here..."
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-red-50 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {recordingState === 'ready' && (
            <>
              <button
                onClick={startRecording}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Recording
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {recordingState === 'recording' && (
            <button
              onClick={stopRecording}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </button>
          )}

          {recordingState === 'completed' && (
            <>
              <button
                onClick={approveTranscript}
                disabled={!finalTranscript.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve Transcript
              </button>
              <button
                onClick={() => setRecordingState('ready')}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;