# MKP CORE SDK

This repo host the core of a secure, bidirectional communication system between host applications and client
applications (running inside iframes). The project consists of:

- **Core SDK** – A lightweight, type-safe communication layer that uses the browser’s `postMessage` API to facilitate
  secure messaging between different window contexts. It handles low-level details such as secure handshakes,
  request/response patterns, event pub/sub, and origin validation. Consumed by Host SDK and Client SDK to abstract the
  communication layer

## Structure

The repository is organized as follows:

```
/root
├── package.json          // Root configuration, workspaces, and scripts
├── core              // Core SDK (communication layer)
└── docs                  // Additional documentation and project guides
```

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Install dependencies from the root:

```bash
npm install
```

This installs all dependencies across the packages and sets up the workspaces.

## Commands

Below are the main monorepo commands defined in the root `package.json`:

- **Build Package**  
  Build every package (transpiling TypeScript, etc.):

  ```bash
  npm run build
  ```

- **Clean Package**  
  Remove build artifacts (e.g., `dist` directories):

  ```bash
  npm run clean
  ```

- **Lint All Packages**  
  Run ESLint checks:

  ```bash
  npm run lint
  ```

- **Run Tests**  
  Execute test suites:

  ```bash
  npm run test
  ```

## High-Level SDK Overview

### Core SDK

- **Purpose:** Acts as the backbone for secure communication. It abstracts all low-level postMessage handling and
  exposes a uniform, type-safe API.
- **Key Features:** Secure handshake, request/response pattern, event pub/sub system, and origin validation.
