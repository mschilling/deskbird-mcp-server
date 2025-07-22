#!/usr/bin/env node

/**
 * Simple installation test script
 * This verifies that the package can be imported and basic functionality works
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testInstallation() {
  try {
    console.log('🧪 Testing Deskbird MCP Server installation...');

    // Test 1: Check package.json exists and is valid
    const packagePath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    console.log('✅ Package.json is valid');
    console.log(`📦 Package: ${packageJson.name}@${packageJson.version}`);

    // Test 2: Check if main entry point exists
    const mainFile = join(__dirname, '../dist/main.js');
    try {
      readFileSync(mainFile, 'utf8');
      console.log('✅ Main entry point exists');
    } catch (error) {
      console.log('❌ Main entry point missing - run npm run build');
      process.exit(1);
    }

    // Test 3: Try to import the server (basic smoke test)
    try {
      const { DeskbirdMcpServer } = await import('../dist/deskbird.server.js');
      console.log('✅ Server module can be imported');

      // Test basic instantiation
      const server = new DeskbirdMcpServer();
      console.log('✅ Server can be instantiated');

    } catch (error) {
      console.log('❌ Failed to import/instantiate server:', error.message);
      process.exit(1);
    }

    console.log('🎉 Installation test completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Configure your environment variables (.env file)');
    console.log('2. Add to Claude Desktop or VS Code configuration');
    console.log('3. Run: npm start or deskbird-mcp-server (if installed globally)');

  } catch (error) {
    console.error('❌ Installation test failed:', error.message);
    process.exit(1);
  }
}

// Only run if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testInstallation();
}
