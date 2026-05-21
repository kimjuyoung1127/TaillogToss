/**
 * Storage image upload helpers.
 * Parity: APP-001, B2B-001
 */
import { supabase } from './supabase';

function getImageUploadMeta(fileUri: string): { extension: string; contentType: string } {
  const dataUriMatch = /^data:(image\/([a-zA-Z0-9.+-]+));base64,/.exec(fileUri);
  if (dataUriMatch) {
    const contentType = dataUriMatch[1] ?? 'image/png';
    const rawExtension = (dataUriMatch[2] ?? 'png').toLowerCase();
    const extension = rawExtension === 'jpeg' ? 'jpg' : rawExtension.replace('+xml', '');
    return { extension, contentType };
  }

  const uriWithoutQuery = fileUri.split('?')[0] ?? fileUri;
  const cleanUri = uriWithoutQuery.split('#')[0] ?? uriWithoutQuery;
  const lastSegment = cleanUri.split('/').pop() ?? '';
  const extension = lastSegment.includes('.') ? lastSegment.split('.').pop()?.toLowerCase() || 'jpg' : 'jpg';
  const normalizedExtension = extension === 'jpeg' ? 'jpg' : extension;
  const contentType = normalizedExtension === 'jpg' ? 'image/jpeg' : `image/${normalizedExtension}`;

  return { extension: normalizedExtension, contentType };
}

function dataUriToArrayBuffer(fileUri: string): ArrayBuffer {
  const base64 = fileUri.replace(/^data:[^;]+;base64,/, '');
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function requestUriAsBlob(fileUri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as Blob);
      } else {
        reject(new Error(`Image request failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Image request failed'));
    xhr.responseType = 'blob';
    xhr.open('GET', fileUri);
    xhr.send();
  });
}

async function readImageBody(fileUri: string): Promise<Blob | ArrayBuffer> {
  if (fileUri.startsWith('data:')) {
    return dataUriToArrayBuffer(fileUri);
  }

  try {
    const response = await fetch(fileUri);
    return await response.blob();
  } catch (fetchError) {
    if (/^(content|file):\/\//.test(fileUri)) {
      return requestUriAsBlob(fileUri);
    }
    throw fetchError;
  }
}

export async function uploadImageToPublicStorage(
  bucket: string,
  filePathWithoutExtension: string,
  fileUri: string,
): Promise<string> {
  const { extension, contentType } = getImageUploadMeta(fileUri);
  const imageBody = await readImageBody(fileUri);
  const filePath = `${filePathWithoutExtension}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, imageBody, {
      contentType,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
