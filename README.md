# npm package versioner GitHub Action

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action that automatically manages semantic versioning for npm packages
based on your CI/CD context.

## Purpose

This action automatically updates the `version` field in your `package.json`
file based on the GitHub Actions environment. It generates semantic version
numbers appropriate to your build context:

- **Tags**: Uses the tag name as the version, stripping any non-numeric prefix
  (e.g., `v1.2.3` → `1.2.3`, `www-1.2.3` → `1.2.3`)
- **Branches**: Creates prerelease versions with the branch name and build
  number (e.g., `1.0.0-feature.123.456`)
- **Local development**: Adds a `-local` prerelease identifier

This eliminates manual version management and ensures consistent versioning
across your CI/CD pipeline.

## Usage

### Basic Usage

Add this action to your workflow before building or publishing your package:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: microbit-foundation/npm-package-versioner-action@v1
  - run: npm run build
  - run: npm publish
```

### Custom Working Directory

If your `package.json` is not in the repository root:

```yaml
steps:
  - uses: microbit-foundation/npm-package-versioner-action@v1
    with:
      working-directory: ./packages/my-package
```

### Version Generation Rules

The action generates versions based on the base version in your `package.json`
and the GitHub environment:

| Context                          | Example Output          | Notes                                  |
| -------------------------------- | ----------------------- | -------------------------------------- |
| Tag `v1.2.3`                     | `1.2.3`                 | Non-numeric prefix stripped            |
| Tag `www-1.2.3`                  | `1.2.3`                 | Supports monorepo tag prefixes         |
| Branch `main` + build 456        | `1.0.0-dev.456`         | Main/master/develop branches use `dev` |
| Branch `feature/foo` + build 123 | `1.0.0-feature.foo.123` | Branch name is sanitized               |
| Local (no CI)                    | `1.0.0-local`           | For local development                  |

Branch names are sanitized by:

- Converting `main`, `master`, and `develop` to `dev`
- Splitting on `/`, `\`, `-`, `.`, and `_`
- Removing non-alphanumeric characters
- Joining parts with `.`

## Best Practices

### Placeholder Version in package.json

Since this action automatically generates the version number, we recommend using
`0.0.0-local` as a placeholder in your repository's `package.json`:

```json
{
  "name": "your-package",
  "version": "0.0.0-local",
  ...
}
```

This makes it clear that:

- The version is automatically managed by the CI/CD pipeline
- The checked-in version is not intended for publication
- Local development will use the `-local` prerelease identifier

The action will overwrite this placeholder with the appropriate version during
your CI/CD workflow.

## Development

### Prerequisites

- Node.js 24.x or later
- npm

### Setup and Building

1. Install the dependencies

   ```bash
   npm install
   ```

2. Format, test, and build the action

   ```bash
   npm run all
   ```

   This will:
   - Format code with Prettier
   - Lint with ESLint
   - Run tests with Jest
   - Generate coverage reports
   - Build the distribution bundle with Rollup

   > **Important:** The build step uses [Rollup](https://rollupjs.org/) to
   > bundle the TypeScript source into a single ES module at `dist/index.js`
   > with all dependencies included. You must run `npm run all` (or
   > `npm run package`) before committing to ensure the `dist/` directory is up
   > to date.

### Available Scripts

- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run lint` - Lint code with ESLint
- `npm test` - Run tests
- `npm run coverage` - Generate coverage badge
- `npm run package` - Build the distribution bundle
- `npm run all` - Run all of the above

The generated `dist/` directory must be committed to the repository.

## License

This software is under the MIT open source license.

[SPDX-License-Identifier: MIT](LICENSE)

We use dependencies via the npm registry as specified by the package.json file
under common Open Source licenses.

Full details of each package can be found by running `license-checker`:

```bash
npx license-checker --direct --summary --production
```

Omit the flags as desired to obtain more detail.

## Code of Conduct

Trust, partnership, simplicity and passion are our core values we live and
breathe in our daily work life and within our projects. Our open-source projects
are no exception. We have an active community which spans the globe and we
welcome and encourage participation and contributions to our projects by
everyone. We work to foster a positive, open, inclusive and supportive
environment and trust that our community respects the micro:bit code of conduct.
Please see our [code of conduct](https://microbit.org/safeguarding/) which
outlines our expectations for all those that participate in our community and
details on how to report any concerns and what would happen should breaches
occur.
