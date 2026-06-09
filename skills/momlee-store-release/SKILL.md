---
name: momlee-store-release
description: Use BEFORE submitting the MomLee app to the Apple App Store or Google Play, or when preparing a release build, store listing, privacy labels, or reviewing submission readiness. A pre-submission checklist covering iOS (Info.plist usage descriptions, App Privacy labels, mandatory account deletion, age rating, ATT, assets, TestFlight), Android (Data Safety form, permissions, target SDK, account deletion, Play assets), shared release hygiene (EAS config, versioning, no debug bypasses, privacy policy URL, RTL/Hebrew, crash-free smoke test), and common rejection pitfalls. Trigger on any store submission or release-build prep.
---

# MomLee Store Release — pre-submission readiness

Run this checklist **before each submission**. A miss here is a rejection or a privacy incident.

## How we build & submit (no Mac → cloud)

Sivan builds without a Mac, so **iOS builds and submission run in the Expo cloud**:

- **Build:** `eas build -p ios` (EAS Build) — compiles on Apple hardware in the cloud, **no Mac / no Xcode**. **EAS manages signing credentials remotely** (certs + provisioning profiles).
- **Submit:** `eas submit -p ios` — uploads the cloud build to **TestFlight / App Store** (no Transporter/Xcode).
- **Android:** `eas build -p android` → `eas submit -p android` (Google Play).
- **Prerequisites:** an **Apple Developer account** (TestFlight/App Store + EAS credential management) and an **Expo (EAS) account**; a **Google Play Developer account** for Android. Stay in the managed workflow — don't `expo prebuild`. Full division of labor + command reference: `../../knowledge/dev-environment.md`.

## iOS (App Store)

- [ ] **Info.plist usage descriptions** for every permission requested, in Hebrew + clear purpose: location (`NSLocationWhenInUseUsageDescription`), camera (`NSCameraUsageDescription`, for KYC selfie), photos (`NSPhotoLibraryUsageDescription`), notifications. A missing/empty string = guaranteed rejection.
- [ ] **App Privacy "nutrition" labels** accurately declare data collected (identity, contact, location, user content) and linkage/tracking. Must match what the app actually does.
- [ ] **Account deletion path is MANDATORY** — an in-app way to delete the account and associated data. Apple rejects apps without it.
- [ ] **Age rating** set correctly for a community/social app with user-generated content.
- [ ] **ATT (App Tracking Transparency)** prompt only if you actually track across apps; otherwise declare no tracking. Don't request it gratuitously.
- [ ] **Assets** — icon, splash, and screenshots meet current size specs for required device classes (and are RTL/Hebrew-correct).
- [ ] **TestFlight** build validated (internal/external) before production submission.

## Android (Google Play)

- [ ] **Data Safety form** completed accurately (collected/shared data, security practices) — must match the iOS labels and reality.
- [ ] **Permission declarations** justified; sensitive permissions explained.
- [ ] **Target SDK** meets Play's current minimum requirement.
- [ ] **Account deletion** available in-app AND via the web deletion URL Play requires.
- [ ] **Play asset specs** — icon, feature graphic, screenshots at required sizes.

## Shared release hygiene

- [ ] **EAS build config** correct (profiles, env, credentials); release uses production profile.
- [ ] **Versioning** — app version + build number bumped and consistent across platforms.
- [ ] **No debug/test bypasses in the release build** — no `__DEV__` auth bypass, no test endpoints, no mock data (see **momlee-security**).
- [ ] **Privacy policy URL** live and linked in both stores.
- [ ] **RTL / Hebrew correctness** verified on real devices across key flows (see **momlee-rtl**).
- [ ] **Crash-free smoke test** of core flows (onboarding, OTP, discovery, meetups, chat) on real iOS + Android devices.

## Common rejection pitfalls

- Missing or vague permission purpose strings.
- No account deletion path.
- Privacy labels / Data Safety form not matching actual data use.
- Requesting permissions the app never uses.
- Debug build artifacts or bypasses shipped to production.
- Login/test credentials not provided to reviewers when the app gates content behind auth.

Privacy data handling: **momlee-privacy** + `../../knowledge/privacy.md`. Integrations driving permissions (Mapbox, KYC camera, Expo Push): `../../knowledge/integrations.md`.
