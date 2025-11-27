import React, { useState } from 'react';
import { User, Mail, MessageSquare, Bell, Shield, Palette, Globe, HelpCircle, LogOut, Save, Camera, Lock } from 'lucide-react';

interface ProfileData {
  displayName: string;
  email: string;
  bio: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
}

interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

export const SettingsPage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Productivity enthusiast and tech lover'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    productUpdates: true
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'dark',
    accentColor: '#3b82f6',
    fontSize: 'medium'
  });

  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile Information', icon: <User size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
    { id: 'language', label: 'Language & Region', icon: <Globe size={20} /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle size={20} /> }
  ];

  return (
    <div className="settings-layout">
      {/* Sidebar */}
      <aside className="settings-sidebar">
        <div className="settings-sidebar-header">
          <h2 className="settings-title">Settings</h2>
        </div>

        <nav className="settings-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`settings-nav-item ${activeSection === item.id ? 'active' : ''}`}
            >
              <span className="settings-nav-icon">{item.icon}</span>
              <span className="settings-nav-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="settings-sidebar-footer">
          <button className="settings-logout-btn">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="settings-main">
        <div className="settings-content">
          {/* Profile Information Section */}
          {activeSection === 'profile' && (
            <div className="settings-section animate-fade-in">
              <div className="settings-section-header">
                <h3 className="settings-section-title">Profile Information</h3>
                <p className="settings-section-description">
                  Manage your personal information and account details
                </p>
              </div>

              <div className="settings-card">
                <div className="profile-avatar-section">
                  <div className="profile-avatar">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                      alt="Profile"
                      className="avatar-image"
                    />
                    <button className="avatar-upload-btn">
                      <Camera size={20} />
                    </button>
                  </div>
                  <div className="avatar-info">
                    <h4>Profile Picture</h4>
                    <p>Upload a new avatar. Recommended size: 150x150px</p>
                  </div>
                </div>

                <div className="profile-form">
                  <div className="form-group">
                    <label htmlFor="displayName" className="form-label">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                      className="form-input"
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="form-input"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio" className="form-label">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="form-textarea"
                      rows={4}
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={handleProfileSave}
                      disabled={isSaving}
                      className="btn btn-primary"
                    >
                      {isSaving ? (
                        <>
                          <div className="loading-spinner"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="settings-section animate-fade-in">
              <div className="settings-section-header">
                <h3 className="settings-section-title">Notification Preferences</h3>
                <p className="settings-section-description">
                  Control how you receive notifications and updates
                </p>
              </div>

              <div className="settings-card">
                <div className="notification-group">
                  <h4 className="notification-group-title">Email Notifications</h4>
                  <div className="notification-items">
                    <label className="notification-item">
                      <div className="notification-content">
                        <div className="notification-info">
                          <h5>Email Notifications</h5>
                          <p>Receive important updates via email</p>
                        </div>
                        <div className="notification-toggle">
                          <input
                            type="checkbox"
                            checked={notifications.emailNotifications}
                            onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </label>

                    <label className="notification-item">
                      <div className="notification-content">
                        <div className="notification-info">
                          <h5>Marketing Emails</h5>
                          <p>Receive promotional content and offers</p>
                        </div>
                        <div className="notification-toggle">
                          <input
                            type="checkbox"
                            checked={notifications.marketingEmails}
                            onChange={(e) => setNotifications({...notifications, marketingEmails: e.target.checked})}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </label>

                    <label className="notification-item">
                      <div className="notification-content">
                        <div className="notification-info">
                          <h5>Product Updates</h5>
                          <p>Get notified about new features and improvements</p>
                        </div>
                        <div className="notification-toggle">
                          <input
                            type="checkbox"
                            checked={notifications.productUpdates}
                            onChange={(e) => setNotifications({...notifications, productUpdates: e.target.checked})}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="notification-group">
                  <h4 className="notification-group-title">Push Notifications</h4>
                  <div className="notification-items">
                    <label className="notification-item">
                      <div className="notification-content">
                        <div className="notification-info">
                          <h5>Browser Push Notifications</h5>
                          <p>Receive real-time notifications in your browser</p>
                        </div>
                        <div className="notification-toggle">
                          <input
                            type="checkbox"
                            checked={notifications.pushNotifications}
                            onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="settings-section animate-fade-in">
              <div className="settings-section-header">
                <h3 className="settings-section-title">Appearance</h3>
                <p className="settings-section-description">
                  Customize the look and feel of your interface
                </p>
              </div>

              <div className="settings-card">
                <div className="appearance-group">
                  <h4 className="appearance-group-title">Theme</h4>
                  <div className="theme-options">
                    {(['dark', 'light', 'system'] as const).map((theme) => (
                      <label key={theme} className="theme-option">
                        <input
                          type="radio"
                          name="theme"
                          value={theme}
                          checked={appearance.theme === theme}
                          onChange={(e) => setAppearance({...appearance, theme: e.target.value as typeof theme})}
                          className="theme-radio"
                        />
                        <div className="theme-card">
                          <div className={`theme-preview theme-preview-${theme}`}></div>
                          <span className="theme-name">
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="appearance-group">
                  <h4 className="appearance-group-title">Font Size</h4>
                  <div className="font-size-options">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setAppearance({...appearance, fontSize: size})}
                        className={`font-size-btn ${appearance.fontSize === size ? 'active' : ''}`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="settings-section animate-fade-in">
              <div className="settings-section-header">
                <h3 className="settings-section-title">Security</h3>
                <p className="settings-section-description">
                  Manage your account security and privacy settings
                </p>
              </div>

              {/* Security Banner */}
              <div className="security-banner bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl mb-6">
                <div className="security-banner-content flex items-center">
                  <Lock className="text-white mr-4" size={32} />
                  <div className="security-banner-text">
                    <h4 className="text-white text-xl font-semibold mb-1">Your data is secure</h4>
                    <p className="text-white/90 text-sm">
                      We use industry-standard encryption to protect your information and ensure your privacy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="security-item">
                  <div className="security-info">
                    <h4>Change Password</h4>
                    <p>Update your password to keep your account secure</p>
                  </div>
                  <button className="btn btn-secondary">Change Password</button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn btn-secondary">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}

          {/* Language Section */}
          {activeSection === 'language' && (
            <div className="settings-section animate-fade-in">
              <div className="settings-section-header">
                <h3 className="settings-section-title">Language & Region</h3>
                <p className="settings-section-description">
                  Set your language and regional preferences
                </p>
              </div>

              <div className="settings-card">
                <div className="form-group">
                  <label htmlFor="language" className="form-label">Language</label>
                  <select id="language" className="form-select">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="timezone" className="form-label">Timezone</label>
                  <select id="timezone" className="form-select">
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          {activeSection === 'help' && (
            <div className="settings-section animate-fade-in">
              <div className="settings-section-header">
                <h3 className="settings-section-title">Help & Support</h3>
                <p className="settings-section-description">
                  Get help and find answers to common questions
                </p>
              </div>

              <div className="settings-card">
                <div className="help-item">
                  <div className="help-info">
                    <h4>Documentation</h4>
                    <p>Browse our comprehensive documentation</p>
                  </div>
                  <button className="btn btn-secondary">View Docs</button>
                </div>

                <div className="help-item">
                  <div className="help-info">
                    <h4>Contact Support</h4>
                    <p>Get in touch with our support team</p>
                  </div>
                  <button className="btn btn-primary">Contact Us</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};