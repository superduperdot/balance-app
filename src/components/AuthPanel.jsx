import { useState, useEffect } from 'react';

function AuthPanel() {
  // State management for form inputs and UI states
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load existing token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('bearerToken');
    if (savedToken) {
      setBearerToken(savedToken);
    }
  }, []);

  // Handle authentication with Brale API using OAuth2 client credentials flow
  const handleAuthenticate = async () => {
    // Reset error state and start loading
    setError('');
    setIsLoading(true);

    try {
      // Create Basic auth header by base64 encoding client_id:client_secret
      const credentials = btoa(`${clientId}:${clientSecret}`);
      
      // Create form data for the request body
      const formData = new URLSearchParams();
      formData.append('grant_type', 'client_credentials');

      // Make POST request to Brale OAuth2 endpoint
      const response = await fetch('/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      // Parse the response JSON
      const data = await response.json();
      
      // Extract access token from response
      const accessToken = data.access_token;
      
      if (!accessToken) {
        throw new Error('No access token received from API');
      }

      // Update state and save to localStorage
      setBearerToken(accessToken);
      localStorage.setItem('bearerToken', accessToken);
      
    } catch (err) {
      // Handle any errors that occurred during authentication
      setError(err.message);
    } finally {
      // Stop loading regardless of success or failure
      setIsLoading(false);
    }
  };

  // Handle textarea click to select all text for easy copying
  const handleTokenClick = (event) => {
    event.target.select();
  };

  // Copy token to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bearerToken);
      // Could add a temporary "Copied!" message here if desired
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>
        Brale API Authentication
      </h2>
      
      <p style={{ textAlign: 'center', color: '#999', fontSize: '14px', marginBottom: '30px' }}>
        v1.0.0
      </p>
      
      <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center' }}>
        Enter your Brale API client credentials to generate a bearer token using OAuth2 client credentials flow
      </p>

      {/* Input form for client credentials */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Client ID:
        </label>
        <input
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="Enter your client ID"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Client Secret:
        </label>
        <input
          type="password"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          placeholder="Enter your client secret"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Authentication button */}
      <button
        onClick={handleAuthenticate}
        disabled={!clientId || !clientSecret || isLoading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isLoading ? 'Authenticating...' : 'Get Bearer Token'}
      </button>

      {/* API endpoint info */}
      <div style={{
        padding: '10px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        <strong>Endpoint:</strong> POST https://auth.brale.xyz/oauth2/token<br/>
        <strong>Auth Type:</strong> Basic Authentication (Base64 encoded client_id:client_secret)<br/>
        <strong>Content-Type:</strong> application/x-www-form-urlencoded
      </div>

      {/* Error message display */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ff9999',
          borderRadius: '4px',
          color: '#cc0000',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Token display section */}
      {bearerToken && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>Bearer Token:</h3>
          <textarea
            value={bearerToken}
            onClick={handleTokenClick}
            readOnly
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
              backgroundColor: '#f8f9fa',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={copyToClipboard}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Copy to Clipboard
          </button>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Token has been saved to localStorage and will persist across sessions.
          </p>
        </div>
      )}
    </div>
  );
}

export default AuthPanel; 