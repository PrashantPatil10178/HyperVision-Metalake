import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {}

  configureS3(
    provider: 'gcp' | 'azure' | 'aws' | 'minio',
    accessKeyId: string,
    secretAccessKey: string,
    endpoint?: string | null,
    region?: string,
  ) {
    const config: any = {
      region: region || 'ap-south-1',
      credentials: { accessKeyId, secretAccessKey },
    };

    if (provider === 'gcp') {
      config.endpoint = endpoint || 'https://storage.googleapis.com';
      config.s3ForcePathStyle = false;
    } else if (provider === 'azure') {
      config.endpoint =
        endpoint || 'https://<storage-account>.blob.core.windows.net';
      config.s3ForcePathStyle = true;
    } else if (provider === 'minio' || endpoint) {
      config.endpoint = endpoint;
      config.forcePathStyle = true;
    }

    this.s3Client = new S3Client(config);
  }

  private ensureClientConfigured() {
    if (!this.s3Client) {
      throw new Error('S3 Client is not configured. Call configureS3 first.');
    }
  }

  async testBucketConnection(
    bucket: string,
    format: 'iceberg' | 'hudi' | 'delta',
  ): Promise<{ bucketExists: boolean; hasMetadata: boolean }> {
    this.ensureClientConfigured();
    try {
      const testBucket = await this.s3Client.send(
        new ListObjectsV2Command({ Bucket: bucket }),
      );

      console.log(testBucket, 'I have reached here ');
      let hasMetadata = false;

      if (format === 'iceberg') {
        const metadataFiles = await this.listObjects(bucket, `metadata/`);
        console.log(metadataFiles);
        hasMetadata = metadataFiles.some((file: string) =>
          file.endsWith('.metadata.json'),
        );
      } else if (format === 'hudi') {
        const hoodieFiles = await this.listObjects(bucket, `.hoodie/`);
        hasMetadata = hoodieFiles.length > 0;
      } else if (format === 'delta') {
        const deltaFiles = await this.listObjects(bucket, `_delta_log/`);
        hasMetadata = deltaFiles.some((file: string) => file.endsWith('.json'));
      }

      return { bucketExists: true, hasMetadata };
    } catch (error) {
      console.error(`Bucket connection test failed: ${error}`);
      return { bucketExists: false, hasMetadata: false };
    }
  }

  async uploadObject(bucket: string, key: string, body: Buffer | string) {
    this.ensureClientConfigured();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
    });
    return this.s3Client.send(command);
  }

  async getObject(bucket: string, key: string): Promise<Buffer> {
    this.ensureClientConfigured();
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await this.s3Client.send(command);

    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      (response.Body as Readable).on('data', (chunk) => chunks.push(chunk));
      (response.Body as Readable).on('end', () =>
        resolve(Buffer.concat(chunks)),
      );
      (response.Body as Readable).on('error', reject);
    });
  }

  async listObjects(bucket: string, prefix: string) {
    this.ensureClientConfigured();
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });
    const response = await this.s3Client.send(command);
    return response.Contents?.map((obj) => obj.Key) || [];
  }

  async fetchIcebergMetadata(bucket: string, prefix: string) {
    console.log(`${prefix}/metadata/`);
    const metadataFiles = await this.listObjects(bucket, `${prefix}/metadata/`);
    console.log(metadataFiles);

    const metadataFilePaths = metadataFiles.filter((file) =>
      file?.endsWith('.metadata.json'),
    );

    console.log(metadataFilePaths);

    if (metadataFilePaths.length > 0) {
      // Fetch and parse all metadata files
      const metadataContents = await Promise.all(
        metadataFilePaths.map(async (file) => {
          const data = await this.getObject(bucket, file!);

          return JSON.parse(data.toString());
        }),
      );

      return metadataContents[metadataFilePaths.length - 1];
    }

    return null;
  }

  async fetchHudiMetadata(bucket: string, prefix: string) {
    const hoodieFiles = await this.listObjects(bucket, `${prefix}/.hoodie/`);
    console.log('Fetched Files:', hoodieFiles);
    return hoodieFiles.length > 0 ? { type: 'hudi', files: hoodieFiles } : null;
  }

  async fetchDeltaMetadata(bucket: string, prefix: string) {
    const deltaFiles = await this.listObjects(bucket, `${prefix}/_delta_log/`);
    console.log('Fetched Files:', deltaFiles);

    const latestJsonFile = deltaFiles
      .filter((file) => file?.endsWith('.json'))
      .pop();

    if (latestJsonFile) {
      return this.getObject(bucket, latestJsonFile).then((data) => {
        const rawJson = data.toString().trim(); // Trim any extra whitespace
        console.log('Raw JSON Content:', rawJson);

        try {
          // Split the JSON lines and parse each line separately
          const jsonObjects = rawJson
            .split('\n')
            .map((line) => JSON.parse(line));

          return jsonObjects; // Return an array of parsed objects
        } catch (error) {
          console.error('JSON Parse Error:', error, 'Raw Content:', rawJson);
          return null;
        }
      });
    }
    return null;
  }

  async fetchTableMetadata(bucket: string, prefix: string) {
    const icebergMetadata = await this.fetchIcebergMetadata(bucket, prefix);
    if (icebergMetadata) return { type: 'iceberg', metadata: icebergMetadata };

    const hudiMetadata = await this.fetchHudiMetadata(bucket, prefix);
    if (hudiMetadata) return hudiMetadata;

    const deltaMetadata = await this.fetchDeltaMetadata(bucket, prefix);
    if (deltaMetadata) return { type: 'delta', metadata: deltaMetadata };

    return { error: 'No metadata found' };
  }
  async searchForTablesInBucket(buckets: string[]): Promise<any> {
    this.ensureClientConfigured();
    const discoveredTables: any[] = [];

    for (const bucket of buckets) {
      try {
        const params = {
          Bucket: bucket,
          Delimiter: '/',
        };

        const folder = await this.s3Client.send(
          new ListObjectsV2Command(params),
        );
        console.log(folder, 'Folder');

        // Extract folder names from CommonPrefixes
        const allObjects =
          folder.CommonPrefixes?.map((prefix) => prefix.Prefix) || [];

        const topLevelPrefixes = new Set<string>();
        for (const obj of allObjects) {
          const key = obj ?? '';
          if (key.includes('/')) {
            const folder = key.split('/')[0] + '/'; // Ensure trailing slash
            topLevelPrefixes.add(folder);
          }
        }

        // Also include root level files for Parquet detection
        const rootLevelFiles = folder.Contents?.map((obj) => obj.Key) || [];
        for (const file of rootLevelFiles) {
          if (file?.endsWith('.parquet')) {
            discoveredTables.push({
              table: `s3://${bucket}/${file}`,
              format: 'parquet',
            });
          }
        }

        for (const prefix of topLevelPrefixes) {
          try {
            // 1️⃣ Check Iceberg (metadata folder with .metadata.json)
            const icebergFiles = await this.listObjects(
              bucket,
              `${prefix}metadata/`,
            );
            console.log('Iceberg Files:', icebergFiles);
            if (icebergFiles.some((file) => file?.endsWith('.metadata.json'))) {
              discoveredTables.push({
                table: prefix.replace(/\/$/, ''),
                format: 'iceberg',
              });
              continue; // Skip other checks if Iceberg found
            }

            // 2️⃣ Check Delta (_delta_log with .json files)
            const deltaFiles = await this.listObjects(
              bucket,
              `${prefix}_delta_log/`,
            );
            console.log('Delta Files:', deltaFiles);
            if (deltaFiles.some((file) => file?.endsWith('.json'))) {
              discoveredTables.push({
                table: prefix.replace(/\/$/, ''),
                format: 'delta',
              });
              continue; // Skip other checks if Delta found
            }

            // 3️⃣ Check Hudi (_hoodie with metadata files)
            const hudiFiles = await this.listObjects(bucket, `${prefix}`);
            console.log('Hudi Files:', hudiFiles);
            if (
              hudiFiles.some(
                (file) =>
                  file?.includes('hoodie.properties') ||
                  file?.includes('_hoodie_partition_metadata') ||
                  file?.endsWith('.hoodie'),
              )
            ) {
              discoveredTables.push({
                table: prefix.replace(/\/$/, ''),
                format: 'hudi',
              });
              continue; // Skip other checks if Hudi found
            }

            // 4️⃣ Check Parquet (individual files or folders containing .parquet)
            const filesInFolder = await this.listObjects(bucket, prefix);
            const parquetFiles = filesInFolder.filter(
              (file) => file?.endsWith('.parquet') && !file.includes('/'),
            );

            if (parquetFiles.length > 0) {
              // For Parquet, return each file as a separate table with full S3 URL
              parquetFiles.forEach((file) => {
                discoveredTables.push({
                  table: `s3://${bucket}/${prefix}${file}`,
                  format: 'parquet',
                });
              });
            }
          } catch (error) {
            console.error(`Error scanning ${prefix} in ${bucket}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing bucket ${bucket}:`, error);
      }
    }

    return discoveredTables.length > 0
      ? discoveredTables
      : { message: 'No tables found' };
  }

  async parseAvro(s3Url: string) {
    // Convert s3a:// to s3://
    s3Url = s3Url.replace(/^s3a:\/\//, 's3://');

    // Ensure it's an S3 URL
    const match = s3Url.match(/^s3:\/\/([^\/]+)\/(.+)$/);
    if (!match) {
      throw new Error('Invalid S3 URL format');
    }

    // Convert S3 URL to public HTTP URL
    const bucket = match[1];
    const key = match[2];
    const publicUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

    // Download the Avro file directly from the public S3 URL
    const response = await fetch(publicUrl);
    if (!response.ok) {
      throw new Error(`Failed to download Avro file: ${response.statusText}`);
    }

    const avroFile = await response.arrayBuffer();

    // Send to Avro parser API
    const formData = new FormData();
    formData.append('file', new Blob([avroFile]), 'avro.avro');

    const parseResponse = await fetch(
      'https://arvo-parser.onrender.com/upload',
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!parseResponse.ok) {
      throw new Error(`Failed to parse Avro file: ${parseResponse.statusText}`);
    }

    return parseResponse.json(); // Return parsed JSON
  }
}
