# zscore

Register and manage AI agents on the **zScore ERC-8004 Identity Registry** (Base Mainnet / Base Sepolia). This skill gives agents the ability to register on-chain, check fees, read agent info, set metadata, and manage agent wallets.

## Install with the skills CLI

```bash
npx skills add <owner>/zscore
```

Or from this repo's full URL:

```bash
npx skills add https://github.com/<owner>/zscore
```

Then install dependencies once (from the skill directory, e.g. `.cursor/skills/zscore/` or `~/.cursor/skills/zscore/`):

```bash
cd .cursor/skills/zscore && npm install
```

## Requirements

- **Node.js** and **npx**
- For write operations (register, set-metadata, unset-wallet): set `PRIVATE_KEY` in your agent/skill config or environment. Wallet needs fee + gas (e.g. ~0.003 ETH on Base Mainnet).

## Commands (from SKILL.md)

- **register** — Register an agent via `--json <file>` only (full agent JSON)
- **read** \<agentId\> — Read on-chain agent data
- **fee** — Check registration fee and status
- **set-metadata** \<agentId\> --key \<key\> --value \<value\>
- **unset-wallet** \<agentId\>

See [SKILL.md](./SKILL.md) for full usage and ERC-8004 agent JSON structure.

## License

Same as the upstream project.
