export declare const imageFileFilter: (req: any, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
export declare const generateProfileImageKey: (userType: "lecturers" | "students", userId: string, filename: string) => string;
export declare const validateFileSize: (file: Express.Multer.File, maxSizeInMB?: number) => void;
export declare const generateCourseImageKey: (courseId: string, filename: string, type: "flyer" | "image") => string;
