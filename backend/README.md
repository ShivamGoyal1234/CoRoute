# CoRoute - Collaborative Trip Planning Backend

A comprehensive backend system for collaborative trip planning with real-time updates, role-based permissions, and webhook support.

## Features

- 🗺️ **Trip Management**: Create and manage trips with date ranges and budgets
- 📅 **Day-wise Itineraries**: Organize activities by day with custom notes
- 🎯 **Activity Cards**: Detailed activity information with location, timing, and costs
- 👥 **Collaboration**: Invite members with role-based access (Owner, Editor, Viewer)
- 💬 **Comments**: Discussion system for activities and days
- 📎 **Attachments**: File upload support for tickets, PDFs, and images
- ✅ **Checklists**: Task management with assignments
- 💰 **Budget Tracking**: Expense tracking and budget summaries
- 🔔 **Webhooks**: Event-driven notifications for system integrations

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your environment variables:

   ```bash
   cp .env.example .env
   ```

4. Start MongoDB service

5. Run the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Trips

- `POST /api/trips` - Create trip
- `GET /api/trips` - Get user's trips
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Memberships

- `POST /api/memberships/:tripId/invite` - Invite member
- `PUT /api/memberships/:id/role` - Update member role
- `DELETE /api/memberships/:id` - Remove member

### Days

- `POST /api/days` - Create day in trip
- `GET /api/days/trip/:tripId` - Get all days for trip
- `PUT /api/days/:id` - Update day
- `DELETE /api/days/:id` - Delete day

### Activities

- `POST /api/activities` - Create activity
- `GET /api/activities/day/:dayId` - Get activities for day
- `PUT /api/activities/:id` - Update activity
- `PUT /api/activities/:id/reorder` - Reorder activities
- `DELETE /api/activities/:id` - Delete activity

### Comments

- `POST /api/comments` - Add comment
- `GET /api/comments/activity/:activityId` - Get comments for activity
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Attachments

- `POST /api/attachments` - Upload attachment
- `GET /api/attachments/activity/:activityId` - Get attachments
- `DELETE /api/attachments/:id` - Delete attachment

### Checklists

- `POST /api/checklists` - Create checklist item
- `GET /api/checklists/trip/:tripId` - Get trip checklists
- `PUT /api/checklists/:id` - Update checklist item
- `DELETE /api/checklists/:id` - Delete checklist item

### Webhooks

- `POST /api/webhooks` - Register webhook
- `GET /api/webhooks/trip/:tripId` - Get webhooks for trip
- `DELETE /api/webhooks/:id` - Delete webhook

## Role-Based Permissions

### Owner

- Full access to all trip features
- Can delete the trip
- Can manage all members

### Editor

- Can add/edit/delete days and activities
- Can comment and upload attachments
- Can manage checklists
- Cannot delete trip or change owner

### Viewer

- Read-only access to trip details
- Can view all content
- Can add comments
- Cannot modify trip structure

## Webhook Events

The system triggers webhooks for the following events:

- `trip.created`
- `trip.updated`
- `member.invited`
- `activity.created`
- `activity.updated`
- `comment.added`
- `checklist.completed`

## Database Schema

See ERD in project documentation for complete schema relationships.

## Development

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## License

MIT
