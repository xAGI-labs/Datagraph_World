import { prisma } from "@/lib/prisma";

/**
 * Helper function to find a user by World ID nullifier
 * @param worldIdNullifier - The World ID nullifier from the user
 * @returns User from database or null if not found
 */
export const findUserByWorldId = async (worldIdNullifier: string) => {
  if (!worldIdNullifier) return null;

  const existingUser = await prisma.user.findUnique({
    where: { worldIdNullifier },
  });

  return existingUser;
};

/**
 * Helper function to find a user by their ID
 * @param userId - The user ID
 * @returns User from database or null if not found
 */
export const findUserById = async (userId: string) => {
  if (!userId) return null;

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  return existingUser;
};

/**
 * Helper function to validate World ID user authentication from request body
 * @param requestBody - The request body containing user data
 * @returns Object with user and any validation errors
 */
export const validateWorldIdAuth = async (requestBody: any) => {
  const { userId, worldIdNullifier } = requestBody;

  // Allow authentication by either userId or worldIdNullifier
  if (!userId && !worldIdNullifier) {
    return {
      user: null,
      error: "Unauthorized - missing user identification",
      status: 401,
    };
  }

  let dbUser;

  if (userId) {
    dbUser = await findUserById(userId);
  } else if (worldIdNullifier) {
    dbUser = await findUserByWorldId(worldIdNullifier);
  }

  if (!dbUser) {
    return { user: null, error: "User not found", status: 404 };
  }

  // Verify that the user has completed World ID verification
  if (!dbUser.worldIdVerified) {
    return { user: null, error: "World ID verification required", status: 403 };
  }

  return { user: dbUser, error: null, status: 200 };
};

/**
 * Helper function to validate that a user exists and is World ID verified
 * @param userId - The user ID to validate
 * @returns Object with user and any validation errors
 */
export const validateUserById = async (userId: string) => {
  return await validateWorldIdAuth({ userId });
};
