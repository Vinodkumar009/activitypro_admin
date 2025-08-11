# Ionic 3 to Ionic 6 Migration Guide

## Overview
This guide outlines the step-by-step process to migrate your ActivityPro app from Ionic 3 to Ionic 6.

## Current Project Analysis
- **Framework**: Ionic 3.9.5 with Angular 5.2.11
- **Architecture**: Page-based with lazy loading
- **Key Features**: Firebase, GraphQL, OneSignal, Multiple user types
- **Plugins**: 20+ Cordova plugins
- **Build System**: ionic-app-scripts

## Migration Phases

### Phase 1: Environment Setup
1. Install Ionic CLI 6+
2. Create new Ionic 6 project structure
3. Migrate configuration files
4. Update build system

### Phase 2: Dependencies Update
1. Angular 5 → Angular 14
2. Ionic 3 → Ionic 6
3. RxJS 5 → RxJS 7
4. TypeScript 3 → TypeScript 4.7
5. Update Ionic Native plugins to Capacitor

### Phase 3: Code Migration
1. Convert pages to components
2. Update routing system
3. Migrate navigation patterns
4. Update lifecycle hooks
5. Fix breaking changes

### Phase 4: Plugin Migration
1. Migrate from Cordova to Capacitor
2. Update native plugin implementations
3. Test platform-specific features

## Breaking Changes to Address

### 1. Navigation System
- `NavController.push()` → Angular Router
- `IonicPage` decorator removed
- Lazy loading syntax changed

### 2. Component Changes
- `ion-navbar` → `ion-header` with `ion-toolbar`
- Various component API changes
- CSS custom properties

### 3. Lifecycle Hooks
- `ionViewDidLoad` → `ngOnInit`
- `ionViewWillEnter` → `ionViewWillEnter` (still available)
- `ionViewDidEnter` → `ionViewDidEnter` (still available)

### 4. Build System
- ionic-app-scripts → Angular CLI
- Different build configuration
- Updated serve/build commands

## Estimated Timeline
- **Phase 1**: 1-2 days
- **Phase 2**: 3-4 days  
- **Phase 3**: 5-7 days
- **Phase 4**: 2-3 days
- **Testing & Fixes**: 3-5 days

**Total**: 2-3 weeks

## Next Steps
1. Backup current project
2. Create new Ionic 6 project
3. Begin systematic migration
4. Test thoroughly on both platforms