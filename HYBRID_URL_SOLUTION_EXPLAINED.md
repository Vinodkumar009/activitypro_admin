# Hybrid URL Solution - Detailed Example

## 🎯 The Concept

You have TWO types of URLs working together:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  TYPE 1: SLUG URLs (For Direct Access & Bookmarks)                  │
│  ─────────────────────────────────────────────────                  │
│  https://app.activitypro.com/sunrise-tennis-club/court-booking      │
│                              └───────┬───────────┘ └─────┬─────┘    │
│                                   slug            module            │
│                                                                      │
│  TYPE 2: SHORT LINK URLs (For Sharing)                              │
│  ─────────────────────────────────────                              │
│  https://app.activitypro.com/s/Xk9mN2pQ                             │
│                               └───┬────┘                            │
│                              short code                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Real-World Example

### Your ParentClubs (Customers):

| ParentClub Name | UUID (Hidden) | Slug (Visible) |
|-----------------|---------------|----------------|
| Sunrise Tennis Club | `550e8400-e29b-41d4-a716-446655440000` | `sunrise-tennis-club` |
| Elite Sports Academy | `7c9e6679-7425-40de-944b-e07fc1f90ae7` | `elite-sports-academy` |
| London Fitness Hub | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` | `london-fitness-hub` |

---

## 🔄 Complete Flow with Example

### Scenario: Admin wants to share Court Booking link for "Sunrise Tennis Club"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STEP-BY-STEP FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 1: Admin Opens Dashboard                                               │
│  ────────────────────────────────                                            │
│  Admin logs into: https://admin.activitypro.com                              │
│  Selects: "Sunrise Tennis Club" from customer list                           │
│  Navigates to: "Court Booking" module                                        │
│                                                                              │
│                                                                              │
│  STEP 2: Admin Clicks "Share" Button                                         │
│  ────────────────────────────────────                                        │
│  ┌──────────────────────────────────────┐                                    │
│  │  Court Booking Module                │                                    │
│  │                                      │                                    │
│  │  [View Courts] [Settings] [📤 Share] │  ◄── Admin clicks Share            │
│  │                                      │                                    │
│  └──────────────────────────────────────┘                                    │
│                                                                              │
│                                                                              │
│  STEP 3: Backend Creates Short Link                                          │
│  ──────────────────────────────────────                                      │
│                                                                              │
│  API Request:                                                                │
│  POST /api/share/create                                                      │
│  {                                                                           │
│    "parentclub_id": "550e8400-e29b-41d4-a716-446655440000",                  │
│    "module": "court-booking",                                                │
│    "expires_in_days": 30                                                     │
│  }                                                                           │
│                                                                              │
│  Backend does:                                                               │
│  1. Generates short code: "Xk9mN2pQ"                                         │
│  2. Saves to database:                                                       │
│     ┌─────────────────────────────────────────────────────────┐              │
│     │ shared_links table                                      │              │
│     ├─────────────────────────────────────────────────────────┤              │
│     │ short_code: "Xk9mN2pQ"                                  │              │
│     │ parentclub_id: "550e8400-e29b-41d4-a716-446655440000"   │              │
│     │ module: "court-booking"                                 │              │
│     │ expires_at: "2026-03-01"                                │              │
│     │ click_count: 0                                          │              │
│     └─────────────────────────────────────────────────────────┘              │
│                                                                              │
│  API Response:                                                               │
│  {                                                                           │
│    "url": "https://app.activitypro.com/s/Xk9mN2pQ"                           │
│  }                                                                           │
│                                                                              │
│                                                                              │
│  STEP 4: Admin Shares the Link                                               │
│  ─────────────────────────────────                                           │
│  ┌──────────────────────────────────────┐                                    │
│  │  Share Link                          │                                    │
│  │  ────────────────────────────────    │                                    │
│  │                                      │                                    │
│  │  https://app.activitypro.com/s/Xk9mN2pQ                                   │
│  │                                      │                                    │
│  │  [📋 Copy] [📱 WhatsApp] [📧 Email]  │                                    │
│  │                                      │                                    │
│  └──────────────────────────────────────┘                                    │
│                                                                              │
│  Admin sends via WhatsApp:                                                   │
│  "Book your tennis court here: https://app.activitypro.com/s/Xk9mN2pQ"       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  STEP 5: User Clicks the Shared Link                                         │
│  ────────────────────────────────────                                        │
│                                                                              │
│  User clicks: https://app.activitypro.com/s/Xk9mN2pQ                         │
│                                                                              │
│  Backend does:                                                               │
│  1. Looks up "Xk9mN2pQ" in shared_links table                                │
│  2. Finds parentclub_id: "550e8400-e29b-41d4-a716-446655440000"              │
│  3. Looks up parentclub to get slug: "sunrise-tennis-club"                   │
│  4. Increments click_count: 0 → 1                                            │
│  5. Redirects (302) to: /sunrise-tennis-club/court-booking                   │
│                                                                              │
│                                                                              │
│  STEP 6: User Sees Final URL (Readable!)                                     │
│  ────────────────────────────────────────                                    │
│                                                                              │
│  Browser URL bar shows:                                                      │
│  https://app.activitypro.com/sunrise-tennis-club/court-booking               │
│                              └────────┬────────┘ └─────┬──────┘              │
│                                    slug             module                   │
│                                                                              │
│  ✅ User sees readable URL                                                   │
│  ✅ UUID is completely hidden                                                │
│  ✅ User can bookmark this URL                                               │
│                                                                              │
│                                                                              │
│  STEP 7: Angular App Loads                                                   │
│  ─────────────────────────────                                               │
│                                                                              │
│  Angular reads URL: /sunrise-tennis-club/court-booking                       │
│                                                                              │
│  1. Route resolver extracts slug: "sunrise-tennis-club"                      │
│  2. API call: GET /api/parentclub/by-slug/sunrise-tennis-club                │
│  3. Backend returns:                                                         │
│     {                                                                        │
│       "id": "550e8400-e29b-41d4-a716-446655440000",                           │
│       "name": "Sunrise Tennis Club",                                         │
│       "slug": "sunrise-tennis-club",                                         │
│       "settings": { ... }                                                    │
│     }                                                                        │
│  4. Angular stores the UUID internally for API calls                         │
│  5. Court Booking module loads with correct ParentClub data                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Tables

### Table 1: parentclub (Modified)

```sql
CREATE TABLE parentclub (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,  -- ✅ NEW COLUMN
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  settings JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Example Data:
-- id: 550e8400-e29b-41d4-a716-446655440000
-- name: "Sunrise Tennis Club"
-- slug: "sunrise-tennis-club"  ← Generated from name
```

### Table 2: shared_links (New)

```sql
CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  parentclub_id UUID NOT NULL REFERENCES parentclub(id),
  module VARCHAR(50) NOT NULL,
  additional_params JSONB,           -- Optional: extra data
  expires_at TIMESTAMP,              -- Optional: link expiry
  click_count INTEGER DEFAULT 0,     -- Analytics
  created_by UUID,                   -- Who created the link
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example Data:
-- short_code: "Xk9mN2pQ"
-- parentclub_id: "550e8400-e29b-41d4-a716-446655440000"
-- module: "court-booking"
-- click_count: 47
```

---

## 💻 Backend Code (NestJS)

### 1. ParentClub Entity with Slug

```typescript
// parentclub.entity.ts
@Entity('parentclub')
export class ParentClub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;  // e.g., "sunrise-tennis-club"

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;
}
```

### 2. SharedLink Entity

```typescript
// shared-link.entity.ts
@Entity('shared_links')
export class SharedLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 10 })
  shortCode: string;

  @Column('uuid')
  parentclubId: string;

  @Column({ length: 50 })
  module: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalParams: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: 0 })
  clickCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ParentClub)
  @JoinColumn({ name: 'parentclub_id' })
  parentclub: ParentClub;
}
```

### 3. SharedLink Service

```typescript
// shared-link.service.ts
@Injectable()
export class SharedLinkService {
  constructor(
    @InjectRepository(SharedLink)
    private sharedLinkRepo: Repository<SharedLink>,
    @InjectRepository(ParentClub)
    private parentClubRepo: Repository<ParentClub>,
  ) {}

