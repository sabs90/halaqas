import { getServiceClient } from './supabase';

const BUCKET = 'flyers';

export async function uploadFlyer(
  fileBuffer: ArrayBuffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const supabase = getServiceClient();
  const key = `${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, fileBuffer, { contentType, upsert: false });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}
