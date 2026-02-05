/**
 * Cloudflare R2 Storage Integration for MCOS Deliverables
 * 
 * Handles file upload/download to R2 for binary deliverable attachments.
 * Uses presigned URLs for direct browser uploads.
 */

interface R2Config {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

// Get R2 config from environment
function getR2Config(): R2Config | null {
  const accountId = process.env.NEXT_PUBLIC_R2_ACCOUNT_ID;
  const bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME;
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  
  // Server-side only secrets
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !bucketName) {
    console.warn('R2 configuration incomplete. File uploads will be simulated.');
    return null;
  }

  return {
    accountId,
    bucketName,
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
    publicUrl,
  };
}

/**
 * Generate a unique key for a file
 */
function generateFileKey(filename: string, type: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const folder = type.split('/')[0] || 'files';
  
  return `deliverables/${folder}/${timestamp}-${random}-${sanitizedName}`;
}

/**
 * Upload a file to R2 (via API route for presigned URL)
 */
export async function uploadToR2(file: File, squad: string): Promise<UploadResult> {
  try {
    const key = generateFileKey(file.name, file.type);
    
    // In production, this would:
    // 1. Call an API route to get a presigned URL
    // 2. Upload directly to R2 using the presigned URL
    // 3. Return the public URL
    
    // For now, simulate upload (to be replaced with actual R2 integration)
    console.log(`[R2] Would upload file: ${file.name} (${file.size} bytes) to key: ${key}`);
    
    // Create a local object URL as a placeholder
    const localUrl = URL.createObjectURL(file);
    
    // In production, this would return the R2 public URL
    return {
      success: true,
      url: localUrl,
      key,
    };
  } catch (error) {
    console.error('[R2] Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get a signed download URL for a file
 */
export async function getDownloadUrl(key: string): Promise<string | null> {
  const config = getR2Config();
  
  if (!config?.publicUrl) {
    // Return the key as-is if it's already a full URL
    if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('blob:')) {
      return key;
    }
    return null;
  }

  return `${config.publicUrl}/${key}`;
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    console.log(`[R2] Would delete file with key: ${key}`);
    // In production, this would call an API route to delete from R2
    return true;
  } catch (error) {
    console.error('[R2] Delete failed:', error);
    return false;
  }
}

/**
 * Check if a URL is an R2 URL
 */
export function isR2Url(url: string): boolean {
  const config = getR2Config();
  if (!config?.publicUrl) return false;
  return url.startsWith(config.publicUrl);
}

/**
 * Extract the key from an R2 URL
 */
export function getKeyFromUrl(url: string): string | null {
  const config = getR2Config();
  if (!config?.publicUrl) return null;
  
  if (url.startsWith(config.publicUrl)) {
    return url.slice(config.publicUrl.length + 1);
  }
  return null;
}

// Types for API route handlers
export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  squad: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}
