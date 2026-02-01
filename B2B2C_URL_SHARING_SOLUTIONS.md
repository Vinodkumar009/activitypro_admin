# B2B2C URL Sharing Solutions for ParentClub Modules

## 📋 Problem Statement

You have a B2B2C application where:
- Multiple customers (ParentClubs) each have unique UUID identifiers
- Each ParentClub has different modules (Sessions, Court Booking, Events, etc.)
- Need to share URLs that:
  - ✅ Are readable and user-friendly
  - ✅ Hide the actual ParentClub UUID (privacy concern)
  - ✅ Route users to the correct ParentClub and module
  - ✅ Work as entry points for the Angular web application

---

## 🎯 Solution Options

### Option 1: Slug-Based URLs (Recommended) ⭐

**Concept:** Use human-readable slugs instead of UUIDs in URLs.

**Database Setup:**
```sql
-- Add slug column to parentclub table
ALTER TABLE parentclub ADD COLUMN slug VARCHAR(100) UNIQUE;

-- Example data
-- UUID: 550e8400-e29b-41d4-a716-446655440000
-- Slug: tennis-academy-london
```

**URL Format:**
```
https://app.activitypro.com/tennis-academy-london/court-booking
https://app.activitypro.com/sunrise-sports-club/sessions
https://app.activitypro.com/elite-fitness/events
```

**Backend Implementation (NestJS):**
```typescript
// parentclub.entity.ts
@Entity()
export class ParentClub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;  // e.g., "tennis-academy-london"

  @Column()
  name: string;

  // ... other fields
}

// parentclub.controller.ts
@Get(':slug')
async getBySlug(@Param('slug') slug: string) {
  return this.parentClubService.findBySlug(slug);
}
```

**Angular Route Configuration:**
```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: ':parentClubSlug',
    component: ParentClubLayoutComponent,
    children: [
      { path: 'sessions', component: SessionsComponent },
      { path: 'court-booking', component: CourtBookingComponent },
      { path: 'events', component: EventsComponent },
      { path: 'school-sessions', component: SchoolSessionsComponent },
      { path: 'holiday-camp', component: HolidayCampComponent },
    ]
  }
];
```

**Angular Service:**
```typescript
// parentclub.service.ts
@Injectable({ providedIn: 'root' })
export class ParentClubService {
  private currentParentClub: ParentClub | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  async resolveParentClub(slug: string): Promise<ParentClub> {
    const response = await this.http.get<ParentClub>(`/api/parentclub/by-slug/${slug}`).toPromise();
    this.currentParentClub = response;
    return response;
  }

  getCurrentParentClubId(): string {
    return this.currentParentClub?.id;
  }
}
```

**Pros:**
- ✅ Very readable URLs
- ✅ SEO friendly
- ✅ UUID completely hidden
- ✅ Easy to remember and share
- ✅ Professional appearance

**Cons:**
- ❌ Need to ensure slug uniqueness
- ❌ Slug changes require URL redirects
- ❌ Additional database column

---

### Option 2: Short Code / Alias System

**Concept:** Generate short, unique codes for each ParentClub.

**Database Setup:**
```sql
-- Add short_code column
ALTER TABLE parentclub ADD COLUMN short_code VARCHAR(10) UNIQUE;

-- Example data
-- UUID: 550e8400-e29b-41d4-a716-446655440000
-- Short Code: ABC123
```

**URL Format:**
```
https://app.activitypro.com/c/ABC123/court-booking
https://app.activitypro.com/c/XYZ789/sessions
```

**Short Code Generation (NestJS):**
```typescript
// short-code.service.ts
import { nanoid } from 'nanoid';

@Injectable()
export class ShortCodeService {
  generateShortCode(): string {
    // Generates 8-character alphanumeric code
    return nanoid(8).toUpperCase();
  }

  // Or custom implementation
  generateCustomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
```

**Pros:**
- ✅ Short and easy to type
- ✅ UUID hidden
- ✅ Works well for QR codes
- ✅ Easy to generate

