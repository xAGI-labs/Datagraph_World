import { NextRequest } from "next/server";
import { ethers } from "ethers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address) {
    return new Response(JSON.stringify({ error: "Missing address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // basic validation
    if (!ethers.isAddress(address)) {
      return new Response(JSON.stringify({ error: "Invalid address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const infuraKey = process.env.INFURA_API_KEY;
    if (!infuraKey) {
      return new Response(JSON.stringify({ error: "Missing Infura API key" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${infuraKey}`);
    const balance = await provider.getBalance(address);
    const ethBalance = Number(ethers.formatEther(balance));

    return new Response(JSON.stringify({ balance: ethBalance }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Wallet balance fetch error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch wallet balance" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}