  // Generate a shareable link
  async createShareLink(dto: CreateShareLinkDto): Promise<{ url: string }> {
    const shortCode = this.generateShortCode();
    
    const link = this.sharedLinkRepo.create({
      shortCode,
      parentclubId: dto.parentclubId,
      module: dto.module,
      additionalParams: dto.additionalParams,
      expiresAt: dto.expiresInDays 
        ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
        : null,
    });

    await this.sharedLinkRepo.save(link);
    
    return {
      url: `https://app.activitypro.com/s/${shortCode}`
    };
  }

  // Resolve short code to redirect URL
  async resolveShortCode(shortCode: string): Promise<string> {
    const link = await this.sharedLinkRepo.findOne({
      where: { shortCode },
      relations: ['parentclub'],
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new GoneException('Link has expired');
    }

    // Increment click count
    await this.sharedLinkRepo.increment({ id: link.id }, 'clickCount', 1);

    // Return the slug-based URL
    return `/${link.parentclub.slug}/${link.module}`;
  }

  // Generate 8-character short code
  private generateShortCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
```

### 4. Controllers

```typescript
// shared-link.controller.ts
@Controller()
export class SharedLinkController {
  constructor(private sharedLinkService: SharedLinkService) {}

  // Create a shareable link
  @Post('api/share/create')
  async createShareLink(@Body() dto: CreateShareLinkDto) {
    return this.sharedLinkService.createShareLink(dto);
  }

  // Resolve short link and redirect
  @Get('s/:shortCode')
  async resolveAndRedirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.sharedLinkService.resolveShortCode(shortCode);
    return res.redirect(302, redirectUrl);
  }
}

// parentclub.controller.ts
@Controller('api/parentclub')
export class ParentClubController {
  constructor(private parentClubService: ParentClubService) {}

  // Get ParentClub by slug (for Angular app)
  @Get('by-slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.parentClubService.findBySlug(slug);
  }
}
```

### 5. DTOs

```typescript
// create-share-link.dto.ts
export class CreateShareLinkDto {
  @IsUUID()
  parentclubId: string;

  @IsString()
  module: string;  // 'court-booking', 'sessions', 'events', etc.

  @IsOptional()
  @IsObject()
  additionalParams?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  expiresInDays?: number;
}
```

---

## 🅰️ Angular Frontend Code

### 1. Route Configuration

```typescript
// app-routing.module.ts
const routes: Routes = [
  // Short link redirect (handled by backend, but define for completeness)
  { path: 's/:shortCode', component: RedirectComponent },
  
  // Main ParentClub routes with slug
  {
    path: ':parentClubSlug',
    component: ParentClubLayoutComponent,
    resolve: { parentClub: ParentClubResolver },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'court-booking', component: CourtBookingComponent },
      { path: 'sessions', component: SessionsComponent },
      { path: 'events', component: EventsComponent },
      { path: 'school-sessions', component: SchoolSessionsComponent },
      { path: 'holiday-camp', component: HolidayCampComponent },
    ]
  }
];
```

### 2. ParentClub Resolver

```typescript
// parentclub.resolver.ts
@Injectable({ providedIn: 'root' })
export class ParentClubResolver implements Resolve<ParentClub> {
  constructor(
    private parentClubService: ParentClubService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ParentClub> {
    const slug = route.paramMap.get('parentClubSlug');
    
    return this.parentClubService.getBySlug(slug).pipe(
      catchError(error => {
        this.router.navigate(['/not-found']);
        return EMPTY;
      })
    );
  }
}
```

### 3. ParentClub Service

```typescript
// parentclub.service.ts
@Injectable({ providedIn: 'root' })
export class ParentClubService {
  private currentParentClub: ParentClub | null = null;
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get ParentClub by slug
  getBySlug(slug: string): Observable<ParentClub> {
    return this.http.get<ParentClub>(`${this.baseUrl}/parentclub/by-slug/${slug}`).pipe(
      tap(parentClub => {
        this.currentParentClub = parentClub;
        // Store in localStorage for persistence
        localStorage.setItem('currentParentClub', JSON.stringify(parentClub));
      })
    );
  }

