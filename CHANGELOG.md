# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure with Rust backend (Actix-web)
- React frontend with TypeScript and Vite
- PostgreSQL database with Docker setup
- User management system with secure authentication
- Restaurant and wishlist data models
- Session management with audit logging
- Database security features (user isolation, constraints, triggers)

### Changed
- Migrated from Hyper + HTMX to Actix-web + React architecture

### Fixed
- N/A

### Removed
- N/A

### Security
- Implemented user session limits (max 5 active sessions)
- Added database audit logging for user actions
- Secure password hashing requirements
- Database user isolation with limited permissions

## [0.1.0] - 2025-01-XX

### Added
- Initial commit with project structure
- Basic backend API framework
- Frontend React application setup
- Docker configuration for PostgreSQL
- Database schema with users, restaurants, wishlist_items, and sessions tables

[Unreleased]: https://github.com/tonguechaude/Gourmestre/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/tonguechaude/Gourmestre/releases/tag/v0.1.0