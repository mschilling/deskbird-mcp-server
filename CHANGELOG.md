# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-22

### Added
- Initial release of Deskbird MCP Server
- Book office desks for specific dates
- Manage favorite desks (add/remove)
- Retrieve user bookings and profiles
- Get available desks from floor configuration
- Direct API access tool for advanced users
- TypeScript support with comprehensive type definitions
- Environment configuration support
- Built with MCP SDK v1.16.0

### Features
- `deskbird_book_desk` - Book a desk for a specific date
- `deskbird_get_user_bookings` - Retrieve user's desk bookings
- `deskbird_favorite_desk` - Add desk to favorites
- `deskbird_unfavorite_desk` - Remove desk from favorites
- `deskbird_get_user_favorites` - Get user's favorite desks
- `deskbird_get_user_info` - Get user profile information
- `deskbird_get_available_desks` - List all available desks
- `deskbird_search_users` - Search for users in company
- `deskbird_get_user_details` - Get detailed user information
- `deskbird_api_call` - Direct API access (preview feature)

### Security
- Environment variable configuration for sensitive data
- API token refresh handling with Google API integration
- Input validation and error handling

### Documentation
- Comprehensive README with setup instructions
- API documentation for all available tools
- VS Code and Claude Desktop integration examples
