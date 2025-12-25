"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCourseImageKey = exports.validateFileSize = exports.generateProfileImageKey = exports.imageFileFilter = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const imageFileFilter = (req, file, callback) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = (0, path_1.extname)(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return callback(new common_1.BadRequestException(`Only image files are allowed (${allowedExtensions.join(', ')})`), false);
    }
    callback(null, true);
};
exports.imageFileFilter = imageFileFilter;
const generateProfileImageKey = (userType, userId, filename) => {
    const ext = (0, path_1.extname)(filename);
    const timestamp = Date.now();
    return `${userType}/${userId}/profile/images/${timestamp}${ext}`;
};
exports.generateProfileImageKey = generateProfileImageKey;
const validateFileSize = (file, maxSizeInMB = 5) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        throw new common_1.BadRequestException(`File size exceeds the maximum allowed size of ${maxSizeInMB}MB`);
    }
};
exports.validateFileSize = validateFileSize;
const generateCourseImageKey = (courseId, filename, type) => {
    const ext = (0, path_1.extname)(filename);
    const timestamp = Date.now();
    return `courses/${courseId}/${type}s/${timestamp}${ext}`;
};
exports.generateCourseImageKey = generateCourseImageKey;
//# sourceMappingURL=file-upload.util.js.map