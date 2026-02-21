import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BookOpen, Code2, Zap } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

/**
 * Home page - Landing page with features and CTA
 */
export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">{APP_TITLE}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Enterprise SaaS backend for managing users, workspaces, webhooks, and automation workflows.
          </p>
          <div className="flex gap-4 justify-center mb-12">
            {isAuthenticated ? (
              <>
                <Button size="lg" onClick={() => setLocation("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation("/docs")}>
                  View Documentation
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation("/docs")}>
                  View Documentation
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-slate-50 dark:bg-slate-900 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">Type-Safe API</h3>
                <p className="text-muted-foreground">Built with tRPC for end-to-end type safety</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Webhooks & Workflows</h3>
                <p className="text-muted-foreground">Event-driven architecture with automation</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">Complete Documentation</h3>
                <p className="text-muted-foreground">Comprehensive API docs with examples</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Check out our documentation to learn how to integrate with the API.
          </p>
          <Button size="lg" onClick={() => setLocation("/docs")}>
            View API Documentation
          </Button>
        </div>
      </main>
    </div>
  );
}
