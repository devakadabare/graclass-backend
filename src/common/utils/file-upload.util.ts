import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return callback(
      new BadRequestException(
        `Only image files are allowed (${allowedExtensions.join(', ')})`,
      ),
      false,
    );
  }

  callback(null, true);
};

export const generateProfileImageKey = (
  userType: 'lecturers' | 'students',
  userId: string,
  filename: string,
): string => {
  const ext = extname(filename);
  const timestamp = Date.now();
  return `${userType}/${userId}/profile/images/${timestamp}${ext}`;
};

export const validateFileSize = (
  file: Express.Multer.File,
  maxSizeInMB: number = 5,
): void => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    throw new BadRequestException(
      `File size exceeds the maximum allowed size of ${maxSizeInMB}MB`,
    );
  }
};

export const generateCourseImageKey = (
  courseId: string,
  filename: string,
  type: 'flyer' | 'image',
): string => {
  const ext = extname(filename);
  const timestamp = Date.now();
  return `courses/${courseId}/${type}s/${timestamp}${ext}`;
};
