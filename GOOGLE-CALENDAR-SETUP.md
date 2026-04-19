# Google Calendar Integration - Setup Guide

## What This Does

Syncs Father Forge key dates to your Google Calendar:
- April 25, 2026 Networking Event
- $500 MRR milestone (End of April)
- $10k MRR Bridge Goal (Dec 31, 2026)
- $42k MRR Final Goal (Nov 7, 2027)

## One-Time Setup (15-20 minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a project" dropdown (top bar)
4. Click "NEW PROJECT"
5. Project name: `Father Forge` (or any name)
6. Click "CREATE"
7. Wait for project to be created (~30 seconds)

### Step 2: Enable Google Calendar API

1. In the Google Cloud Console, click the hamburger menu (☰) → "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click "ENABLE"
5. Wait for API to be enabled

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials" (left sidebar)
2. Click "+ CREATE CREDENTIALS" (top)
3. Select "OAuth client ID"
4. If prompted to configure OAuth consent screen:
   - Click "CONFIGURE CONSENT SCREEN"
   - Select "External" (unless you have a Google Workspace)
   - Click "CREATE"
   - Fill in required fields:
     - App name: `Father Forge`
     - User support email: (your email)
     - Developer contact: (your email)
   - Click "SAVE AND CONTINUE"
   - Skip "Scopes" (click "SAVE AND CONTINUE")
   - Skip "Test users" (click "SAVE AND CONTINUE")
   - Click "BACK TO DASHBOARD"

5. Now create the OAuth client:
   - Go back to "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `Father Forge Calendar Integration`
   - Under "Authorized redirect URIs", click "+ ADD URI"
   - Add: `http://localhost:8080/calendar.html`
   - Click "CREATE"

6. **IMPORTANT:** Copy your Client ID
   - A popup will show your Client ID and Client Secret
   - Copy the **Client ID** (long string starting with numbers)
   - You don't need the Client Secret for this integration
   - Click "OK"

### Step 4: Configure Father Forge

1. Open `/father-forge/calendar.html` in your browser
   - Or serve with: `python3 -m http.server 8080` from the father-forge directory
   - Then go to: `http://localhost:8080/calendar.html`

2. Paste your Client ID into the text field
3. Click "Save Client ID"
4. Click "Connect Google Calendar"
5. Sign in with your Google account
6. Grant calendar permissions when prompted
7. You should see "Connected to Google Calendar" ✅

### Step 5: Sync Events

Once connected:
1. Click "Sync All Events" to add all 4 key dates
2. Or sync individual events using their "📅 Sync to Calendar" buttons
3. Check your Google Calendar to verify events appear

## Troubleshooting

### "Authorization failed" error
- Make sure redirect URI is exactly: `http://localhost:8080/calendar.html`
- No trailing slash, correct port number
- Serving the file on the same port (8080)

### "Google API not loaded yet"
- Wait a few seconds after page loads
- Check browser console for errors
- Make sure you have internet connection

### Events not appearing in calendar
- Check you're signed in to the correct Google account
- Refresh Google Calendar
- Check calendar permissions were granted
- Look in your "primary" calendar (not other calendars)

### Client ID won't save
- Make sure you copied the full Client ID
- No extra spaces before/after
- Client ID should be very long (70+ characters)

## Security Notes

- Client ID is stored in browser localStorage only
- No secrets or tokens stored on disk
- OAuth tokens expire after 1 hour (re-auth automatically)
- You can disconnect anytime by clicking "Disconnect"

## What Gets Synced

**April 25 Event:**
- Title: 🎯 Father Forge - April 25 Networking Event
- Date: Friday, April 25, 2026, 6:00 PM - 9:00 PM JST
- Location: Midtown BBQ Fushimi, Nagoya, Japan
- Description: International entrepreneur meetup

**Milestone Events (All-day):**
- $500 MRR: April 30, 2026
- $10k MRR: December 31, 2026
- $42k MRR: November 7, 2027

Events are created in your primary Google Calendar and can be edited/deleted like any calendar event.

## Next Steps

After setup:
1. Integrate calendar.html into main Father Forge dashboard
2. Add automatic sync on milestone achievement
3. Add event edit/delete functionality
4. Two-way sync (calendar → Forge)

## Need Help?

If you get stuck:
1. Check browser console for error messages
2. Verify all setup steps were completed
3. Try disconnecting and reconnecting
4. Delete and recreate OAuth credentials if needed
