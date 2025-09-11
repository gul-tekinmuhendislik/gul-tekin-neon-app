import { sql } from "./db";

interface FacebookToken {
  access_token: string;
  page_id: string;
  page_name: string;
  expires_at: Date;
  is_active: boolean;
}

/**
 * Get active Facebook token from database
 */
export async function getActiveFacebookToken(): Promise<FacebookToken | null> {
  try {
    const result = await sql`
      SELECT 
        access_token,
        page_id,
        page_name,
        expires_at,
        is_active
      FROM social_tokens
      WHERE platform = 'facebook'
        AND token_type = 'page_access_token'
        AND is_active = true
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      // Fallback to environment variable if no token in DB
      const envToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
      const envPageId = process.env.FACEBOOK_PAGE_ID;
      
      if (envToken && envPageId) {
        // Save env token to database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 60); // 60 days default
        
        await saveFacebookToken(envToken, envPageId, "Gül-tekin Mühendislik", expiresAt);
        
        return {
          access_token: envToken,
          page_id: envPageId,
          page_name: "Gül-tekin Mühendislik",
          expires_at: expiresAt,
          is_active: true
        };
      }
      
      return null;
    }

    return result[0] as FacebookToken;
  } catch (error) {
    console.error("Error getting Facebook token:", error);
    // Fallback to environment variable
    const envToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const envPageId = process.env.FACEBOOK_PAGE_ID;
    
    if (envToken && envPageId) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60);
      
      return {
        access_token: envToken,
        page_id: envPageId,
        page_name: "Gül-tekin Mühendislik",
        expires_at: expiresAt,
        is_active: true
      };
    }
    
    return null;
  }
}

/**
 * Save or update Facebook token in database
 */
export async function saveFacebookToken(
  accessToken: string,
  pageId: string,
  pageName: string,
  expiresAt: Date,
  refreshToken?: string
): Promise<boolean> {
  try {
    await sql`
      INSERT INTO social_tokens (
        platform,
        token_type,
        access_token,
        refresh_token,
        page_id,
        page_name,
        expires_at,
        scopes,
        metadata
      ) VALUES (
        'facebook',
        'page_access_token',
        ${accessToken},
        ${refreshToken || null},
        ${pageId},
        ${pageName},
        ${expiresAt},
        ARRAY['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
        ${JSON.stringify({
          updatedAt: new Date().toISOString(),
          source: 'api'
        })}
      )
      ON CONFLICT (platform, token_type) 
      DO UPDATE SET
        access_token = ${accessToken},
        refresh_token = COALESCE(${refreshToken}, social_tokens.refresh_token),
        page_id = ${pageId},
        page_name = ${pageName},
        expires_at = ${expiresAt},
        updated_at = CURRENT_TIMESTAMP,
        is_active = true
    `;
    
    console.log(`Facebook token saved/updated for page: ${pageName}`);
    return true;
  } catch (error) {
    console.error("Error saving Facebook token:", error);
    return false;
  }
}

/**
 * Check if token needs refresh (within 7 days of expiry)
 */
export async function checkTokenNeedsRefresh(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 
        expires_at,
        EXTRACT(DAY FROM (expires_at - NOW())) as days_until_expiry
      FROM social_tokens
      WHERE platform = 'facebook'
        AND token_type = 'page_access_token'
        AND is_active = true
      LIMIT 1
    `;

    if (result.length === 0) return true; // No token, needs refresh
    
    const daysUntilExpiry = result[0].days_until_expiry;
    
    // Refresh if less than 7 days remaining
    return daysUntilExpiry < 7;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return false;
  }
}

/**
 * Log token refresh attempt
 */
export async function logTokenRefresh(
  platform: string,
  tokenId: number | null,
  status: 'success' | 'failed',
  oldExpiresAt: Date | null,
  newExpiresAt: Date | null,
  errorMessage?: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO token_refresh_logs (
        platform,
        token_id,
        refresh_status,
        old_expires_at,
        new_expires_at,
        error_message,
        metadata
      ) VALUES (
        ${platform},
        ${tokenId},
        ${status},
        ${oldExpiresAt},
        ${newExpiresAt},
        ${errorMessage || null},
        ${JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_by: 'inngest_function'
        })}
      )
    `;
  } catch (error) {
    console.error("Error logging token refresh:", error);
  }
}

/**
 * Exchange short-lived token for long-lived token
 * Facebook long-lived tokens last 60 days
 */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    if (!appId || !appSecret) {
      console.error("Facebook App ID or Secret not configured");
      return null;
    }
    
    const url = `https://graph.facebook.com/v23.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${shortLivedToken}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("Error exchanging token:", data.error);
      return null;
    }
    
    return {
      access_token: data.access_token,
      expires_in: data.expires_in // seconds
    };
  } catch (error) {
    console.error("Error exchanging for long-lived token:", error);
    return null;
  }
}

/**
 * Get token expiry information
 */
export async function getTokenExpiryInfo(): Promise<{
  platform: string;
  expires_at: Date;
  days_remaining: number;
  needs_refresh: boolean;
} | null> {
  try {
    const result = await sql`
      SELECT 
        platform,
        expires_at,
        EXTRACT(DAY FROM (expires_at - NOW())) as days_remaining,
        CASE 
          WHEN EXTRACT(DAY FROM (expires_at - NOW())) < 7 THEN true
          ELSE false
        END as needs_refresh
      FROM social_tokens
      WHERE platform = 'facebook'
        AND token_type = 'page_access_token'
        AND is_active = true
      LIMIT 1
    `;

    if (result.length === 0) return null;
    
    return {
      platform: result[0].platform,
      expires_at: result[0].expires_at,
      days_remaining: result[0].days_remaining,
      needs_refresh: result[0].needs_refresh
    };
  } catch (error) {
    console.error("Error getting token expiry info:", error);
    return null;
  }
}