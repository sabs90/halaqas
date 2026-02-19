export async function uploadToR2(
  fileBuffer: ArrayBuffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'halaqas-images';

  if (!accountId || !accessKeyId || !secretAccessKey) {
    // Fallback: store as data URL if R2 not configured
    const base64 = Buffer.from(fileBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  }

  // Use S3-compatible API endpoint for Cloudflare R2
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const key = `flyers/${Date.now()}-${fileName}`;

  // Simple PUT request with basic auth headers
  // In production, use AWS SDK v3 with S3 client for proper signing
  const url = `${endpoint}/${bucketName}/${key}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status}`);
  }

  // Return the public URL (assuming public bucket or custom domain)
  return `https://images.halaqas.com/${key}`;
}
