#!/bin/bash
set -e

# ============================================================
# Build Sidewinder for Mac App Store submission
# ============================================================
#
# Prerequisites:
#   1. "3rd Party Mac Developer Application" certificate installed in Keychain
#   2. "3rd Party Mac Developer Installer" certificate installed in Keychain
#   3. App created in App Store Connect with bundle ID com.sidewinder.notes
#
# Usage:
#   ./scripts/build-appstore.sh
#
# Then upload the .pkg via Transporter app or:
#   xcrun altool --upload-app -f Sidewinder.pkg -t macos -u YOUR_APPLE_ID -p APP_SPECIFIC_PASSWORD
# Or:
#   xcrun notarytool submit Sidewinder.pkg --key AuthKey.p8 --key-id KEY_ID --issuer ISSUER_ID --wait
# ============================================================

# Configuration — update these with your actual values
APP_SIGNING_IDENTITY="3rd Party Mac Developer Application: Ryan Russell (W32225Q5CL)"
INSTALLER_SIGNING_IDENTITY="3rd Party Mac Developer Installer: Ryan Russell (W32225Q5CL)"
ENTITLEMENTS="src-tauri/entitlements.plist"
BUNDLE_ID="com.sidewinder.notes"

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
    codesign --deep --force --options runtime --sign "$APP_SIGNING_IDENTITY" --entitlements "$ENTITLEMENTS" "$lib" 2>/dev/null || true
done

# Sign the main binary
codesign --deep --force --options runtime --sign "$APP_SIGNING_IDENTITY" --entitlements "$ENTITLEMENTS" "$APP_PATH"

echo "==> Verifying signature..."
codesign --verify --deep --strict "$APP_PATH"

echo "==> Building installer package..."
productbuild --component "$APP_PATH" /Applications --sign "$INSTALLER_SIGNING_IDENTITY" "Sidewinder.pkg"

echo "==> Done!"
echo ""
echo "Output: Sidewinder.pkg"
echo ""
echo "Upload to App Store Connect using Transporter app"
echo "or via command line:"
echo "  xcrun altool --upload-app -f Sidewinder.pkg -t macos -u YOUR_APPLE_ID -p APP_SPECIFIC_PASSWORD"
