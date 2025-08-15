# Documentation

This directory contains comprehensive technical documentation for the Deskbird MCP Server project.

## Available Documentation

### 🗺️ [Spatial Awareness Endpoints](./spatial-endpoints.md)
Comprehensive guide to the office social radar capabilities, including zone availability and floor configuration endpoints for proximity-based desk management.

**Topics Covered:**
- Real-time desk occupancy and availability queries
- Floor plan coordinates and spatial calculations
- Proximity analysis and colleague location tracking
- Smart desk booking and team clustering
- Example queries and integration patterns

### 📋 [Logging Best Practices](./logging-best-practices.md)
Essential guide for implementing proper logging in MCP servers to avoid JSON-RPC protocol violations and Claude Desktop integration issues.

**Topics Covered:**
- MCP protocol compliance and stdout/stderr separation
- Professional logging architecture patterns
- Environment-based configuration
- Performance optimization
- Troubleshooting common logging issues

---

## Contributing to Documentation

When adding new documentation:

1. **Create descriptive filenames** using kebab-case (e.g., `logging-best-practices.md`)
2. **Update this README.md** with links to new documents
3. **Include practical examples** and code snippets where relevant
4. **Follow the established structure** with clear headings and sections
5. **Cross-reference** related documentation when helpful

## Documentation Standards

- Use clear, concise language
- Include code examples for technical concepts
- Provide both quick reference and detailed explanations
- Update `CLAUDE.md` for essential development guidance
- Keep documentation current with code changes

---

*For quick development reference, see the main [CLAUDE.md](../CLAUDE.md) file.*