**Cons:**
- ❌ Not as readable as slugs
- ❌ No meaning in the URL
- ❌ Potential collision (need uniqueness check)

---

### Option 3: Encrypted/Encoded URL Parameter

**Concept:** Encrypt or encode the UUID so it's not directly visible.

**Implementation Options:**

#### 3a. Base64 Encoding (Simple but Reversible)
```typescript
// encoding.service.ts
@Injectable()
export class EncodingService {
  encode(uuid: string): string {
    return Buffer.from(uuid).toString('base64url');
  }

  decode(encoded: string): string {
    return Buffer.from(encoded, 'base64url').toString('utf8');
  }
}

// UUID: 550e8400-e29b-41d4-a716-446655440000
// Encoded: NTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAw
```

**URL Format:**
```
https://app.activitypro.com/p/NTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAw/court-booking
```

#### 3b. AES Encryption (More Secure)
```typescript
// crypto.service.ts
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey = process.env.URL_ENCRYPTION_KEY; // 32 bytes

  encrypt(uuid: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    
    let encrypted = cipher.update(uuid, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine iv + authTag + encrypted
    return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')])
      .toString('base64url');
  }

  decrypt(encryptedData: string): string {
    const data = Buffer.from(encryptedData, 'base64url');
    
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const encrypted = data.subarray(28);
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

**Pros:**
- ✅ UUID is hidden/encrypted
- ✅ No additional database columns needed
- ✅ Can include expiry or additional data

**Cons:**
- ❌ URLs are long and ugly
- ❌ Not readable or memorable
- ❌ Encryption overhead

---

### Option 4: URL Shortener with Database Lookup (Recommended for Sharing) ⭐

**Concept:** Create short, shareable links that map to full URLs in a database.

**Database Setup:**
```sql
CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  parentclub_id UUID NOT NULL REFERENCES parentclub(id),
  module VARCHAR(50) NOT NULL,
  additional_params JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id)
);

-- Index for fast lookups
CREATE INDEX idx_shared_links_short_code ON shared_links(short_code);
```

**URL Format:**
```
https://app.activitypro.com/s/Xk9mN2pQ
```

**Backend Implementation:**
```typescript
// shared-link.entity.ts
@Entity('shared_links')
export class SharedLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  shortCode: string;

  @Column('uuid')
  parentclubId: string;

  @Column()
  module: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalParams: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: 0 })
  clickCount: number;

  @CreateDateColumn()
  createdAt: Date;
}

// shared-link.service.ts
@Injectable()
export class SharedLinkService {
  constructor(
    @InjectRepository(SharedLink)
    private sharedLinkRepo: Repository<SharedLink>,
  ) {}

  async createShareableLink(
    parentclubId: string,
    module: string,
    additionalParams?: Record<string, any>,
    expiresInDays?: number
  ): Promise<string> {
    const shortCode = this.generateShortCode();
    
    const link = this.sharedLinkRepo.create({
      shortCode,
      parentclubId,
      module,
      additionalParams,
      expiresAt: expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null,
    });

    await this.sharedLinkRepo.save(link);
    
    return `https://app.activitypro.com/s/${shortCode}`;
  }

  async resolveLink(shortCode: string): Promise<SharedLink> {
    const link = await this.sharedLinkRepo.findOne({ 
      where: { shortCode } 
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new GoneException('Link has expired');
    }

    // Increment click count
    await this.sharedLinkRepo.increment({ id: link.id }, 'clickCount', 1);

    return link;
  }

  private generateShortCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

// shared-link.controller.ts
@Controller('s')
export class SharedLinkController {
  constructor(private sharedLinkService: SharedLinkService) {}

  @Get(':shortCode')
  async resolveAndRedirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response
  ) {
    const link = await this.sharedLinkService.resolveLink(shortCode);
    
    // Get parentclub slug for readable URL
    const parentclub = await this.parentClubService.findById(link.parentclubId);
    
    // Redirect to the actual module URL
    const redirectUrl = `/${parentclub.slug}/${link.module}`;
    
    return res.redirect(302, redirectUrl);
  }
}
```

**Angular Implementation:**
```typescript
// share-link.service.ts
@Injectable({ providedIn: 'root' })
export class ShareLinkService {
  constructor(private http: HttpClient) {}

