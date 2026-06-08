# API Conventions

## Overview
API design conventions, routing patterns, and response formats for internal endpoints.

## API Style
RESTful Path Segments

API paths represent standard resources, avoiding RPC-style naming:
- `/api/fixtures`
- `/api/groups`
- `/api/teams/[teamId]`
- `/api/teams/[teamId]/pathway`
- `/api/teams/[teamId]/form`

## Response Format
JSON Responses & Graceful Degradation

- Endpoints return JSON data.
- **Errors**: Instead of returning `500 Internal Server Error` and breaking the frontend, the convention is to return an empty array (`[]`) or a fallback mock object when an external API or database call fails. This aligns with the frontend's graceful degradation approach.

## Error Response Format
Silent Catching

Errors in the API layer are caught silently to prevent application crashes, particularly when interfacing with unreliable external Football Data or News APIs. The frontend is designed to handle empty arrays by rendering empty states instead of error boundaries.

## Streaming Patterns
Server-Sent Events (SSE)

- The `/api/scores/stream/route.ts` endpoint is dedicated to maintaining persistent SSE connections.
- Payloads are pushed to the client immediately as updates happen, bypassing the need for heavy client-side polling.
