import * as Minio from 'minio';
import { getEnv } from '@helpers/env';
import { Logging } from '@helpers/logging';

class S3 {
    static minioClient: any;
    static bucketName: string;

    static init(): void {
        // @ts-ignore
        S3.minioClient = new Minio.Client({
            endPoint: <string>getEnv('S3_ENDPOINT'),
            port: <number>getEnv('S3_PORT'),
            useSSL: <boolean>getEnv('S3_SSL'),
            accessKey: <string>getEnv('S3_ACCESS_KEY'),
            secretKey: <string>getEnv('S3_SECRET_KEY'),
        });
    }

    static setBucket(bucketName: string): void {
        S3.bucketName = bucketName;
    }

    static async uploadFile(objectName: string, filePath: string): Promise<any> {
        if (!S3.minioClient) S3.init();

        if (!S3.bucketName) throw new Error('Bucket name is missing!');

        try {
            await S3.minioClient.fPutObject(S3.bucketName, objectName, filePath);
            Logging.info('Uploaded file to S3');
        } catch (error) {
            Logging.error(`Error inside S3 helper: ${error}`);
        }
    }
}