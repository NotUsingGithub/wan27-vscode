"use strict";

const WAN27_URLS = Object.freeze({
  website: "https://wan2-7.io/",
  mcp: "https://wan2-7.io/mcp/",
  mcpGuide: "https://wan2-7.io/mcp/guide/",
  cli: "https://wan2-7.io/cli/",
  pricing: "https://wan2-7.io/pricing/",
  apiBase: "https://wan2-7.io/api/v1/"
});

class Wan27Error extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = "Wan27Error";
    this.code = code;
    this.status = status;
  }
}

function buildMcpConfigJson() {
  return JSON.stringify(
    {
      mcpServers: {
        wan27: {
          command: "npx",
          args: ["-y", "@wan27/cli", "mcp"],
          env: {
            WAN27_ACCESS_TOKEN: "${env:WAN27_ACCESS_TOKEN}"
          }
        }
      }
    },
    null,
    2
  );
}

function buildSdkSnippet(modelId = "wan27-text-to-video", prompt = "A paper boat drifting through a rain puddle, gentle tracking shot") {
  return [
    'import { Wan27 } from "@notusinggithub/wan27";',
    "",
    "const wan = new Wan27({ token: process.env.WAN27_ACCESS_TOKEN });",
    "const input = {",
    `  modelId: ${JSON.stringify(modelId)},`,
    `  prompt: ${JSON.stringify(prompt)},`,
    "  durationSeconds: 5,",
    '  resolution: "720p"',
    "};",
    "",
    "// 1. Estimate credit spend before running a paid generation",
    "const estimate = await wan.estimate(input);",
    "console.log(\"Estimated credits:\", estimate);",
    "",
    "// 2. Persist requestId before calling generate() to prevent duplicate spend",
    "const requestId = crypto.randomUUID();",
    "const task = await wan.generate(input, requestId);",
    "console.log(\"Created task:\", task.id);"
  ].join("\n");
}

function validateRequestId(requestId) {
  if (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(requestId)) {
    throw new Wan27Error(
      "INVALID_INPUT",
      "requestId must be 16-128 letters, digits, underscores or hyphens."
    );
  }
  return requestId;
}

async function callWan27Api(method, path, token, body = undefined, fetchImpl = globalThis.fetch) {
  if (typeof token !== "string" || !token.trim() || /[\r\n]/.test(token)) {
    throw new Wan27Error("AUTH_REQUIRED", "Provide an existing Wan27 access token.");
  }
  const cleanRoute = path.endsWith("/") ? path : `${path}/`;
  const url = `${WAN27_URLS.apiBase}${cleanRoute}`;
  const headers = {
    Authorization: `Bearer ${token.trim()}`,
    Accept: "application/json",
    "X-Wan27-Client-Mode": "cli"
  };
  let payload;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
    if (Buffer.byteLength(payload, "utf8") > 32768) {
      throw new Wan27Error("INVALID_INPUT", "Request exceeds 32 KiB.");
    }
  }
  const response = await fetchImpl(url, {
    method,
    headers,
    body: payload,
    redirect: "error"
  });
  const text = await response.text();
  let data = {};
  if (text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Wan27Error("INVALID_RESPONSE", "Unreadable API response.", response.status);
    }
  }
  if (!response.ok) {
    const errObj = data && typeof data.error === "object" ? data.error : {};
    throw new Wan27Error(
      typeof errObj.code === "string" ? errObj.code : "API_ERROR",
      typeof errObj.message === "string" ? errObj.message : `Wan27 returned HTTP ${response.status}.`,
      response.status
    );
  }
  return data;
}

module.exports = {
  WAN27_URLS,
  Wan27Error,
  buildMcpConfigJson,
  buildSdkSnippet,
  validateRequestId,
  callWan27Api
};