  // Get current ParentClub ID (UUID) for API calls
  getCurrentParentClubId(): string {
    return this.currentParentClub?.id || '';
  }

  // Get current ParentClub slug for URL building
  getCurrentSlug(): string {
    return this.currentParentClub?.slug || '';
  }
}
```

### 4. Share Link Service

```typescript
// share-link.service.ts
@Injectable({ providedIn: 'root' })
export class ShareLinkService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private parentClubService: ParentClubService
  ) {}

  // Generate a shareable link for current module
  generateShareLink(module: string, additionalParams?: any): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.baseUrl}/share/create`, {
      parentclubId: this.parentClubService.getCurrentParentClubId(),
      module,
      additionalParams,
      expiresInDays: 30
    });
  }

  // Copy link to clipboard
  copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url);
  }

  // Native share (mobile)
  async nativeShare(title: string, url: string): Promise<void> {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      this.copyToClipboard(url);
    }
  }
}
```

### 5. Share Button Component

```typescript
// share-button.component.ts
@Component({
  selector: 'app-share-button',
  template: `
    <button (click)="share()" class="share-btn">
      <ion-icon name="share-outline"></ion-icon>
      Share
    </button>
  `
})
export class ShareButtonComponent {
  @Input() module: string;
  @Input() title: string = 'Check this out!';

  constructor(
    private shareLinkService: ShareLinkService,
    private toastService: ToastService
  ) {}

  async share() {
    this.shareLinkService.generateShareLink(this.module).subscribe({
      next: async (response) => {
        await this.shareLinkService.nativeShare(this.title, response.url);
        this.toastService.show('Link ready to share!');
      },
      error: (err) => {
        this.toastService.show('Failed to generate link');
      }
    });
  }
}
```

### 6. Usage in Module Component

```html
<!-- court-booking.component.html -->
<div class="module-header">
  <h1>Court Booking</h1>
  
  <app-share-button 
    module="court-booking" 
    title="Book a Tennis Court">
  </app-share-button>
</div>

<!-- Rest of court booking UI -->
```

---

## 📱 Complete User Journey Example

### Scenario: Sharing Court Booking for "Sunrise Tennis Club"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  👤 ADMIN JOURNEY                                                            │
│  ════════════════                                                            │
│                                                                              │
│  1. Admin logs into admin dashboard                                          │
│  2. Selects "Sunrise Tennis Club" from customer list                         │
│  3. Goes to Court Booking module                                             │
│  4. Clicks "Share" button                                                    │
│  5. Gets link: https://app.activitypro.com/s/Xk9mN2pQ                        │
│  6. Sends via WhatsApp to a customer                                         │
│                                                                              │
│                                                                              │
│  👥 END USER JOURNEY                                                         │
│  ═══════════════════                                                         │
│                                                                              │
│  1. User receives WhatsApp message with link                                 │
│  2. Clicks: https://app.activitypro.com/s/Xk9mN2pQ                           │
│                                                                              │
│  3. Backend:                                                                 │
│     - Looks up "Xk9mN2pQ" in database                                        │
│     - Finds: parentclub_id = "550e8400-..."                                  │
│     - Gets slug: "sunrise-tennis-club"                                       │
│     - Redirects to: /sunrise-tennis-club/court-booking                       │
│                                                                              │
│  4. Browser URL changes to:                                                  │
│     https://app.activitypro.com/sunrise-tennis-club/court-booking            │
│                                                                              │
│  5. Angular app:                                                             │
│     - Reads slug from URL: "sunrise-tennis-club"                             │
│     - Calls API: GET /api/parentclub/by-slug/sunrise-tennis-club             │
│     - Gets ParentClub data (including hidden UUID)                           │
│     - Loads Court Booking module                                             │
│                                                                              │
│  6. User sees Court Booking page for Sunrise Tennis Club! ✅                 │
│                                                                              │
│                                                                              │
│  🔒 WHAT USER SEES vs WHAT'S HIDDEN                                          │
│  ═══════════════════════════════════                                         │
│                                                                              │
│  ✅ User sees: https://app.activitypro.com/sunrise-tennis-club/court-booking │
│  ❌ User NEVER sees: 550e8400-e29b-41d4-a716-446655440000                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Analytics Dashboard (Bonus)

With this setup, you can track shared link performance:

```typescript
// Get analytics for a ParentClub's shared links
@Get('api/share/analytics/:parentclubId')
async getAnalytics(@Param('parentclubId') parentclubId: string) {
  const links = await this.sharedLinkRepo.find({
    where: { parentclubId },
    order: { clickCount: 'DESC' }
  });

  return {
    totalLinks: links.length,
    totalClicks: links.reduce((sum, l) => sum + l.clickCount, 0),
    topLinks: links.slice(0, 10).map(l => ({
      module: l.module,
      shortCode: l.shortCode,
      clicks: l.clickCount,
      createdAt: l.createdAt
    }))
  };
}
```

