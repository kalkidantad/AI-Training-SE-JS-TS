// src/httpClient.ts
import { OAuth2Token } from "./tokens";

function isOAuth2Token(token: any): token is OAuth2Token {
  return token instanceof OAuth2Token;
}

export class HttpClient {
  oauth2Token: OAuth2Token | { accessToken: string; expiresAt: number } | null = null;

  request(method: string, url: string, options?: { api?: boolean }) {
    const opts = options || {};
    let token = this.oauth2Token;

    // Convert plain object to OAuth2Token instance
    if (token && !isOAuth2Token(token)) {
      token = new OAuth2Token(token.accessToken, token.expiresAt);
      this.oauth2Token = token;
    }

    // Refresh token if missing or expired
    if (!token || (isOAuth2Token(token) && token.expired)) {
      token = new OAuth2Token("fresh-token", Math.floor(Date.now() / 1000) + 3600);
      this.oauth2Token = token;
    }

    const headers: Record<string, string> = {};

    if (opts.api === true && token && 'accessToken' in token) {
      headers.Authorization = `Bearer ${token.accessToken}`;
    }

    return { headers };
  }
}