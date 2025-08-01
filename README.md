# Elbtal Property Management

A modern property rental management platform built for property management companies and tenants.

## Features

### Public Website
- **Property Listings**: Browse available rental properties with advanced search and filtering
- **Property Search**: Filter by location, price range, room count, area, and amenities
- **Property Details**: Detailed property pages with image galleries, floor plans, and location maps
- **Interactive Maps**: Property locations displayed on interactive maps using Leaflet
- **Contact Forms**: Contact property managers and submit rental inquiries
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Company Information**: About us, services overview, and rental process information
- **Legal Pages**: Privacy policy, terms of service, and imprint pages

### Admin Dashboard
- **Property Management**: Add, edit, and manage rental properties
- **City Management**: Manage supported cities and locations
- **Contact Requests**: View and manage incoming contact inquiries
- **User Authentication**: Secure admin login and session management
- **Mobile Responsive**: Fully responsive admin interface with collapsible sidebar

### Technical Features
- **Real-time Updates**: Live property data updates using Supabase
- **Image Management**: Property image galleries with lazy loading
- **Form Validation**: Comprehensive form validation using React Hook Form and Zod
- **Toast Notifications**: User feedback through toast notifications
- **Database Integration**: PostgreSQL database with Supabase backend
- **Edge Functions**: Serverless functions for contact forms and admin operations

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with full TypeScript support
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: High-quality UI component library
- **React Router**: Client-side routing and navigation
- **React Query**: Data fetching and state management
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation
- **Lucide React**: Modern icon library

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **PostgreSQL**: Relational database for property and user data
- **Edge Functions**: Serverless functions for API endpoints
- **Row Level Security**: Database-level security policies

### Maps & Geolocation
- **Leaflet**: Interactive maps for property locations
- **OpenStreetMap**: Map tiles and geographic data

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Component Tagger**: Development-time component identification

## Getting Started

### Prerequisites
- Node.js (recommended: install with [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd elbtal-property-management

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
1. Create a Supabase project
2. Configure environment variables for Supabase connection
3. Run database migrations
4. Set up authentication and database policies

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components and routes
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── integrations/       # Third-party service integrations
└── assets/             # Static assets and images
```

## Development

This project follows modern React development practices with:
- Component-based architecture
- Custom hooks for business logic
- TypeScript for type safety
- Responsive design principles
- Accessibility best practices