**Dashboard View:**
```
┌─────────────────────────────────────────────────────────┐
│  Shared Links Analytics - Sunrise Tennis Club           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Total Links Created: 24                                │
│  Total Clicks: 1,847                                    │
│                                                         │
│  Top Performing Links:                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Module          │ Short Code │ Clicks │ Created │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ court-booking   │ Xk9mN2pQ   │ 523    │ Jan 15  │   │
│  │ events          │ Abc12345   │ 412    │ Jan 20  │   │
│  │ sessions        │ Xyz98765   │ 298    │ Jan 18  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Summary

| What | How |
|------|-----|
| **Hide UUID** | Use slug in URL, UUID only in backend |
| **Readable URLs** | `/sunrise-tennis-club/court-booking` |
| **Short Share Links** | `/s/Xk9mN2pQ` → redirects to slug URL |
| **Track Clicks** | `click_count` in shared_links table |
| **Link Expiry** | `expires_at` in shared_links table |
| **Bookmarkable** | Users bookmark the slug URL |

This hybrid approach gives you the best of both worlds:
- **Professional, readable URLs** for direct access
- **Short, trackable links** for sharing
- **Complete privacy** of UUIDs


---

# 🛠️ COMPLETE IMPLEMENTATION CODE

## 📁 Project Structure

```
Backend (NestJS):
├── src/
│   ├── modules/
│   │   ├── shared-link/
│   │   │   ├── shared-link.module.ts
│   │   │   ├── shared-link.controller.ts
│   │   │   ├── shared-link.service.ts
│   │   │   ├── shared-link.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-shared-link.dto.ts
│   │   │       └── resolve-shared-link.dto.ts
│   │   └── parentclub/
│   │       └── parentclub.entity.ts (modified)
│   └── migrations/
│       └── xxx-create-shared-links-table.ts

Frontend (Angular):
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   ├── shared-link.service.ts
│   │   │   └── parentclub.service.ts
│   │   ├── guards/
│   │   │   └── shared-link.guard.ts
│   │   ├── components/
│   │   │   └── share-button/
│   │   │       ├── share-button.component.ts
│   │   │       └── share-button.component.html
│   │   └── app-routing.module.ts
```

---

## 🗄️ DATABASE

### Migration: Create shared_links Table

```sql
-- migrations/001_create_shared_links_table.sql

CREATE TABLE shared_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(10) UNIQUE NOT NULL,
    parentclub_id UUID NOT NULL,
    parentclub_name VARCHAR(255) NOT NULL,
    module VARCHAR(50) NOT NULL,
    additional_params JSONB,
    expires_at TIMESTAMP,
    click_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_parentclub 
        FOREIGN KEY (parentclub_id) 
        REFERENCES parentclub(id) 
        ON DELETE CASCADE
);

-- Indexes for fast lookups
CREATE INDEX idx_shared_links_slug ON shared_links(slug);
CREATE INDEX idx_shared_links_parentclub ON shared_links(parentclub_id);
CREATE INDEX idx_shared_links_active ON shared_links(is_active) WHERE is_active = true;

-- Add slug column to parentclub if not exists
ALTER TABLE parentclub ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Create index on parentclub slug
CREATE INDEX IF NOT EXISTS idx_parentclub_slug ON parentclub(slug);
```

---

## 🔧 BACKEND (NestJS)

### 1. Entity: shared-link.entity.ts

```typescript
// src/modules/shared-link/shared-link.entity.ts

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ParentClub } from '../parentclub/parentclub.entity';

@Entity('shared_links')
export class SharedLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  slug: string;

  @Column({ type: 'uuid', name: 'parentclub_id' })
  parentclubId: string;

  @Column({ type: 'varchar', length: 255, name: 'parentclub_name' })
  parentclubName: string;

  @Column({ type: 'varchar', length: 50 })
  module: string;

  @Column({ type: 'jsonb', nullable: true, name: 'additional_params' })
  additionalParams: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'int', default: 0, name: 'click_count' })
  clickCount: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ParentClub, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentclub_id' })
  parentclub: ParentClub;
}
```

### 2. DTOs

```typescript
// src/modules/shared-link/dto/create-shared-link.dto.ts