  async generateShareLink(module: string, additionalParams?: any): Promise<string> {
    const response = await this.http.post<{ url: string }>('/api/share/create', {
      module,
      additionalParams
    }).toPromise();
    
    return response.url;
  }

  copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url);
  }
}

// Usage in component
async shareModule() {
  const shareUrl = await this.shareLinkService.generateShareLink('court-booking');
  
  // Show share dialog
  if (navigator.share) {
    await navigator.share({
      title: 'Book a Court',
      text: 'Check out court booking at Tennis Academy',
      url: shareUrl
    });
  } else {
    this.shareLinkService.copyToClipboard(shareUrl);
    this.showToast('Link copied to clipboard!');
  }
}
```

**Pros:**
- ✅ Very short URLs
- ✅ UUID completely hidden
- ✅ Can track clicks/analytics
- ✅ Can set expiry dates
- ✅ Can include additional parameters
- ✅ Professional appearance

**Cons:**
- ❌ Requires database lookup for every access
- ❌ Additional table to maintain
- ❌ Links can break if deleted

---

### Option 5: Subdomain-Based Routing

**Concept:** Each ParentClub gets its own subdomain.

**URL Format:**
```
https://tennis-academy.activitypro.com/court-booking
https://sunrise-sports.activitypro.com/sessions
https://elite-fitness.activitypro.com/events
```

**DNS/Server Setup:**
```nginx
# Nginx configuration
server {
    server_name ~^(?<subdomain>.+)\.activitypro\.com$;
    
    location / {
        proxy_pass http://angular-app;
        proxy_set_header X-ParentClub-Subdomain $subdomain;
    }
}
```

**Angular Implementation:**
```typescript
// app.component.ts
export class AppComponent implements OnInit {
  constructor(
    private parentClubService: ParentClubService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    const hostname = this.document.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    if (subdomain !== 'app' && subdomain !== 'www') {
      this.parentClubService.resolveBySubdomain(subdomain);
    }
  }
}
```

**Pros:**
- ✅ Very clean URLs
- ✅ Professional branding for each ParentClub
- ✅ UUID completely hidden
- ✅ Easy to remember

**Cons:**
- ❌ Complex DNS/SSL setup
- ❌ Wildcard SSL certificate needed
- ❌ More infrastructure overhead

---

## 🏆 Recommended Approach: Hybrid Solution

Combine **Option 1 (Slugs)** + **Option 4 (Short Links)** for the best of both worlds:

### Architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        URL TYPES                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DIRECT ACCESS (Bookmarked/Typed):                           │
│     https://app.activitypro.com/tennis-academy/court-booking    │
│     └── Uses slug from parentclub table                         │
│                                                                  │
│  2. SHARED LINKS (Social/Email/SMS):                            │
│     https://app.activitypro.com/s/Xk9mN2pQ                      │
│     └── Resolves from shared_links table                        │
│     └── Redirects to slug-based URL                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema:

```sql
-- ParentClub table with slug
CREATE TABLE parentclub (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  -- ... other fields
);

