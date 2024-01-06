import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import { RecoilRoot } from 'recoil';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider attribute='class'>
      <Theme accentColor='mint'>
        <RecoilRoot>
          <App />
        </RecoilRoot>
      </Theme>
    </ThemeProvider>
  </React.StrictMode>,
);
