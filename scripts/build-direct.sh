#!/bin/bash
set -e

# ============================================================
# Build Sidewinder for direct distribution (signed + notarized)
# ============================================================
#
# Prerequisites:
#   1. "Developer ID Application" certificate installed in Keychain
#   2. App-specific password or API key for notarization
#
# Usage:
#   ./scripts/build-direct.sh
#
# Environment variables (or set below):
#   APPLE_ID         — your Apple ID email
#   APPLE_TEAM_ID    — your team ID (W32225Q5CL)
#   APPLE_PASSWORD   — app-specific password (or use keychain profile)
# ============================================================

# Configuration
SIGNING_IDENTITY="Developer ID Application: Ryan Russell (W32225Q5CL)"
TEAM_ID="${APPLE_TEAM_ID:-W32225Q5CL}"

echo "==> Building Tauri app..."
pnpm tauri build --bundles app

APP_PATH="src-tauri/target/release/bundle/macos/Sidewinder.app"

if [ ! -d "$APP_PATH" ]; then
    echo "Error: App bundle not found at $APP_PATH"
    exit 1
fi

echo "==> Signing app bundle..."
# Sign all nested binaries and frameworks first
find "$APP_PATH" -name "*.dylib" -o -name "*.framework" | while read -r lib; do
    codesign --deep --force --options runtime --sign "$SIGNING_IDENTITY" "$lib" 2>/dev/null || true
done

# Sign the main binary
codesign --deep --force --options runtime --sign "$SIGNING_IDENTITY" "$APP_PATH"

echo "==> Verifying signature..."
codesign --verify --deep --strict "$APP_PATH"
spctl --assess --type execute "$APP_PATH" && echo "    Gatekeeper: ACCEPTED" || echo "    Gatekeeper: will pass after notarization"

echo "==> Creating DMG..."
DMG_NAME="Sidewinder.dmg"
VOLUME_NAME="Sidewinder"
DMG_TEMP="dmg-temp"

rm -rf "$DMG_TEMP" "$DMG_NAME"
mkdir -p "$DMG_TEMP"
cp -R "$APP_PATH" "$DMG_TEMP/"
ln -s /Applications "$DMG_TEMP/Applications"

hdiutil create -volname "$VOLUME_NAME" -srcfolder "$DMG_TEMP" -ov -format UDZO "$DMG_NAME"
rm -rf "$DMG_TEMP"

# Sign the DMG
codesign --force --sign "$SIGNING_IDENTITY" "$DMG_NAME"

echo "==> Submitting for notarization..."
if [ -n "$APPLE_ID" ] && [ -n "$APPLE_PASSWORD" ]; then
    xcrun notarytool submit "$DMG_NAME" \
        --apple-id "$APPLE_ID" \
        --team-id "$TEAM_ID" \
        --password "$APPLE_PASSWORD" \
        --wait

    echo "==> Stapling notarization ticket..."
    xcrun stapler staple "$DMG_NAME"
    echo ""
    echo "==> Done! Notarized DMG ready: $DMG_NAME"
else
    echo ""
    echo "==> DMG created but NOT notarized (no credentials provided)"
    echo "    To notarize manually:"
    echo "    xcrun notarytool submit $DMG_NAME --apple-id YOUR_APPLE_ID --team-id $TEAM_ID --password APP_SPECIFIC_PASSWORD --wait"
    echo "    xcrun stapler staple $DMG_NAME"
fi

echo ""
echo "Output: $DMG_NAME"
