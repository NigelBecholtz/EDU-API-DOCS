import React from "react";
import type { ZudokuConfig } from "zudoku";
import { createApiIdentityPlugin } from "zudoku/plugins";
import { ApiKeySettingsPage } from "./src/ApiKeySettingsPage";

const EDU_API_KEY_STORAGE = "edu_immosurance_api_key";

const eduApiKeyPlugin = createApiIdentityPlugin({
  getIdentities: async () => [
    {
      id: "edu-immosurance-api-key",
      label: "EDU Immosurance API Key",
      authorizeRequest: (request: Request) => {
        if (typeof window === "undefined") return request;
        const apiKey = localStorage.getItem(EDU_API_KEY_STORAGE)?.trim();
        if (!apiKey) return request;
        const url = new URL(request.url);
        url.searchParams.set("api_key", apiKey);
        const init: RequestInit = {
          method: request.method,
          headers: request.headers,
          body: request.body,
        };
        if (request.body != null) {
          (init as RequestInit & { duplex?: string }).duplex = "half";
        }
        return new Request(url.toString(), init);
      },
    },
  ],
});

const config: ZudokuConfig = {
  basePath: "/EDU-API-DOCS",
  site: {
    title: "EDU Immosurance API",
  },
  navigation: [
    {
      type: "category",
      label: "Documentation",
      link: "docs/introduction",
      items: [
        {
          type: "category",
          label: "Getting Started",
          items: [
            "docs/introduction",
            "docs/overview",
            "docs/authentication",
            "docs/logins",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Project",
      link: "project/overview",
      items: [
        {
          type: "category",
          label: "Project Information",
          items: [
            "project/overview",
            "project/components",
            "project/database-configuration",
            "project/logins",
          ],
        },
      ],
    },
    {
      type: "link",
      to: "/api",
      label: "API Reference",
    },
    {
      type: "custom-page",
      path: "/api-key",
      label: "API Key",
      element: <ApiKeySettingsPage />,
    },
  ],
  redirects: [{ from: "/", to: "/docs/introduction" }],
  apis: [
    {
      type: "file",
      input: "../openapi.yaml",
      path: "api",
      options: {
        schemaDownload: { enabled: true },
      },
    },
  ],
  docs: {
    files: "/pages/**/*.mdx",
  },
  plugins: [eduApiKeyPlugin],
};

export default config;
