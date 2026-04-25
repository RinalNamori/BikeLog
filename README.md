# BikeLog

Motorcycle maintenance logging Android app built with React Native + Expo.
Claude garbage in&out, just tryin ai coding
## Features

- **Maintenance Logs** — Track oil changes, repairs, tires, brakes, filters, battery, and inspections
- **Parts Tracker** — Monitor change cycles with mileage progress bars and overdue alerts
- **Cost Tracking** — Automatic per-category and monthly cost summaries
- **Charts** — Monthly cost bar chart, category breakdown, lifetime summary
- **Vehicle Tax** — Annual tax records with 30-day push notification reminders
- **PDF Export** — Generate and share a full maintenance report as PDF
- **Gemini App Actions** — Say "Hey Google, log oil change in BikeLog" to open the log form pre-filled
- **Multi-bike Support** — Manage multiple motorcycles with separate logs per bike

## Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account
eas login

# Build sideloadable APK
eas build --platform android --profile preview
```

## Gemini App Actions Setup

For "Hey Google" voice logging, after building and publishing to Play Console:
1. Go to [Google Search Console](https://search.google.com/search-console) and verify your app
2. Associate the app with your Google Developer account
3. Test: hold power button → say "Log oil change in BikeLog"

## Development

```bash
npm install
npx expo start --android
```

## Tech Stack

| Library | Purpose |
|---|---|
| Expo SDK 54 | Framework |
| expo-router | File-based navigation |
| expo-sqlite | Local database |
| expo-notifications | Push notifications |
| expo-print + expo-sharing | PDF export |
| react-native-paper | Material Design UI |
| zustand | State management |
