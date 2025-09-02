#!/bin/bash

# Ionic 3 Build Script with Error Handling
# This script executes commands one by one and continues even if a command fails

set +e  # Don't exit on errors, continue with next command

# Record start time
START_TIME=$(date +%s)

echo "🚀 Starting Ionic 3 Build Process..."
echo "======================================="

# Function to execute command with error handling
execute_command() {
    local cmd="$1"
    local description="$2"
    
    echo ""
    echo "📋 Step: $description"
    echo "💻 Command: $cmd"
    echo "---"
    
    if eval "$cmd"; then
        echo "✅ SUCCESS: $description"
    else
        echo "❌ FAILED: $description (continuing to next step...)"
    fi
}

# Function to check if nvm is available
check_nvm() {
    if ! command -v nvm &> /dev/null; then
        echo "⚠️  NVM not found. Attempting to source it..."
        if [ -f "$HOME/.nvm/nvm.sh" ]; then
            source "$HOME/.nvm/nvm.sh"
        elif [ -f "/usr/local/opt/nvm/nvm.sh" ]; then
            source "/usr/local/opt/nvm/nvm.sh"
        else
            echo "❌ NVM not found. Please install NVM first."
            return 1
        fi
    fi
}

# Check NVM availability
check_nvm

# Step 1: Clean Android
execute_command "cordova clean android" "Clean Android platform"

# Step 2-4: Remove plugins
execute_command "ionic cordova plugin rm cordova-plugin-camera" "Remove camera plugin"
execute_command "ionic cordova plugin rm cordova-plugin-app-version" "Remove app-version plugin"
execute_command "ionic cordova plugin rm cordova-plugin-splashscreen" "Remove splashscreen plugin"
execute_command "ionic cordova plugin rm cordova-plugin-market" "Remove splashscreen plugin"
# Step 5: Switch to Node 16
execute_command "nvm use 16" "Switch to Node 16"

# Step 6-8: Add plugins back
execute_command "ionic cordova plugin add cordova-plugin-camera" "Add camera plugin"
execute_command "cordova plugin add cordova-plugin-ionic-webview@5.0.0" "Add ionic webview plugin"
execute_command "ionic cordova plugin add cordova-plugin-splashscreen" "Add splashscreen plugin"
execute_command "ionic cordova plugin add cordova-plugin-market" "Add splashscreen plugin"

# Step 9: Switch to Node 14
execute_command "nvm use 14" "Switch to Node 14"

# Step 10: Remove Android platform
execute_command "ionic cordova platform rm android" "Remove Android platform"

# Step 11: Switch to Node 16
execute_command "nvm use 16" "Switch to Node 16"

# Step 12: Add Android platform
execute_command "ionic cordova platform add android@12" "Add Android platform v12"

# Step 13: Generate resources
execute_command "ionic cordova resources android" "Generate Android resources"

# Step 14: Switch to Node 14
execute_command "nvm use 14" "Switch to Node 14"

# Step 15: Search and replace fs.cpSync with fs.copyFileSync
echo ""
echo "📋 Step: Search and replace fs.cpSync with fs.copyFileSync in platforms/android and node_modules"
echo "💻 Command: find platforms/android node_modules -type f -name '*.js' -exec grep -l 'fs.cpSync' {} \;"
echo "---"

if find platforms/android node_modules -type f -name "*.js" -exec grep -l "fs.cpSync" {} \; 2>/dev/null | while read -r file; do
    echo "Replacing fs.cpSync in: $file"
    sed -i '' 's/fs\.cpSync/fs.copyFileSync/g' "$file"
done; then
    echo "✅ SUCCESS: Replaced fs.cpSync with fs.copyFileSync"
else
    echo "❌ FAILED: Could not replace fs.cpSync (continuing...)"
fi

# Step 16: Check required images
echo ""
echo "📋 Step: Check if required images are generated"
echo "💻 Checking: platforms/android/app/src/main/res"
echo "---"

if [ -d "platforms/android/app/src/main/res" ]; then
    echo "✅ SUCCESS: Android resources directory exists"
    ls -la platforms/android/app/src/main/res/ || echo "Could not list contents"
else
    echo "❌ FAILED: Android resources directory not found (continuing...)"
fi

# Step 17: Replace 'compile' with 'implementation' in cordova-plugin-badge
echo ""
echo "📋 Step: Replace 'compile' with 'implementation' in cordova-plugin-badge"
echo "---"

if [ -d "platforms/android/cordova-plugin-badge" ]; then
    find platforms/android/cordova-plugin-badge -type f -name "*.gradle" -exec sed -i '' 's/compile /implementation /g' {} \;
    echo "✅ SUCCESS: Updated cordova-plugin-badge"
