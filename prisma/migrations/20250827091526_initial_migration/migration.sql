-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "privyId" TEXT,
    "walletAddress" TEXT,
    "vibePoints" INTEGER NOT NULL DEFAULT 0,
    "promptsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "comparisonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "dayStreak" INTEGER NOT NULL DEFAULT 0,
    "hasOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "age" TEXT,
    "educationLevel" TEXT,
    "country" TEXT,
    "city" TEXT,
    "occupation" TEXT,
    "lastActiveDate" TIMESTAMP(3),
    "voiceConversations" INTEGER NOT NULL DEFAULT 0,
    "voiceMessageCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteVoiceRoom" TEXT,
    "totalVoiceTime" INTEGER NOT NULL DEFAULT 0,
    "gender" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceLevel" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "projectPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Prompt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "modelA" TEXT NOT NULL,
    "modelB" TEXT NOT NULL,
    "modelALabel" TEXT NOT NULL,
    "modelBLabel" TEXT NOT NULL,
    "selectedModel" TEXT,
    "feedback" TEXT,
    "responseTimeA" INTEGER,
    "responseTimeB" INTEGER,
    "pointsEarned" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selectedNeither" BOOLEAN NOT NULL DEFAULT false,
    "userCorrectAnswer" TEXT,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoiceSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "sessionDuration" INTEGER,

    CONSTRAINT "VoiceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoiceMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "agentPersonality" TEXT NOT NULL,
    "agentModel" TEXT NOT NULL,
    "agentResponse" TEXT NOT NULL,
    "agentAudioUrl" TEXT,
    "responseTime" INTEGER,
    "pointsEarned" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoiceFeedback" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "enjoyedConversation" BOOLEAN,
    "hostRating" INTEGER,
    "conversationRating" INTEGER,
    "feedbackText" TEXT,
    "wouldReturnToRoom" BOOLEAN,
    "hostPersonality" TEXT NOT NULL,
    "suggestedImprovements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoomUsageStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastVisited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "averageRating" DOUBLE PRECISION,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomUsageStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Trading" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vibePointsTraded" INTEGER NOT NULL,
    "cryptoSymbol" TEXT NOT NULL,
    "cryptoAmount" DOUBLE PRECISION NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "usdValue" DOUBLE PRECISION,
    "transactionHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "estimatedHours" INTEGER,
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredExperience" TEXT,
    "maxAssignments" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "createdBy" TEXT,
    "instructions" TEXT,
    "datasetUrl" TEXT,
    "submissionFormat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "submissionData" TEXT,
    "submissionNotes" TEXT,
    "feedback" TEXT,
    "rating" DOUBLE PRECISION,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "matchScore" DOUBLE PRECISION,

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnnotationProject" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "payRate" TEXT NOT NULL,
    "isStarter" BOOLEAN NOT NULL DEFAULT false,
    "passScore" INTEGER NOT NULL DEFAULT 80,

    CONSTRAINT "AnnotationProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnnotationQuestion" (
    "id" TEXT NOT NULL,
    "annotationProjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userQuery" TEXT,
    "context" TEXT,
    "questionType" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "timeLimit" INTEGER,
    "pointsWorth" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "AnnotationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnnotationResponse" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "responseLabel" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "aiModel" TEXT,
    "responseTime" INTEGER,

    CONSTRAINT "AnnotationResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnnotationSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedResponse" TEXT,
    "reasoning" TEXT,
    "confidence" INTEGER,
    "timeSpent" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnotationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_privyId_key" ON "public"."User"("privyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "public"."User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceFeedback_sessionId_key" ON "public"."VoiceFeedback"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomUsageStats_userId_roomId_key" ON "public"."RoomUsageStats"("userId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProject_userId_projectId_key" ON "public"."UserProject"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnotationProject_projectId_key" ON "public"."AnnotationProject"("projectId");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prompt" ADD CONSTRAINT "Prompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comparison" ADD CONSTRAINT "Comparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comparison" ADD CONSTRAINT "Comparison_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "public"."Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoiceSession" ADD CONSTRAINT "VoiceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoiceMessage" ADD CONSTRAINT "VoiceMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."VoiceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoiceMessage" ADD CONSTRAINT "VoiceMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoiceFeedback" ADD CONSTRAINT "VoiceFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."VoiceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoiceFeedback" ADD CONSTRAINT "VoiceFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomUsageStats" ADD CONSTRAINT "RoomUsageStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Trading" ADD CONSTRAINT "Trading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProject" ADD CONSTRAINT "UserProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProject" ADD CONSTRAINT "UserProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnotationProject" ADD CONSTRAINT "AnnotationProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnotationQuestion" ADD CONSTRAINT "AnnotationQuestion_annotationProjectId_fkey" FOREIGN KEY ("annotationProjectId") REFERENCES "public"."AnnotationProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnotationResponse" ADD CONSTRAINT "AnnotationResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."AnnotationQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnotationSubmission" ADD CONSTRAINT "AnnotationSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnotationSubmission" ADD CONSTRAINT "AnnotationSubmission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."AnnotationQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
