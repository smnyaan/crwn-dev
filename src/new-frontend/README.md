# new-frontend

Figma-based redesign. Nothing here is wired into the app yet — safe to build freely.

## Structure

```
new-frontend/
├── screens/
│   ├── onboarding/     # Onboarding flow screens
│   ├── auth/           # Login, signup, etc.
│   ├── home/           # Home/feed screens
│   ├── profile/        # Profile screens
│   └── community/      # Community/explore screens
└── components/
    ├── ui/             # Buttons, inputs, cards, badges, etc.
    ├── layout/         # Headers, tab bars, containers, etc.
    └── forms/          # Form components
```

## Usage

When a screen/component is ready to replace the old one, import from here instead of `src/screens` or `src/components`.
