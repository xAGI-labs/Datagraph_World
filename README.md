# Datagraph World

**Compare AI, Earn Crypto. A Sybil-Resistant Data Network Powered by World ID.**

Datagraph World is a decentralized platform that rewards users for contributing to the evaluation and improvement of AI models. By leveraging World ID for Sybil resistance and World Chain for fast, gas-free transactions, we are building a transparent and incentivized ecosystem for human-AI interaction data.

## The Pitch (for Hackathon Judges)

In the rapidly evolving world of AI, high-quality, human-verified data is the most valuable resource. Existing data collection methods are often centralized, lack transparency, and fail to reward the users who provide the data. 

Datagraph World solves this by creating a decentralized data network where anyone can contribute to AI evaluation and be rewarded for their efforts. We use **World ID** to ensure that every contributor is a unique human, preventing Sybil attacks and guaranteeing data quality. All rewards are paid out seamlessly on **World Chain**, making the process fast, efficient, and gas-free for the user. This project represents a paradigm shift in data collection—from centralized exploitation to decentralized collaboration.

## What it Does

*   **🧠 AI Model Comparison:** Users are presented with prompts and can compare the responses of various leading AI models side-by-side.
*   **✨ Vibe Points System:** For each comparison submitted, users earn "Vibe Points," an in-app currency that represents their contribution to the network.
*   **💹 Crypto Trading:** Users can trade their Vibe Points for real cryptocurrency (WLD and USDC) directly within the app.
*   **⛓️ On-Chain Payments:** All trades are executed as real cryptocurrency transactions on the World Chain, sent directly to the user's wallet.
*   **📊 User Dashboard:** A personalized dashboard shows users their stats, including comparisons completed, day streaks, and total earnings.
*   **🔒 World ID Authentication:** Secure, Sybil-resistant login using World ID ensures that all contributions are from unique individuals.

## How We Built It

*   **Frontend:** [Next.js](https://nextjs.org/) (React), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/) for a modern, responsive user experience.
*   **Onchain Toolkit:** We used [OnchainKit](https://onchainkit.xyz/) to simplify interactions with the blockchain.
*   **Backend:** Next.js API Routes provide the server-side logic.
*   **Database:** [Prisma](https://www.prisma.io/) is our ORM for interacting with a PostgreSQL database, managing user data, comparisons, and payments.
*   **Authentication:** **World ID** is at the core of our platform, providing secure and Sybil-resistant user authentication.
*   **Blockchain:** We are deployed on **World Chain** to enable fast, scalable, and gas-free transactions for our users.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   Yarn, npm, or pnpm

### Installation

1.  Clone the repo:
    ```bash
    git clone https://github.com/your-username/datagraph-world.git
    ```
2.  Install dependencies:
    ```bash
    cd datagraph-world
    yarn install
    ```

### Environment Variables

Create a `.env.local` file in the root of the project and add the following variables. You can get these from the Worldcoin Developer Portal.

```env
# Get this from the Worldcoin Developer Portal
NEXT_PUBLIC_WORLD_APP_ID=app_...

# Get this from the Worldcoin Developer Portal
WORLD_DEV_PORTAL_API_KEY=...

# Your  OpenRouter API key for accessing AI models
OPENROUTER_API_KEY=...


# Your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Running the App

1.  Run the development server:
    ```bash
    yarn dev
    ```
2.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## What's Next for Datagraph World

We're just getting started! Here are some of the features we're excited to build next:

*   **More AI Models:** Integrating a wider variety of open-source and proprietary AI models for comparison.
*   **Advanced Analytics:** Providing deeper insights into model performance based on our collected data.
*   **Decentralized Governance:** Allowing Vibe Point holders to vote on the future direction of the platform.
*   **Data Marketplace:** Creating a marketplace where developers and researchers can purchase high-quality, human-verified AI data.