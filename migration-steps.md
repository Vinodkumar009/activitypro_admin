# Ionic 3 to 6 Migration Steps

## Step 1: Setup New Project
```bash
# Install latest Ionic CLI
npm install -g @ionic/cli@latest

# Create new Ionic 6 project
ionic start activitypro-ionic6 blank --type=angular --capacitor

# Copy your assets and source files
```

## Step 2: Update Dependencies
Replace package.json with the new one I created (package-ionic6.json)

## Step 3: Key Changes Needed

### Navigation Changes
- Replace `NavController.push()` with Angular Router
- Remove `@IonicPage()` decorators
- Update lazy loading syntax

### Component Updates
- `ion-navbar` → `ion-header` with `ion-toolbar`
- Update lifecycle hooks
- Fix CSS custom properties

### Plugin Migration
- Cordova → Capacitor plugins
- Update native plugin calls

## Step 4: Page Migration Example

### Before (Ionic 3):
```typescript
@IonicPage()
@Component({
  selector: 'login-page',
  templateUrl: 'login.html'
})
export class Login {
  constructor(public navCtrl: NavController) {}
  
  goToPage() {
    this.navCtrl.push('Dashboard');
  }
}
```

### After (Ionic 6):
```typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  constructor(private router: Router) {}
  
  goToPage() {
    this.router.navigate(['/dashboard']);
  }
}
```

## Step 5: Critical Files to Update
1. app.module.ts → Use new Angular/Ionic 6 imports
2. Add app-routing.module.ts
3. Update tsconfig.json
4. Add angular.json
5. Update environment files
6. Migrate each page component

## Next Steps
1. Would you like me to start migrating specific pages?
2. Should I focus on the core navigation first?
3. Do you want to migrate plugins to Capacitor?