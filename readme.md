# Feature-Flag Management Monorepo

A full-stack, real-time feature-flag management app. This repo contains both:

* **Backend** (AWS Lambda + DynamoDB + API Gateway WebSockets via Serverless Framework)
* **Frontend** (React + Vite + Tailwind CSS)

When running, multiple browser instances stay in sync via WebSocket broadcasts. You can create, toggle, and delete feature flags, and every connected client sees updates immediately.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Structure](#repository-structure)
3. [Backend (AWS Serverless)](#backend-aws-serverless)
   3.1. [Configuration & Env Variables](#configuration--env-variables)
   3.2. [Install & Deploy](#install--deploy)
   3.3. [Local Development (serverless-offline)](#local-development-serverless-offline)
4. [Frontend (React + Vite)](#frontend-react--vite)
   4.1. [Configuration & Env Variables](#configuration--env-variables-1)
   4.2. [Install & Run](#install--run)
   4.3. [Build for Production](#build-for-production)
   4.4. [Testing](#testing)
5. [Real-Time WebSocket Flow](#real-time-websocket-flow)
6. [Common Commands](#common-commands)

---

## Prerequisites

* **Node.js** (v18 LTS recommended)
* **npm** (bundled with Node.js)
* **AWS CLI** (configured with a profile that has permission to create DynamoDB tables, API Gateway, Lambda, IAM roles)
* **Serverless Framework** (v3 or higher)

  ```bash
  npm install -g serverless
  ```
* **Vite** (installed per-project; included below)

> **Note:** You do *not* need to check any AWS credentials into Git. They should live in `~/.aws/credentials` or be injected via environment variables.

---

## Repository Structure

```
feature-flag-monorepo/
├── backend/
│   ├── handlers/
│   │   ├── createFlag.js
│   │   ├── deleteFlag.js
│   │   ├── getFlags.js
│   │   ├── onConnect.js
│   │   ├── onDisconnect.js
│   │   └── updateFlag.js
│   ├── serverless.yml
│   ├── package.json
│   └── README.md
└── frontend/
    ├── public/
    │   └── index.html
    ├── .env.local.example
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── api.js
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── ConfirmModal.jsx
        │   ├── DeleteConfirm.jsx
        │   ├── FilterTabs.jsx
        │   ├── FlagForm.jsx
        │   ├── FlagRow.jsx
        │   ├── FlagTable.jsx
        │   ├── Header.jsx
        │   ├── Layout.jsx
        │   ├── LoginForm.jsx
        │   ├── MobileFlagModal.jsx
        │   ├── NotFound.jsx
        │   ├── ProtectedLayout.jsx
        │   ├── RegisterForm.jsx
        │   └── SessionExpiredModal.jsx
        ├── contexts/
        │   └── AuthContext.jsx
        ├── hooks/
        │   ├── useAwsWebSocketFlags.js
        │   ├── useDarkMode.js
        │   └── useSessionValidator.jsx
        └── __tests__/
            ├── api.test.jsx
            ├── App.test.jsx
            ├── App.more.test.jsx
            ├── main.test.jsx
            ├── main.routes.test.jsx
            ├── main.entrypoint.test.jsx
            ├── hooks/
            │   ├── useAwsWebSocketFlags.test.js
            │   ├── useDarkMode.test.js
            │   └── useSessionValidator.test.jsx
            └── components/
                ├── ConfirmModal.test.jsx
                ├── DeleteConfirm.test.jsx
                ├── FilterTabs.test.jsx
                ├── FlagForm.test.jsx
                ├── FlagRow.test.jsx
                ├── FlagTable.test.jsx
                ├── Header.test.jsx
                ├── Layout.test.jsx
                ├── LoginForm.test.jsx
                ├── MobileFlagModal.test.jsx
                ├── NotFound.test.jsx
                ├── ProtectedLayout.test.jsx
                ├── RegisterForm.test.jsx
                └── SessionExpiredModal.test.jsx

```

---

## Backend (AWS Serverless)

### Configuration & Env Variables

1. **AWS Credentials**
   Ensure you have a valid AWS profile (e.g. `default`) configured in `~/.aws/credentials` with permissions to create/retrieve DynamoDB tables, API Gateway resources, Lambdas, and IAM roles.

2. **`serverless.yml`**

   * Declares three DynamoDB tables: `FlagsTable`, `CountersTable`, and `ConnectionsTable`.
   * Defines the following HTTP API routes:

     * `GET  /flags` → list all flags
     * `POST /flags` → create a new flag
     * `PATCH /flags/{id}` → toggle a flag’s “enabled” boolean
     * `DELETE /flags/{id}` → delete a flag
   * Defines two WebSocket routes:

     * `$connect` → stores new connections
     * `$disconnect` → removes stale connections
   * Lambdas broadcast events (`flag-created`, `flag-updated`, `flag-deleted`) to all live connections via API Gateway Management API.

3. **Environment Variables (in `serverless.yml`)**

   ```yaml
   provider:
     environment:
       DYNAMODB_FLAGS_TABLE:      !Ref FlagsTable
       DYNAMODB_COUNTERS_TABLE:   !Ref CountersTable
       DYNAMODB_CONNECTIONS_TABLE: !Ref ConnectionsTable
       WEBSOCKET_ENDPOINT:        !Sub "https://${WebsocketsApi}.execute-api.${AWS::Region}.amazonaws.com/dev"
   ```

   * These names are auto-generated by CloudFormation, so you don’t need to hard-code ARNs in environment variables.

### Install & Deploy

```bash
cd backend
npm install
# Verify AWS credentials are set (e.g., AWS_PROFILE=default)
npx serverless deploy
```

* On success, you’ll see:

  ```
  Service deployed to stack feature-flags-backend-dev
  endpoints:
    wss://<WebSocketApiId>.execute-api.<region>.amazonaws.com/dev
    GET    https://<HttpApiId>.execute-api.<region>.amazonaws.com/flags
    POST   https://<HttpApiId>.execute-api.<region>.amazonaws.com/flags
    PATCH  https://<HttpApiId>.execute-api.<region>.amazonaws.com/flags/{id}
    DELETE https://<HttpApiId>.execute-api.<region>.amazonaws.com/flags/{id}
  functions:
    getFlags:        feature-flags-backend-dev-getFlags
    createFlag:      feature-flags-backend-dev-createFlag
    updateFlag:      feature-flags-backend-dev-updateFlag
    deleteFlag:      feature-flags-backend-dev-deleteFlag
    onConnect:       feature-flags-backend-dev-onConnect
    onDisconnect:    feature-flags-backend-dev-onDisconnect
  ```

* Copy the **HTTP API base URL** and **WebSocket endpoint** (e.g. `wss://xyz.execute-api.ap-southeast-2.amazonaws.com/dev`). You’ll need these in the frontend’s `.env.local`.

### Local Development (serverless-offline)

Install the plugin:

```bash
npm install --save-dev serverless-offline
```

Ensure `serverless.yml` has:

```yaml
custom:
  serverless-offline:
    httpPort: 3001
    websocketPort: 3002
```

Then run:

```bash
npx serverless offline start
```

* **HTTP API** will be available at `http://localhost:3001/flags`
* **WebSocket** will be at `ws://localhost:3002/dev`

Update your frontend’s `.env.local` during local dev to:

```
VITE_API_BASE=http://localhost:3001
VITE_WEBSOCKET_URL=ws://localhost:3002/dev
```

---

## Frontend (React + Vite)

### Configuration & Env Variables

Create a `.env.local` file in the `frontend/` folder (do *not* commit this—add `.env.local` to `.gitignore`). Use the following as a template:

```
VITE_API_BASE=https://<YourHttpApiId>.execute-api.<region>.amazonaws.com
VITE_WEBSOCKET_URL=wss://<YourWebSocketApiId>.execute-api.<region>.amazonaws.com/dev
```

* **`VITE_API_BASE`** should be exactly the HTTP API base URL reported by Serverless (omit trailing `/flags`—just the root).
* **`VITE_WEBSOCKET_URL`** is the WebSocket endpoint URL, including the `/dev` stage.

For local development with `serverless-offline`, set:

```
VITE_API_BASE=http://localhost:3001
VITE_WEBSOCKET_URL=ws://localhost:3002/dev
```

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

* Vite will start a local dev server at `http://localhost:3000`.
* The app will immediately connect to `VITE_API_BASE` and `VITE_WEBSOCKET_URL` (from `.env.local`).
* Once loaded, clicking **Create Flag**, toggling status, or deleting a flag will fire HTTP requests to the backend and broadcast via WebSockets.

### Build for Production

```bash
npm run build
```

* This outputs an optimized build in `dist/`. You can deploy that to any static hosting (Netlify, Vercel, S3 + CloudFront, etc.).
* When deployed, make sure the environment variables `VITE_API_BASE` and `VITE_WEBSOCKET_URL` point to the live AWS endpoints.

### Testing

All frontend functionality is covered by **Jest** + **React Testing Library**. The tests live alongside your source under `src/__tests__` and `src/hooks/__tests__/` and cover:

* **API layer** (`api.fetcher`, error & 401 handling)
* **Custom hooks** (`useAwsWebSocketFlags`, `useDarkMode`, `useSessionValidator`)
* **Components** (layout, modals, forms, tables, routing)
* **App logic** (filtering, sorting, CRUD & bulk actions, dark mode toggling)
* **Routing** (public vs. protected routes, 404 redirects, entrypoint bootstrap)

To run tests:

```bash
cd frontend
npm test
```

To generate a coverage report:

```bash
npm test -- --coverage
```

Reports will be output to `coverage/` and the console summary will show percentage metrics for statements, branches, functions, and lines.

---

## Real-Time WebSocket Flow

1. **Client** (frontend) calls `useAwsWebSocketFlags(loadFlags)` on mount:

   * Creates a native `WebSocket` to `VITE_WEBSOCKET_URL`.
   * Listens for incoming messages (JSON objects with `event` + `id` or `flag` data).

2. **Server** (Lambda):

   * On any `createFlag`, `updateFlag`, or `deleteFlag`, the Lambda scans the `ConnectionsTable` and broadcasts:

     ```json
     { "event": "flag-created", "flag": { /* new flag object */ } }
     { "event": "flag-updated",  "id": <flagId> }
     { "event": "flag-deleted",  "id": <flagId> }
     ```
   * If a `PostToConnection` fails with 404/410, the Lambda deletes that stale `connectionId` from DynamoDB.

3. **Client** receives an event and calls the passed‐in `onEvent()` (which is `loadFlags()`):

   * Re-fetches the entire `/flags` list
   * Updates local state, re-rendering the table so every tab stays in sync.

---

## Common Commands

```bash
# From the monorepo root:

# 1) Backend
cd backend
npm install
npx serverless deploy          # Deploy to AWS
npx serverless offline start   # Run locally

# 2) Frontend
cd frontend
npm install
npm run dev                    # Start Vite dev server (http://localhost:3000)
npm run build                  # Build for production

# 3) Tests
npm test                       # Run all tests
npm test -- --coverage         # Run tests with coverage reporting

# 4) Lint (if ESLint configured)
cd frontend
npm run lint
```

---

## Summary

* **Frontend** (React + Vite + Tailwind):

  * Real-time flag listing, create, toggle, delete
  * Responsive, mobile-friendly, light/dark mode
* **Backend** (Serverless Framework + AWS):

  * DynamoDB for storing flags, counters, and connection IDs
  * AWS API Gateway (HTTP + WebSocket) + Lambda functions
  * Real-time broadcast of create/update/delete events

> Feel free to open issues or submit PRs for improvements. Enjoy building with real-time feature flags!
