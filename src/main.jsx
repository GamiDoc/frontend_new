import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { WizardProvider } from './context/WizardContext.jsx';
import { DesignProvider } from './context/DesignContext.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <WizardProvider>
                <DesignProvider>
                    <App />
                </DesignProvider>
            </WizardProvider>
        </AuthProvider>
    </StrictMode>,
);
