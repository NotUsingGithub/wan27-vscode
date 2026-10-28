# Wan27 — VS Code & Cursor Extension for AI Image/Video Generation & MCP

Official VS Code, Cursor, and Windsurf extension for [Wan27](https://wan2-7.io/), providing one-click configuration for the [Wan27 MCP Server](https://wan2-7.io/mcp/), dry-run credit cost estimation, account balance checks, and idempotent SDK code snippets.

**The extension is MIT licensed. Using the hosted Wan27 API requires an active paid [Wan27 subscription](https://wan2-7.io/pricing/), and generation tasks consume credits.**

## Features

- **Wan27: Insert MCP Server Configuration (`wan27.insertMcpConfig`)** — Inserts the canonical `npx -y @wan27/cli mcp` configuration block for Cursor, Claude Desktop, and VS Code MCP settings.
- **Wan27: Check Account Eligibility & Credit Balance (`wan27.checkAccount`)** — Queries `GET /api/v1/account/` using `WAN27_ACCESS_TOKEN` without persisting secrets to disk.
- **Wan27: Estimate Generation Credit Cost (`wan27.estimateCredits`)** — Calls `POST /api/v1/estimates/` to preview credit usage before authorizing any paid generation.
- **Wan27: Insert Idempotent API Generation Snippet (`wan27.insertSdkSnippet`)** — Inserts ready-to-run TypeScript/Node.js code using `@notusinggithub/wan27` with explicit `requestId` idempotency protection.
- **Wan27: Open Official Documentation (`wan27.openDocs`)** — Quick launcher for the [Wan27 Website](https://wan2-7.io/), [MCP Server](https://wan2-7.io/mcp/), [MCP & API Workflow Guide](https://wan2-7.io/mcp/guide/), [CLI Reference](https://wan2-7.io/cli/), and [Pricing](https://wan2-7.io/pricing/).

## MCP Configuration Reference

```json
{
  "mcpServers": {
    "wan27": {
      "command": "npx",
      "args": ["-y", "@wan27/cli", "mcp"],
      "env": {
        "WAN27_ACCESS_TOKEN": "${env:WAN27_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Links & Documentation

- [Wan27 Official Website](https://wan2-7.io/)
- [Wan27 MCP Server](https://wan2-7.io/mcp/)
- [Wan27 MCP and API Workflow Guide](https://wan2-7.io/mcp/guide/)
- [Wan27 CLI Documentation](https://wan2-7.io/cli/)
- [Wan27 Pricing & Subscriptions](https://wan2-7.io/pricing/)
- [Source Repository](https://github.com/NotUsingGithub/wan27-vscode)
