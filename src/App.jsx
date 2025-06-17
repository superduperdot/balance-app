import { useState } from 'react';
import AuthPanel from './components/AuthPanel';
import WalletInfo from './components/WalletInfo';

function App() {
  const [activeTab, setActiveTab] = useState('auth');

  const tabButtonStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    backgroundColor: isActive ? '#007bff' : '#f8f9fa',
    color: isActive ? 'white' : '#333',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
    marginRight: '2px'
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* App Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            color: '#333', 
            marginBottom: '10px',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            Brale API Demo
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '18px',
            margin: '0'
          }}>
            Authentication & Wallet Management Tool
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '0',
          borderBottom: '2px solid #dee2e6'
        }}>
          <button
            onClick={() => setActiveTab('auth')}
            style={tabButtonStyle(activeTab === 'auth')}
          >
            🔐 Authentication
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            style={tabButtonStyle(activeTab === 'wallets')}
          >
            💼 Wallet Info
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: '500px'
        }}>
          {activeTab === 'auth' && <AuthPanel />}
          {activeTab === 'wallets' && <WalletInfo />}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '20px',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>Brale API Authentication Demo v1.0 - Enhanced with Wallet Management</p>
          <p>Built with React & Vite</p>
        </div>
      </div>
    </div>
  );
}

export default App; 