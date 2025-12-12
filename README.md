# MobileDear 📱

**MobileDear** is a cutting-edge mobile e-commerce application engineered with **React Native** and **Expo**. It delivers a high-performance cross-platform experience (Android & iOS) with a robust Admin Dashboard for comprehensive resource management.

[![Expo](https://img.shields.io/badge/Expo-SDK_51-000020.svg?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 🏗 Technology Architecture

### Core Stack

- **Framework**: [Expo SDK 51](https://expo.dev/) (Managed Workflow)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict Typing)
- **Engine**: React Native 0.74

### Frontend Ecosystem

- **Navigation**: [Expo Router v3](https://docs.expo.dev/router/introduction/) (File-based routing, Deep linking)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Flux-principles, lightweight)
- **Data Synchronization**: [TanStack Query v5](https://tanstack.com/query/latest) (Server state management, Caching, Optimistic updates)
- **Networking**: Axios (HTTP Client)

### UI/UX Implementation

- **Design System**: [NativeWind v4](https://www.nativewind.dev/) (TailwindCSS compliant)
- **Iconography**: [Lucide React Native](https://lucide.dev/) (Consistent, clean SVG icons)
- **Components**: Custom reusable component library located in `components/ui`
- **Typography**: Custom font integration via `expo-font`

### Storage & Native Integration

- **Local Persistence**: `@react-native-async-storage/async-storage`
- **Image Handling**: `expo-image`, `expo-image-picker`
- **Device Features**: `expo-location`, `expo-haptics`, `expo-blur`

---

## ⚙️ System Requirements

To ensure a smooth development environment, the following prerequisites are **mandatory**:

| Requirement         | Version                    | Note                                |
| :------------------ | :------------------------- | :---------------------------------- |
| **Node.js**         | `v18.18.0` (LTS) or newer  | Recommended `v20.x`                 |
| **Package Manager** | `npm` v9+ or `yarn` v1.22+ | `npm` is default                    |
| **Expo CLI**        | `v6.x`                     | Global install: `npm i -g expo-cli` |
| **JDK**             | JDK 11 or 17               | Required for Android Builds         |
| **Android Studio**  | Latest Stable              | For Android Emulator & SDK          |
| **Xcode**           | v15+ (macOS only)          | Required for iOS Simulator          |

> **Note**: For Windows/Linux users, iOS development is only possible via physical device with Expo Go, or EAS Build.

---

## 🚀 Getting Started

### 1. Environmental Setup

Clone the repository and install dependencies:

```bash
# Clone repository
git clone <repository_url>
cd MobileDear

# Install dependencies (Legacy Peer Deps might be needed depending on npm version)
npm install
```

### 2. Configuration

Create a `.env` file (if applicable in future) or configure via `Constants`.
_Currently, API endpoints are configured in `Config.ts` or `Constants.ts`._

### 3. Execution

Launch the development server:

```bash
# Clear cache and start (Recommended for first run)
npx expo start -c
```

#### Running on Simulators/Emulators

- **Android**: Press `a` in the terminal.
- **iOS**: Press `i` in the terminal.

#### Running on Physical Device

1. Download **Expo Go** from Play Store or App Store.
2. Scan the QR Code displayed in the terminal.
   - **Android**: Scan directly with Expo Go.
   - **iOS**: Scan with Camera app.

---

## 📂 Engineering Structure

We adhere to a strict modular architecture to ensure scalability. See [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) for the detailed file tree.

- **`app/`**: Route-based components (Pages).
- **`src/services/`**: API abstraction layer.
- **`store/`**: Global state slices.
- **`components/ui/`**: Atomic design components.

---

## 🤝 Contribution Guidelines

1.  **Branching Strategy**: Use `feature/` or `fix/` prefixes (e.g., `feature/user-profile`).
2.  **Commits**: Conventional Commits style recommended (e.g., `feat: add login screen`).
3.  **Linting**: Ensure no strict TypeScript errors before pushing.

---

## � Licensing

This project is proprietary. All rights reserved..

