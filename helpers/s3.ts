import * as Minio from 'minio';
import { getEnv } from '@helpers/env';
import { Logging } from '@helpers/logging';

export default class S3OperationBuilder {
    private static minioClient: any;
    private bucketName: string | undefined;

    static init(): void {
        if (S3OperationBuilder.minioClient) return;

        S3OperationBuilder.minioClient = new Minio.Client({
            endPoint: <string>getEnv('S3_ENDPOINT'),
            port: <number>getEnv('S3_PORT'),
            useSSL: false,
            accessKey: <string>getEnv('S3_ACCESS_KEY'),
            secretKey: <string>getEnv('S3_SECRET_KEY'),
        });
    }

    static setBucket(bucketName: string): S3OperationBuilder {
        S3OperationBuilder.init();

        const builder = new S3OperationBuilder();
        builder.bucketName = bucketName;

        return builder;
    }

    async uploadFileFromPath(objectName: string, filePath: string): Promise<any> {
        try {
            await S3OperationBuilder.minioClient.fPutObject(this.bucketName, objectName, filePath);

            Logging.debug('S3 upload successful!');
            return { success: true };
        } catch (error) {
            Logging.debug(`S3 upload failed: ${error}`);
            return { success: false, error: error };
        }
    }

    async getObjectUrl(objectName: string): Promise<any> {
        try {
            const object = await S3OperationBuilder.minioClient.presignedGetObject(this.bucketName, objectName);

            Logging.debug('S3 getObject successful!');
            return { success: object };
        } catch (error) {
            Logging.debug(`S3 getObject failed: ${error}`);
            return { success: false, error: error };
        }
    }

    async deleteObject(objectName: string): Promise<any> {
        try {
            const object = await S3OperationBuilder.minioClient.removeObject(this.bucketName, objectName);

            Logging.debug('S3 delete successful!');
            return { success: object };
        } catch (error) {
            Logging.error(`S3 delete failed: ${error}`);
            return { success: false, error: error };
        }
    }

    async listObjects(): Promise<any> {
        try {
            const data: any[] = [];
            const stream = await S3OperationBuilder.minioClient.listObjects(this.bucketName);


            return new Promise((resolve, reject) => {
                stream.on('data', (obj: Minio.BucketItem) => {
                    data.push(obj);
                });
                stream.on('end', () => {
                    Logging.debug(`S3 lists successful! Found ${data.length} objects.`);
                    resolve({ success: true, data });
                });
                stream.on('error', (error: any) => {
                    Logging.error(`S3 lists failed: ${error}`);
                    reject({ success: false, error });
                });
            });
        } catch (error) {
            Logging.debug(`S3 lists failed: ${error}`);
            return { success: false, error: error };
        }
    }
}
