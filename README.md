# Blaxel MCP Hello World TypeScript

<p align="center">
  <img src="https://blaxel.ai/logo.png" alt="Blaxel" width="200"/>
</p>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/downloads/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-brightgreen.svg)](https://github.com/modelcontextprotocol/servers)
[![PNPM](https://img.shields.io/badge/PNPM-package_manager-orange.svg)](https://pnpm.io/)

</div>

A TypeScript template implementation of a Model Context Protocol (MCP) server using the Blaxel platform. This simple "Hello World" server demonstrates how to create MCP tools and functions that can be integrated with AI agents and language models through the standardized MCP interface.

## 📑 Table of Contents

- [✨ Features](#features)
- [🚀 Quick Start](#quick-start)
- [📋 Prerequisites](#prerequisites)
- [💻 Installation](#installation)
- [🔧 Usage](#usage)
  - [Running Locally](#running-locally)
  - [Testing](#testing)
  - [Deployment](#deployment)
- [📁 Project Structure](#project-structure)
- [❓ Troubleshooting](#troubleshooting)
- [👥 Contributing](#contributing)
- [🆘 Support](#support)
- [📄 License](#license)

## ✨ Features

- Simple MCP server implementation with TypeScript
- "Hello World" tool function with parameter validation
- Zod schema validation for robust type safety
- Built-in Blaxel platform integration for seamless deployment
- Support for both stdio and Blaxel transport protocols
- Hot reload development environment
- Production-ready TypeScript compilation
- Easy integration with AI agents and language models

## 🚀 Quick Start

For those who want to get up and running quickly:

```bash
# Clone the repository
git clone https://github.com/blaxel-ai/template-mcp-hello-world-ts.git

# Navigate to the project directory
cd template-mcp-hello-world-ts

# Install dependencies
npm install

# Start the development server
npm dev

# In another terminal, deploy to Blaxel
bl deploy

# Test MCP server
npm run inspect
```

## 📋 Prerequisites

- **Node.js:** 18.0 or later
- **Blaxel Platform Setup:** Complete Blaxel setup by following the [quickstart guide](https://docs.blaxel.ai/Get-started#quickstart)
  - **[Blaxel CLI](https://docs.blaxel.ai/Get-started):** Ensure you have the Blaxel CLI installed. If not, install it globally:
    ```bash
    curl -fsSL https://raw.githubusercontent.com/blaxel-ai/toolkit/main/install.sh | BINDIR=/usr/local/bin sudo -E sh
    ```
  - **Blaxel login:** Login to Blaxel platform
    ```bash
    bl login YOUR-WORKSPACE
    ```

## 💻 Installation

**Clone the repository and install dependencies:**

```bash
git clone https://github.com/blaxel-ai/template-mcp-hello-world-ts.git
cd template-mcp-hello-world-ts
npm install
```

## 🔧 Usage

### Running Locally

Start the development server with hot reloading:

```bash
npm dev
```

For production build and run:

```bash
# Build the TypeScript code
npm run build

# Run the compiled JavaScript
npm run prod
```

You can also inspect the MCP server using the official MCP inspector:

```bash
npm run inspect
```

_Note:_ The development server automatically restarts when you make changes to the source code.

### Testing

You can test your MCP function locally:

```bash
# Test with the MCP inspector
npm run inspect
```

The MCP tool expects a `firstname` parameter and returns a greeting message.

### Deployment

When you are ready to deploy your MCP server:

```bash
bl deploy
```

This command uses your code and the configuration in `blaxel.toml` to deploy your MCP server as a function on the Blaxel platform.

## 📁 Project Structure

- **src/server.ts** - Main MCP server implementation with the hello_world tool
- **package.json** - NPM package configuration with scripts and dependencies
- **tsconfig.json** - TypeScript compiler configuration
- **blaxel.toml** - Blaxel deployment configuration (function type)

## ❓ Troubleshooting

### Common Issues

1. **Blaxel Platform Issues**:
   - Ensure you're logged in to your workspace: `bl login MY-WORKSPACE`
   - Verify models are available: `bl get models`
   - Check that functions exist: `bl get functions`

2. **MCP Server Connection Issues**:
   - Verify the server starts without errors using `npm run dev`
   - Check that the MCP inspector can connect using `npm run inspect`
   - Ensure TypeScript compiles successfully with `npm run build`
   - Verify WebSocket connections if using Blaxel transport

3. **Dependency and Environment Issues**:
   - Make sure you have Node.js 18+
   - Try `npm install` to reinstall dependencies
   - Check for TypeScript compilation errors
   - Verify that all required dependencies are installed

For more help, please [submit an issue](https://github.com/blaxel-templates/template-mcp-hello-world-ts/issues) on GitHub.

## 👥 Contributing

Contributions are welcome! Here's how you can contribute:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Submit** a Pull Request

Please make sure to update tests as appropriate and follow the TypeScript code style of the project.

## 🆘 Support

If you need help with this template:

- [Submit an issue](https://github.com/blaxel-templates/template-mcp-hello-world-ts/issues) for bug reports or feature requests
- Visit the [Blaxel Documentation](https://docs.blaxel.ai) for platform guidance
- Check the [Model Context Protocol Documentation](https://github.com/modelcontextprotocol/servers) for MCP-specific help
- Join our [Discord Community](https://discord.gg/G3NqzUPcHP) for real-time assistance

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.