import { IsString, IsUUID, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSharedLinkDto {
  @ApiProperty({ description: 'ParentClub UUID' })
  @IsUUID()
  parentclubId: string;

  @ApiProperty({ description: 'ParentClub Name' })
  @IsString()
  parentclubName: string;

  @ApiProperty({ description: 'Module name', example: 'court-booking' })
  @IsString()
  module: string;

  @ApiPropertyOptional({ description: 'Additional parameters' })
  @IsOptional()
  @IsObject()
  additionalParams?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Link expiry in days' })
  @IsOptional()
  @IsNumber()
  expiresInDays?: number;
}

// src/modules/shared-link/dto/create-shared-link-response.dto.ts

export class CreateSharedLinkResponseDto {
  @ApiProperty({ description: 'Generated shareable URL' })
  url: string;

  @ApiProperty({ description: 'Short slug code' })
  slug: string;

  @ApiProperty({ description: 'Expiry date if set' })
  expiresAt?: Date;
}

// src/modules/shared-link/dto/resolve-shared-link-response.dto.ts

export class ResolveSharedLinkResponseDto {
  @ApiProperty()
  parentclubId: string;

  @ApiProperty()
  parentclubName: string;

  @ApiProperty()
  module: string;

  @ApiPropertyOptional()
  additionalParams?: Record<string, any>;

  @ApiProperty()
  redirectUrl: string;
}
```

### 3. Service: shared-link.service.ts

```typescript
// src/modules/shared-link/shared-link.service.ts

import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharedLink } from './shared-link.entity';
import { CreateSharedLinkDto, CreateSharedLinkResponseDto, ResolveSharedLinkResponseDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SharedLinkService {
  private readonly appDomain: string;

  constructor(
    @InjectRepository(SharedLink)
    private readonly sharedLinkRepo: Repository<SharedLink>,
    private readonly configService: ConfigService,
  ) {
    this.appDomain = this.configService.get<string>('APP_DOMAIN', 'https://app.activitypro.com');
  }

  /**
   * Generate a shareable link
   */
  async createSharedLink(
    dto: CreateSharedLinkDto,
    createdBy?: string
  ): Promise<CreateSharedLinkResponseDto> {
    // Generate unique slug
    const slug = await this.generateUniqueSlug();

    // Calculate expiry date if provided
    const expiresAt = dto.expiresInDays
      ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create and save the shared link
    const sharedLink = this.sharedLinkRepo.create({
      slug,
      parentclubId: dto.parentclubId,
      parentclubName: dto.parentclubName,
      module: dto.module,
      additionalParams: dto.additionalParams,
      expiresAt,
      createdBy,
    });

    await this.sharedLinkRepo.save(sharedLink);

    return {
      url: `${this.appDomain}/s/${slug}`,
      slug,
      expiresAt,
    };
  }

  /**
   * Resolve a shared link by slug
   */
  async resolveSharedLink(slug: string): Promise<ResolveSharedLinkResponseDto> {
    const sharedLink = await this.sharedLinkRepo.findOne({
      where: { slug, isActive: true },
    });

    if (!sharedLink) {
      throw new NotFoundException('Shared link not found or has been deactivated');
    }

    // Check if link has expired
    if (sharedLink.expiresAt && sharedLink.expiresAt < new Date()) {
      throw new GoneException('This shared link has expired');
    }

    // Increment click count (fire and forget)
    this.incrementClickCount(sharedLink.id);

    // Generate readable redirect URL
    const parentclubSlug = this.generateSlugFromName(sharedLink.parentclubName);
    const redirectUrl = `/${parentclubSlug}/${sharedLink.module}`;

    return {
      parentclubId: sharedLink.parentclubId,
      parentclubName: sharedLink.parentclubName,
      module: sharedLink.module,
      additionalParams: sharedLink.additionalParams,
      redirectUrl,
    };
  }

  /**
   * Get analytics for shared links
   */
  async getAnalytics(parentclubId: string) {
    const links = await this.sharedLinkRepo.find({
      where: { parentclubId, isActive: true },
      order: { clickCount: 'DESC' },
    });

    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);

    return {
      totalLinks: links.length,
      totalClicks,
      links: links.map(link => ({
        slug: link.slug,
        module: link.module,
        clickCount: link.clickCount,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        url: `${this.appDomain}/s/${link.slug}`,
      })),
    };
  }

  /**
   * Deactivate a shared link
   */
  async deactivateLink(slug: string, userId: string): Promise<void> {
    const result = await this.sharedLinkRepo.update(
      { slug, createdBy: userId },
      { isActive: false }
    );

    if (result.affected === 0) {
      throw new NotFoundException('Link not found or you do not have permission');
    }
  }

  /**
   * Generate a unique 8-character slug
   */
  private async generateUniqueSlug(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let slug: string;
    let isUnique = false;

    while (!isUnique) {
      slug = '';
      for (let i = 0; i < 8; i++) {
        slug += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if slug already exists
      const existing = await this.sharedLinkRepo.findOne({ where: { slug } });
      isUnique = !existing;
    }

    return slug;
  }

  /**
   * Generate URL-friendly slug from name
   */
  private generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Increment click count asynchronously
   */
  private async incrementClickCount(id: string): Promise<void> {
    try {
      await this.sharedLinkRepo.increment({ id }, 'clickCount', 1);
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to increment click count:', error);
    }
  }
}
```

### 4. Controller: shared-link.controller.ts

```typescript
// src/modules/shared-link/shared-link.controller.ts

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SharedLinkService } from './shared-link.service';
import { CreateSharedLinkDto, CreateSharedLinkResponseDto, ResolveSharedLinkResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Shared Links')
@Controller()
export class SharedLinkController {
  constructor(private readonly sharedLinkService: SharedLinkService) {}

  /**
   * Create a new shareable link
   */
  @Post('api/share/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a shareable link' })
  @ApiResponse({ status: 201, type: CreateSharedLinkResponseDto })
  async createSharedLink(
    @Body() dto: CreateSharedLinkDto,
    @Request() req,
  ): Promise<CreateSharedLinkResponseDto> {
    return this.sharedLinkService.createSharedLink(dto, req.user?.id);
  }

  /**
   * Resolve shared link - Returns data for Angular app
   */
  @Get('api/share/resolve/:slug')
  @ApiOperation({ summary: 'Resolve a shared link' })
  @ApiResponse({ status: 200, type: ResolveSharedLinkResponseDto })
  async resolveSharedLink(
    @Param('slug') slug: string,
  ): Promise<ResolveSharedLinkResponseDto> {
    return this.sharedLinkService.resolveSharedLink(slug);
  }

  /**
   * Redirect endpoint - For direct browser access
   * When user clicks: https://app.activitypro.com/s/Xk9mN2pQ
   */
  @Get('s/:slug')
  @ApiOperation({ summary: 'Redirect shared link to Angular app' })
  async redirectSharedLink(
    @Param('slug') slug: string,
    @Res() res: Response,
  ) {
    try {
      const resolved = await this.sharedLinkService.resolveSharedLink(slug);
      
      // Option 1: Redirect to readable URL
      // return res.redirect(HttpStatus.FOUND, resolved.redirectUrl);
      
      // Option 2: Redirect to Angular app with slug (let Angular handle routing)
      return res.redirect(HttpStatus.FOUND, `/app/s/${slug}`);
      
    } catch (error) {
      // Redirect to error page
      return res.redirect(HttpStatus.FOUND, '/link-expired');
    }
  }

  /**
   * Get analytics for a ParentClub's shared links
   */
  @Get('api/share/analytics/:parentclubId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shared link analytics' })
  async getAnalytics(@Param('parentclubId') parentclubId: string) {
    return this.sharedLinkService.getAnalytics(parentclubId);
  }

  /**
   * Deactivate a shared link
   */
  @Delete('api/share/:slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a shared link' })
  async deactivateLink(
    @Param('slug') slug: string,
    @Request() req,
  ) {
    await this.sharedLinkService.deactivateLink(slug, req.user?.id);
    return { message: 'Link deactivated successfully' };
  }
}
```

### 5. Module: shared-link.module.ts

```typescript
// src/modules/shared-link/shared-link.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SharedLink } from './shared-link.entity';
import { SharedLinkService } from './shared-link.service';
import { SharedLinkController } from './shared-link.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedLink]),
    ConfigModule,
  ],
  controllers: [SharedLinkController],
  providers: [SharedLinkService],
  exports: [SharedLinkService],
})
export class SharedLinkModule {}
```

---

## 🅰️ FRONTEND (Angular)

### 1. Service: shared-link.service.ts

```typescript
// src/app/services/shared-link.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateSharedLinkRequest {
  parentclubId: string;
  parentclubName: string;
  module: string;
  additionalParams?: Record<string, any>;
  expiresInDays?: number;
}

