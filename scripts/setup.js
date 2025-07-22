#!/usr/bin/env node

/**
 * Setup helper script for Deskbird MCP Server
 * Helps users configure their environment and integration
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createEnvTemplate() {
  const envTemplate = `# Deskbird MCP Server Configuration
# Copy this file to .env and fill in your actual values

# Required: Your Deskbird refresh token
REFRESH_TOKEN=your_deskbird_refresh_token

# Required: Google API key for token refresh
GOOGLE_API_KEY=your_google_api_key

# Required: Deskbird workspace configuration
DESKBIRD_RESOURCE_ID=your_resource_id
DESKBIRD_ZONE_ITEM_ID=your_zone_item_id
DESKBIRD_WORKSPACE_ID=your_workspace_id

# Optional: Override default API endpoints
# DESKBIRD_API_BASE_URL=https://app.deskbird.com/api
# DESKBIRD_API_VERSION=v1.1

# Optional: Logging level (debug, info, warn, error)
# LOG_LEVEL=info
`;

  const envPath = join(process.cwd(), '.env.example');
  writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.example file with configuration template');
}

function generateClaudeConfig() {
  const config = {
    mcpServers: {
      deskbird: {
        command: "npx",
        args: ["-y", "@mschilling/deskbird-mcp-server"]
      }
    }
  };

  const configPath = join(process.cwd(), 'claude_desktop_config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Generated claude_desktop_config.json');
}

function generateVSCodeConfig() {
  const config = {
    mcp: {
      servers: {
        deskbird: {
          command: "npx",
          args: ["-y", "@mschilling/deskbird-mcp-server"]
        }
      }
    }
  };

  const configPath = join(process.cwd(), 'vscode_mcp_config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Generated vscode_mcp_config.json');
}

function showInstructions() {
  console.log(`
🚀 Deskbird MCP Server Setup Complete!

📁 Files created:
- .env.example - Environment configuration template
- claude_desktop_config.json - Claude Desktop configuration
- vscode_mcp_config.json - VS Code MCP configuration

📝 Next Steps:

1. Configure Environment:
   cp .env.example .env
   # Edit .env with your actual Deskbird credentials

2. For Claude Desktop:
   # Copy contents of claude_desktop_config.json to your Claude Desktop config
   # Location: ~/Library/Application Support/Claude/claude_desktop_config.json

3. For VS Code:
   # Add contents of vscode_mcp_config.json to your VS Code settings
   # Or copy to .vscode/mcp.json in your workspace

4. Test the server:
   npm start

📚 Documentation:
- README.md - Full documentation and setup guide
- API_ENDPOINTS.md - API reference

🆘 Need Help?
- Check the README.md for detailed setup instructions
- Report issues: https://github.com/mschilling/deskbird-mcp-server/issues

Happy desk booking! 🏢✨
`);
}

async function setup() {
  try {
    console.log('🔧 Setting up Deskbird MCP Server...\n');

    createEnvTemplate();
    generateClaudeConfig();
    generateVSCodeConfig();

    showInstructions();

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Only run if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setup();
}
