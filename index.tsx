import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { EmployeeProvider } from './utils/employeeStore';
import { SettingsProvider } from './utils/settingsStore';
import { ToastProvider } from './utils/ToastContext';
import { GlobalProvider } from './utils/GlobalContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <SettingsProvider>
        <GlobalProvider>
          <EmployeeProvider>
            <App />
          </EmployeeProvider>
        </GlobalProvider>
      </SettingsProvider>
    </ToastProvider>
  </React.StrictMode>
);
