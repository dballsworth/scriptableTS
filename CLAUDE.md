# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a TypeScript boilerplate for creating iOS widgets with the Scriptable app. The project enables hot-loading widgets served by Next.js with automatic updates to live widgets.

## Project Architecture

The codebase consists of two separate packages:

### 1. widgets/
TypeScript source code for widget development, compiled via Rollup.

- **Widget Modules**: All files ending with `WidgetModule.ts` in `widgets/code/widget-modules/` are automatically compiled by Rollup
- **Widget Interface**: Each module must export an `IWidgetModule` object with a `createWidget` async function that returns a `ListWidget`
- **WidgetLoader**: Bootstrap mechanism (`widgets/code/widgetLoader.ts`) that loads and runs widget modules dynamically
- **Compilation Output**: Rollup outputs to `../scriptable-api/public/compiled-widgets/`
  - `widgetLoader.js` uses ES module format
  - Individual widget modules use IIFE format to prevent namespace collisions

### 2. scriptable-api/
Next.js application that serves compiled widgets and provides the demo website.

- Serves compiled widget modules via public directory
- Can host custom data endpoints for widgets
- Deployed to Vercel for production widget updates

### Data Flow

The two packages communicate through the build process: `widgets` compiles TypeScript to JavaScript files in `scriptable-api/public/compiled-widgets/`. The Next.js server serves these compiled files, and the WidgetLoader uses ETag change detection to automatically pull new versions.

## Development Commands

### Widget Development (from ./widgets)

Build widgets once:
```bash
yarn build
```

Watch and rebuild on changes:
```bash
yarn watch
```

### Next.js Server (from ./scriptable-api)

Start development server:
```bash
yarn dev
```

Build for production:
```bash
yarn build
```

Start production server:
```bash
yarn start
```

## Development Workflow

1. Run `yarn watch` in `./widgets` to automatically compile TypeScript changes
2. Run `yarn dev` in `./scriptable-api` to serve compiled widgets at `http://YOUR_LOCAL_DNS_NAME:3000`
3. Compiled widgets are available at `/compiled-widgets/widget-modules/{moduleName}.js`
4. Changes to widgets are automatically detected via ETag and loaded by WidgetLoader on device refresh

## Creating a New Widget Module

1. Create a new file in `./widgets/code/widget-modules/` following the naming pattern `*WidgetModule.ts`
2. Implement the `IWidgetModule` interface:

```typescript
import { IWidgetModule } from "code/utils/interfaces";

const widgetModule: IWidgetModule = {
    createWidget: async (params) => {
        const widget = new ListWidget()
        // Use params.widgetParameter for configuration
        // Use params.debug for debug mode
        return widget
    }
}

module.exports = widgetModule;
```

3. The widget will be automatically picked up by Rollup and compiled

## Loading Widgets on Device

Use the compiled `WidgetLoader` from `./scriptable-api/public/compiled-widgets/widgetLoader.js` with the following configuration:

```javascript
const argsConfig = {
    fileName: "yourWidgetModuleName",
    rootUrl: "http://macbook-pro.local:3000/compiled-widgets/widget-modules/",
    defaultWidgetParameter: "",
    downloadQueryString: "",
};
```

## TypeScript Configuration

- Target: ES2018
- Strict null checks enabled
- Module resolution: node
- Base imports resolve from `widgets/` directory (e.g., `code/utils/interfaces`)

## Known Issues

Multiple widgets from this codebase running simultaneously may interfere with each other, sometimes showing "Call script.setwidget" errors. This persists despite using IIFE format and avoiding global namespace pollution.

## Deployment

The `scriptable-api` directory deploys to Vercel. Configure Vercel to use the `scriptable-api` subdirectory as the project root. Pushing to main branch automatically updates live widgets via ETag-based hot reload.
