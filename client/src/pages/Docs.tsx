import DocsLayout from "@/components/DocsLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, BookOpen, Zap, Shield, Copy, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Docs() {
  const [location, setLocation] = useLocation();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Getting Started",
      description: "Learn the basics and set up your first project in minutes",
      href: "/docs/quick-start",
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "API Reference",
      description: "Complete API documentation with examples and code snippets",
      href: "/api/docs",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Guides & Tutorials",
      description: "Step-by-step guides for common tasks and workflows",
      href: "/docs/guides",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security",
      description: "Learn about authentication, API keys, and security best practices",
      href: "/docs/security",
    },
  ];

  const codeExample = `// Register a new user
const response = await fetch('/api/trpc/userAccounts.register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure-password-123'
  })
});

const data = await response.json();
console.log('User created:', data);`;

  return (
    <DocsLayout
      title="Documentation"
      description="Complete guide to using the User Data Management Backend API"
    >
      <div className="space-y-12">
        {/* Welcome Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Welcome to the API Docs</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know to integrate with our platform. Whether you're just getting started or building advanced features, we've got you covered.
          </p>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setLocation(feature.href)}
            >
              <div className="flex items-start gap-4">
                <div className="text-primary">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Core Concepts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Core Concepts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Users & Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Manage user accounts with email/password or OAuth. Generate and manage API keys for programmatic access.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Workspaces</h3>
              <p className="text-sm text-muted-foreground">
                Organize your resources into workspaces. Invite team members and manage permissions with role-based access control.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Webhooks & Events</h3>
              <p className="text-sm text-muted-foreground">
                React to events in real-time with webhooks. Automate workflows and integrate with external systems.
              </p>
            </div>
          </div>
        </section>

        {/* API Endpoints Overview */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">API Endpoints</h2>
          <div className="space-y-3">
            <div className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                    POST
                  </span>
                  <code className="text-sm font-mono">/api/trpc/userAccounts.register</code>
                </div>
                <button
                  onClick={() => handleCopyCode('/api/trpc/userAccounts.register')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy endpoint"
                >
                  {copiedCode === '/api/trpc/userAccounts.register' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">Register a new user account</p>
            </div>

            <div className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                    GET
                  </span>
                  <code className="text-sm font-mono">/api/trpc/userAccounts.getById</code>
                </div>
                <button
                  onClick={() => handleCopyCode('/api/trpc/userAccounts.getById')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy endpoint"
                >
                  {copiedCode === '/api/trpc/userAccounts.getById' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">Get user account details</p>
            </div>

            <div className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                    POST
                  </span>
                  <code className="text-sm font-mono">/api/trpc/userAccounts.regenerateApiKey</code>
                </div>
                <button
                  onClick={() => handleCopyCode('/api/trpc/userAccounts.regenerateApiKey')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy endpoint"
                >
                  {copiedCode === '/api/trpc/userAccounts.regenerateApiKey' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">Regenerate API key</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/api/docs")}
            className="mt-4"
          >
            View Full API Reference →
          </Button>
        </section>

        {/* Authentication */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Authentication</h2>
          <p className="text-muted-foreground">
            The API supports multiple authentication methods:
          </p>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              <strong>API Key:</strong> Pass your API key in the <code>X-API-Key</code> header
            </li>
            <li>
              <strong>Bearer Token:</strong> Use JWT tokens for session-based authentication
            </li>
            <li>
              <strong>OAuth:</strong> Authenticate users with OAuth providers
            </li>
          </ul>
        </section>

        {/* Code Examples */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Quick Example</h2>
          <div className="relative bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
            <button
              onClick={() => handleCopyCode(codeExample)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded transition-colors"
              title="Copy code"
            >
              {copiedCode === codeExample ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <pre className="text-sm pr-10">
              {codeExample}
            </pre>
          </div>
        </section>

        {/* Support */}
        <section className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">Need Help?</h2>
          <p className="text-muted-foreground">
            Can't find what you're looking for? Check our FAQ or reach out to support.
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/docs/faq")}
            >
              View FAQ
            </Button>
            <Button
              onClick={() => setLocation("/support")}
            >
              Contact Support
            </Button>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
