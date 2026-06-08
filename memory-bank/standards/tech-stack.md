# Tech Stack

## Overview
Core technology choices for the World Cup 2026 Fan Companion project. It is built as a highly interactive, real-time web application.

## Languages
TypeScript (Strict mode), Node.js

TypeScript provides type safety which is crucial for maintaining the complex domain models of the tournament (matches, teams, brackets), while Node.js runs our Next.js backend/BFF layer.

## Framework
Next.js 16 (App Router) with React 19

Next.js offers a powerful mix of server and client rendering, which is ideal for this application where SEO and fast initial page loads matter (server-side rendering) but high interactivity is also needed (client-side React components).

## Authentication
TBD / None

Currently, the application operates as a public data viewer without user-specific accounts or authenticated sessions.

## Infrastructure & Deployment
Vercel

Vercel provides the most optimized deployment environment for Next.js applications, offering edge caching, zero-config deployments, and seamless integration with the App Router.

## Package Manager
npm

Standard npm is used for dependency management, aligning with the existing `package-lock.json`.
