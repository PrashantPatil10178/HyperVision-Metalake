import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { json } from 'stream/consumers';

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'ap-south-1',
      credentials: {
        accessKeyId: this.configService.get<string>('Accesskey')!,
        secretAccessKey: this.configService.get<string>('Secretkey')!,
      },
    });

    this.bucketName = 'delta-lake-project-dem0';
  }

  /**
   * List all Delta log files in the `_delta_log/` directory.
   */
  async listDeltaLogFiles(tablePath: string): Promise<string[]> {
    const deltaLogPrefix = `${tablePath}/_delta_log/`;
    this.logger.log(
      `📂 Searching for Delta logs in: s3://${this.bucketName}/${deltaLogPrefix}`,
    );

    const logFiles: string[] = [];

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: deltaLogPrefix,
      });

      let isTruncated = true;
      let continuationToken: string | undefined;

      while (isTruncated) {
        const response = await this.s3Client.send(command);
        if (response.Contents) {
          for (const obj of response.Contents) {
            this.logger.log(`🔹 Found log file: ${obj.Key}`);
            if (
              obj.Key?.endsWith('.json') ||
              obj.Key?.endsWith('.checkpoint.parquet')
            ) {
              logFiles.push(obj.Key);
            }
          }
        }

        isTruncated = response.IsTruncated ?? false;
        continuationToken = response.NextContinuationToken;
      }
    } catch (error) {
      this.logger.error('❌ Failed to list Delta log files:', error);
    }

    if (logFiles.length === 0) {
      this.logger.warn(`⚠️ No Delta log files found in ${deltaLogPrefix}`);
      return [];
    }

    // Sort numerically (since Delta log filenames are sequential numbers)
    return logFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });
  }

  /**
   * Get the latest Delta log file (either JSON or checkpoint).
   */
  async getLatestDeltaLog(tablePath: string): Promise<string | null> {
    const logFiles = await this.listDeltaLogFiles(tablePath);
    if (logFiles.length === 0) return null;
    return logFiles[logFiles.length - 1]; // Get the most recent log file
  }

  /**
   * Fetch and parse the latest Delta JSON transaction log.
   */
  async getLatestDeltaMetadata(): Promise<any | null> {
    const tablePath = 'delta-lake-resources';
    const latestLogFile = await this.getLatestDeltaLog(tablePath);

    if (!latestLogFile) {
      this.logger.error('❌ No Delta transaction log found.');
      return null;
    }

    this.logger.log(
      `✅ Fetching latest Delta log: s3://${this.bucketName}/${latestLogFile}`,
    );

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: latestLogFile,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('Empty response body from S3');
      }

      const fileStream = response.Body as Readable;
      const dataChunks: Buffer[] = [];

      for await (const chunk of fileStream) {
        dataChunks.push(chunk);
      }

      const jsonData = Buffer.concat(dataChunks).toString('utf-8');
      console.log(jsonData);
      return JSON.parse(jsonData); // Convert string to JSON object
    } catch (error) {
      this.logger.error('❌ Failed to fetch Delta log:', error);
      return null;
    }
  }
}
