/*
  Warnings:

  - You are about to drop the column `pointsEarned` on the `Comparison` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `favoriteVoiceRoom` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `privyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalVoiceTime` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `voiceConversations` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `voiceMessageCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnnotationProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnnotationQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnnotationResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnnotationSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomUsageStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trading` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoiceFeedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoiceMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoiceSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[worldIdNullifier]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[worldChainAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `worldIdNullifier` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AnnotationProject" DROP CONSTRAINT "AnnotationProject_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AnnotationQuestion" DROP CONSTRAINT "AnnotationQuestion_annotationProjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AnnotationResponse" DROP CONSTRAINT "AnnotationResponse_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AnnotationSubmission" DROP CONSTRAINT "AnnotationSubmission_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AnnotationSubmission" DROP CONSTRAINT "AnnotationSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoomUsageStats" DROP CONSTRAINT "RoomUsageStats_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trading" DROP CONSTRAINT "Trading_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProject" DROP CONSTRAINT "UserProject_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProject" DROP CONSTRAINT "UserProject_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoiceFeedback" DROP CONSTRAINT "VoiceFeedback_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoiceFeedback" DROP CONSTRAINT "VoiceFeedback_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoiceMessage" DROP CONSTRAINT "VoiceMessage_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoiceMessage" DROP CONSTRAINT "VoiceMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoiceSession" DROP CONSTRAINT "VoiceSession_userId_fkey";

-- DropIndex
DROP INDEX "public"."User_email_key";

-- DropIndex
DROP INDEX "public"."User_privyId_key";

-- DropIndex
DROP INDEX "public"."User_walletAddress_key";

-- AlterTable
ALTER TABLE "public"."Comparison" DROP COLUMN "pointsEarned",
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "emailVerified",
DROP COLUMN "favoriteVoiceRoom",
DROP COLUMN "privyId",
DROP COLUMN "totalVoiceTime",
DROP COLUMN "voiceConversations",
DROP COLUMN "voiceMessageCount",
DROP COLUMN "walletAddress",
ADD COLUMN     "verificationLevel" TEXT,
ADD COLUMN     "worldChainAddress" TEXT,
ADD COLUMN     "worldIdNullifier" TEXT NOT NULL,
ADD COLUMN     "worldIdVerified" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."Account";

-- DropTable
DROP TABLE "public"."AnnotationProject";

-- DropTable
DROP TABLE "public"."AnnotationQuestion";

-- DropTable
DROP TABLE "public"."AnnotationResponse";

-- DropTable
DROP TABLE "public"."AnnotationSubmission";

-- DropTable
DROP TABLE "public"."Project";

-- DropTable
DROP TABLE "public"."RoomUsageStats";

-- DropTable
DROP TABLE "public"."Session";

-- DropTable
DROP TABLE "public"."Trading";

-- DropTable
DROP TABLE "public"."UserProject";

-- DropTable
DROP TABLE "public"."VerificationToken";

-- DropTable
DROP TABLE "public"."VoiceFeedback";

-- DropTable
DROP TABLE "public"."VoiceMessage";

-- DropTable
DROP TABLE "public"."VoiceSession";

-- CreateTable
CREATE TABLE "public"."WorldChainPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "transactionHash" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WorldChainPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorldChainPayment_reference_key" ON "public"."WorldChainPayment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "User_worldIdNullifier_key" ON "public"."User"("worldIdNullifier");

-- CreateIndex
CREATE UNIQUE INDEX "User_worldChainAddress_key" ON "public"."User"("worldChainAddress");

-- AddForeignKey
ALTER TABLE "public"."Comparison" ADD CONSTRAINT "Comparison_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."WorldChainPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorldChainPayment" ADD CONSTRAINT "WorldChainPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
