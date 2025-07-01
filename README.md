# TicketFlow - Next.js Full-Stack Application

A modern, production-ready ticket management system built with Next.js, MySQL, and JWT authentication.

## 🚀 Tech Stack

### Frontend

- **Next.js 14+** with App Router
- **React 18** with TypeScript
- **TailwindCSS** with custom IncubXperts design system
- **Radix UI + shadcn/ui** components
- **TanStack Query** for server state management

### Backend

- **Next.js API Routes** for backend logic
- **Prisma ORM** with MySQL database
- **JWT Authentication** with HTTP-only cookies
- **bcryptjs** for password hashing

### Database

- **MySQL 8.0+** with Prisma schema
- **Automated migrations** and seeding

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install

# Install Prisma CLI globally (optional)
npm install -g prisma
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
DATABASE_URL="mysql://username:password@localhost:3306/ticketflow"
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-secure"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with demo data
npm run db:seed
```

### 4. Development

```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🔑 Demo Users

After seeding, you can login with these demo accounts:

| Username          | Password      | Role            |
| ----------------- | ------------- | --------------- |
| `john.employee`   | `password123` | Employee        |
| `jane.employee`   | `password123` | Employee        |
| `admin.manager`   | `password123` | Admin Manager   |
| `finance.manager` | `password123` | Finance Manager |
| `hr.manager`      | `password123` | HR Manager      |

## 📊 Features

### ✅ Authentication & Authorization

- JWT-based authentication with HTTP-only cookies
- Role-based access control (Employee, Admin, Finance, HR)
- Protected routes and API endpoints

### ✅ Ticket Management

- **Hierarchical ticket creation** (Department → Category → Subcategory)
- **Status management** (Open, In Progress, On Hold, Cancelled, Closed)
- **Priority levels** (Low, Medium, High)
- **Real-time updates** via API

### ✅ Dashboard & Analytics

- **Interactive statistics** with click-to-filter
- **Department-wise analytics** for managers
- **Advanced search and filtering**
- **Responsive design** for all devices

### ✅ User Experience

- **IncubXperts-inspired design** with professional typography
- **Smooth animations** and hover effects
- **Toast notifications** for user feedback
- **Loading states** and error handling

## 🏗️ Project Structure

```
├── app/                     # Next.js App Router
│   ├── (protected)/        # Protected routes
│   │   ├── dashboard/
│   │   ├── create-ticket/
│   │   ├── my-tickets/
│   │   └── manage-tickets/
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── tickets/
│   │   └── dashboard/
│   ├── login/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── globals.css
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/
│   ├── dashboard/
│   └── tickets/
├── contexts/                # React contexts
├── lib/                     # Utilities and config
├── prisma/                  # Database schema and seed
└── public/                  # Static assets
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tickets

- `GET /api/tickets` - Get tickets (filtered by role)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/[id]` - Get single ticket
- `PUT /api/tickets/[id]` - Update ticket
- `DELETE /api/tickets/[id]` - Delete ticket

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

```bash
DATABASE_URL="mysql://user:password@host:3306/database"
JWT_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-nextauth-secret"
```

### Database Migration

```bash
# Generate migration files
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy
```

## 🎨 Design System

The application uses a professional design system inspired by IncubXperts:

- **Typography**: Barlow Semi Condensed (headings) + Roboto (body)
- **Colors**: Custom blue palette (#196cfa) with professional grays
- **Components**: Consistent spacing, shadows, and hover effects
- **Responsive**: Mobile-first design with smooth animations

## 🔒 Security Features

- HTTP-only JWT cookies for authentication
- Password hashing with bcryptjs
- Role-based API endpoint protection
- Input validation and sanitization
- SQL injection prevention via Prisma ORM

## 📈 Performance

- Server-side rendering with Next.js
- Optimized database queries
- Component-level code splitting
- Image optimization ready
- Progressive Web App ready

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
