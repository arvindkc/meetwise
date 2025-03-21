# Meeting Manager

A modern React application for managing and organizing meetings efficiently. Built with Vite, TypeScript, and Tailwind CSS.

## Features

- Calendar data import and parsing
- Drag-and-drop meeting prioritization
- Meeting statistics and time tracking
- Meeting Rating
- Modern UI with shadcn/ui components
- Persistent storage with Zustand

## Technical Stack

Core:

- React 18.3.1
- TypeScript 5.5.3
- Vite 5.4.8

UI Components:

- Radix UI primitives
- shadcn/ui component system
- Tailwind CSS for styling

State Management:

- Zustand with persist middleware
- React Hook Form for form handling

Data Handling:

- File system for calendar import
- Local storage for persistence
- Email integration via Gmail compose URL

Data Security:
- Web Crypto API for encryption
- AES-GCM encryption algorithm
- PBKDF2 key derivation
- Secure salt generation and storage

Data Storage:
- IndexedDB for encrypted data
- Dexie.js for IndexedDB management
- Encrypted records for all sensitive data
- Automatic key management

## Project Structure

/src
/components - UI components and layouts
/services - Business logic (calendar, email)
/stores - State management
/types - TypeScript interfaces
/lib - Utility functions

## Getting Started

1. Install dependencies:
   npm install

2. Start development server:
   npm run dev

3. Build for production:
   npm run build

4. Run linting:
   npm run lint

## Usage

1. Import Calendar:

   - Click "Import" button
   - Select JSON file with calendar data
   - Data will be parsed and displayed

2. Manage Meetings:

   - Drag and drop to prioritize
   - Add comments and notes
   - Request cancellations or changes
   - Track meeting duration

3. Generate Reports:
   - Click "Send Email" to generate summary
   - Review meeting statistics
   - Monitor time allocation

## Configuration

- Target hours can be adjusted in stats panel
- Meeting status tracked per meeting
- Persistent storage configuration in settingsStore
- TypeScript and build settings in tsconfig files

## Development Notes

- Uses strict TypeScript configuration
- Implements error boundaries
- Modular component architecture
- Responsive design with Tailwind
- State persistence with Zustand

## Security Features

### Encryption
- Uses browser's native Web Crypto API
- AES-GCM encryption for all sensitive data
- Secure key derivation using PBKDF2
- Unique IV (Initialization Vector) per encryption
- Automatic salt generation and management


## License

### MIT License

Copyright (c) 2025 [Arvind KC]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
