import DocsLayout from "@/components/DocsLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApiReference() {
  const endpoints = [
    {
      category: "Authentication",
      items: [
        {
          method: "GET",
          path: "/api/trpc/auth.me",
          description: "Get current user",
          auth: "Bearer Token",
        },
        {
          method: "POST",
          path: "/api/trpc/auth.logout",
          description: "Logout current user",
          auth: "Bearer Token",
        },
      ],
    },
    {
      category: "User Accounts",
      items: [
        {
          method: "POST",
          path: "/api/trpc/userAccounts.register",
          description: "Register new user",
          auth: "Public",
        },
        {
          method: "POST",
          path: "/api/trpc/userAccounts.login",
          description: "Login user",
          auth: "Public",
        },
        {
          method: "GET",
          path: "/api/trpc/userAccounts.getById",
          description: "Get user account details",
          auth: "Bearer Token",
        },
        {
          method: "POST",
          path: "/api/trpc/userAccounts.regenerateApiKey",
          description: "Regenerate production API key",
          auth: "Bearer Token",
        },
        {
          method: "POST",
          path: "/api/trpc/userAccounts.regenerateTestApiKey",
          description: "Regenerate test API key",
          auth: "Bearer Token",
        },
        {
          method: "POST",
          path: "/api/trpc/userAccounts.updateTier",
          description: "Update user tier",
          auth: "Admin",
        },
        {
          method: "POST",
          path: "/api/trpc/userAccounts.validateApiKey",
          description: "Validate API key",
          auth: "API Key",
        },
      ],
    },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800";
      case "POST":
        return "bg-green-100 text-green-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DocsLayout
      title="API Reference"
      description="Complete reference for all available API endpoints"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">API Reference</h2>
          <p className="text-muted-foreground">
            This is the complete reference for the User Data Management Backend API. All endpoints use the tRPC protocol for type-safe communication.
          </p>
        </section>

        {/* Base URL */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Base URL</h3>
          <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
            <code className="text-sm font-mono">https://api.example.com/api/trpc</code>
          </div>
        </section>

        {/* Authentication */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Authentication</h3>
          <Tabs defaultValue="bearer" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bearer">Bearer Token</TabsTrigger>
              <TabsTrigger value="apikey">API Key</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
            </TabsList>

            <TabsContent value="bearer" className="space-y-4">
              <p className="text-muted-foreground">
                Use JWT Bearer tokens for user authentication:
              </p>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm">
{`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="apikey" className="space-y-4">
              <p className="text-muted-foreground">
                Use API keys for programmatic access:
              </p>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm">
{`X-API-Key: sk_live_abc123def456...`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="public" className="space-y-4">
              <p className="text-muted-foreground">
                Some endpoints don't require authentication:
              </p>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm">
{`// No authentication header needed`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Endpoints */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold">Endpoints</h3>

          {endpoints.map((category) => (
            <div key={category.category} className="space-y-4">
              <h4 className="text-lg font-semibold text-muted-foreground">
                {category.category}
              </h4>

              <div className="space-y-3">
                {category.items.map((endpoint, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      {/* Endpoint Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono flex-1 break-all">
                            {endpoint.path}
                          </code>
                        </div>
                        <Badge variant="outline">{endpoint.auth}</Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground">
                        {endpoint.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Response Format */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Response Format</h3>
          <p className="text-muted-foreground">
            All responses follow the tRPC format:
          </p>
          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
{`{
  "result": {
    "data": {
      // Response data
    }
  }
}

// Error response
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}`}
            </pre>
          </div>
        </section>

        {/* Error Codes */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Error Codes</h3>
          <div className="space-y-3">
            {[
              { code: "UNAUTHORIZED", description: "Authentication required or invalid" },
              { code: "FORBIDDEN", description: "Insufficient permissions" },
              { code: "NOT_FOUND", description: "Resource not found" },
              { code: "BAD_REQUEST", description: "Invalid request parameters" },
              { code: "CONFLICT", description: "Resource already exists" },
              { code: "INTERNAL_SERVER_ERROR", description: "Server error" },
            ].map((error) => (
              <div key={error.code} className="border rounded-lg p-3">
                <div className="font-mono text-sm font-semibold">{error.code}</div>
                <p className="text-sm text-muted-foreground">{error.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rate Limiting */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Rate Limiting</h3>
          <p className="text-muted-foreground">
            API requests are rate limited based on your plan:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { plan: "Free", limit: "100 requests/hour" },
              { plan: "Pro", limit: "10,000 requests/hour" },
              { plan: "Enterprise", limit: "Unlimited" },
            ].map((tier) => (
              <Card key={tier.plan} className="p-4">
                <h4 className="font-semibold mb-2">{tier.plan}</h4>
                <p className="text-sm text-muted-foreground">{tier.limit}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Pagination */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Pagination</h3>
          <p className="text-muted-foreground">
            List endpoints support pagination with the following parameters:
          </p>
          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
{`{
  "limit": 20,      // Number of items per page (default: 20, max: 100)
  "offset": 0,      // Number of items to skip (default: 0)
  "sort": "createdAt",  // Field to sort by
  "order": "desc"   // Sort order: asc or desc
}`}
            </pre>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
