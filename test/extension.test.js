"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  WAN27_URLS,
  Wan27Error,
  buildMcpConfigJson,
  buildSdkSnippet,
  validateRequestId,
  callWan27Api
} = require("../client");

test("WAN27_URLS exposes all canonical Wan27 URLs", () => {
  assert.equal(WAN27_URLS.website, "https://wan2-7.io/");
  assert.equal(WAN27_URLS.mcp, "https://wan2-7.io/mcp/");
  assert.equal(WAN27_URLS.mcpGuide, "https://wan2-7.io/mcp/guide/");
  assert.equal(WAN27_URLS.cli, "https://wan2-7.io/cli/");
  assert.equal(WAN27_URLS.pricing, "https://wan2-7.io/pricing/");
});

test("buildMcpConfigJson includes @wan27/cli mcp args", () => {
  const parsed = JSON.parse(buildMcpConfigJson());
  assert.deepEqual(parsed.mcpServers.wan27.args, ["-y", "@wan27/cli", "mcp"]);
});

test("buildSdkSnippet generates idempotent SDK usage code", () => {
  const snippet = buildSdkSnippet("wan27-text-to-image", "A lighthouse at dusk");
  assert.match(snippet, /@notusinggithub\/wan27/);
  assert.match(snippet, /wan\.estimate\(input\)/);
  assert.match(snippet, /wan\.generate\(input, requestId\)/);
});

test("validateRequestId enforces 16-128 safe characters", () => {
  assert.throws(() => validateRequestId("short"), Wan27Error);
  assert.equal(validateRequestId("req_vscode_20261028_0001"), "req_vscode_20261028_0001");
});

test("callWan27Api performs offline mock request and handles errors", async () => {
  let capturedUrl = "";
  let capturedInit = null;
  const mockFetch = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ eligible: true, credits: 250 })
    };
  };

  const res = await callWan27Api("GET", "account", "wan27_vscode_token", undefined, mockFetch);
  assert.equal(res.eligible, true);
  assert.equal(res.credits, 250);
  assert.equal(capturedUrl, "https://wan2-7.io/api/v1/account/");
  assert.equal(capturedInit.headers.Authorization, "Bearer wan27_vscode_token");
});
