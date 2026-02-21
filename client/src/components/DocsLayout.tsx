import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DocsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const docsSidebar = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Quick Start", href: "/docs/quick-start" },
      { label: "Installation", href: "/docs/installation" },
    ],
  },
  {
    title: "Authentication",
    items: [
      { label: "Overview", href: "/docs/auth/overview" },
      { label: "Email & Password", href: "/docs/auth/email-password" },
      { label: "API Keys", href: "/docs/auth/api-keys" },
      { label: "OAuth", href: "/docs/auth/oauth" },
    ],
  },
  {
    title: "User Management",
    items: [
      { label: "Overview", href: "/docs/users/overview" },
      { label: "Create User", href: "/docs/users/create" },
      { label: "Update User", href: "/docs/users/update" },
      { label: "Delete User", href: "/docs/users/delete" },
    ],
  },
  {
    title: "Workspaces",
    items: [
      { label: "Overview", href: "/docs/workspaces/overview" },
      { label: "Create Workspace", href: "/docs/workspaces/create" },
      { label: "Manage Members", href: "/docs/workspaces/members" },
      { label: "Settings", href: "/docs/workspaces/settings" },
    ],
  },
  {
    title: "Webhooks",
    items: [
      { label: "Overview", href: "/docs/webhooks/overview" },
      { label: "Create Webhook", href: "/docs/webhooks/create" },
      { label: "Events", href: "/docs/webhooks/events" },
      { label: "Retries", href: "/docs/webhooks/retries" },
    ],
  },
  {
    title: "Workflows",
    items: [
      { label: "Overview", href: "/docs/workflows/overview" },
      { label: "Create Workflow", href: "/docs/workflows/create" },
      { label: "Triggers", href: "/docs/workflows/triggers" },
      { label: "Steps", href: "/docs/workflows/steps" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { label: "REST API", href: "/docs/api/rest" },
      { label: "tRPC API", href: "/docs/api/trpc" },
      { label: "Error Codes", href: "/docs/api/errors" },
      { label: "Rate Limiting", href: "/docs/api/rate-limiting" },
    ],
  },
  {
    title: "Examples",
    items: [
      { label: "JavaScript", href: "/docs/examples/javascript" },
      { label: "Python", href: "/docs/examples/python" },
      { label: "cURL", href: "/docs/examples/curl" },
      { label: "Postman", href: "/docs/examples/postman" },
    ],
  },
  {
    title: "FAQ",
    items: [
      { label: "Common Questions", href: "/docs/faq" },
      { label: "Troubleshooting", href: "/docs/troubleshooting" },
      { label: "Support", href: "/docs/support" },
    ],
  },
];

export default function DocsLayout({ children, title, description }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          <div className="hidden md:block w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`w-64 border-r bg-card overflow-y-auto transition-all ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } fixed md:relative h-full md:h-auto z-30`}
        >
          <nav className="p-6 space-y-8">
            {docsSidebar.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-sm mb-3 text-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                        onClick={() => setSidebarOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-12">
            {description && (
              <p className="text-lg text-muted-foreground mb-8">{description}</p>
            )}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
