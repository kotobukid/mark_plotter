# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mark Plotter is a browser-based SVG annotation and markup tool built with Vue 3, TypeScript, and Vite. It allows users to annotate images with various shapes, text, and drawing tools, then export the results as SVG or PNG.

### Project Philosophy

This tool is designed specifically for creating software documentation with consistent visual quality. Key design decisions:
- **Fixed stroke colors and widths** - Ensures visual consistency across all documentation
- **Intentionally limited features** - Focuses on essential marking capabilities only
- **Screenshot-first workflow** - Optimized for pasting screenshots or opening local images

### Development Guidelines

1. **Maintain simplicity** - Do not add features that compromise the tool's focused purpose
2. **Preserve visual consistency** - Stroke colors and widths must remain fixed
3. **Small, incremental changes** - Make granular improvements that can be reviewed individually
4. **Wait for approval** - Discuss potential improvements before implementing
5. **No automatic commits** - The maintainer will handle all git commits

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (serves on https://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## Architecture Overview

### Core Technologies
- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety
- **Pinia** for state management
- **Vite** for building and development
- **Pug** for template syntax
- **Less** for styling

### Key Architectural Patterns

1. **Layer-based Rendering System**
   - Each tool has its own layer component (e.g., `CircleLayer.vue`, `RectLayer.vue`)
   - Edit layers handle modification of existing annotations (e.g., `CircleEditLayer.vue`)
   - `TransformedEventEmitter.vue` handles coordinate transformations for all layers

2. **State Management Structure**
   - Tool state: `stores/tool.ts` - manages active tool and options
   - Shape stores: `stores/circles.ts`, `stores/rects.ts`, etc. - manage shape collections
   - Transform state: `stores/transform.ts` - viewport pan/zoom state
   - Snapshot system: `stores/snapshot.ts` - undo/redo functionality

3. **Composables for Reusable Logic**
   - `composables/clipboard.ts` - clipboard operations (paste screenshots, copy as PNG)
   - `composables/fileSystem.ts` - File System API integration
   - `composables/svg.ts` - SVG serialization and export
   - `composables/image.ts` - image loading and conversion

### Tool System

Tools are defined in `types.ts` and include:
- `pan` - Navigate the viewport
- `crop` - Crop the canvas
- `rect`, `circle`, `ellipse`, `line` - Shape drawing tools
- `text` - Text annotation
- `mask` - Black rectangle masking
- `edit` - Edit existing annotations
- `erase` - Remove annotations

Each tool typically has:
- A layer component for rendering
- An edit layer for modifications
- A store for managing instances
- Optional tool options component

### File Structure Patterns

When adding new features:
- New tools go in `components/*Layer.vue` and `components/*EditLayer.vue`
- Tool state goes in `stores/*.ts`
- Shared logic goes in `composables/*.ts`
- Tool icons go in `public/*.svg`

## Important Implementation Details

1. **Coordinate System**: The app uses a transformed coordinate system. Mouse events must be transformed through `TransformedEventEmitter.vue` to account for pan/zoom.

2. **SVG Export**: The `composables/svg.ts` handles serialization. Elements marked with `omit-on-save` class are excluded from exports.

3. **Clipboard Integration**: Supports pasting images directly from clipboard and copying the canvas as PNG.

4. **Multi-file Support**: The app can handle multiple images simultaneously, shown in the file list sidebar.

5. **HTTPS Requirement**: The development server runs on HTTPS (required for clipboard API). Local certificates are included in the repo.