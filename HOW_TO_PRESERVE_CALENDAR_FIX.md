# How to Preserve the Calendar Fix

## The Problem
The calendar fix is applied to `node_modules/ionic3-calendar-en/src/calendar/calendar.js`, which will be lost when you run `npm install` or reinstall dependencies.

## Recommended Solution: Use patch-package

### Step 1: Install patch-package
```bash
npm install patch-package --save-dev
```

### Step 2: Create the patch
```bash
npx patch-package ionic3-calendar-en
```

This will create a file: `patches/ionic3-calendar-en+[version].patch`

### Step 3: Add postinstall script
Edit your `package.json` and add this to the scripts section:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

### Step 4: Commit the patch file
```bash
git add patches/
git commit -m "Add calendar fix patch"
```

### Done! 
Now whenever anyone runs `npm install`, the fix will be automatically reapplied.

## Alternative: Manual Fix (If patch-package doesn't work)

If you need to manually reapply the fix after `npm install`:

### Fix 1: Add Safety Check (Line ~210)
Open: `node_modules/ionic3-calendar-en/src/calendar/calendar.js`

Find:
```javascript
Calendar.prototype.daySelect = function (day, i, j) {
    // First clear the last click status
    this.dateArray[this.lastSelect].isSelect = false;
```

Replace with:
```javascript
Calendar.prototype.daySelect = function (day, i, j) {
    // First clear the last click status (with safety check)
    if (this.dateArray[this.lastSelect]) {
        this.dateArray[this.lastSelect].isSelect = false;
    }
```

### Fix 2: Reset lastSelect (Line ~68)
Find:
```javascript
Calendar.prototype.createMonth = function (year, month) {
    this.dateArray = []; // Clear last month's data
    this.weekArray = []; // Clear week data
    var firstDay;
```

Replace with:
```javascript
Calendar.prototype.createMonth = function (year, month) {
    this.dateArray = []; // Clear last month's data
    this.weekArray = []; // Clear week data
    this.lastSelect = 0; // Reset last selection to prevent index errors
    var firstDay;
```

## Verification

After applying the fix, test by:
1. Navigate to the booking page
2. Open the calendar
3. Navigate from January to February
4. Click any date in February
5. Should work without errors ✅

## Need Help?

Refer to:
- `CALENDAR_BUG_FIX_SUMMARY.md` - Complete explanation of the bug and fix
- `patches/ionic3-calendar-fix.md` - Detailed technical documentation
