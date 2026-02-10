# Real Device Setup Guide

## Problem
When testing on a **real physical device** (not emulator), `localhost` refers to the device itself, not your development PC. This causes connection errors like "Network request failed" or "Please check your connection".

## Solution
Set your PC's **local network IP address** as an environment variable so the app knows where to find your backend.

## Steps

### 1. Find Your PC's Local IP Address

**Windows:**
```powershell
ipconfig
```
Look for `IPv4 Address` under your active network adapter (usually WiFi or Ethernet). Example: `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
or
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### 2. Set Environment Variable

Create or update `.env` file in your project root:

```env
EXPO_PUBLIC_DEV_HOST_IP=192.168.1.100
```

Replace `192.168.1.100` with **your actual PC IP**.

**OR** set it in `app.json`:

```json
{
  "expo": {
    "extra": {
      "DEV_HOST_IP": "192.168.1.100"
    }
  }
}
```

### 3. Restart Expo

After setting the variable, restart Expo:

```bash
npx expo start -c
```

### 4. Ensure Same Network

Make sure your **phone and PC are on the same WiFi network**. The phone cannot reach your PC if they're on different networks.

### 5. Verify Backend is Accessible

From your phone's browser (or another device on the same network), try:

```
http://192.168.1.100:8082/api/health
```

(Replace with your actual IP and port)

If this works, your React Native app should also be able to connect.

## How It Works

- **Emulator:** Automatically uses `10.0.2.2` (Android) or `localhost` (iOS Simulator)
- **Real Device:** Uses `EXPO_PUBLIC_DEV_HOST_IP` if set, otherwise falls back to emulator mapping

The app will automatically replace `localhost` and `127.0.0.1` in all API URLs with your PC's IP when running on a real device.

## Troubleshooting

**Still getting connection errors?**

1. **Check firewall:** Windows Firewall or antivirus might be blocking port `8082` or `7880`
   - Allow these ports in firewall settings
   - Or temporarily disable firewall for testing

2. **Check backend is running:** Make sure your backend server is actually running on `http://localhost:8082`

3. **Check IP hasn't changed:** Your router might assign a new IP. Run `ipconfig` again to verify.

4. **Try ping:** From your phone, ping your PC's IP to verify network connectivity
