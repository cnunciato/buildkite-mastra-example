# Buildkite Mastra Example [![Build status](https://badge.buildkite.com/b081ea7c86665b9e9b8ecdd7bf543cb7115ffd6b37ec599ff1.svg)](https://buildkite.com/cnunciato/buildkite-mastra-example)

A demonstration project showing how to use Mastra AI workflows to intelligently generate Buildkite CI/CD pipelines based on Git commit analysis.

## Overview

This project consists of two main applications:

- **Pipeline**: A Mastra-powered workflow that analyzes Git commits and generates appropriate Buildkite test pipelines
- **Web**: An Astro web application with unit and end-to-end tests

The pipeline workflow uses AI to examine Git diffs and intelligently determine whether to run unit tests, end-to-end tests, or both, based on the files that were changed.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd buildkite-mastra-example
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Running the Mastra Development Server

To start the Mastra development server for the pipeline application:

```bash
npm run dev -w pipeline
```

This will start the Mastra development server, allowing you to interact with and test the AI workflows.

### Generating the Pipeline

To generate a Buildkite pipeline YAML file based on the current Git commit:

```bash
npm run pipeline
```

This command will:

1. Analyze the current HEAD commit (or specify a different SHA as an argument)
2. Use AI to determine which tests should run based on the changed files
3. Generate a Buildkite pipeline YAML file at `apps/pipeline/dist/pipeline.yml`

You can also specify a custom Git SHA and repository path:

```bash
npx tsx apps/pipeline/src/mastra/generate.ts <sha> <repo-path>
```

### Running Tests

For the web application:

- Unit tests: `npm run test:unit -w web`
- End-to-end tests: `npm run test:e2e -w web`
- All tests: `npm run test -w web`

## Project Structure

```
├── apps/
│   ├── pipeline/          # Mastra AI workflow application
│   │   └── src/mastra/
│   │       ├── workflows/
│   │       │   └── pipeline.ts    # Main workflow definition
│   │       └── generate.ts        # Pipeline generation script
│   └── web/              # Astro web application
│       ├── src/
│       └── test/         # Unit and E2E tests
├── package.json          # Root package with workspace configuration
└── turbo.json           # Turborepo configuration
```

## How It Works

1. The workflow analyzes Git commits using the `determineTestTypes` step
2. An AI agent examines the diff and decides which test categories to run
3. The `generatePipeline` step creates a Buildkite YAML pipeline with the appropriate test steps
4. The generated pipeline is saved to `apps/pipeline/dist/pipeline.yml`

The AI analysis considers file relationships and dependencies to make intelligent decisions about which tests need to run for each commit.
