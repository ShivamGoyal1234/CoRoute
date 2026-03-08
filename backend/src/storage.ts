import path from 'path';
import config from './config';
import ImageKit from '@imagekit/nodejs';
import { toFile } from '@imagekit/nodejs';

let imagekitClient: InstanceType<typeof ImageKit> | null = null;

function getImageKit(): InstanceType<typeof ImageKit> {
  if (!imagekitClient) {
    if (!config.imagekit.privateKey) {
      throw new Error('IMAGEKIT_PRIVATE_KEY is required. Set it in your .env file.');
    }
    imagekitClient = new ImageKit({
      privateKey: config.imagekit.privateKey,
    });
  }
  return imagekitClient;
}

/**
 * Upload file to ImageKit (any file type: images, PDFs, documents). Returns the public URL.
 */
export async function uploadToImageKit(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<string> {
  const client = getImageKit();
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(fileName)}`;
  const file = await toFile(buffer, uniqueName, { type: mimeType || 'application/octet-stream' });

  const folder = config.imagekit.folder ? `${config.imagekit.folder}/` : undefined;
  const result = await client.files.upload({
    file,
    fileName: uniqueName,
    folder,
    useUniqueFileName: false,
  });

  if (!result.url) throw new Error('ImageKit upload did not return a URL');
  return result.url;
}

/**
 * Upload multer file (buffer) to ImageKit and return the URL to store in DB.
 */
export async function getFileUrlAfterUpload(
  file: Express.Multer.File & { buffer?: Buffer }
): Promise<string> {
  if (!file.buffer) throw new Error('File buffer is required (use multer.memoryStorage())');
  return uploadToImageKit(file.buffer, file.originalname, file.mimetype);
}