-- Shared links table
CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  parentclub_id UUID NOT NULL REFERENCES parentclub(id),
  module VARCHAR(50) NOT NULL,
  additional_params JSONB,
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_parentclub_slug ON parentclub(slug);
CREATE INDEX idx_shared_links_short_code ON shared_links(short_code);
```

### Complete Flow:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ADMIN SHARES LINK:                                                   │
│  ┌─────────────────┐                                                  │
│  │ Admin Dashboard │                                                  │
│  │ Select Module   │──► Click "Share" ──► Generate Short Link        │
│  │ Court Booking   │                       https://app.../s/Xk9mN2pQ │
│  └─────────────────┘                                                  │
│                                                                       │
│  USER CLICKS SHARED LINK:                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐ │
│  │ Short Link      │────►│ Backend Lookup  │────►│ Redirect to     │ │
│  │ /s/Xk9mN2pQ     │     │ shared_links    │     │ /tennis-academy │ │
│  │                 │     │ table           │     │ /court-booking  │ │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘ │
│                                                                       │
│  ANGULAR APP LOADS:                                                   │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐ │
│  │ Read slug from  │────►│ API: Get        │────►│ Store in        │ │
│  │ URL params      │     │ ParentClub by   │     │ service/state   │ │
│  │ "tennis-academy"│     │ slug            │     │ Use UUID for    │ │
│  └─────────────────┘     └─────────────────┘     │ API calls       │ │
│                                                   └─────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Checklist

### Backend (NestJS):

- [ ] Add `slug` column to `parentclub` table
- [ ] Create `shared_links` table
- [ ] Create `ParentClubController.getBySlug()` endpoint
- [ ] Create `SharedLinkController` with create/resolve endpoints
- [ ] Add slug generation utility (from ParentClub name)
- [ ] Add short code generation utility

### Frontend (Angular):

- [ ] Configure routes with `:parentClubSlug` parameter
- [ ] Create `ParentClubResolver` to fetch ParentClub on route activation
- [ ] Create `ShareLinkService` for generating shareable links
- [ ] Add share button to each module
- [ ] Handle short link redirects

### Database:

- [ ] Migration for `slug` column
- [ ] Migration for `shared_links` table
- [ ] Populate slugs for existing ParentClubs
- [ ] Add unique constraints and indexes

---

## 🔒 Security Considerations

1. **Rate Limiting**: Limit short link creation to prevent abuse
2. **Expiry**: Set default expiry for shared links (e.g., 30 days)
3. **Validation**: Validate slugs to prevent XSS/injection
4. **Access Control**: Ensure users can only create links for their ParentClub
5. **Audit Trail**: Log link creation and access for security monitoring

---

## 📊 Comparison Summary

| Feature | Slugs | Short Codes | Encrypted | Short Links | Subdomains |
|---------|-------|-------------|-----------|-------------|------------|
| Readability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| UUID Hidden | ✅ | ✅ | ✅ | ✅ | ✅ |
| SEO Friendly | ✅ | ❌ | ❌ | ❌ | ✅ |
| Easy to Share | ✅ | ✅ | ❌ | ✅ | ✅ |
| Analytics | ❌ | ❌ | ❌ | ✅ | ❌ |
| Expiry Support | ❌ | ❌ | ✅ | ✅ | ❌ |
| Setup Complexity | Low | Low | Medium | Medium | High |
| Maintenance | Low | Low | Low | Medium | High |

---

## ✅ Final Recommendation

**Use the Hybrid Approach (Slugs + Short Links):**

1. **Slugs** for direct access and SEO
2. **Short Links** for sharing with tracking

This gives you:
- ✅ Readable, professional URLs
- ✅ UUID completely hidden
- ✅ Analytics on shared links
- ✅ Expiry support for shared links
- ✅ Best user experience

---

## 📁 Files to Create

1. `src/modules/parentclub/parentclub.entity.ts` - Add slug field
2. `src/modules/shared-link/shared-link.entity.ts` - New entity
3. `src/modules/shared-link/shared-link.service.ts` - Business logic
4. `src/modules/shared-link/shared-link.controller.ts` - API endpoints
5. `src/modules/shared-link/dto/create-shared-link.dto.ts` - Request DTO
6. `migrations/xxx-add-slug-to-parentclub.ts` - Database migration
7. `migrations/xxx-create-shared-links-table.ts` - Database migration

Would you like me to implement any of these solutions?
