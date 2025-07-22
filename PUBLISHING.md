# Publishing Guide

This document outlines the process for publishing the Deskbird MCP Server to GitHub Packages.

## Prerequisites

1. **GitHub Repository**: Make sure your repository is properly set up on GitHub
2. **GitHub Personal Access Token (PAT)**: You'll need a PAT with `packages:write` permission
3. **NPM Configuration**: Configure npm to use GitHub Packages registry

## Setup for Publishing

### 1. Configure NPM for GitHub Packages

Create or update your `~/.npmrc` file with:

```bash
@mschilling:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Alternatively, you can authenticate using:

```bash
npm login --scope=@mschilling --auth-type=legacy --registry=https://npm.pkg.github.com
```

### 2. Verify Package Configuration

The package.json is already configured with:
- Scoped package name: `@mschilling/deskbird-mcp-server`
- GitHub registry: `publishConfig.registry`
- Binary entry point: `bin.deskbird-mcp-server`
- Proper files inclusion

### 3. Publishing Process

#### Option A: Manual Publishing

1. **Build the package**:
   ```bash
   npm run build
   ```

2. **Test the package**:
   ```bash
   npm run test
   ```

3. **Publish to GitHub Packages**:
   ```bash
   npm publish
   ```

#### Option B: Automated Publishing (Recommended)

The repository includes GitHub Actions workflows for automated publishing:

1. **Release Workflow** (`.github/workflows/release.yml`):
   - Triggers on manual dispatch or main branch changes
   - Automatically bumps version
   - Creates GitHub release
   - Publishes to GitHub Packages

2. **Publish Workflow** (`.github/workflows/publish.yml`):
   - Triggers on GitHub releases
   - Builds and publishes the package

### 4. Creating a Release

#### Using GitHub Actions (Recommended):

1. Go to your repository on GitHub
2. Navigate to Actions → Release
3. Click "Run workflow"
4. Select version type (patch, minor, major) or provide custom version
5. The workflow will handle everything automatically

#### Manual Release:

1. **Update version**:
   ```bash
   npm version patch  # or minor/major
   ```

2. **Update CHANGELOG.md** with release notes

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "chore: release v1.0.1"
   git push
   git push --tags
   ```

4. **Create GitHub Release**:
   - Go to GitHub → Releases → New Release
   - Select the tag you just created
   - Add release notes
   - Publish release

## Installation for Users

After publishing, users can install your package:

### Global Installation:
```bash
npm install -g @mschilling/deskbird-mcp-server
```

### Using NPX:
```bash
npx @mschilling/deskbird-mcp-server
```

### As Dependency:
```bash
npm install @mschilling/deskbird-mcp-server
```

## Verification

After publishing, verify the package:

1. **Check GitHub Packages**:
   - Go to your GitHub repository
   - Check the "Packages" section
   - Verify the package appears correctly

2. **Test Installation**:
   ```bash
   npm install -g @mschilling/deskbird-mcp-server
   deskbird-mcp-server --help
   ```

3. **Test NPX Usage**:
   ```bash
   npx @mschilling/deskbird-mcp-server
   ```

## Troubleshooting

### Authentication Issues:
- Verify your GitHub token has `packages:write` permission
- Check your `.npmrc` configuration
- Try re-authenticating: `npm login --registry=https://npm.pkg.github.com`

### Build Issues:
- Run `npm run build` before publishing
- Check TypeScript compilation errors
- Verify all dependencies are installed

### Permission Issues:
- Ensure you have write access to the repository
- Check that the repository visibility allows package publishing

## Best Practices

1. **Always test locally** before publishing
2. **Use semantic versioning** (semver)
3. **Update CHANGELOG.md** with each release
4. **Test package installation** after publishing
5. **Use GitHub releases** for proper version management
6. **Keep README.md updated** with installation instructions

## Security Considerations

- Never commit GitHub tokens to the repository
- Use GitHub secrets for automated workflows
- Regularly update dependencies
- Review package contents before publishing

## Support

If you encounter issues:
1. Check this guide first
2. Review GitHub Actions logs
3. Consult GitHub Packages documentation
4. Open an issue in the repository