else
    echo "❌ FAILED: cordova-plugin-badge directory not found (continuing...)"
fi

# Step 18: Replace 'compile' with 'implementation' in cordova-plugin-local-notification
echo ""
echo "📋 Step: Replace 'compile' with 'implementation' in cordova-plugin-local-notification"
echo "---"

if [ -d "platforms/android/cordova-plugin-local-notification" ]; then
    find platforms/android/cordova-plugin-local-notification -type f -name "*.gradle" -exec sed -i '' 's/compile /implementation /g' {} \;
    echo "✅ SUCCESS: Updated cordova-plugin-local-notification"
else
    echo "❌ FAILED: cordova-plugin-local-notification directory not found (continuing...)"
fi

# Step 19: Replace package name
echo ""
echo "📋 Step: Replace io.cordova.helloCordova with app.activitypro.apadminnextgen in platforms/android and node_modules"
echo "---"

if [ -d "platforms/android" ] || [ -d "node_modules" ]; then
    find platforms/android node_modules -type f \( -name "*.xml" -o -name "*.java" -o -name "*.json" -o -name "*.gradle" \) -exec sed -i '' 's/io.cordova.helloCordova/app.activitypro.apadminnextgen/g' {} \; 2>/dev/null
    echo "✅ SUCCESS: Updated package name"
else
    echo "❌ FAILED: Neither platforms/android nor node_modules directory found (continuing...)"
fi

echo ""
echo "📋 Step: Create/Update themes.xml"
echo "---"

# Step 20: Create/Update themes.xml
themes_dir="platforms/android/app/src/main/res/values"
themes_file="$themes_dir/themes.xml"

if [ ! -d "$themes_dir" ]; then
    mkdir -p "$themes_dir"
fi

cat > "$themes_file" << 'EOF'
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <style name="Theme.App.SplashScreen" parent="Theme.SplashScreen.IconBackground">
        <item name="windowSplashScreenBackground">@color/cdv_splashscreen_background</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_full</item>
        <item name="windowSplashScreenAnimationDuration">1000</item>
        <item name="postSplashScreenTheme">@style/Theme.AppCompat.NoActionBar</item>
    </style>
</resources>
EOF

if [ -f "$themes_file" ]; then
    echo "✅ SUCCESS: Created themes.xml"
else
    echo "❌ FAILED: Could not create themes.xml (continuing...)"
fi

echo ""
echo "📋 Step: Create splash_full.xml"
echo "---"

# Step 21: Create splash_full.xml
drawable_dir="platforms/android/app/src/main/res/drawable"
splash_full_file="$drawable_dir/splash_full.xml"

if [ ! -d "$drawable_dir" ]; then
    mkdir -p "$drawable_dir"
fi

cat > "$splash_full_file" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <bitmap android:src="@drawable/screen"
                android:gravity="fill" />
    </item>
</layer-list>
EOF

if [ -f "$splash_full_file" ]; then
    echo "✅ SUCCESS: Created splash_full.xml"
else
    echo "❌ FAILED: Could not create splash_full.xml (continuing...)"
fi

echo ""
echo "📋 Step: Copy splash.png as screen.png"
echo "---"

# Step 22: Copy splash.png to screen.png
if [ -f "resources/splash.png" ]; then
    cp "resources/splash.png" "$drawable_dir/screen.png"
    if [ -f "$drawable_dir/screen.png" ]; then
        echo "✅ SUCCESS: Copied splash.png as screen.png"
    else
        echo "❌ FAILED: Could not copy splash.png (continuing...)"
    fi
else
    echo "❌ FAILED: resources/splash.png not found (continuing...)"
fi

# Step 23: Run fix_androidx.sh
execute_command "find . -type f \( -name "*.xml" -o -name "*.java" -o -name "*.json" -o -name "*.gradle" \) -exec sed -i '' 's/io.cordova.helloCordova/app.activitypro.apadminnextgen/g' {} \;"

# Step 24: Prepare Android platform
execute_command "ionic cordova prepare android" "Prepare Android platform"

# Step 25: Build Android
execute_command "ionic cordova build android" "Build Android application"

# Step 26: Run fix_androidx.sh
execute_command "./fix_androidx.sh" "Run AndroidX fix script"

# Calculate execution time
END_TIME=$(date +%s)
EXECUTION_TIME=$((END_TIME - START_TIME))
MINUTES=$((EXECUTION_TIME / 60))
SECONDS=$((EXECUTION_TIME % 60))

echo ""
echo "🎉 Build script completed!"
echo "======================================="
echo "⏱️  Total execution time: ${MINUTES}m ${SECONDS}s"
echo "📝 Summary: All steps have been executed."
echo "⚠️  Please check the output above for any failed steps."
echo "🔍 You may need to manually fix any failed operations."