export interface CreateSharedLinkResponse {
  url: string;
  slug: string;
  expiresAt?: Date;
}

export interface ResolveSharedLinkResponse {
  parentclubId: string;
  parentclubName: string;
  module: string;
  additionalParams?: Record<string, any>;
  redirectUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedLinkService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create a shareable link
   */
  createSharedLink(request: CreateSharedLinkRequest): Observable<CreateSharedLinkResponse> {
    return this.http.post<CreateSharedLinkResponse>(
      `${this.apiUrl}/share/create`,
      request
    );
  }

  /**
   * Resolve a shared link by slug
   */
  resolveSharedLink(slug: string): Observable<ResolveSharedLinkResponse> {
    return this.http.get<ResolveSharedLinkResponse>(
      `${this.apiUrl}/share/resolve/${slug}`
    );
  }

  /**
   * Copy URL to clipboard
   */
  async copyToClipboard(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  }

  /**
   * Native share (for mobile devices)
   */
  async nativeShare(title: string, text: string, url: string): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Check if native share is supported
   */
  isNativeShareSupported(): boolean {
    return !!navigator.share;
  }
}
```

### 2. Service: parentclub-context.service.ts

```typescript
// src/app/services/parentclub-context.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ParentClubContext {
  id: string;
  name: string;
  slug?: string;
  module?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParentClubContextService {
  private contextSubject = new BehaviorSubject<ParentClubContext | null>(null);
  public context$ = this.contextSubject.asObservable();

  /**
   * Set the current ParentClub context
   */
  setContext(context: ParentClubContext): void {
    this.contextSubject.next(context);
    // Also store in sessionStorage for persistence
    sessionStorage.setItem('parentclub_context', JSON.stringify(context));
  }

  /**
   * Get current context
   */
  getContext(): ParentClubContext | null {
    if (!this.contextSubject.value) {
      // Try to restore from sessionStorage
      const stored = sessionStorage.getItem('parentclub_context');
      if (stored) {
        const context = JSON.parse(stored);
        this.contextSubject.next(context);
        return context;
      }
    }
    return this.contextSubject.value;
  }

  /**
   * Get current ParentClub ID
   */
  getParentClubId(): string | null {
    return this.getContext()?.id || null;
  }

  /**
   * Get current ParentClub Name
   */
  getParentClubName(): string | null {
    return this.getContext()?.name || null;
  }

  /**
   * Clear context (on logout or navigation away)
   */
  clearContext(): void {
    this.contextSubject.next(null);
    sessionStorage.removeItem('parentclub_context');
  }
}
```

### 3. Guard: shared-link.guard.ts

```typescript
// src/app/guards/shared-link.guard.ts

import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  Router,
  UrlTree 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SharedLinkService } from '../services/shared-link.service';
import { ParentClubContextService } from '../services/parentclub-context.service';

@Injectable({
  providedIn: 'root'
})
export class SharedLinkGuard implements CanActivate {
  constructor(
    private sharedLinkService: SharedLinkService,
    private parentClubContext: ParentClubContextService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const slug = route.paramMap.get('slug');

    if (!slug) {
      return of(this.router.createUrlTree(['/not-found']));
    }

    return this.sharedLinkService.resolveSharedLink(slug).pipe(
      map(response => {
        // Set the ParentClub context
        this.parentClubContext.setContext({
          id: response.parentclubId,
          name: response.parentclubName,
          module: response.module,
        });

        // Navigate to the module
        // Option 1: Stay on /s/:slug URL
        return true;

        // Option 2: Redirect to readable URL
        // return this.router.createUrlTree([response.redirectUrl]);
      }),
      catchError(error => {
        console.error('Failed to resolve shared link:', error);
        
        if (error.status === 410) {
          // Link expired
          return of(this.router.createUrlTree(['/link-expired']));
        }
        
        return of(this.router.createUrlTree(['/not-found']));
      })
    );
  }
}
```

### 4. Routing: app-routing.module.ts

```typescript
// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedLinkGuard } from './guards/shared-link.guard';

