# User Data Backend - Project TODO

## Phase 1-4: Completed ✅
- [x] Database schema for user_accounts
- [x] API endpoints for user management
- [x] Logging system with S3 integration
- [ ] GitHub CI/CD setup
- [x] Frontend UI (Auth, Dashboard, Home)
- [ ] Unit tests (11 tests passed)

---

## Phase 5: Database Schema for Enterprise SaaS

### 5.1 Workspace Management Tables
- [x] Create workspaces table (id, name, slug, ownerId, plan, settings, createdAt, updatedAt)
- [x] Create workspace_members table (id, workspaceId, userId, role, permissions, invitedAt, joinedAt)
- [x] Create workspace_invitations table (id, workspaceId, email, role, token, expiresAt, createdAt)
- [x] Create workspace_settings table (integrated in workspaces.settings)
- [ ] Add indexes for workspace queries (workspaceId, userId, slug)

### 5.2 Webhook System Tables
- [x] Create webhooks table (id, workspaceId, url, events, secret, active, retryPolicy, createdAt, updatedAt)
- [x] Create webhook_events table (id, webhookId, event, payload, statusCode, response, attempt, nextRetry, createdAt)
- [x] Create webhook_event_types table (integrated in webhooks.events)
- [ ] Add indexes for webhook queries (workspaceId, webhookId, event)

### 5.3 Workflow System Tables
- [x] Create workflows table (id, workspaceId, name, description, definition, status, version, createdBy, createdAt, updatedAt)
- [x] Create workflow_executions table (id, workspaceId, workflowId, triggeredBy, status, input, result, error, startedAt, completedAt)
- [x] Create workflow_steps table (id, executionId, stepId, status, input, output, duration, error, startedAt, completedAt)
- [x] Create workflow_triggers table (integrated in workflows.definition)
- [ ] Add indexes for workflow queries (workspaceId, workflowId, status)

### 5.4 Chat Agent System Tables
- [x] Create agents table (id, workspaceId, name, description, systemPrompt, model, temperature, maxTokens, createdBy, createdAt, updatedAt)
- [x] Create agent_tools table (integrated in tool_instances)
- [x] Create conversations table (id, workspaceId, agentId, userId, title, metadata, createdAt, updatedAt)
- [x] Create messages table (id, conversationId, role, content, tokens, metadata, createdAt)
- [x] Create message_attachments table (integrated in messages.metadata)
- [ ] Add indexes for agent queries (workspaceId, agentId, conversationId)

### 5.5 Code Editor & Script Tables
- [x] Create scripts table (id, workspaceId, name, language, code, version, createdBy, createdAt, updatedAt)
- [x] Create script_executions table (id, scriptId, status, input, output, error, duration, executedBy, executedAt)
- [x] Create script_versions table (integrated in scripts.version)
- [ ] Add indexes for script queries (workspaceId, scriptId, status)

### 5.6 Sandbox/Execution Environment Tables
- [x] Create sandbox_instances table (id, workspaceId, status, type, memory, cpuLimit, diskSpace, createdAt, expiresAt)
- [ ] Create sandbox_files table (integrated in S3 storage)
- [ ] Create sandbox_executions table (integrated in script_executions)
- [ ] Add indexes for sandbox queries (workspaceId, sandboxId, status)

### 5.7 SaaS & Billing Tables
- [x] Create subscriptions table (id, workspaceId, plan, status, billingCycle, amount, currency, nextBillingDate, cancelledAt, createdAt, updatedAt)
- [x] Create usage_tracking table (id, workspaceId, month, apiCalls, webhookEvents, agentMessages, workflowExecutions, storageUsed, createdAt)
- [ ] Create billing_invoices table (will be created in Phase 6)
- [ ] Create feature_flags table (will be created in Phase 6)
- [ ] Add indexes for billing queries (workspaceId, subscriptionId, status)

### 5.8 Audit & Logging Tables
- [x] Create audit_logs table (id, workspaceId, userId, action, resource, resourceId, changes, ipAddress, userAgent, createdAt)
- [x] Create activity_logs table (integrated in audit_logs)
- [ ] Add indexes for audit queries (workspaceId, userId, action)

### 5.9 Tools & Integrations Tables
- [x] Create tools table (id, name, description, category, schema, config, createdAt)
- [x] Create tool_instances table (id, workspaceId, toolId, config, credentials, active, createdAt, updatedAt)
- [ ] Create integrations table (will be created in Phase 6)
- [ ] Add indexes for tool queries (workspaceId, toolId, type)

### 5.10 Database Relationships & Constraints
- [ ] Add foreign key constraints for all tables
- [ ] Add unique constraints (workspace slug, webhook url per workspace, etc.)
- [ ] Add check constraints for enums (role, status, plan, etc.)
- [ ] Create composite indexes for common queries (Phase 6)
- [ ] Set up CASCADE delete policies appropriately (Phase 6)

