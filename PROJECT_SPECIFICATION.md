# School Management & Portal System - Project Specification

## Goal
Build a modern, responsive institutional website and management portal **without a custom backend**, leveraging BaaS capabilities.

## Tech Stack
- React 19 + Vite
- Tailwind CSS
- React Router
- Context API
- Custom Hooks
- Supabase (Auth, PostgreSQL, Storage)
- React Hook Form + Zod
- SheetJS
- jsPDF / html2canvas
- Lucide React
- Framer Motion

## Architecture
- Reusable components only.
- No duplicated UI.
- Feature-based folder structure.
- Fully responsive for mobile, tablet, and desktop layouts.

## Public Pages
- Home
- About
- Leadership Message
- Faculty Directory
- Gallery
- Contact
- Result Verification
- 404 Error Page

## Admin & Control Console
Roles:
- Super Admin
- Admin
- Teacher

Features:
- Authentication & Login
- Central Dashboard
- Student CRUD operations
- Faculty CRUD operations
- Gallery CRUD operations
- Batch Result Upload (Excel)
- Result Publication Controls
- Institutional Settings & Metadata

## Result & Academic System
Lookup options:
- Class + Roll Number
- Student ID

Detailed Marks Certificate (DMC) generation including:
- Institution branding and logo
- Student identifier and photo
- Subject-wise breakdown, aggregate marks, and percentage
- Calculated grades and remarks
- Print and PDF export features

## Database Schema & Storage
- Relational tables handling user profiles, students, faculty, classes, sessions, settings, and audit logs.
- Cloud storage buckets configured for school assets, faculty media, and student records with robust Row Level Security (RLS) policies.

## UI Theme & Styling
- Primary: #0F766E
- Secondary: #14532D
- Accent: #F59E0B
- Background: #F8FAFC
- Typography: Inter
- Iconography: Lucide

Design principles: Rounded cards, subtle shadows, and clean, accessible educational layouts.

## React & Development Requirements
- Functional Components & Modern Hooks
- Client-side routing and context-driven state management
- Lazy loading and error boundaries
- Modular, production-quality code with type-safe validation
- Built-in loading and error states across asynchronous flows
- Direct integration with Supabase (replacing traditional custom backend infrastructure)

## Folder Structure

```text
src/
├── components/          # Reusable UI elements and layout containers
├── pages/               # Public-facing and administrative views
├── hooks/               # Custom React state and data-fetching hooks
├── contexts/            # Global context providers (e.g., AuthContext)
├── services/            # Supabase API communication layer
├── lib/                 # Client initializers and configuration utils
├── routes/              # Routing configurations and route protection
├── assets/              # Static media files and imagery
