import { TwitterApi } from 'twitter-api-v2';

// Type definition for Twitter API error responses
interface TwitterApiError extends Error {
  code?: string | number;
  data?: {
    detail?: string;
    title?: string;
    errors?: Array<{ message: string; code?: number }>;
    [key: string]: unknown;
  };
  statusCode?: number;
  errors?: Array<{ message: string; code?: number }>;
  detail?: string;
  title?: string;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}
import CryptoJS from 'crypto-js';

// X API Configuration - Lazy evaluation to prevent module import crashes
const getXConfig = () => ({
  apiKey: process.env.TWITTER_API_KEY || '',
  apiSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
  oauth2ClientId: process.env.TWITTER_OAUTH2_CLIENT_ID || '',
  oauth2ClientSecret: process.env.TWITTER_OAUTH2_CLIENT_SECRET || '',
  callbackUrl: process.env.TWITTER_OAUTH_CALLBACK_URL || '',
});

// Rate limiting configuration
const RATE_LIMITS = {
  tweets: 300, // per 3 hours
  dm: 50, // per 24 hours
  mentions: 300, // per 3 hours
};

// Encryption for token storage
// Lazy initialization to avoid throwing errors during module import
const getEncryptionKey = (): string => {
  const key = process.env.NEXTAUTH_SECRET;

  if (!key) {
    throw new Error(
      '🔒 SECURITY ERROR: NEXTAUTH_SECRET environment variable is required for token encryption. ' +
      'Please set it in your .env.local file with at least 32 random characters.'
    );
  }

  if (key.length < 32) {
    throw new Error(
      '🔒 SECURITY ERROR: NEXTAUTH_SECRET must be at least 32 characters for secure encryption. ' +
      `Current length: ${key.length}. Please generate a stronger secret.`
    );
  }

  return key;
};

export interface XUser {
  id: string;
  username: string;
  name: string;
  profileImageUrl?: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
}

// OAuth 1.0a credentials structure
export interface XCredentials {
  accessToken: string;           // OAuth 1.0a access token
  accessTokenSecret: string;     // OAuth 1.0a access token secret (REQUIRED for signing requests)
  userId?: string;              // Twitter user ID
  screenName?: string;          // Twitter username
  // Note: OAuth 1.0a tokens don't expire (permanent until revoked)
  // No refreshToken - OAuth 1.0a doesn't support token refresh
}

export interface TweetRequest {
  text: string;
  mediaIds?: string[];
  replyToTweetId?: string;
}

export interface TweetResponse {
  id: string;
  text: string;
  createdAt: string;
  url: string; // Direct link to the tweet on X/Twitter
  metrics: {
    likeCount: number;
    retweetCount: number;
    replyCount: number;
    quoteCount: number;
  };
  user: XUser;
}

export interface MediaUploadResponse {
  mediaId: string;
  mediaKey: string;
  expiresAfter?: number;
}

