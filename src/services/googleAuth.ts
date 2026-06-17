import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { loadUser, saveUser, clearUser, StoredUser } from './storage';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'elayra' });

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function useGoogleAuth() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: GOOGLE_REDIRECT_URI,
      scopes: ['openid', 'email', 'profile'],
      responseType: 'code',
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    discovery
  );

  const signIn = async (): Promise<StoredUser | null> => {
    const result = await promptAsync();
    
    if (result.type === 'success' && result.params.code) {
      const tokenResponse = await exchangeCodeForToken(result.params.code);
      if (tokenResponse) {
        const userInfo = await fetchUserInfo(tokenResponse.access_token);
        if (userInfo) {
          const user: StoredUser = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
          };
          await saveUser(user);
          return user;
        }
      }
    }
    return null;
  };

  const signOut = async (): Promise<void> => {
    const user = await loadUser();
    if (user?.accessToken) {
      try {
        await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `token=${user.accessToken}`,
        });
      } catch (e) {
        console.error('Token revoke failed:', e);
      }
    }
    await clearUser();
  };

  return { request, response, signIn, signOut };
}

async function exchangeCodeForToken(code: string): Promise<any> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });
  return response.json();
}

async function fetchUserInfo(accessToken: string): Promise<any> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.json();
}

export async function getValidAccessToken(): Promise<string | null> {
  const user = await loadUser();
  if (!user) return null;
  
  if (Date.now() >= user.expiresAt - 60000) {
    if (user.refreshToken) {
      const newTokens = await refreshAccessToken(user.refreshToken);
      if (newTokens) {
        const updatedUser = { ...user, accessToken: newTokens.access_token, expiresAt: Date.now() + (newTokens.expires_in * 1000) };
        await saveUser(updatedUser);
        return newTokens.access_token;
      }
    }
    return null;
  }
  return user.accessToken;
}

async function refreshAccessToken(refreshToken: string): Promise<any> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  return response.json();
}