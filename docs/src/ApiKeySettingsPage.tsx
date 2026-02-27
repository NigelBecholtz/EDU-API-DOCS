import React from "react";
import { useState, useEffect } from "react";
import { Button, Head, Link } from "zudoku/components";

const STORAGE_KEY = "edu_immosurance_api_key";

export const ApiKeySettingsPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setApiKey(stored);
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, apiKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClear = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setApiKey("");
    }
  };

  const handleCopy = async () => {
    const key = apiKey.trim() || localStorage.getItem(STORAGE_KEY);
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("input");
      el.value = key;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section>
      <Head>
        <title>API Key Settings — EDU API</title>
      </Head>
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold">API Key for Playground</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your EDU-issued API key here. In the{" "}
            <Link to="/api">API Reference</Link> Playground, under Query
            Parameters, there is an <strong>api_key</strong> field — enable it and paste
            your key there.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="api-key"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            API Key
          </label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key..."
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-wrap gap-2 gap-y-2">
          <Button onClick={handleSave}>Save</Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!apiKey.trim()}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          {saved && (
            <span className="self-center text-sm text-green-600 dark:text-green-400">
              Saved.
            </span>
          )}
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-950/30">
          <strong>Using in the Playground:</strong>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Click an endpoint in the API Reference</li>
            <li>Open the Playground (Try it)</li>
            <li>Under Query Parameters: enable <strong>api_key</strong></li>
            <li>Paste your key (use the copy button above)</li>
            <li>Click Send</li>
          </ol>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
          <strong>Security:</strong> The key is stored only in your browser
          (localStorage). Do not share this page and log out after use on
          shared computers.
        </div>
      </div>
    </section>
  );
};