class XApiService {
  private client: TwitterApi;
  private rateLimitTracker: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    const config = getXConfig();
    this.client = new TwitterApi(config.apiKey || 'placeholder');
  }

  /**
   * Generate OAuth 1.0a authorization URL (3-legged OAuth flow)
   * Returns authorization URL, oauth_token, and oauth_token_secret
   */
  async generateAuthUrl(): Promise<{ url: string; oauth_token: string; oauth_token_secret: string }> {
    try {
      console.log('🔐 [X OAuth 1.0a] Starting OAuth URL generation');

      const config = getXConfig();

      // Validate required environment variables
      if (!config.apiKey) {
        throw new Error('TWITTER_API_KEY is not configured');
      }
      if (!config.apiSecret) {
        throw new Error('TWITTER_API_SECRET is not configured');
      }
      if (!config.callbackUrl) {
        throw new Error('TWITTER_OAUTH_CALLBACK_URL is not configured');
      }

      // Create TwitterApi client with consumer credentials only (for auth link generation)
      const client = new TwitterApi({
        appKey: config.apiKey,
        appSecret: config.apiSecret,
      });

      console.log('🔐 [X OAuth 1.0a] Generating auth link with callback:', config.callbackUrl);

      // Generate auth link - this creates request token and returns URL
      const authLink = await client.generateAuthLink(config.callbackUrl, {
        linkMode: 'authorize' // Use 'authorize' for better UX (auto-redirects if previously approved)
      });

      console.log('🔐 [X OAuth 1.0a] Auth link generated successfully');
      console.log('🔐 [X OAuth 1.0a] oauth_token:', authLink.oauth_token.substring(0, 10) + '...');
      console.log('🔐 [X OAuth 1.0a] URL:', authLink.url);

      return {
        url: authLink.url,
        oauth_token: authLink.oauth_token,
        oauth_token_secret: authLink.oauth_token_secret, // CRITICAL: Must be stored for callback
      };
    } catch (error) {
      console.error('❌ [X OAuth 1.0a] Error generating auth URL:', error);
      throw error;
    }
  }

  /**
   * Exchange OAuth 1.0a verifier for access tokens
   * This is called in the OAuth callback after user approves the app
   */
  async exchangeOAuthVerifierForTokens(
    oauth_token: string,
    oauth_token_secret: string,
    oauth_verifier: string
  ): Promise<XCredentials> {
    try {
      console.log('🔐 [X OAuth 1.0a] Starting token exchange');
      console.log('🔐 [X OAuth 1.0a] oauth_token:', oauth_token.substring(0, 10) + '...');
      console.log('🔐 [X OAuth 1.0a] oauth_verifier:', oauth_verifier.substring(0, 10) + '...');

      const config = getXConfig();

      // Validate required environment variables
      if (!config.apiKey) {
        throw new Error('TWITTER_API_KEY is not configured');
      }
      if (!config.apiSecret) {
        throw new Error('TWITTER_API_SECRET is not configured');
      }

      // Create TwitterApi client with temporary token from request token phase
      const client = new TwitterApi({
        appKey: config.apiKey,
        appSecret: config.apiSecret,
        accessToken: oauth_token,
        accessSecret: oauth_token_secret,
      });

      console.log('🔐 [X OAuth 1.0a] Exchanging verifier for permanent access tokens...');

      // Exchange verifier for permanent access token
      const { client: loggedClient, accessToken, accessSecret, userId, screenName } = await client.login(oauth_verifier);

      console.log('🔐 [X OAuth 1.0a] Token exchange successful');
      console.log('🔐 [X OAuth 1.0a] Access token received:', accessToken ? 'YES' : 'NO');
      console.log('🔐 [X OAuth 1.0a] Access token secret received:', accessSecret ? 'YES' : 'NO');
      console.log('🔐 [X OAuth 1.0a] User ID:', userId);
      console.log('🔐 [X OAuth 1.0a] Screen name:', screenName);

      const credentials: XCredentials = {
        accessToken: accessToken || '',
        accessTokenSecret: accessSecret || '',
        userId,
        screenName,
      };

      return credentials;
    } catch (error: unknown) {
      const err = error as TwitterApiError;
      console.error('❌ [X OAuth 1.0a] Error exchanging verifier for tokens:', error);

      // Provide more specific error messages
      if (err.message?.includes('Invalid oauth_verifier')) {
        throw new Error('Invalid OAuth verifier. The verifier may have expired or been used already.');
      } else if (err.message?.includes('Invalid request')) {
        throw new Error('Invalid request. Check your callback URL configuration.');
      } else if (err.message?.includes('Unauthorized')) {
        throw new Error('Unauthorized. Check your app permissions in X Developer Portal.');
      } else {
        throw new Error(`Failed to exchange verifier for tokens: ${err.message || error}`);
      }
    }
  }

  /**
   * Create Twitter client with OAuth 1.0a user credentials
   * Requires all 4 credentials: consumer key/secret + access token/secret
   */
  private createUserClient(accessToken: string, accessTokenSecret: string): TwitterApi {
    const config = getXConfig();
    return new TwitterApi({
      appKey: config.apiKey,
      appSecret: config.apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
  }

  /**
   * Get user profile information using OAuth 1.0a credentials
   */
  async getUserProfile(accessToken: string, accessTokenSecret: string): Promise<XUser> {
    try {
      const client = this.createUserClient(accessToken, accessTokenSecret);
      const user = await client.v2.me({
        'user.fields': ['profile_image_url', 'public_metrics', 'username', 'name'],
      });

      const metrics = user.data.public_metrics as { followers_count?: number; following_count?: number; tweet_count?: number };

      return {
        id: user.data.id,
        username: user.data.username,
        name: user.data.name,
        profileImageUrl: user.data.profile_image_url,
        followersCount: metrics.followers_count || 0,
        followingCount: metrics.following_count || 0,
        tweetCount: metrics.tweet_count || 0,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Post a tweet using OAuth 1.0a credentials
   */
  async postTweet(accessToken: string, accessTokenSecret: string, request: TweetRequest): Promise<TweetResponse> {
    // Validate access token
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Invalid access token provided');
    }
    if (!accessTokenSecret || typeof accessTokenSecret !== 'string') {
      throw new Error('Invalid access token secret provided');
    }

    // Validate request
    if (!request.text || typeof request.text !== 'string') {
      throw new Error('Tweet text is required and must be a string');
    }

    // Rate limiting check
    if (!this.checkRateLimit('tweets')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      console.log('📤 [Post Tweet] Starting tweet post:', {
        textLength: request.text.length,
        hasReply: !!request.replyToTweetId,
        mediaCount: request.mediaIds?.length || 0,
      });

      const client = this.createUserClient(accessToken, accessTokenSecret);

      const tweetData: {
        text: string;
        reply?: { in_reply_to_tweet_id: string };
        media?: { media_ids: [string] | [string, string] | [string, string, string] | [string, string, string, string] };
      } = {
        text: request.text,
      };

      if (request.replyToTweetId) {
        tweetData.reply = {
          in_reply_to_tweet_id: request.replyToTweetId,
        };
      }

      // Attach media if provided
      if (request.mediaIds && request.mediaIds.length > 0) {
        // Twitter API expects a tuple of 1-4 media IDs
        tweetData.media = {
          media_ids: request.mediaIds.slice(0, 4) as [string] | [string, string] | [string, string, string] | [string, string, string, string],
        };
        console.log('📤 [Post Tweet] Attaching media:', request.mediaIds);
      }

      const tweet = await client.v2.tweet(tweetData);

      if (!tweet || !tweet.data || !tweet.data.id) {
        throw new Error('Twitter API returned invalid response - missing tweet data');
      }

      console.log('✅ [Post Tweet] Tweet created:', tweet.data.id);

      // Get user info for the response
      const userProfile = await this.getUserProfile(accessToken, accessTokenSecret);

      // Generate shareable URL for the tweet
      const tweetUrl = `https://x.com/${userProfile.username}/status/${tweet.data.id}`;

      console.log('✅ [Post Tweet] Tweet posted successfully:', {
        tweetId: tweet.data.id,
        url: tweetUrl,
        username: userProfile.username,
      });

      return {
        id: tweet.data.id,
        text: tweet.data.text,
        createdAt: new Date().toISOString(), // API v2 doesn't return created_at in basic response
        url: tweetUrl,
        metrics: {
          likeCount: 0,
          retweetCount: 0,
          replyCount: 0,
          quoteCount: 0,
        },
        user: userProfile,
      };
    } catch (error: unknown) {
      const err = error as TwitterApiError;
      // Log FULL error details for debugging
      console.error('❌ [Post Tweet] Error posting tweet:', {
        message: err.message || String(error),
        code: err.code,
        statusCode: err.statusCode,
        data: err.data,
        errors: err.errors,
        detail: err.detail,
        title: err.title,
        fullError: JSON.stringify(error, null, 2)
      });

      // Handle specific Twitter API errors
      if (err.code === 403 || err.statusCode === 403) {
        const twitterError = err.data?.detail || err.data?.title || err.errors?.[0]?.message || '';
        throw new Error(`Tweet rejected by Twitter (403): ${twitterError || 'You may not have permission to post, or the tweet violates Twitter rules. Try reconnecting your account with fresh permissions.'}`);
      }

      if (err.code === 401 || err.statusCode === 401) {
        throw new Error('Twitter authorization failed - please reconnect your account');
      }

      if (err.code === 429 || err.statusCode === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (err.code === 187) {
        throw new Error('Status is a duplicate');
      }

      if (err.data?.detail) {
        throw new Error(`Twitter API error: ${err.data.detail}`);
      }

      if (err.message) {
        throw new Error(err.message);
      }

      throw new Error('Failed to post tweet - unknown error occurred');
    }
  }

  /**
   * Upload media (image/video/gif) for tweets using Twitter API v1.1 with OAuth 1.0a
   * Implements manual chunked upload for videos to handle large files and OAuth 1.0a properly
   *
   * Supports:
   * - Images: PNG, JPG, WEBP (up to 4MB) - Uses simple upload
   * - GIFs: up to 4MB - Uses simple upload
   * - Videos: MP4, MOV, AVI, WEBM (up to 512MB) - Uses chunked upload (INIT → APPEND → FINALIZE → STATUS)
   */
  async uploadMedia(
    accessToken: string,
    accessTokenSecret: string,
    buffer: Buffer,
    mimeType: string,
    mediaType: string = 'image'
  ): Promise<MediaUploadResponse> {
    try {
      console.log('📸 [Media Upload] Starting upload with OAuth 1.0a:', {
        size: buffer.length,
        type: mimeType,
        mediaType,
      });

      // Create authenticated client with OAuth 1.0a credentials
      const client = this.createUserClient(accessToken, accessTokenSecret);

      // Use twitter-api-v2 library's uploadMedia for all media types
      // The library handles chunked uploads automatically for large files (videos)
      // and routes correctly to upload.twitter.com with proper OAuth 1.0a signing
      console.log('📸 [Media Upload] Using library uploadMedia with type:', mediaType);

      const mediaId = await client.v1.uploadMedia(buffer, {
        mimeType: mimeType as any,
        target: 'tweet',
      });

      console.log('✅ [Media Upload] Upload successful:', {
        mediaId,
        size: buffer.length,
        mediaType,
      });

      return {
        mediaId,
        mediaKey: mediaId,
        expiresAfter: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

    } catch (error: unknown) {
      const err = error as Error;
      console.error('❌ [Media Upload] Upload failed:', {
        message: err.message,
        stack: err.stack,
      });

      // Parse and provide user-friendly error messages
      if (err.message.includes('403') || err.message.includes('Forbidden')) {
        throw new Error('Twitter rejected upload (403): Check your app permissions in X Developer Portal. OAuth 1.0a credentials may need to be regenerated.');
      } else if (err.message.includes('413')) {
        throw new Error('Media file is too large. Check size limits: Images 4MB, GIFs 4MB, Videos 512MB.');
      } else if (err.message.includes('400')) {
        throw new Error('Invalid media format or parameters. Please check your file type and size.');
      } else if (err.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      } else if (err.message.includes('timeout')) {
        throw new Error('Upload timed out. Please try again or use a smaller file.');
      } else if (err.message.includes('text/plain')) {
        // Handle the specific error we're debugging
        throw new Error(`Twitter API returned plain text error instead of JSON. This usually indicates an OAuth 1.0a authentication issue. Raw error: ${err.message}`);
      }

      throw new Error(`Failed to upload media: ${err.message}`);
    }
  }

  /**
   * Simple media upload for images and GIFs (non-chunked)
   * Uses twitter-api-v2 library's built-in method
   */
  private async uploadSimpleMedia(
    client: TwitterApi,
    buffer: Buffer,
    mimeType: string,
    mediaType: string
  ): Promise<MediaUploadResponse> {
    console.log('📸 [Simple Upload] Uploading via twitter-api-v2 library...');

    const mediaId = await client.v1.uploadMedia(buffer, {
      mimeType: mimeType as any,
      target: mediaType === 'gif' ? 'tweet' : 'tweet',
    });

    console.log('✅ [Simple Upload] Upload successful:', {
      mediaId,
      size: buffer.length,
      mediaType,
    });

    return {
      mediaId,
      mediaKey: mediaId,
      expiresAfter: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
  }

  /**
   * Chunked video upload implementation: INIT → APPEND → FINALIZE → STATUS
   * This handles large video files and provides better error handling for OAuth 1.0a
   */
  private async uploadVideoChunked(
    client: TwitterApi,
    buffer: Buffer,
    mimeType: string
  ): Promise<MediaUploadResponse> {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks (Twitter's recommended size)
    const totalBytes = buffer.length;
    const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);

    console.log('📸 [Chunked Upload] Starting chunked video upload:', {
      totalBytes,
      totalChunks,
      chunkSize: CHUNK_SIZE,
      mimeType,
    });

    try {
      // PHASE 1: INIT - Initialize the upload and get media_id
      console.log('📸 [Chunked Upload] INIT: Initializing upload...');
      const initResponse = await client.v1.post('media/upload.json', {
        command: 'INIT',
        total_bytes: totalBytes,
        media_type: mimeType,
        media_category: 'tweet_video', // Required for videos
      });

      // Check if response is valid JSON
      if (!initResponse || typeof initResponse !== 'object') {
        console.error('❌ [Chunked Upload] INIT: Invalid response type:', typeof initResponse);
        throw new Error(`INIT phase failed: Received ${typeof initResponse} instead of JSON object. This indicates an OAuth 1.0a authentication issue.`);
      }

      const mediaId = (initResponse as any).media_id_string;
      if (!mediaId) {
        console.error('❌ [Chunked Upload] INIT: No media_id in response:', initResponse);
        throw new Error('INIT phase failed: No media_id returned. Twitter API may have rejected the request.');
      }

      console.log('✅ [Chunked Upload] INIT: Success, media_id:', mediaId);

      // PHASE 2: APPEND - Upload chunks
      console.log('📸 [Chunked Upload] APPEND: Uploading chunks...');
      for (let segmentIndex = 0; segmentIndex < totalChunks; segmentIndex++) {
        const start = segmentIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalBytes);
        const chunk = buffer.slice(start, end);

        console.log(`📸 [Chunked Upload] APPEND: Uploading chunk ${segmentIndex + 1}/${totalChunks} (${chunk.length} bytes)`);

        // Use form data for APPEND with media as binary
        const appendResponse = await client.v1.post('media/upload.json', {
          command: 'APPEND',
          media_id: mediaId,
          segment_index: segmentIndex,
          media: chunk,
        });

        // APPEND returns empty response on success, any content indicates error
        if (appendResponse && typeof appendResponse === 'string') {
          console.error('❌ [Chunked Upload] APPEND: Received error response:', appendResponse);
          throw new Error(`APPEND phase failed at chunk ${segmentIndex + 1}: ${appendResponse}`);
        }

        console.log(`✅ [Chunked Upload] APPEND: Chunk ${segmentIndex + 1}/${totalChunks} uploaded successfully`);
      }

      // PHASE 3: FINALIZE - Complete the upload
      console.log('📸 [Chunked Upload] FINALIZE: Finalizing upload...');
      const finalizeResponse = await client.v1.post('media/upload.json', {
        command: 'FINALIZE',
        media_id: mediaId,
      });

      if (!finalizeResponse || typeof finalizeResponse !== 'object') {
        console.error('❌ [Chunked Upload] FINALIZE: Invalid response type:', typeof finalizeResponse);
        throw new Error(`FINALIZE phase failed: Received ${typeof finalizeResponse} instead of JSON object.`);
      }

      console.log('✅ [Chunked Upload] FINALIZE: Success');

      // PHASE 4: STATUS - Poll for processing completion (required for videos)
      const processingInfo = (finalizeResponse as any).processing_info;
      if (processingInfo) {
        console.log('📸 [Chunked Upload] STATUS: Video processing required, polling for completion...');
        await this.pollVideoProcessingStatus(client, mediaId, processingInfo);
      } else {
        console.log('📸 [Chunked Upload] No processing required, upload complete');
      }

      return {
        mediaId,
        mediaKey: mediaId,
        expiresAfter: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

    } catch (error: unknown) {
      const err = error as Error;
      console.error('❌ [Chunked Upload] Error during chunked upload:', {
        message: err.message,
        stack: err.stack,
      });

      // Provide specific error messages for chunked upload phases
      if (err.message.includes('INIT phase failed')) {
        throw new Error(`Video upload initialization failed: ${err.message}. Check OAuth 1.0a credentials and app permissions.`);
      } else if (err.message.includes('APPEND phase failed')) {
        throw new Error(`Video upload chunk transfer failed: ${err.message}. The upload may have timed out.`);
      } else if (err.message.includes('FINALIZE phase failed')) {
        throw new Error(`Video upload finalization failed: ${err.message}. The video may be corrupted or invalid.`);
      } else if (err.message.includes('STATUS phase failed')) {
        throw new Error(`Video processing failed: ${err.message}. The video format may not be supported.`);
      }

      throw err;
    }
  }

  /**
   * Poll Twitter's STATUS endpoint until video processing is complete
   * Videos require server-side processing after upload
   */
  private async pollVideoProcessingStatus(
    client: TwitterApi,
    mediaId: string,
    processingInfo: any
  ): Promise<void> {
    const MAX_POLL_ATTEMPTS = 60; // 60 attempts * 5 seconds = 5 minutes max
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
      const checkAfterSecs = processingInfo.check_after_secs || 5;
      console.log(`📸 [Chunked Upload] STATUS: Waiting ${checkAfterSecs}s before next poll (attempt ${attempts + 1}/${MAX_POLL_ATTEMPTS})...`);

      // Wait before polling
      await new Promise(resolve => setTimeout(resolve, checkAfterSecs * 1000));

      // Poll for status
      console.log('📸 [Chunked Upload] STATUS: Polling processing status...');
      const statusResponse = await client.v1.get('media/upload.json', {
        command: 'STATUS',
        media_id: mediaId,
      });

      if (!statusResponse || typeof statusResponse !== 'object') {
        console.error('❌ [Chunked Upload] STATUS: Invalid response type:', typeof statusResponse);
        throw new Error(`STATUS phase failed: Received ${typeof statusResponse} instead of JSON object.`);
      }

      const status = (statusResponse as any).processing_info;
      if (!status) {
        console.log('✅ [Chunked Upload] STATUS: Processing complete (no processing_info)');
        return;
      }

      console.log('📸 [Chunked Upload] STATUS: Current state:', status.state);

      // Check processing state
      if (status.state === 'succeeded') {
        console.log('✅ [Chunked Upload] STATUS: Video processing succeeded');
        return;
      } else if (status.state === 'failed') {
        const errorMsg = status.error?.message || 'Unknown error';
        console.error('❌ [Chunked Upload] STATUS: Video processing failed:', errorMsg);
        throw new Error(`Video processing failed: ${errorMsg}`);
      } else if (status.state === 'in_progress') {
        // Continue polling
        const progressPercent = status.progress_percent || 0;
        console.log(`📸 [Chunked Upload] STATUS: Processing in progress (${progressPercent}%)...`);
        processingInfo = status;
        attempts++;
      } else {
        console.warn('⚠️ [Chunked Upload] STATUS: Unknown state:', status.state);
        attempts++;
      }
    }

    // Max attempts reached
    throw new Error('Video processing timeout: Maximum polling attempts reached (5 minutes). The video may be too large or complex to process.');
  }

  /**
   * Encrypt credentials for storage
   */
  encryptCredentials(credentials: XCredentials): string {
    return CryptoJS.AES.encrypt(JSON.stringify(credentials), getEncryptionKey()).toString();
  }

  /**
   * Decrypt credentials from storage
   */
  decryptCredentials(encryptedData: string): XCredentials {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid encrypted data: must be a non-empty string');
      }

      const bytes = CryptoJS.AES.decrypt(encryptedData, getEncryptionKey());
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error('Decryption resulted in empty data - credentials may be corrupted');
      }

      const credentials = JSON.parse(decryptedData);

      // Validate the decrypted credentials structure
      if (!credentials || typeof credentials !== 'object') {
        throw new Error('Decrypted data is not a valid credentials object');
      }

      if (!credentials.accessToken || typeof credentials.accessToken !== 'string') {
        throw new Error('Decrypted credentials missing valid accessToken');
      }

      return credentials;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [Credentials] Decryption failed:', {
        error: err.message,
        hasData: !!encryptedData,
        dataLength: encryptedData?.length || 0,
      });
      throw new Error(`Failed to decrypt credentials: ${err.message}`);
    }
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const tracker = this.rateLimitTracker.get(endpoint);

    if (!tracker || now > tracker.resetTime) {
      // Reset or initialize tracker
      this.rateLimitTracker.set(endpoint, {
        count: 1,
        resetTime: now + (3 * 60 * 60 * 1000), // 3 hours
      });
      return true;
    }

    if (tracker.count >= RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS]) {
      return false;
    }

    tracker.count++;
    return true;
  }
}

export const xApiService = new XApiService();