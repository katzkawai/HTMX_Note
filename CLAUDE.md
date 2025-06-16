# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start the production server on port 3000
- `npm run dev` - Start development server with auto-restart (nodemon)
- `npm install` - Install dependencies

## Architecture Overview

This is a simple HTMX-based note-taking application with a Node.js/Express backend. The architecture follows a traditional server-side rendering approach where the server returns HTML fragments instead of JSON.

### Key Components

- **Frontend**: Single HTML page (index.html) with HTMX attributes for dynamic interactions
- **Backend**: Express.js server providing RESTful endpoints that return HTML fragments
- **Data Storage**: In-memory array (notes) with auto-incrementing IDs

### HTMX Integration Pattern

The app uses HTMX attributes to enable dynamic interactions without JavaScript:
- Form submissions return HTML fragments that update specific DOM elements
- CRUD operations use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Server responses are HTML snippets that replace or update DOM elements via `hx-target` and `hx-swap`

### API Endpoints

- `GET /` - Serves the main HTML page
- `GET /notes` - Returns HTML list of all notes
- `POST /notes` - Creates new note, returns HTML for the new note item
- `GET /notes/:id/edit` - Returns HTML edit form for specific note
- `GET /notes/:id` - Returns HTML for specific note (used for cancel operations)
- `PUT /notes/:id` - Updates note, returns updated HTML
- `DELETE /notes/:id` - Deletes note, returns empty response

### Template Pattern

Server-side HTML generation uses template literals to create consistent note item structure. Each note item includes:
- Unique ID for targeting (`note-${id}`)
- HTMX attributes for edit/delete actions
- Confirmation dialogs for destructive operations