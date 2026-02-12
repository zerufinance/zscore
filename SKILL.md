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

## Agent Instructions: Registration Flow

When the user wants to **register an agent**, you **must** ask them for all relevant details and build a **full** agent JSON (see "Agent JSON Structure" below). Do **not** default to a minimal JSON (name + description + one service). Ask for each category below; only omit optional fields if the user explicitly skips them.

### 1. Tell the user about the fee and private key

- **Registration fee:** On Base Mainnet (default): **0.0025 ETH**. On Base Sepolia: **0.001 ETH**. The wallet must also have enough ETH for gas (recommend ~0.003 ETH total on mainnet).
- **Private key:** Registration requires a wallet. Ask the user to provide `PRIVATE_KEY` (in environment or when you prompt). Explain it is only used to run the CLI and can be set via env (e.g. OpenClaw config) or provided when you ask.

### 2. Ask for full JSON details — do not assume minimal structure

Ask the user for each of the following. Use the **full** JSON structure (see "Agent JSON Structure" and the Full JSON example below). Only leave out optional fields if the user says they don't have them or don't want them.

| Input | Required? | What to ask |
|-------|-----------|-------------|
| **Name** | Yes | "What should the agent name be?" (1–256 chars) |
| **Description** | Yes | "What description should the agent have?" (max 2048 chars) |
| **Image** | No | "Do you have an image URL for the agent (avatar/logo)?" (HTTPS, IPFS, or Arweave). |
| **Services** | Yes | "What services does the agent expose?" Ask for **each** service type they want: **web** (website URL), **MCP** (server URL, version, mcpTools, etc.), **A2A** (agent card URL, version, a2aSkills), **OASF** (repo URL, version, skills, domains), **api** or custom (endpoint URL). For each service, get the required endpoint and any extra fields from the Service types table in "Agent JSON Structure". Do not assume "just one api service" — ask which services they want and collect details for each. |
| **x402Support** | No | "Does the agent support x402 payments?" (true/false). |
| **active** | No | "Should the agent be marked as active?" (default true). |
| **supportedTrust** | No | "Which trust models does the agent support?" (e.g. `reputation`, `ERC-8004`, `crypto-economic`, `tee-attestation`). |
| **owner** | No | Usually auto-set from PRIVATE_KEY. Only ask if they need a different owner address. |

**Important:** Build the `services` array with the full shape for each type (e.g. for MCP include `version`, `mcpTools`, `capabilities` if applicable; for A2A include `version`, `a2aSkills`; for OASF include `version`, `skills`, `domains`). Reference the "Full JSON" example and the "Service types" table below when constructing the JSON.

### 3. Create the JSON file

Once you have collected the details:

1. Build a JSON object using the **full** structure (see "Full JSON" example in "Agent JSON Structure" below). Include all fields the user provided; use the proper structure for each service type.
2. Write it to a file in the current or skill directory, e.g. `agent.json`.
3. Confirm with the user: "I've created `agent.json` with the full details you provided. Registration fee is 0.0025 ETH (mainnet) / 0.001 ETH (Sepolia). Proceed?"

### 4. Run registration

- Ensure `PRIVATE_KEY` is set (env or user provided). If the user gave the key for this run only: `PRIVATE_KEY=0x... npx tsx ./scripts/zscore.ts register --json agent.json`
- For Base Sepolia, add: `--chain 84532`
- Run: `npx tsx ./scripts/zscore.ts register --json agent.json` (and `--chain 84532` if using Sepolia)

Do **not** run the register command until the user has provided name, description, and at least one service (with full details for each service they want), and (if not already in env) the private key, and you have created the JSON file using the full structure.

## Agent JSON Structure (ERC-8004 registration-v1)

Registration accepts **only** a JSON file. Use the **full** structure below when collecting user input and building the file. Do not default to a minimal structure.

**Full JSON (MCP + A2A + OASF + web + x402):**

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
| custom | Any URL | `description` |

## Commands

### `/zscore register --json <file>`

Register a new agent **only** via a JSON file. There is no flag-based registration (no `--name` / `--description` / `--endpoint`). Creates hosted agent URI, mints NFT on-chain, and updates URI with the real agentId.

```
/zscore register --json agent.json
/zscore register --json agent.json --chain 84532
```

**Steps to register (when following Agent Instructions above):**
1. Ask the user for **full** JSON details (name, description, image, all services with their type-specific fields, x402Support, active, supportedTrust). Do not default to minimal JSON.
2. Create a JSON file (e.g. `agent.json`) using the full structure (see "Agent JSON Structure" and Full JSON example).
3. Run: `npx tsx ./scripts/zscore.ts register --json agent.json`

The SDK automatically adds `type`, `registrations` (with `agentId: 0` placeholder), and defaults for missing optional fields. After minting, it updates the document with the real `agentId`.

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
