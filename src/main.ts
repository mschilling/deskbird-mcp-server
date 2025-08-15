#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DeskbirdMcpServer } from './deskbird.server.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('Main');

// --- Server Start ---
async function main() {
  logger.info('Starting Deskbird MCP Server...');
  const server = new DeskbirdMcpServer();
  
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Keep the process alive for stdio transport
  process.stdin.resume();
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, closing server.');
    await server.close();
    process.exit(0);
  });
}

// Run the main function and handle potential errors
main().catch((error) => {
  logger.error('Fatal error starting MCP Server', error);
  process.exit(1);
});
