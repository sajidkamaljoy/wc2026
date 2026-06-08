# UX Guide

## Overview
UI/UX standards and design system choices for a premium, fast, and interactive World Cup fan experience.

## Design System & Component Library
Custom Tailwind CSS v4

There is no external component library (like MUI or Radix). All components are bespoke, built from scratch using strict utility-first Tailwind classes.

## Styling Approach
Inline Utility Classes

- All styling is done inline via Tailwind CSS. No CSS modules or external style sheets, with the exception of `app/globals.css` (used exclusively for base layers, custom variables, and keyframe animations).
- **Dark Mode**: Applied globally via the `dark` class on the `<html>` element. The primary background is `bg-slate-950` (#020617).

## Design Tokens & Colors
- **Text**: `text-slate-100` (primary), `text-slate-400` / `500` (muted)
- **Accent**: `text-amber-400`, `bg-amber-500/10` (active states, highlights, points)
- **Live/Danger**: `text-red-400`, `bg-red-500/10` (live match indicators, negative sentiment)
- **Success**: `text-emerald-400`, `bg-emerald-500/10` (qualification zone, positive sentiment)
- **Warning**: `text-amber-300`, `bg-amber-500/5` (third-place conditionals)
- **Glassmorphism**: `backdrop-blur-md`, `bg-slate-950/80` (used in NavBars and modals)

## Responsive Design Strategy
Mobile-First with Progressive Enhancement

- **Mobile (Default)**: Icon-only nav items, collapsed badges, stacked layouts.
- **sm**: Show nav labels, expand badges.
- **md**: Side-by-side fixture card layouts, horizontal scrolls.
- **lg**: Wider content area.
- **xl**: 3-column group grids.

## Animations
Subtle, meaningful animations to elevate the premium feel:
- `animate-fade-in`: Custom keyframe for page transitions.
- `animate-pulse` / `animate-ping`: Used for live indicators and loading states.
- `animate-spin`: Loading spinners.
