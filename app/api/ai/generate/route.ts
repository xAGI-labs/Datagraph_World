import { NextRequest, NextResponse } from "next/server";

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const AVAILABLE_MODELS = [
  {
    id: "openai/gpt-4o",
    label: "GPT-4o",
    provider: "OpenAI",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "OpenAI",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    label: "Claude 3.5 Sonnet",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-3-haiku",
    label: "Claude 3 Haiku",
    provider: "Anthropic",
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    label: "Llama 3.1 70B",
    provider: "Meta",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    label: "Llama 3.1 8B",
    provider: "Meta",
  },
  {
    id: "google/gemini-pro-1.5",
    label: "Gemini Pro 1.5",
    provider: "Google",
  },
  {
    id: "google/gemini-flash-1.5",
    label: "Gemini Flash 1.5",
    provider: "Google",
  },
  {
    id: "mistralai/mistral-large",
    label: "Mistral Large",
    provider: "Mistral",
  },
  {
    id: "mistralai/mistral-small",
    label: "Mistral Small",
    provider: "Mistral",
  },
  {
    id: "perplexity/llama-3.1-sonar-large-128k-online",
    label: "Perplexity Sonar Large",
    provider: "Perplexity",
  },
  {
    id: "cohere/command-r-plus",
    label: "Command R+",
    provider: "Cohere",
  },
];

function createAgentSystemPrompt(
  agentPersonality: string,
  topic: string,
  roomName: string
): string {
  const basePrompt = `You are ${agentPersonality}, an AI personality in a voice chat room called "${roomName}" discussing "${topic}".

Your role is to engage in natural, conversational monologue about this topic. You should:
- Speak in a conversational, engaging tone as if talking to listeners
- Share insights, thoughts, and perspectives about ${topic}
- Keep responses to 2-3 sentences maximum for natural speech flow
- Be authentic to your personality: ${agentPersonality}
- Don't ask direct questions to users - this is a monologue format
- Speak as if you're thinking out loud or sharing interesting observations

Current topic focus: ${topic}

Generate a natural, engaging comment about this topic that fits your personality:`;

  if (
    agentPersonality.includes("Optimist") ||
    agentPersonality.includes("Tech")
  ) {
    return (
      basePrompt +
      `\n\nAs a ${agentPersonality}, you should be enthusiastic, forward-thinking, and focus on positive possibilities and innovations.`
    );
  } else if (
    agentPersonality.includes("Analyst") ||
    agentPersonality.includes("Cautious")
  ) {
    return (
      basePrompt +
      `\n\nAs a ${agentPersonality}, you should be thoughtful, analytical, and consider potential risks or challenges while being balanced.`
    );
  } else {
    return (
      basePrompt +
      `\n\nStay true to your personality as ${agentPersonality} while discussing ${topic}.`
    );
  }
}

async function callOpenRouter(
  prompt: string,
  model: string
): Promise<{ response: string; responseTime: number }> {
  const startTime = Date.now();

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "Datagraph",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    const responseTime = Date.now() - startTime;

    return {
      response: data.choices[0]?.message?.content || "No response generated",
      responseTime,
    };
  } catch (error) {
    console.error("OpenRouter API error:", error);
    const responseTime = Date.now() - startTime;
    return {
      response:
        "Sorry, I encountered an error generating this response. Please try again.",
      responseTime,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.messageType === "agent_monologue") {
      const { topic, roomName, agentPersonality, conversationHistory } = body;

      console.log(
        "🤖 Generating agent monologue for:",
        agentPersonality,
        "on topic:",
        topic
      );

      if (!topic || !agentPersonality) {
        return NextResponse.json(
          { error: "Topic and agent personality required for monologue" },
          { status: 400 }
        );
      }

      const systemPrompt = createAgentSystemPrompt(
        agentPersonality,
        topic,
        roomName
      );
      const contextPrompt =
        conversationHistory && conversationHistory.length > 0
          ? `\n\nPrevious conversation context:\n${conversationHistory
              .map((msg: any) => `${msg.speaker}: ${msg.message}`)
              .join("\n")}`
          : "";

      const fullPrompt = systemPrompt + contextPrompt;

      console.log(
        "📝 Generated prompt for agent:",
        fullPrompt.substring(0, 200) + "..."
      );

      const result = await callOpenRouter(fullPrompt, "openai/gpt-4o-mini");

      console.log(
        "✅ Agent response generated, length:",
        result.response.length
      );

      return NextResponse.json({
        message: result.response,
        responseTime: result.responseTime,
      });
    }

    const { prompt, models } = body;

    if (!prompt || !models || models.length !== 2) {
      return NextResponse.json(
        { error: "Invalid request. Prompt and exactly 2 models required." },
        { status: 400 }
      );
    }

    const validModels = models.filter((modelId: string) =>
      AVAILABLE_MODELS.some((m) => m.id === modelId)
    );

    if (validModels.length !== 2) {
      return NextResponse.json(
        { error: "Invalid models selected" },
        { status: 400 }
      );
    }

    const [responseA, responseB] = await Promise.all([
      callOpenRouter(prompt, validModels[0]),
      callOpenRouter(prompt, validModels[1]),
    ]);

    const modelAInfo = AVAILABLE_MODELS.find((m) => m.id === validModels[0]);
    const modelBInfo = AVAILABLE_MODELS.find((m) => m.id === validModels[1]);

    return NextResponse.json({
      prompt,
      responses: [
        {
          modelId: validModels[0],
          modelLabel: modelAInfo?.label,
          provider: modelAInfo?.provider,
          response: responseA.response,
          responseTime: responseA.responseTime,
        },
        {
          modelId: validModels[1],
          modelLabel: modelBInfo?.label,
          provider: modelBInfo?.provider,
          response: responseB.response,
          responseTime: responseB.responseTime,
        },
      ],
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ models: AVAILABLE_MODELS });
}
