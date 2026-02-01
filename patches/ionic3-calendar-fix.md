# Fix for ionic3-calendar-en February Bug

## Issue
Calendar throws error: `Cannot set properties of undefined (setting 'isSelect')` when navigating to February from months with more days.

## Root Cause
The `lastSelect` index is not validated or reset when changing months, causing it to point to invalid array indices in shorter months like February.

## Files Modified
- `node_modules/ionic3-calendar-en/src/calendar/calendar.js`

## Changes Applied

### 1. Added Safety Check in daySelect Method (Line ~210)

**Before:**
```javascript
Calendar.prototype.daySelect = function (day, i, j) {
    // First clear the last click status
    this.dateArray[this.lastSelect].isSelect = false;
    // Store this clicked status
    this.lastSelect = i * 7 + j;
    this.dateArray[i * 7 + j].isSelect = true;
    this.onDaySelect.emit(day);
};
```

**After:**
```javascript
Calendar.prototype.daySelect = function (day, i, j) {
    // First clear the last click status (with safety check)
    if (this.dateArray[this.lastSelect]) {
        this.dateArray[this.lastSelect].isSelect = false;
    }
    // Store this clicked status
    this.lastSelect = i * 7 + j;
    this.dateArray[i * 7 + j].isSelect = true;
    this.onDaySelect.emit(day);
};
```

### 2. Reset lastSelect in createMonth Method (Line ~68)

**Before:**
```javascript
Calendar.prototype.createMonth = function (year, month) {
    this.dateArray = []; // Clear last month's data
    this.weekArray = []; // Clear week data
    var firstDay;
```

**After:**
```javascript
Calendar.prototype.createMonth = function (year, month) {
    this.dateArray = []; // Clear last month's data
    this.weekArray = []; // Clear week data
    this.lastSelect = 0; // Reset last selection to prevent index errors
    var firstDay;
```

## How to Reapply After npm install

If you run `npm install` and node_modules is recreated, you'll need to reapply these changes:

1. Open `node_modules/ionic3-calendar-en/src/calendar/calendar.js`
2. Find the `daySelect` method and add the `if` check
3. Find the `createMonth` method and add the `lastSelect = 0` reset

## Alternative: Use patch-package

To automate this fix:

```bash
npm install patch-package --save-dev
```

Add to package.json scripts:
```json
"scripts": {
  "postinstall": "patch-package"
}
```

Then run:
```bash
npx patch-package ionic3-calendar-en
```

This will create a patch file that automatically applies after npm install.

## Testing
- Navigate to booking page
- Open calendar
- Navigate from January (31 days) to February (28 days)
- Click any date in February
- Should work without errors

## Date Fixed
January 30, 2026
