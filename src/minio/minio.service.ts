import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private readonly bucket = process.env.MINIO_BUCKET || 'uploads';

  onModuleInit() {
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: (process.env.MINIO_USE_SSL || 'false') === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  /** Pastikan bucket ada */
  async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) await this.client.makeBucket(this.bucket, 'us-east-1');
  }

  /** Upload dari buffer (lebih simpel) */
  async uploadBuffer(objectName: string, buffer: Buffer, mime?: string) {
    await this.ensureBucket();
    await this.client.putObject(
      this.bucket,
      objectName,
      buffer,
      buffer.length,
      { 'Content-Type': mime || 'application/octet-stream' }
    );
    return { bucket: this.bucket, objectName };
  }

  /** Stream download */
  async getStream(objectName: string) {
    return this.client.getObject(this.bucket, objectName);
  }

  /** Hapus objek */
  async remove(objectName: string) {
    await this.client.removeObject(this.bucket, objectName);
    return { removed: true };
  }

  /** Signed URL untuk GET (lihat/unduh tanpa login) */
  async signedGetUrl(objectName: string, expirySeconds = 60 * 10) {
    return this.client.presignedGetObject(this.bucket, objectName, expirySeconds);
  }

  /** Signed URL untuk PUT (frontend upload langsung ke MinIO) */
  async signedPutUrl(objectName: string, expirySeconds = 60 * 10) {
    return this.client.presignedPutObject(this.bucket, objectName, expirySeconds);
  }
}
