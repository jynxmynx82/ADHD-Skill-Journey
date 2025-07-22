# Firebase Emulator Setup Guide

## Overview
This guide covers the essential setup for Firebase emulators to work properly with React Native/Expo development, especially for mobile device testing.

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project initialized: `firebase init emulators`
- React Native/Expo development environment

## Critical Configuration

### 1. Firebase Configuration (`firebase.json`)
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": {
      "host": "0.0.0.0",
      "port": 9099
    },
    "firestore": {
      "host": "0.0.0.0", 
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4001
    }
  }
}
```

**Key Point:** `"host": "0.0.0.0"` is **CRITICAL** for mobile device access. Without this, emulators only listen on localhost and won't be accessible from physical devices.

### 2. Firebase Config (`firebaseConfig.ts`)
```typescript
// Connect to Firebase emulators in development
if (__DEV__) {
  try {
    // Connect to Auth emulator with network IP
    connectAuthEmulator(auth, 'http://YOUR_NETWORK_IP:9099', { disableWarnings: true });
    console.log('🔥 Auth Emulator connected');
  } catch (e) {
    console.warn('Error connecting to Auth Emulator:', e);
  }
  
  try {
    // Connect to Firestore emulator with network IP
    connectFirestoreEmulator(db, 'YOUR_NETWORK_IP', 8080);
    console.log('🔥 Firestore Emulator connected');
  } catch (e) {
    console.warn('Error connecting to Firestore Emulator:', e);
  }
}
```

**Key Point:** Replace `YOUR_NETWORK_IP` with your computer's actual IP address (e.g., `192.168.86.211`).

## Finding Your Network IP

### macOS
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Windows
```bash
ipconfig
```

### Linux
```bash
hostname -I
```

## Starting Emulators

### Standard Command
```bash
firebase emulators:start --only firestore,auth
```

### With Port Cleanup (if ports are busy)
```bash
lsof -ti:8080 | xargs kill -9 2>/dev/null; \
lsof -ti:9099 | xargs kill -9 2>/dev/null; \
lsof -ti:4001 | xargs kill -9 2>/dev/null; \
firebase emulators:start --only firestore,auth
```

## Verification Steps

### 1. Check Emulator Status
Look for this output:
```
┌────────────────┬──────────────┬─────────────────────────────────┐
│ Emulator       │ Host:Port    │ View in Emulator UI             │
├────────────────┼──────────────┼─────────────────────────────────┤
│ Authentication │ 0.0.0.0:9099 │ http://127.0.0.1:4001/auth      │
├────────────────┼──────────────┼─────────────────────────────────┤
│ Firestore      │ 0.0.0.0:8080 │ http://127.0.0.1:4001/firestore │
└────────────────┴──────────────┴─────────────────────────────────┘
```

### 2. Test Network Connectivity
```bash
curl -I http://YOUR_NETWORK_IP:9099  # Should return HTTP 200
curl -I http://YOUR_NETWORK_IP:8080  # Should return HTTP 404 (normal for gRPC)
```

### 3. Check App Console Logs
Look for:
```
🔥 Auth Emulator connected
🔥 Firestore Emulator connected
```

## Common Issues & Solutions

### Issue: "auth/network-request-failed"
**Cause:** App trying to connect to real Firebase instead of emulator
**Solution:** 
1. Ensure emulators are running on `0.0.0.0`
2. Use correct network IP in `firebaseConfig.ts`
3. Restart app after configuration changes

### Issue: "Could not reach Cloud Firestore backend"
**Cause:** Firestore emulator not accessible from mobile device
**Solution:**
1. Check `firebase.json` has `"host": "0.0.0.0"`
2. Verify network IP is correct in `firebaseConfig.ts`
3. Test connectivity with `curl`

### Issue: React Hook Errors
**Cause:** Calling hooks inside functions
**Solution:** Move `useAuth()` to top level of component

### Issue: Firestore Permission Denied
**Cause:** Security rules blocking document creation
**Solution:** Update rules for new document creation:
```javascript
match /provisionalProfiles/{profileId} {
  allow read, write: if isAuthenticated() && 
    (resource == null || request.auth.uid == resource.data.userId) &&
    (request.resource == null || request.auth.uid == request.resource.data.userId);
}
```

## Development Workflow

### 1. Start Emulators
```bash
firebase emulators:start --only firestore,auth
```

### 2. Start Expo Development Server
```bash
npx expo start --clear
```

### 3. Test on Device
- Scan QR code or use ADB
- Check console logs for emulator connections
- Verify data appears in Firestore emulator UI

### 4. Monitor Emulator UI
- Open `http://127.0.0.1:4001/firestore`
- Check for created documents
- Verify data structure

## Production vs Development

### Development
- Uses Firebase emulators
- Connects to local network IP
- Data stored locally
- No real Firebase costs

### Production
- Uses real Firebase project
- Connects to cloud services
- Data stored in Firebase cloud
- Real Firebase costs apply

## Team Setup Checklist

- [ ] Firebase CLI installed
- [ ] Firebase project initialized
- [ ] `firebase.json` configured with `"host": "0.0.0.0"`
- [ ] Network IP identified and updated in `firebaseConfig.ts`
- [ ] Emulators start successfully
- [ ] App connects to emulators (check console logs)
- [ ] Test Provisional Profile creation
- [ ] Verify data in Firestore emulator UI

## Notes for Future Teams

1. **Always use `0.0.0.0` host** in `firebase.json` for mobile testing
2. **Update network IP** when changing development machines
3. **Test emulator connectivity** before starting development
4. **Monitor console logs** for connection status
5. **Use Firestore emulator UI** to verify data creation

This setup is essential for local development and testing, not just a "nice to have" - it's required for proper mobile app development with Firebase. 