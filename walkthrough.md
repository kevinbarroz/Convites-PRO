# ConvitesPRO - Walkthrough

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
Run the SQL commands from `schema.sql` in your Supabase SQL Editor to create the necessary tables (`invites`, `buttons`, `rsvps`) and policies.

### 3. Authentication Setup (Admin Access)
Since this is an exclusive admin panel, there is no public "Sign Up" page. You must create your admin user manually:

1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Authentication** (icon of two users) > **Users**.
3.  Click on **Add User** (top right) -> **Create New User**.
4.  Enter your desired **Email** and **Password**.
5.  Click **Create User**.
    *   *Tip: If "Confirm Email" is enabled in your settings, you might need to click the confirmation link sent to that email, or manually mark the user as confirmed in the dashboard (click the three dots next to the user > "Confirm user").*
6.  Use these credentials to log in at `http://localhost:3000/login`.

> [!IMPORTANT]
> **Enable Email Login**: If you see "Email logins are disabled", go to **Authentication > Providers > Email** in your Supabase Dashboard and ensure **Enable Email provider** is toggled **ON**.

## Features Overview

### Landing Page (`/`)
- Public facing page with "Hero" and "How it works".
- Links to Admin Login and WhatsApp contact.

### Admin Panel (`/admin`)
- **Login**: Secure access via Supabase Auth.
- **Dashboard**: View total views and RSVPs. List of all invites.
- **Create/Edit Invite**:
  - Set Title and Slug (e.g., `/casamento-ana`).
  - Add Image URLs for Cover and Background.
  - Manage interactive buttons (Location, RSVP, Text).

### Invite Page (`/[slug]`)
- **Cover State**: Fullscreen image with "Tap to Open". Increments view count.
- **Open State**: Shows background image and buttons.
- **Modals**:
  - **Location**: Displays Google Maps iframe.
  - **RSVP**: Simple form to confirm presence.
  - **Text**: Displays custom text (e.g., Dress Code).

## Development
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.
