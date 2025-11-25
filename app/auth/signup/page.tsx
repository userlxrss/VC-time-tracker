'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: number;
  first_name: string;
  role: string;
  setup_completed: boolean;
}

export default function ProfileSelection() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const availableProfiles = profiles.filter(profile => !profile.setup_completed);
  const setupCompletedProfiles = profiles.filter(profile => profile.setup_completed);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      console.log('Fetching profiles from Supabase...');

      // Add delay to allow CORS to potentially resolve
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');

      if (error) {
        console.error('Supabase error:', error);

        // If CORS error, show mock data for testing
        if (error.message?.includes('CORS') || error.message?.includes('fetch')) {
          console.log('CORS error detected, showing mock data...');
          setProfiles([
            { id: 1, first_name: 'Ella', role: 'boss', setup_completed: false },
            { id: 2, first_name: 'Paul', role: 'boss', setup_completed: true }, // Paul already set up
            { id: 3, first_name: 'Larina', role: 'employee', setup_completed: true } // Larina now set up
          ]);
          return;
        }

        setError(`Failed to load profiles: ${error.message}`);
        return;
      }

      console.log('Profiles loaded:', data);
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowLoginModal(true);
    setLoginPassword('');
    setLoginError('');
  };

  const handleLoginSubmit = async () => {
    if (!loginPassword) {
      setLoginError('Please enter your password');
      return;
    }

    try {
      // For now, we'll simulate the login
      // In production, this would verify against Supabase
      const mockPasswords = {
        1: 'ella123',
        2: 'paul123',
        3: 'larina123'
      };

      if (selectedProfile && loginPassword === mockPasswords[selectedProfile.id]) {
        // Success - store logged in user and redirect to main app
        localStorage.setItem('loggedInUser', JSON.stringify(selectedProfile));
        window.location.href = '/';
      } else {
        setLoginError('Incorrect password');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setSelectedProfile(null);
    setLoginPassword('');
    setLoginError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProfiles}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (availableProfiles.length === 0 && setupCompletedProfiles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">All Profiles Setup Complete</h1>
          <p className="text-gray-600 mb-6">All available profiles have been configured.</p>
          <a href="/auth/login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-900 mb-3">VC Time Tracker</h1>
          <h2 className="text-xl font-medium text-gray-700 mb-2">Choose Your Profile</h2>
          <p className="text-gray-500">Select your name to continue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
          {availableProfiles.map((profile) => (
            <div
              key={profile.id}
              className="group bg-gray-50 rounded-lg border border-gray-200 p-6 text-center hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 w-64"
            >
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gray-600 rounded-full flex items-center justify-center text-white text-xl font-light">
                  {profile.first_name[0]}
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {profile.first_name}
              </h3>

              <a
                href={`/auth/signup/setup/${profile.id}`}
                className="w-full block px-4 py-2.5 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                Set Up Profile
              </a>
            </div>
          ))}

          {setupCompletedProfiles.map((profile) => (
            <div
              key={profile.id}
              className="group bg-white rounded-lg border border-gray-300 p-6 text-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 w-64"
            >
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-light">
                  {profile.first_name[0]}
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {profile.first_name}
              </h3>

              <button
                onClick={() => handleLogin(profile)}
                className="w-full px-4 py-2.5 bg-green-700 text-white text-sm rounded-md hover:bg-green-600 transition-colors duration-200"
              >
                Log In
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/auth/login" className="text-blue-600 hover:text-blue-700 text-sm">
            Already have an account? Login
          </a>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-light mb-4">
                  {selectedProfile.first_name[0]}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Welcome back, {selectedProfile.first_name}
                </h3>
                <p className="text-sm text-gray-500">
                  Enter your password to continue
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLoginSubmit()}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="Enter your password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showLoginPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-sm text-red-600">
                    {loginError}
                  </p>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLoginSubmit}
                  className="flex-1 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}