# Brale API Authentication Demo v1.0

A minimal React application built with Vite that demonstrates OAuth2 client credentials authentication with the Brale API. Uses the API documented at https://docs.brale.xyz

## Features

 **OAuth2 Client Credentials Flow** - Implements the official Brale authentication method  
 **Bearer Token Generation** - Generates and displays API access tokens  
 **Token Persistence** - Saves tokens to localStorage for session persistence  
 **Copy to Clipboard** - Easy token copying for use in other applications  
 **CORS Proxy** - Built-in proxy to handle cross-origin requests  
 **Error Handling** - Clear error messages for authentication failures  
 **Clean UI** - Professional, developer-focused interface  

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the app:** Visit `http://localhost:5173`

4. **Authenticate:** Enter your Brale API client credentials and click "Get Bearer Token"

## API Integration

This app correctly implements the [Brale OAuth2 authentication flow](https://docs.brale.xyz/docs/authentication-1):

- **Endpoint:** `POST https://auth.brale.xyz/oauth2/token`
- **Authentication:** Basic HTTP Authentication (Base64 encoded `client_id:client_secret`)
- **Content-Type:** `application/x-www-form-urlencoded`
- **Grant Type:** `client_credentials`

## Project Structure

```
brale-auth-demo/
├── src/
│   ├── App.jsx          # Main authentication component
│   ├── main.jsx         # React entry point
│   └── index.html       # HTML template
├── vite.config.js       # Vite configuration with CORS proxy
├── package.json         # Project dependencies
└── README.md           # This file
```

## Configuration

The app uses a Vite proxy to handle CORS issues during development:

- `/api/oauth2/*` routes to `https://auth.brale.xyz/oauth2/*`
- `/api/*` routes to `https://api.brale.xyz/*`

## Usage

1. **Get API Credentials:** Create an application in the [Brale Dashboard](https://dashboard.brale.xyz) to obtain your `client_id` and `client_secret`

2. **Enter Credentials:** Input your client ID and secret in the form fields

3. **Generate Token:** Click "Get Bearer Token" to authenticate with the Brale API

4. **Use Token:** Copy the generated bearer token and use it in the `Authorization: Bearer {token}` header for subsequent Brale API calls

## Token Storage

- Tokens are automatically saved to `localStorage` under the key `bearerToken`
- Tokens persist across browser sessions until manually cleared
- Tokens are displayed immediately if found in localStorage on app load

## Requirements

- Node.js 18+ and npm
- Modern web browser with ES6+ support
- Valid Brale API credentials

## Development

Built with:
- **React 19** - Modern React with hooks
- **Vite 6** - Fast development server and build tool
- **Vanilla CSS** - Clean inline styling, no external frameworks

## License

This project is for demonstration purposes. Refer to Brale's terms of service for API usage guidelines.

## Version History

### v1.0.0 (2024)
-  Complete OAuth2 client credentials implementation
-  Working CORS proxy configuration
-  Token persistence and clipboard functionality
-  Professional UI with error handling
-  Full compatibility with Brale API documentation
