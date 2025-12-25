import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucketName;
    constructor(configService: ConfigService);
    uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;
    deleteFile(key: string): Promise<void>;
    extractKeyFromUrl(url: string): string;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}
