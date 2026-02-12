/**
 * @zeru/erc8004 — SDK for Zeru ERC-8004 Identity Registry
 *
 * Register agents, manage wallets & metadata.
 */
export { resolveConfig } from "./config.js";
// ── Errors ──
export { ZeruError } from "./errors.js";
// ── Agent URI ──
export { createAgentURI, updateAgentURI } from "./create-agent-uri.js";
// ── Registration ──
export { registerAgent } from "./register-agent.js";
// ── On-chain reads ──
export { getAgent, getRegistrationFee, isRegistrationEnabled } from "./get-agent.js";
// ── Wallet ──
export { unsetAgentWallet, getAgentWallet } from "./agent-wallet.js";
// ── Metadata ──
export { setMetadata } from "./metadata.js";
