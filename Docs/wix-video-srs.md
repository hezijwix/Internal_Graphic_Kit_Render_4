# Software Requirements Specification - Wix Video Asset Creator

## System Design

### Architecture Pattern

#### Phase A - MVP Architecture
- **Monolithic Architecture** with modular structure
- **Client-Server Architecture** with React SPA frontend
- **Layered Architecture**:
  - Presentation Layer (React)
  - Business Logic Layer (Services)
  - Data Access Layer (Repository Pattern)
  - Infrastructure Layer (Database, Storage)

#### Phase B - Full System Architecture
- **Microservices Architecture** evolution from Phase A modules:
  - Authentication Service
  - Project Management Service
  - Template Service
  - Rendering Service
  - Asset Storage Service
- **Event-Driven Communication** between services
- **API Gateway** for unified frontend access

### SOLID Principles Implementation

#### Single Responsibility Principle (SRP)
- Each service/module handles one business domain
- Separate concerns: rendering, authentication, storage
- React components follow single purpose design

#### Open/Closed Principle (OCP)
- Plugin architecture for template system
- Strategy pattern for export formats
- Abstract base classes for extensibility

#### Liskov Substitution Principle (LSP)
- Common interfaces for storage providers (S3, local)
- Swappable authentication providers
- Consistent template interface regardless of type

#### Interface Segregation Principle (ISP)
- Minimal, focused interfaces for each service
- Role-based interfaces (IRenderer, IStorage, IAuthProvider)
- Component-specific props interfaces

#### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions
- Dependency injection for services
- Repository pattern for data access

### State Management

#### Phase A
- **Redux Toolkit** for:
  - Current project state
  - Template customization state
  - Preview/timeline state
- **Local Storage** for draft saving

#### Phase B (Additional)
- **Redux Toolkit** expanded for:
  - User authentication state
  - Project listing cache
  - Admin features
- **React Query** for server state management

### Data Flow
- **Unidirectional Data Flow**:
  1. User actions trigger Redux actions
  2. Redux updates application state
  3. React components re-render based on state changes
  4. API calls managed through service layer
  5. Real-time preview updates through Konva.js/GSAP integration

## Technical Stack

### Phase A - Core Stack
#### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Redux Toolkit** for state management
- **Konva.js** for canvas rendering
- **GSAP** for animations
- **Tailwind CSS** for styling

#### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **SQLite** for simple data persistence
- **Sharp** for image processing
- **FFmpeg** for video encoding

### Phase B - Enhanced Stack
#### Additional Frontend
- **React Router v6** for navigation
- **React Query** for server state
- **Radix UI** for accessible components
- **WebSocket** support

#### Enhanced Backend
- **PostgreSQL** replacing SQLite
- **Redis** for caching and sessions
- **Prisma ORM** for database operations
- **Bull Queue** for background jobs
- **Multer** for file uploads
- **AWS S3** for cloud storage

## Service Architecture (Following SOLID)

### Core Services Design

```typescript
// Phase A - Monolithic but modular
interface ITemplateService {
  loadTemplate(id: string): Promise<Template>;
  getTemplateConfig(id: string): Promise<TemplateConfig>;
}

interface IRenderingService {
  renderFrame(timeline: Timeline, frame: number): Promise<Canvas>;
  exportVideo(timeline: Timeline, format: ExportFormat): Promise<string>;
}

interface IStorageService {
  save(key: string, data: Buffer): Promise<string>;
  retrieve(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

// Phase B - Microservices with same interfaces
interface IAuthenticationService {
  authenticate(credentials: Credentials): Promise<AuthToken>;
  validateToken(token: string): Promise<User>;
  refreshToken(refreshToken: string): Promise<AuthToken>;
}
```

## Authentication Process

### Phase A - Simple Authentication
- Basic email/password storage
- Session-based authentication
- No user management UI

### Phase B - Full Authentication
- JWT-based authentication
- User registration flow
- Password reset functionality
- Role-based access control (RBAC)
- OAuth integration ready

### Implementation Details
- **bcrypt** for password hashing
- **JWT** tokens with refresh mechanism
- **Redis** for session management (Phase B)

## Route Design

### Phase A Routes
```
/                       - Main editor (single template)
/api/export            - Export endpoints
/api/assets            - Asset management
```

### Phase B Routes
```
# Frontend Routes
/                       - Landing/Login page
/dashboard              - Project listing
/editor/:projectId      - Main editor interface
/templates              - Template gallery
/profile                - User settings
/admin                  - Admin panel

# API Routes
# Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me

# Projects
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

# Templates
GET    /api/templates
GET    /api/templates/:id
POST   /api/templates (admin)
PUT    /api/templates/:id (admin)

# Assets
POST   /api/assets/upload
GET    /api/assets/icons
DELETE /api/assets/:id

# Export
POST   /api/export/mp4
POST   /api/export/png-sequence
GET    /api/export/:jobId/status
GET    /api/export/:jobId/download
```

## API Design

### Design Patterns
- **Repository Pattern** for data access
- **Service Layer Pattern** for business logic
- **DTO Pattern** for data transfer
- **Factory Pattern** for export format creation

### Response Format (Consistent Interface)
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

interface ApiError {
  code: string;
  message: string;
  details?: any;
}
```

## Database Design ERD

### Phase A - Simplified Schema
**projects** (Local storage or SQLite)
- id (INTEGER, PK)
- name (TEXT)
- template_data (JSON)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**assets** (File system based)
- File-based storage with metadata JSON

### Phase B - Full Schema
**users**
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- role (ENUM: 'user', 'admin')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**projects**
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- name (VARCHAR)
- template_id (UUID, FK -> templates.id)
- project_data (JSONB)
- thumbnail_url (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**templates**
- id (UUID, PK)
- name (VARCHAR)
- category (VARCHAR)
- thumbnail_url (VARCHAR)
- template_data (JSONB)
- is_active (BOOLEAN)
- created_by (UUID, FK -> users.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**assets**
- id (UUID, PK)
- user_id (UUID, FK -> users.id, NULL for presets)
- type (ENUM: 'icon', 'image')
- file_url (VARCHAR)
- file_size (INTEGER)
- metadata (JSONB)
- created_at (TIMESTAMP)

**export_jobs**
- id (UUID, PK)
- project_id (UUID, FK -> projects.id)
- user_id (UUID, FK -> users.id)
- type (ENUM: 'mp4', 'png_sequence')
- status (ENUM: 'pending', 'processing', 'completed', 'failed')
- file_url (VARCHAR)
- error_message (TEXT)
- created_at (TIMESTAMP)
- completed_at (TIMESTAMP)

## Migration Strategy

### Phase A to Phase B
1. **Database Migration**
   - SQLite to PostgreSQL migration scripts
   - Add user relationships to existing data

2. **Service Extraction**
   - Extract rendering module to separate service
   - Extract authentication from monolith
   - Implement message queue for async operations

3. **Frontend Enhancement**
   - Add routing and navigation
   - Implement authentication flow
   - Add project management UI

4. **Infrastructure Evolution**
   - Containerize services
   - Implement service discovery
   - Add monitoring and logging