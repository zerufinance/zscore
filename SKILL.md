---
name: zscore
description: Register agents on the zScore ERC-8004 Identity Registry, manage wallets and metadata, and read on-chain state. Use when an agent needs to register on-chain, check fees, read agent info, set metadata, or manage agent wallets on Base Mainnet or Base Sepolia.
user-invocable: true
metadata: {"openclaw":{"requires":{"env":["PRIVATE_KEY"],"bins":["node","npx"]},"primaryEnv":"PRIVATE_KEY"}}
---

# zScore ERC-8004 Identity Registry

Register and manage AI agents on the zScore Identity Registry. Defaults to Base Mainnet (0.0025 ETH fee). Use `--chain 84532` for Base Sepolia testnet.

## One-Time Setup

Run once to install dependencies:

```bash
npm install
```

## Agent JSON Structure (ERC-8004 registration-v1)

When registering an agent, you provide a JSON file describing the agent. The SDK auto-fills `type`, `registrations`, and defaults for `x402Support`/`active`/`image` if omitted.

**Minimal JSON (just name + description + one service):**

```json
{
  "name": "My AI Agent",
  "description": "A helpful AI agent that does X",
  "services": [
    { "name": "web", "endpoint": "https://myagent.example.com" }
  ]
}
```

**Full JSON (MCP + A2A + OASF + x402 payments):**

```json
{
  "name": "DataAnalyst Pro",
  "description": "Enterprise-grade blockchain data analysis agent. Performs on-chain forensics, wallet profiling, and transaction pattern detection.",
  "image": "https://cdn.example.com/agents/analyst.png",
  "services": [
    {
      "name": "MCP",
      "endpoint": "https://api.dataanalyst.ai/mcp",
      "version": "2025-06-18",
      "mcpTools": ["analyze_wallet", "trace_transactions", "detect_anomalies"],
      "capabilities": []
    },
    {
      "name": "A2A",
      "endpoint": "https://api.dataanalyst.ai/.well-known/agent-card.json",
      "version": "0.3.0",
      "a2aSkills": ["analytical_skills/data_analysis/blockchain_analysis"]
    },
    {
      "name": "OASF",
      "endpoint": "https://github.com/agntcy/oasf/",
      "version": "0.8.0",
      "skills": ["analytical_skills/data_analysis/blockchain_analysis"],
      "domains": ["technology/blockchain"]
    },
    {
      "name": "web",
      "endpoint": "https://dataanalyst.ai"
    },
    {
      "name": "agentWallet",
      "endpoint": "eip155:8453:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7"
    }
  ],
  "x402Support": true,
  "active": true,
  "supportedTrust": ["reputation", "ERC-8004"]
}
```

**All fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | — | Agent name (1–256 chars) |
| `description` | string | Yes | — | What the agent does (max 2048 chars) |
| `image` | string | No | placeholder | Avatar URL (HTTPS, IPFS, or Arweave) |
| `services` | array | Yes | — | Service endpoints (1–64 items, see below) |
| `x402Support` | boolean | No | `false` | Supports x402 payment protocol |
| `active` | boolean | No | `true` | Agent is actively accepting requests |
| `supportedTrust` | string[] | No | — | Trust models: `"reputation"`, `"crypto-economic"`, `"tee-attestation"`, `"ERC-8004"` |
| `owner` | string | No | signer address | Owner 0x address (auto-set from PRIVATE_KEY) |

**Service types:**

| `name` | `endpoint` | Extra fields |
|--------|-----------|--------------|
| `"web"` | Website URL | — |
| `"MCP"` | MCP server URL | `version`, `mcpTools[]`, `mcpPrompts[]`, `mcpResources[]`, `capabilities[]` |
| `"A2A"` | Agent card URL (`/.well-known/agent-card.json`) | `version`, `a2aSkills[]` |
| `"OASF"` | OASF repo URL | `version`, `skills[]`, `domains[]` |
| `"agentWallet"` | CAIP-10 address (`eip155:{chainId}:{address}`) | — |
| `"ENS"` | ENS name (e.g. `myagent.eth`) | — |
| `"email"` | Email address | — |
| custom | Any URL | `description` |

## Agent Instructions: Registration Flow

When the user wants to **register an agent**, follow this flow. Do not proceed to run the register command until you have collected the required inputs and the user has confirmed.

### 1. Tell the user about the fee and private key

- **Registration fee:** On Base Mainnet (default): **0.0025 ETH**. On Base Sepolia: **0.001 ETH**. The wallet must also have enough ETH for gas (recommend ~0.003 ETH total on mainnet).
- **Private key:** Registration requires a wallet. The user must provide `PRIVATE_KEY` (either in environment or when you ask). Explain that you will use it only to run the CLI and that they can set it via env (e.g. in OpenClaw config) or provide it when prompted.

### 2. Collect all required and optional inputs for the agent JSON

Ask the user for each of the following. For anything they skip, use the suggested default or omit the field as noted.

| Input | Required? | What to ask / default |
|-------|-----------|------------------------|
| **Name** | Yes | "What should the agent name be?" (1–256 chars) |
| **Description** | Yes | "What description should the agent have?" (max 2048 chars) |
| **Services** | Yes | At least one service. Ask: "What service(s) does the agent expose?" For each: type (e.g. `web`, `MCP`, `A2A`, `api`) and **endpoint** URL. Minimal: one service with name (e.g. `api` or `web`) and endpoint. |
| **Image** | No | "Do you have an image URL for the agent?" (HTTPS/IPFS/Arweave). Default: omit or use placeholder. |
| **x402Support** | No | "Does the agent support x402 payments?" Default: `false`. |
| **active** | No | "Should the agent be marked active?" Default: `true`. |
| **supportedTrust** | No | "Any supported trust models?" (e.g. `reputation`, `ERC-8004`). Default: omit. |
| **owner** | No | Usually auto-set from the signer (PRIVATE_KEY). Only ask if they want a different owner address. |

