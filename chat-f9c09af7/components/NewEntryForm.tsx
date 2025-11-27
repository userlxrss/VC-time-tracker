import React, { useState } from 'react';
import { Calendar, Camera, Smile, Zap, Heart, Tag, X, Plus } from 'lucide-react';
import './NewEntryForm.css';

interface NewEntryFormProps {
  onSubmit: (entry: any) => void;
}

export const NewEntryForm: React.FC<NewEntryFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    mood: 5,
    energy: 5,
    gratitude: [''],
    tags: [''],
    photo: null as File | null
  });

  const [tagInput, setTagInput] = useState('');
  const [gratitudeInput, setGratitudeInput] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags.filter(tag => tag !== ''), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddGratitude = () => {
    if (gratitudeInput.trim() && !formData.gratitude.includes(gratitudeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        gratitude: [...prev.gratitude.filter(item => item !== ''), gratitudeInput.trim()]
      }));
      setGratitudeInput('');
    }
  };

  const handleRemoveGratitude = (gratitudeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      gratitude: prev.gratitude.filter(item => item !== gratitudeToRemove)
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      gratitude: formData.gratitude.filter(item => item !== ''),
      tags: formData.tags.filter(tag => tag !== '')
    };
    onSubmit(cleanData);

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
      mood: 5,
      energy: 5,
      gratitude: [''],
      tags: [''],
      photo: null
    });
  };

  return (
    <div className="new-entry-form glass-card">
      <div className="form-header">
        <h2 className="form-title">New Entry</h2>
        <p className="form-subtitle">Capture your thoughts and feelings</p>
      </div>

      <form onSubmit={handleSubmit} className="journal-form">
        <div className="form-grid">
          {/* Date Input */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Title Input */}
          <div className="form-group full-width">
            <label className="form-label">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Give your entry a title..."
              className="form-input"
              required
            />
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label className="form-label">
              <Camera size={16} />
              Photo
            </label>
            <div className="file-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="file-upload-label">
                {formData.photo ? formData.photo.name : 'Choose photo...'}
              </label>
            </div>
          </div>

          {/* Mood Slider */}
          <div className="form-group">
            <label className="form-label">
              <Smile size={16} />
              Mood: {formData.mood}/10
            </label>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood}
                onChange={(e) => handleInputChange('mood', parseInt(e.target.value))}
                className="mood-slider"
              />
              <div className="slider-marks">
                <span>😞</span>
                <span>😐</span>
                <span>😊</span>
              </div>
            </div>
          </div>

          {/* Energy Slider */}
          <div className="form-group">
            <label className="form-label">
              <Zap size={16} />
              Energy: {formData.energy}/10
            </label>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy}
                onChange={(e) => handleInputChange('energy', parseInt(e.target.value))}
                className="energy-slider"
              />
              <div className="slider-marks">
                <span>🔋</span>
                <span>⚡</span>
                <span>🚀</span>
              </div>
            </div>
          </div>

          {/* Reflections Textarea */}
          <div className="form-group full-width">
            <label className="form-label">
              Reflections
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="What's on your mind? How was your day?"
              className="form-textarea"
              rows={6}
              required
            />
          </div>

          {/* Gratitude List */}
          <div className="form-group full-width">
            <label className="form-label">
              <Heart size={16} />
              Gratitude
            </label>
            <div className="gratitude-input-group">
              <input
                type="text"
                value={gratitudeInput}
                onChange={(e) => setGratitudeInput(e.target.value)}
                placeholder="What are you grateful for?"
                className="form-input"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGratitude())}
              />
              <button type="button" onClick={handleAddGratitude} className="add-btn">
                <Plus size={16} />
              </button>
            </div>
            <div className="tag-list gratitude-list">
              {formData.gratitude.filter(item => item !== '').map((item, index) => (
                <span key={index} className="tag gratitude-tag">
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveGratitude(item)}
                    className="tag-remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags Input */}
          <div className="form-group full-width">
            <label className="form-label">
              <Tag size={16} />
              Tags
            </label>
            <div className="tag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags..."
                className="form-input"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button type="button" onClick={handleAddTag} className="add-btn">
                <Plus size={16} />
              </button>
            </div>
            <div className="tag-list">
              {formData.tags.filter(tag => tag !== '').map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="tag-remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-glow">
            Save Entry
          </button>
        </div>
      </form>
    </div>
  );
};