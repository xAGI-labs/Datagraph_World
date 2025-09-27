import { prisma } from "@/lib/prisma";

/**
 * Helper function to find a user by NextAuth session user data
 * @param user - The user object from NextAuth session
 * @returns User from database or null if not found
 */
export const findUserById = async (user: any) => {
  if (!user?.id) return null;

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  return existingUser;
};

/**
 * Helper function to validate user authentication from request body
 * @param requestBody - The request body containing user data
 * @returns Object with user and any validation errors
 */
export const validateUserAuth = async (requestBody: any) => {
  const user = requestBody?.user;

  if (!user?.id) {
    return { user: null, error: "Unauthorized", status: 401 };
  }

  const dbUser = await findUserById(user);

  if (!dbUser) {
    return { user: null, error: "User not found", status: 404 };
  }

  return { user: dbUser, error: null, status: 200 };
};
