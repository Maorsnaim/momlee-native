> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Dev environment — the no-Mac, cloud-first iOS reality

**Iron rule:** The iOS toolchain MUST work without a Mac. **Sivan (who builds the app) does NOT have a Mac.** Maor has one. So the whole iOS path — build, signing, distribution, submission — runs in the **cloud / cross-platform**, and we deliberately keep it that way. Anything that secretly needs a Mac is a bug in our process.

Native work happens on the **`momlee-native`** branch of the app repo.

## Why this constraint exists

A normal RN/iOS flow assumes a Mac (Xcode, iOS Simulator, local signing). We can't assume that. Every decision below — staying in the **Expo managed workflow**, building via **EAS in the cloud**, testing via **Expo Go / dev client** — exists so Sivan can do real iOS work on **Windows/Linux** end to end.

## What Sivan CAN do without a Mac (Windows/Linux)

- **Write code** in any editor.
- **Run on Web** (Expo for web) — fastest inner loop.
- **Run on an Android Emulator** — Android Studio runs on Windows/Linux.
- **Build the iOS app in the cloud via Expo EAS Build** (`eas build -p ios`) — no Mac, no Xcode. EAS compiles on Apple hardware in the cloud and **manages signing credentials remotely** (certs + provisioning profiles).
- **Submit to TestFlight / App Store via EAS Submit** (`eas submit -p ios`) — straight from the cloud build, no Transporter/Xcode.
- **Test on a real iPhone using Expo Go** — scan the QR from `expo start`. No Mac, no cable, no Xcode.

## What requires a Mac → Maor does it

- **iOS Simulator** (Mac-only).
- **Xcode-specific work** and anything needing local Apple tooling.
- **Deep native iOS debugging** (Instruments, native crash symbolication, native module debugging at the Xcode level).

## Division of labor

| Capability | Needs a Mac? | Who does it |
|---|---|---|
| Write app code | No | Sivan |
| Run on Web (Expo web) | No | Sivan |
| Run on Android Emulator | No | Sivan |
| Test on a real iPhone (Expo Go) | No | Sivan |
| iOS Development Build / dev client | No (EAS cloud-built) | Sivan |
| iOS build for TestFlight / App Store (`eas build -p ios`) | No (EAS cloud) | Sivan |
| Submit to TestFlight / App Store (`eas submit -p ios`) | No (EAS cloud) | Sivan |
| Android build / Play release (`eas build -p android`) | No | Sivan |
| OTA update push (`eas update`) | No | Sivan |
| iOS Simulator | **Yes** | **Maor** |
| Xcode-specific work / local Apple tooling | **Yes** | **Maor** |
| Deep native iOS debugging (Instruments, native crash symbolication) | **Yes** | **Maor** |

**Rule of thumb:** if a step needs the iOS Simulator, Xcode, or local Apple tooling, it's **Maor's**. Everything else — including all cloud iOS builds and submissions — is **Sivan's**, on Windows/Linux.

## The important nuance: Expo Go vs Development Build (dev client)

**Expo Go** only runs the native modules that are **bundled into the Expo SDK**. It's perfect while the project sticks to SDK-included native modules.

**The moment the project adds a custom native module or a config plugin that changes native code, Expo Go stops being enough.** At that point Sivan switches to an **EAS-built Development Build (dev client)** installed on her iPhone via **EAS internal distribution** — still **cloud-built, still no Mac**. The QR/`expo start` loop then targets the dev client instead of Expo Go.

**Stay-in-managed-workflow rule:**
- **Prefer the Expo managed workflow + config plugins.** They keep native config declarative, so EAS can build iOS in the cloud and Sivan never needs Xcode.
- **Avoid `expo prebuild` / the bare workflow.** Generating local `ios/` + `android/` native projects pushes you toward local native tooling (i.e. a Mac) and breaks the no-Mac path. Don't do it without explicit approval from Maor.
- Reach for a Development Build (dev client) — not a bare eject — when you need a native module Expo Go lacks.

This dovetails with stack discipline (`stack.md` / `conventions.md`): no unapproved native dependency, and any native addition is a deliberate decision because it changes the test path (Expo Go → dev client).

## Prerequisites (accounts)

- **Apple Developer account** — required for TestFlight / App Store and for EAS to manage iOS signing credentials in the cloud.
- **Expo (EAS) account** — required for `eas build` / `eas submit` / `eas update`.
- **Google Play Developer account** — required for the Android release.

## Command reference

```text
expo start                              # dev server; scan QR with Expo Go (or dev client) on a real iPhone
expo start --web                        # run in the browser (fastest inner loop, no Mac)
eas build -p ios --profile preview      # cloud iOS build (dev client / internal distribution), no Mac
eas build -p ios --profile production   # cloud iOS build for TestFlight / App Store
eas build -p android                    # cloud Android build (APK/AAB)
eas submit -p ios                       # upload the cloud build to TestFlight / App Store
eas submit -p android                   # upload to Google Play
eas update                              # push an OTA JS/asset update (no store round-trip)
```

Related: stack (`stack.md`), conventions / stack discipline (`conventions.md`), store submission checklist (skill **momlee-store-release**), native architecture (skill **momlee-react-native**).
