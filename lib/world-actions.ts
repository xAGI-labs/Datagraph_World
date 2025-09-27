/**
 * World ID Actions Configuration
 * These should match the actions created in World Developer Portal
 */

export const WORLD_ID_ACTIONS = {
  ONBOARDING: "datagraph-user-verification",

  // Recommended additional actions for future use
  COMPARISON: "datagraph-comparison",
  PAYMENT: "datagraph-payment",
} as const;

export type WorldIdAction =
  (typeof WORLD_ID_ACTIONS)[keyof typeof WORLD_ID_ACTIONS];

// Helper function to get action description for UI
export function getActionDescription(action: WorldIdAction): string {
  switch (action) {
    case WORLD_ID_ACTIONS.ONBOARDING:
      return "Verify your identity to access Datagraph";
    case WORLD_ID_ACTIONS.COMPARISON:
      return "Submit AI model comparison";
    case WORLD_ID_ACTIONS.PAYMENT:
      return "Authorize payment for premium features";
    default:
      return "Verify action with World ID";
  }
}
