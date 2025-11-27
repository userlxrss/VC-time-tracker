import React from 'react';
import { Layout } from '../components/Layout';
import { SettingsPage } from '../components/SettingsPage';
import '../premium-dark-mode.css';
import '../components/SettingsPage.css';

export const Settings: React.FC = () => {
  return (
    <Layout>
      <SettingsPage />
    </Layout>
  );
};

export default Settings;