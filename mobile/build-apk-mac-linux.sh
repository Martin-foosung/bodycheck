#!/usr/bin/env bash
set -e
npm install
npx expo install --fix
npx expo-doctor
npx eas-cli build -p android --profile preview