// Components
import { SharedLinkLayoutComponent } from './layouts/shared-link-layout.component';
import { CourtBookingComponent } from './modules/court-booking/court-booking.component';
import { SessionsComponent } from './modules/sessions/sessions.component';
import { EventsComponent } from './modules/events/events.component';
import { SchoolSessionsComponent } from './modules/school-sessions/school-sessions.component';
import { HolidayCampComponent } from './modules/holiday-camp/holiday-camp.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { LinkExpiredComponent } from './pages/link-expired/link-expired.component';

const routes: Routes = [
  // Shared link route
  {
    path: 's/:slug',
    component: SharedLinkLayoutComponent,
    canActivate: [SharedLinkGuard],
    children: [
      { path: '', component: ModuleRouterComponent }, // Routes based on context
    ]
  },

  // Direct module routes (with parentclub slug)
  {
    path: ':parentclubSlug',
    component: ParentClubLayoutComponent,
    children: [
      { path: 'court-booking', component: CourtBookingComponent },
      { path: 'sessions', component: SessionsComponent },
      { path: 'events', component: EventsComponent },
      { path: 'school-sessions', component: SchoolSessionsComponent },
      { path: 'holiday-camp', component: HolidayCampComponent },
    ]
  },

  // Error pages
  { path: 'not-found', component: NotFoundComponent },
  { path: 'link-expired', component: LinkExpiredComponent },
  
  // Default redirect
  { path: '', redirectTo: '/not-found', pathMatch: 'full' },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

### 5. Component: share-button.component.ts

```typescript
// src/app/components/share-button/share-button.component.ts

import { Component, Input } from '@angular/core';
import { SharedLinkService, CreateSharedLinkRequest } from '../../services/shared-link.service';
import { ParentClubContextService } from '../../services/parentclub-context.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ShareDialogComponent } from './share-dialog.component';

@Component({
  selector: 'app-share-button',
  template: `
    <button 
      mat-icon-button 
      (click)="openShareDialog()"
      [disabled]="isLoading"
      matTooltip="Share this page">
      <mat-icon>share</mat-icon>
    </button>
  `,
  styles: [`
    button {
      color: #1976d2;
    }
  `]
})
export class ShareButtonComponent {
  @Input() module: string;
  @Input() title: string = 'Check this out!';
  @Input() additionalParams?: Record<string, any>;

  isLoading = false;

  constructor(
    private sharedLinkService: SharedLinkService,
    private parentClubContext: ParentClubContextService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async openShareDialog(): Promise<void> {
    const context = this.parentClubContext.getContext();
    
    if (!context) {
      this.snackBar.open('Unable to share. Please try again.', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    const request: CreateSharedLinkRequest = {
      parentclubId: context.id,
      parentclubName: context.name,
      module: this.module,
      additionalParams: this.additionalParams,
      expiresInDays: 30,
    };

    this.sharedLinkService.createSharedLink(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Open share dialog
        this.dialog.open(ShareDialogComponent, {
          width: '400px',
          data: {
            url: response.url,
            title: this.title,
            parentclubName: context.name,
            module: this.module,
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to create share link:', error);
        this.snackBar.open('Failed to generate share link', 'Close', { duration: 3000 });
      }
    });
  }
}
```

### 6. Component: share-dialog.component.ts

```typescript
// src/app/components/share-button/share-dialog.component.ts

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedLinkService } from '../../services/shared-link.service';

interface ShareDialogData {
  url: string;
  title: string;
  parentclubName: string;
  module: string;
}

@Component({
  selector: 'app-share-dialog',
  template: `
    <h2 mat-dialog-title>Share Link</h2>
    
    <mat-dialog-content>
      <p class="share-info">
        Share <strong>{{ data.module | titlecase }}</strong> for 
        <strong>{{ data.parentclubName }}</strong>
      </p>
      
      <div class="url-container">
        <input 
          matInput 
          [value]="data.url" 
          readonly 
          class="url-input"
          #urlInput>
        <button mat-icon-button (click)="copyLink()" matTooltip="Copy link">
          <mat-icon>content_copy</mat-icon>
        </button>
      </div>

      <div class="share-buttons">
        <button mat-stroked-button (click)="shareVia('whatsapp')" class="whatsapp-btn">
          <mat-icon>chat</mat-icon>
          WhatsApp
        </button>
        
        <button mat-stroked-button (click)="shareVia('email')" class="email-btn">
          <mat-icon>email</mat-icon>
          Email
        </button>
        
        <button 
          mat-stroked-button 
          (click)="shareVia('native')" 
          *ngIf="canNativeShare"
          class="native-btn">
          <mat-icon>share</mat-icon>
          More
        </button>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .share-info {
      margin-bottom: 16px;
      color: #666;
    }
    .url-container {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 4px;
      padding: 8px;
      margin-bottom: 16px;
    }
    .url-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 14px;
      outline: none;
    }
    .share-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .whatsapp-btn { color: #25D366; }
    .email-btn { color: #EA4335; }
    .native-btn { color: #1976d2; }
  `]
})
export class ShareDialogComponent {
  canNativeShare: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ShareDialogData,
    private dialogRef: MatDialogRef<ShareDialogComponent>,
    private sharedLinkService: SharedLinkService,
    private snackBar: MatSnackBar
  ) {
    this.canNativeShare = this.sharedLinkService.isNativeShareSupported();
  }

  async copyLink(): Promise<void> {
    const success = await this.sharedLinkService.copyToClipboard(this.data.url);
    if (success) {
      this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
    }
  }

  shareVia(platform: 'whatsapp' | 'email' | 'native'): void {
    const text = `${this.data.title} - ${this.data.parentclubName}`;
    
    switch (platform) {
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + this.data.url)}`;
        window.open(whatsappUrl, '_blank');
        break;
        
      case 'email':
        const emailUrl = `mailto:?subject=${encodeURIComponent(this.data.title)}&body=${encodeURIComponent(text + '\n\n' + this.data.url)}`;
        window.location.href = emailUrl;
        break;
        
      case 'native':
        this.sharedLinkService.nativeShare(this.data.title, text, this.data.url);
        break;
    }
  }
}
```

### 7. Layout Component: shared-link-layout.component.ts

```typescript
// src/app/layouts/shared-link-layout.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParentClubContextService } from '../services/parentclub-context.service';

