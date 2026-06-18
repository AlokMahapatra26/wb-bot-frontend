# Changelog

All notable changes to the WhatsApp AI Bot Dashboard Frontend will be documented in this file.

## [1.1.0] - 2026-06-18

### Added
- Created dynamic `<meta name="description">` tags in `Layout.astro` for SEO and search engine indexing.
- Added comprehensive landing page contents:
  - Responsive Use Cases Grid.
  - Setup and Quick Start guidelines.
  - Native `<details>` FAQs regarding WhatsApp session details, privacy, persistence, and Gemini models.
  - Interactive accordion CSS styling for summary headings and expandable FAQ contents.
- Real-time message streaming support inside `Dashboard.jsx`'s EventSource SSE channel, handling `chat_message` and `chat_clear` events to update message history feeds in real-time.
- Responsive outline SVG vector icons for profile avatar and file contexts in the active configurations list, replacing the legacy emojis.

### Changed
- Rebalanced the layout of the public landing page: Hero text and Sign-In forms now sit side-by-side in a top-fold row (`.hero-auth-row`) while subsequent sections span full width, avoiding the visual gaps.
- Decoupled `html, body` styles in `style.css` to enable natural scrolling on the landing page while preserving the dashboard layout's body constraints.
- Integrated a permanent collapsible WhatsApp integration panel at the top of the left configurations column, removing the redundant button from the header.
- Relocated the WhatsApp server daemon connection logs into an always-visible diagnostics panel at the bottom of the right columns.
- Removed the manual "Send Message" input form.
- Fixed theme switcher manual overrides to toggle both `.dark-mode` and `.light-mode` classes on `document.body` and resolved media query priority overrides.
