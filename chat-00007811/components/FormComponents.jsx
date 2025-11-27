import React, { useState } from 'react';

/**
 * Form Components Showcase
 * Demonstrates refined dark mode colors for interactive elements
 */
const FormComponents = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    message: '',
    newsletter: false,
    plan: 'pro'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Form Components</h1>

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card with refined colors */}
          <div className="p-6 bg-surface-elevated rounded-xl border border-border-light shadow-card">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Account Information</h2>

            <div className="space-y-4">
              {/* Email Input with refined styling */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-bg-elevated border border-border-light rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:outline-none focus:shadow-glow transition-all duration-200"
                    placeholder="john@example.com"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Input with refined styling */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-bg-elevated border border-border-light rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:outline-none focus:shadow-glow transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Textarea with refined styling */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-bg-elevated border border-border-light rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:outline-none focus:shadow-glow transition-all duration-200 resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>
            </div>
          </div>

          {/* Radio Group with refined colors */}
          <div className="p-6 bg-surface-elevated rounded-xl border border-border-light shadow-card">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Choose Your Plan</h2>
            <div className="space-y-3">
              {[
                { value: 'starter', label: 'Starter', price: '$9/month', description: 'Perfect for individuals' },
                { value: 'pro', label: 'Pro', price: '$29/month', description: 'Best for professionals' },
                { value: 'enterprise', label: 'Enterprise', price: '$99/month', description: 'For large teams' },
              ].map((plan) => (
                <label
                  key={plan.value}
                  className="relative flex items-center p-4 bg-bg-elevated border rounded-lg cursor-pointer transition-all duration-200 hover:border-accent-primary hover:shadow-md"
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.value}
                    checked={formData.plan === plan.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                    formData.plan === plan.value
                      ? 'border-accent-primary bg-accent-primary'
                      : 'border-border-light'
                  }`}>
                    {formData.plan === plan.value && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-text-primary">{plan.label}</h3>
                      <span className="text-sm font-semibold text-accent-primary">{plan.price}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Checkbox with refined styling */}
          <div className="p-6 bg-surface-elevated rounded-xl border border-border-light shadow-card">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  formData.newsletter
                    ? 'border-accent-primary bg-accent-primary shadow-glow'
                    : 'border-border-light group-hover:border-accent-primary group-hover:shadow-sm'
                }`}>
                  {formData.newsletter && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                  Subscribe to Newsletter
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Get updates about new features and releases
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between space-x-4">
            <button
              type="button"
              className="px-6 py-3 bg-bg-elevated border border-border-light text-text-secondary rounded-lg hover:text-text-primary hover:border-accent-primary hover:shadow-md transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-accent-primary text-text-inverse rounded-lg font-medium transition-all duration-200 ${
                isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-accent-hover hover:shadow-lg hover:shadow-accent-glow active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Additional UI Elements */}
        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Additional UI Elements</h2>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg border border-border-light">
            <span className="text-text-primary">Enable notifications</span>
            <button
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-bg-interactive border border-border-light"
              onClick={() => setFormData(prev => ({ ...prev, newsletter: !prev.newsletter }))}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.newsletter ? 'translate-x-6 bg-accent-primary' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Badge Examples */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent-primary bg-opacity-10 text-accent-primary border border-accent-primary border-opacity-20">
              Primary
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-success bg-opacity-10 text-success border border-success border-opacity-20">
              Success
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20">
              Warning
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-error bg-opacity-10 text-error border border-error border-opacity-20">
              Error
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormComponents;