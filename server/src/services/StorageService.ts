import mongoose from 'mongoose';
import crypto from 'crypto';
import { EncryptionService } from './EncryptionService.js';
import { Readable } from 'stream';

export class StorageService {
  private static getBucket() {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
    return new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'vault_assets'
    });
  }

  static async saveFile(file: Express.Multer.File): Promise<{ path: string; iv: string; authTag: string; fileHash: string }> {
    const { encryptedData, iv, authTag } = EncryptionService.encrypt(file.buffer);
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const fileName = `${Date.now()}-${file.originalname}.enc`;

    const bucket = this.getBucket();
    const uploadStream = bucket.openUploadStream(fileName, {
      metadata: { fileHash, iv, authTag }
    });

    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(encryptedData);
      readableStream.push(null);

      readableStream.pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => {
          resolve({
            path: fileName,
            iv,
            authTag,
            fileHash
          });
        });
    });
  }

  static async getFile(fileName: string, iv: string, authTag: string): Promise<Buffer> {
    const bucket = this.getBucket();
    const downloadStream = bucket.openDownloadStreamByName(fileName);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      (downloadStream as any).on('data', (chunk: Buffer) => chunks.push(chunk));
      (downloadStream as any).on('error', reject);
      (downloadStream as any).on('end', () => {
        const encryptedData = Buffer.concat(chunks);
        resolve(EncryptionService.decrypt(encryptedData, iv, authTag));
      });
    });
  }

  static async deleteFile(fileName: string): Promise<void> {
    const bucket = this.getBucket();
    const files = await bucket.find({ filename: fileName }).toArray();
    const file = files[0];
    
    if (file && file._id) {
      await bucket.delete(file._id);
    }
  }
}
