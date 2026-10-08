import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!s3Client) {
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_S3_BUCKET_NAME) {
      logger.warn('S3Service', 'AWS S3 credentials or AWS_S3_BUCKET_NAME are missing in .env.');
      return null;
    }

    s3Client = new S3Client({
      region: env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

export async function uploadImageToS3(
  fileBuffer: Buffer,
  mimeType: string,
  folder = 'photos'
): Promise<string> {
  const client = getS3Client();
  const fileExtension = mimeType.split('/')[1] || 'jpg';
  const fileKey = `${folder}/${crypto.randomUUID()}.${fileExtension}`;
  const bucketName = env.AWS_S3_BUCKET_NAME || 'careerprepster-media';

  if (!client) {
    logger.info('S3Service', `S3 client unconfigured. Fallback: generating inline base64 URL for dev.`);
    return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await client.send(command);

    const s3Url = `https://${bucketName}.s3.${env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${fileKey}`;
    logger.info('S3Service', `Successfully uploaded image to S3: ${s3Url}`);
    return s3Url;
  } catch (err: any) {
    logger.error('S3Service', `Failed to upload image to S3: ${err.message}`, err);
    throw err;
  }
}
