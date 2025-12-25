-- AlterTable
ALTER TABLE `courses` ADD COLUMN `flyer` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `lecturers` ADD COLUMN `profileImage` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `students` ADD COLUMN `profileImage` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `course_images` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `course_images_courseId_idx`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_images` ADD CONSTRAINT `course_images_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
