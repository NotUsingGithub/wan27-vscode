"use strict";

const vscode = require("vscode");
const {
  WAN27_URLS,
  buildMcpConfigJson,
  buildSdkSnippet,
  callWan27Api
} = require("./client");

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("wan27.insertMcpConfig", async () => {
      const snippet = buildMcpConfigJson();
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, snippet);
        });
        vscode.window.showInformationMessage("Inserted Wan27 MCP Server configuration.");
      } else {
        const doc = await vscode.workspace.openTextDocument({
          content: snippet,
          language: "json"
        });
        await vscode.window.showTextDocument(doc);
      }
    }),

    vscode.commands.registerCommand("wan27.insertSdkSnippet", async () => {
      const config = vscode.workspace.getConfiguration("wan27");
      const defaultModel = config.get("defaultModelId", "wan27-text-to-video");
      const snippet = buildSdkSnippet(defaultModel);
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, snippet);
        });
      } else {
        const doc = await vscode.workspace.openTextDocument({
          content: snippet,
          language: "typescript"
        });
        await vscode.window.showTextDocument(doc);
      }
    }),

    vscode.commands.registerCommand("wan27.checkAccount", async () => {
      const token =
        process.env.WAN27_ACCESS_TOKEN ||
        (await vscode.window.showInputBox({
          prompt: "Enter your Wan27 Access Token (not stored to disk)",
          password: true,
          ignoreFocusOut: true
        }));
      if (!token) {
        return;
      }
      try {
        const account = await callWan27Api("GET", "account", token);
        vscode.window.showInformationMessage(`Wan27 Account: ${JSON.stringify(account)}`);
      } catch (err) {
        vscode.window.showErrorMessage(`Wan27 Error (${err.code || "ERROR"}): ${err.message}`);
      }
    }),

    vscode.commands.registerCommand("wan27.estimateCredits", async () => {
      const config = vscode.workspace.getConfiguration("wan27");
      const modelId = config.get("defaultModelId", "wan27-text-to-video");
      const prompt = await vscode.window.showInputBox({
        prompt: `Enter prompt to estimate credits for ${modelId}`,
        placeHolder: "A paper boat drifting through a rain puddle, gentle tracking shot"
      });
      if (!prompt) {
        return;
      }
      const token =
        process.env.WAN27_ACCESS_TOKEN ||
        (await vscode.window.showInputBox({
          prompt: "Enter your Wan27 Access Token (not stored to disk)",
          password: true,
          ignoreFocusOut: true
        }));
      if (!token) {
        return;
      }
      try {
        const est = await callWan27Api("POST", "estimates", token, { modelId, prompt });
        vscode.window.showInformationMessage(`Wan27 Credit Estimate: ${JSON.stringify(est)}`);
      } catch (err) {
        vscode.window.showErrorMessage(`Wan27 Estimate Error (${err.code || "ERROR"}): ${err.message}`);
      }
    }),

    vscode.commands.registerCommand("wan27.openDocs", async () => {
      const items = [
        { label: "Wan27 Official Website", description: WAN27_URLS.website, url: WAN27_URLS.website },
        { label: "Wan27 MCP Server Overview", description: WAN27_URLS.mcp, url: WAN27_URLS.mcp },
        { label: "Wan27 MCP & API Workflow Guide", description: WAN27_URLS.mcpGuide, url: WAN27_URLS.mcpGuide },
        { label: "Wan27 CLI Documentation", description: WAN27_URLS.cli, url: WAN27_URLS.cli },
        { label: "Wan27 Pricing & Plans", description: WAN27_URLS.pricing, url: WAN27_URLS.pricing }
      ];
      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: "Select a Wan27 documentation page to open"
      });
      if (picked) {
        await vscode.env.openExternal(vscode.Uri.parse(picked.url));
      }
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
