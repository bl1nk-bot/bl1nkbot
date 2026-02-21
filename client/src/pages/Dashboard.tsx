import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Copy, RefreshCw, LogOut, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTestApiKey, setShowTestApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userQuery = trpc.userAccounts.getById.useQuery(
    { id: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const regenerateApiKeyMutation = trpc.userAccounts.regenerateApiKey.useMutation({
    onSuccess: () => {
      setSuccess('API key regenerated successfully!');
      setError('');
      userQuery.refetch();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message || 'Failed to regenerate API key');
      setSuccess('');
    },
  });

  const regenerateTestApiKeyMutation = trpc.userAccounts.regenerateTestApiKey.useMutation({
    onSuccess: () => {
      setSuccess('Test API key regenerated successfully!');
      setError('');
      userQuery.refetch();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message || 'Failed to regenerate test API key');
      setSuccess('');
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation('/auth');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!user) {
    setLocation('/auth');
    return null;
  }

  if (userQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const userData = userQuery.data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {userData?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{userData?.tier || 'free'}</div>
                  <p className="text-xs text-muted-foreground mt-1">Current tier</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Account Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Registration date</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">API Version</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userData?.version || 1}</div>
                  <p className="text-xs text-muted-foreground mt-1">Current version</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground mt-1">{userData?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {userData?.provider || 'email'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Updated</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userData?.updatedAt
                      ? new Date(userData.updatedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Production API Key</CardTitle>
                <CardDescription>Use this key for production requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                  <code className="flex-1 text-sm font-mono break-all">
                    {showApiKey ? userData?.apiKey : '••••••••••••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(userData?.apiKey || '', 'apiKey')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copiedKey === 'apiKey' && (
                  <p className="text-sm text-green-600">Copied to clipboard!</p>
                )}
                <Button
                  onClick={() =>
                    regenerateApiKeyMutation.mutate({ id: user.id })
                  }
                  disabled={regenerateApiKeyMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {regenerateApiKeyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate API Key
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test API Key</CardTitle>
                <CardDescription>Use this key for testing and development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                  <code className="flex-1 text-sm font-mono break-all">
                    {showTestApiKey ? userData?.testApiKey : '••••••••••••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowTestApiKey(!showTestApiKey)}
                  >
                    {showTestApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(userData?.testApiKey || '', 'testApiKey')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copiedKey === 'testApiKey' && (
                  <p className="text-sm text-green-600">Copied to clipboard!</p>
                )}
                <Button
                  onClick={() =>
                    regenerateTestApiKeyMutation.mutate({ id: user.id })
                  }
                  disabled={regenerateTestApiKeyMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {regenerateTestApiKeyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate Test API Key
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Additional settings will be available soon. For now, you can manage your API keys above.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
