# Data Stack

## Overview
Database and data persistence decisions for the World Cup 2026 Fan Companion project.

## Database
PostgreSQL

PostgreSQL is a robust relational database that perfectly models the deeply relational data of the World Cup (Teams, Groups, Matches, Brackets).

## ORM / Database Client
Prisma

Prisma provides excellent type safety that integrates seamlessly with TypeScript and Next.js server components/API routes. It is used extensively for querying match and team data across the app.