For **services**, the minimal valid input is one entry, e.g. `{ "name": "api", "endpoint": "https://..." }` or `{ "name": "web", "endpoint": "https://..." }`. If they provide more (MCP, A2A, etc.), collect the extra fields per the table in "Agent JSON Structure" above.

### 3. Create the JSON file

Once you have all inputs:

1. Build a JSON object that matches the structure above (see "Minimal JSON" or "Full JSON" examples).
2. Write it to a file in the current or skill directory, e.g. `agent.json`.
3. Confirm with the user: "I've created `agent.json` with the details you provided. Ready to register on-chain. Fee is 0.0025 ETH (mainnet) / 0.001 ETH (Sepolia). Proceed?"

### 4. Run registration

- Ensure `PRIVATE_KEY` is set (env or user provided). If the user gave the key for this run only, set it in the environment for the command: `PRIVATE_KEY=0x... npx tsx ./scripts/zscore.ts register --json agent.json`
- For Base Sepolia, add: `--chain 84532`
- Run: `npx tsx ./scripts/zscore.ts register --json agent.json` (and `--chain 84532` if using Base Sepolia)

Do **not** run the register command until the user has provided at least name, description, and at least one service endpoint, and (if not already in env) the private key, and you have created the JSON file.

## Commands

### `/zscore register --json <file>`

Register a new agent using a full JSON file (recommended). Creates hosted agent URI, mints NFT on-chain, and updates URI with the real agentId.

```
/zscore register --json agent.json
/zscore register --json agent.json --chain 84532
```

**Steps to register (when following Agent Instructions above):**
1. Collect user input for name, description, services, and any optional fields; mention fee and PRIVATE_KEY.
2. Create a JSON file (e.g. `agent.json`) with that data.
3. Run: `npx tsx ./scripts/zscore.ts register --json agent.json`

The SDK automatically adds `type`, `registrations` (with `agentId: 0` placeholder), and defaults for missing optional fields. After minting, it updates the document with the real `agentId`.

### `/zscore register --name <name> --description <desc> --endpoint <url>`

Simple registration (single API endpoint only). For richer agents, use `--json` instead.

```
/zscore register --name "Trading Bot" --description "AI-powered trading agent" --endpoint "https://mybot.com/api"
/zscore register --name "Data Analyzer" --description "Analyzes datasets" --endpoint "https://analyzer.ai/api" --image "https://example.com/icon.png"
/zscore register --name "Test Bot" --description "Testing" --endpoint "https://test.com" --chain 84532
```

Requires `PRIVATE_KEY` env var. Wallet must have fee + gas (e.g. ~0.003 ETH on mainnet).

To run: `npx tsx ./scripts/zscore.ts register --name "..." --description "..." --endpoint "..."`

### `/zscore read <agentId>`

Read an agent's on-chain data: owner, URI, wallet, name, services.

```
/zscore read 16
```

To run: `npx tsx ./scripts/zscore.ts read 16`

### `/zscore fee`

Check current registration fee and whether registration is open.

```
/zscore fee
```

To run: `npx tsx ./scripts/zscore.ts fee`

### `/zscore set-metadata <agentId> --key <key> --value <value>`

Set custom metadata on an agent. Only the owner can call.

```
/zscore set-metadata 16 --key "category" --value "trading"
```

Requires `PRIVATE_KEY`.

To run: `npx tsx ./scripts/zscore.ts set-metadata 16 --key "category" --value "trading"`

### `/zscore unset-wallet <agentId>`

Clear the agent wallet. Only the owner can call.

```
/zscore unset-wallet 16
```

Requires `PRIVATE_KEY`.

To run: `npx tsx ./scripts/zscore.ts unset-wallet 16`

## Setup

### Read-Only (no setup needed)

`read` and `fee` work without a private key.

### With Wallet (for registration and writes)

Add to your OpenClaw config (`~/.openclaw/openclaw.json`):

```json
{
  "skills": {
    "entries": {
      "zscore": {
        "enabled": true,
        "env": {
          "PRIVATE_KEY": "0xYourFundedPrivateKey"
        }
      }
    }
  }
}
```

Optional env:
- `RPC_URL` — override default RPC
- `CHAIN_ID` — override chain (default: `8453` for Base Mainnet, use `84532` for Base Sepolia)

## Contract Info

### Base Mainnet (default, chainId 8453)
- **Identity Registry:** `0xFfE9395fa761e52DBC077a2e7Fd84f77e8abCc41`
- **Reputation Registry:** `0x187d72a58b3BF4De6432958fc36CE569Fb15C237`
- **Registration Fee:** 0.0025 ETH
- **RPC:** https://mainnet.base.org

### Base Sepolia (testnet, chainId 84532)
- **Identity Registry:** `0xF0682549516A4BA09803cCa55140AfBC4e5ed2E0`
- **Reputation Registry:** `0xaAC7557475023AEB581ECc8bD6886d1742382421`
- **Registration Fee:** 0.001 ETH
- **RPC:** https://sepolia.base.org

- **Source:** `zscore`

## How It Works

1. **register** creates a hosted JSON document (ERC-8004 registration-v1 schema) via the Agent URI API, mints an NFT on the Identity Registry (paying the fee), then updates the document with the real agentId.
2. **read** queries the on-chain contract for owner, tokenURI, and agentWallet, then fetches and parses the URI JSON.
3. **fee** reads the current `registrationFee()` and `registrationEnabled()` from the contract.
4. **set-metadata** calls `setMetadata(agentId, key, value)` on the contract.
5. **unset-wallet** calls `unsetAgentWallet(agentId)` on the contract.