@Component({
  selector: 'app-shared-link-layout',
  template: `
    <div class="shared-link-layout">
      <!-- Header with ParentClub branding -->
      <header class="header" *ngIf="parentClubName">
        <h1>{{ parentClubName }}</h1>
      </header>

      <!-- Module content -->
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shared-link-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: #1976d2;
      color: white;
      padding: 16px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    .content {
      flex: 1;
      padding: 16px;
    }
  `]
})
export class SharedLinkLayoutComponent implements OnInit {
  parentClubName: string | null = null;

  constructor(
    private parentClubContext: ParentClubContextService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const context = this.parentClubContext.getContext();
    
    if (context) {
      this.parentClubName = context.name;
      
      // Route to the correct module based on context
      this.routeToModule(context.module);
    }
  }

  private routeToModule(module: string): void {
    // This component acts as a router based on the module in context
    // The actual module component will be loaded as a child
  }
}
```

### 8. Module Router Component: module-router.component.ts

```typescript
// src/app/components/module-router/module-router.component.ts

import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { ParentClubContextService } from '../../services/parentclub-context.service';

// Import all module components
import { CourtBookingComponent } from '../../modules/court-booking/court-booking.component';
import { SessionsComponent } from '../../modules/sessions/sessions.component';
import { EventsComponent } from '../../modules/events/events.component';
import { SchoolSessionsComponent } from '../../modules/school-sessions/school-sessions.component';
import { HolidayCampComponent } from '../../modules/holiday-camp/holiday-camp.component';

@Component({
  selector: 'app-module-router',
  template: `<ng-container #moduleContainer></ng-container>`
})
export class ModuleRouterComponent implements OnInit {
  private moduleMap = {
    'court-booking': CourtBookingComponent,
    'sessions': SessionsComponent,
    'events': EventsComponent,
    'school-sessions': SchoolSessionsComponent,
    'holiday-camp': HolidayCampComponent,
  };

  constructor(
    private parentClubContext: ParentClubContextService,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    const context = this.parentClubContext.getContext();
    
    if (context?.module) {
      this.loadModule(context.module);
    }
  }

  private loadModule(moduleName: string): void {
    const component = this.moduleMap[moduleName];
    
    if (component) {
      this.viewContainerRef.clear();
      const factory = this.componentFactoryResolver.resolveComponentFactory(component);
      this.viewContainerRef.createComponent(factory);
    }
  }
}
```

---

## 🧪 USAGE EXAMPLE

### In any module component (e.g., Court Booking):

```typescript
// src/app/modules/court-booking/court-booking.component.ts

import { Component, OnInit } from '@angular/core';
import { ParentClubContextService } from '../../services/parentclub-context.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-court-booking',
  template: `
    <div class="court-booking">
      <div class="header">
        <h2>Court Booking</h2>
        
        <!-- Share Button -->
        <app-share-button 
          module="court-booking"
          title="Book a Court">
        </app-share-button>
      </div>

      <!-- Court booking content -->
      <div class="content">
        <!-- Your court booking UI here -->
      </div>
    </div>
  `
})
export class CourtBookingComponent implements OnInit {
  parentClubId: string;

  constructor(
    private parentClubContext: ParentClubContextService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get ParentClub ID from context
    this.parentClubId = this.parentClubContext.getParentClubId();
    
    // Use it for API calls
    this.loadCourts();
  }

  loadCourts(): void {
    // All API calls use the parentClubId from context
    this.http.get(`/api/courts?parentclubId=${this.parentClubId}`)
      .subscribe(courts => {
        // Handle courts data
      });
  }
}
```

---

## 📋 API ENDPOINTS SUMMARY

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/share/create` | Create a new shareable link |
| GET | `/api/share/resolve/:slug` | Resolve slug to ParentClub data |
| GET | `/s/:slug` | Redirect endpoint for browsers |
| GET | `/api/share/analytics/:parentclubId` | Get link analytics |
| DELETE | `/api/share/:slug` | Deactivate a link |

---

## ✅ IMPLEMENTATION CHECKLIST

### Backend:
- [ ] Create `shared_links` table migration
- [ ] Create `SharedLink` entity
- [ ] Create DTOs
- [ ] Implement `SharedLinkService`
- [ ] Implement `SharedLinkController`
- [ ] Register `SharedLinkModule` in AppModule
- [ ] Add environment variable `APP_DOMAIN`

### Frontend:
- [ ] Create `SharedLinkService`
- [ ] Create `ParentClubContextService`
- [ ] Create `SharedLinkGuard`
- [ ] Update routing configuration
- [ ] Create `ShareButtonComponent`
- [ ] Create `ShareDialogComponent`
- [ ] Create `SharedLinkLayoutComponent`
- [ ] Create `ModuleRouterComponent`

### Testing:
- [ ] Test link creation
- [ ] Test link resolution
- [ ] Test expired link handling
- [ ] Test click count increment
- [ ] Test share dialog on mobile
- [ ] Test share dialog on desktop

---

## 🎉 DONE!

With this implementation, you have:
- ✅ Short, shareable URLs (`/s/Xk9mN2pQ`)
- ✅ UUID completely hidden from users
- ✅ Click tracking and analytics
- ✅ Link expiry support
- ✅ Native share support on mobile
- ✅ WhatsApp and Email sharing
- ✅ Copy to clipboard functionality