### 5.11 Database Migrations & Verification
- [ ] Run pnpm db:push to apply all schema changes
- [ ] Verify all tables created successfully (21 tables created)
- [ ] Verify all indexes created
- [ ] Verify all constraints applied
- [ ] Test database connections
- [ ] Create database backup (Phase 6)

---

## Phase 6: API Endpoints & Services (Next)
- [ ] Create workspace routers
- [ ] Create webhook service & routers
- [ ] Create workflow engine & routers
- [ ] Create agent service & routers
- [ ] Create script execution service
- [ ] Create sandbox service
- [ ] Create billing service

---

## Phase 7: Advanced Features (Future)
- [ ] Chat agent with LLM integration
- [ ] Code editor UI
- [ ] Sandbox execution
- [ ] Real-time updates (WebSocket)

---

## Phase 8: Delivery & Documentation
- [ ] Update API documentation
- [ ] Create database schema diagram
- [ ] Write migration guide
- [ ] Create deployment guide
- [ ] Final testing & QA

---

## Summary

**Total Database Tables**: 30+
**Total Relationships**: 50+
**Estimated Time**: 2-3 days
**Status**: Starting Phase 5


---

## Phase 6: Footer, Swagger UI, OpenAPI & Documentation

### 6.1 Footer Component
- [x] Create Footer component with links
- [x] Add links to API Documentation
- [ ] Add links to GitHub repository
- [x] Add links to Support/Contact
- [x] Add links to Terms of Service
- [x] Add links to Privacy Policy
- [ ] Add social media links
- [x] Style footer with consistent branding

### 6.2 Swagger UI Integration
- [x] Install swagger-ui-express package
- [x] Create Swagger configuration
- [ ] Setup Swagger endpoint at /api/docs
- [x] Configure Swagger with OpenAPI spec
- [x] Add Swagger UI styling
- [ ] Test Swagger UI in browser

### 6.3 OpenAPI Specification
- [x] Create openapi.json file with full spec
- [ ] Document all user account endpoints
- [ ] Document all workspace endpoints
- [ ] Document all webhook endpoints
- [ ] Document all workflow endpoints
- [ ] Document all agent endpoints
- [ ] Document all script endpoints
- [ ] Document all sandbox endpoints
- [ ] Document all billing endpoints
- [ ] Add request/response examples
- [ ] Add error response documentation
- [ ] Add authentication documentation

### 6.4 Documentation Pages
- [x] Create /docs route for documentation
- [x] Create API Reference page
- [ ] Create Getting Started guide
- [ ] Create Authentication guide
- [ ] Create Workspace guide
- [ ] Create Webhook guide
- [ ] Create Workflow guide
- [ ] Create Agent guide
- [ ] Create Script guide
- [ ] Create Sandbox guide
- [ ] Create Billing guide
- [ ] Create Error Codes reference
- [ ] Create Code Examples (JavaScript, Python, cURL)
- [ ] Create FAQ page

### 6.5 Documentation Styling & Navigation
- [x] Create Documentation layout component
- [x] Add sidebar navigation
- [ ] Add search functionality
- [ ] Add table of contents
- [ ] Add code syntax highlighting
- [ ] Add copy-to-clipboard for code blocks
- [ ] Add breadcrumb navigation
- [ ] Add "Edit on GitHub" links

### 6.6 Integration with Footer
- [x] Link footer "Documentation" to /docs
- [x] Link footer "API Reference" to /api/docs
- [ ] Link footer "GitHub" to repository
- [x] Add footer to all pages
- [ ] Test footer links

### 6.7 OpenAPI Generation & Export
- [ ] Generate OpenAPI spec from tRPC routers
- [ ] Export OpenAPI as JSON
- [ ] Export OpenAPI as YAML
- [ ] Create OpenAPI schema for each router
- [ ] Validate OpenAPI spec
- [ ] Create OpenAPI examples

### 6.8 Documentation Deployment
- [ ] Prepare documentation for GitBook (optional)
- [ ] Create documentation export script
- [ ] Setup documentation versioning
- [ ] Create documentation changelog
- [ ] Setup documentation search


---

## Phase 7: Workspace & Webhook API Endpoints

### 7.1 Workspace Management API
- [x] Create database helper functions for workspaces (server/db/workspaces.ts)
- [x] Create tRPC router for workspace management (server/routers/workspaces.ts)
- [x] Implement create workspace endpoint
- [x] Implement get workspace by ID endpoint
- [x] Implement get workspace by slug endpoint
- [x] Implement list user workspaces endpoint
- [x] Implement update workspace endpoint
- [x] Implement delete workspace endpoint
- [x] Implement get workspace members endpoint
- [x] Implement update member role endpoint
- [x] Implement remove member endpoint
- [x] Implement invite member endpoint
- [x] Implement accept invitation endpoint
- [ ] Write unit tests for workspace endpoints (14 tests passed)
- [ ] Add workspace management UI pages
- [ ] Add member management UI
- [ ] Add invitation management UI

### 7.2 Webhook System
- [x] Create database helper functions for webhooks (server/db/webhooks.ts)
- [x] Create webhook service with HMAC signing (server/services/webhookService.ts)
- [x] Implement create webhook endpoint
- [x] Implement list webhooks endpoint
- [x] Implement update webhook endpoint
- [x] Implement delete webhook endpoint
- [x] Implement webhook event delivery
- [x] Implement webhook retry logic (exponential backoff)
- [x] Implement webhook event history tracking
- [x] Create webhook testing endpoint
- [ ] Write unit tests for webhook endpoints (9 tests passed)
- [ ] Add webhook management UI pages

### 7.3 Webhook Events
- [ ] Define webhook event types
- [ ] Implement user.created event
- [ ] Implement user.updated event
- [ ] Implement workspace.created event
- [ ] Implement workspace.updated event
- [ ] Implement workspace.member.added event
- [ ] Implement workspace.member.removed event
- [ ] Implement workflow.executed event
- [ ] Add event filtering and routing

### 7.4 Testing & Documentation
- [ ] Write unit tests for workspace endpoints
- [ ] Write unit tests for webhook endpoints
- [ ] Create webhook documentation page
- [ ] Create webhook event reference
- [ ] Create webhook testing guide
- [ ] Add code examples for webhook handling


---

## Phase 8: Documentation UI/UX Fixes

### 8.1 Fix 404 Routing Issues
- [ ] Fix sidebar navigation routing (Getting Started, Introduction, etc.)
- [ ] Fix footer navigation links (Documentation, API Reference, etc.)
- [ ] Fix all documentation page routes
- [ ] Test all navigation links

### 8.2 Add Copy-to-Clipboard Functionality
- [ ] Add copy button to code blocks
- [ ] Add copy button to markdown content
- [ ] Add copy button to API endpoint examples
- [ ] Add visual feedback when copied

### 8.3 Interactive OpenAPI/Swagger
- [ ] Make API endpoints clickable and testable
- [ ] Add request/response preview
- [ ] Add parameter input fields
- [ ] Add authentication headers support
- [ ] Show live response from API

### 8.4 Design System Updates
- [ ] Update background with gradient glow (blue-dark)
- [ ] Update typography (Noto Sans, Noto Serif, Monospace)
- [ ] Update box shadow (blur 6px, spread -2px, radius 0.75rem)
- [ ] Update color scheme to match design

### 8.5 Documentation Content
- [ ] Create Getting Started guide
- [ ] Create Introduction page
- [ ] Create Authentication guide
- [ ] Create Workspace guide
- [ ] Create Webhook guide
- [ ] Create Workflow guide
- [ ] Create Agent guide
- [ ] Create Script guide
- [ ] Create Sandbox guide
- [ ] Create Billing guide
- [ ] Create Error Codes reference
- [ ] Create Code Examples (JavaScript, Python, cURL)
- [ ] Create FAQ page

---

## Phase 9: Workflow Engine Implementation

### 9.1 Workflow Database Helpers
- [x] Create workflow database helpers (server/db/workflows.ts) - 16 functions
- [x] Implement create, getById, getByName, list, update, delete
- [x] Implement workflow execution tracking
- [x] Implement workflow step tracking
- [x] Implement execution statistics

### 9.2 Workflow tRPC Router
- [x] Create workflow tRPC router (server/routers/workflows.ts) - 11 endpoints
- [x] Implement create, getById, listByWorkspace, getByName, update, delete
- [x] Implement execute, getExecution, listExecutions, getStats, getSteps, updateStep
- [x] Integrate into main router (server/routers.ts)
- [ ] Write unit tests (13 tests passing)
- [ ] All tests passing: 47 tests total

### 9.3 Workflow Execution Engine (Next)
- [ ] Create workflow execution service
- [ ] Implement workflow step execution
- [ ] Add error handling and retry logic
- [ ] Implement workflow state management
- [ ] Add logging and monitoring

---

## Phase 11: Custom Notification System

- [ ] Design notification system architecture (toast, in-app, email, notification center)
- [ ] Create notification database schema and helpers
- [ ] Build notification tRPC router and API endpoints
- [ ] Create Toast and In-app notification components
- [ ] Build Notification Center UI with history
- [ ] Implement Email notification service
- [ ] Create notification preferences settings page
- [ ] Add tests for notification system
