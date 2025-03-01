#!/bin/bash

# Kill any existing Metro processes
pkill -f "expo start" || true

# Start Expo with tunnel mode
npx expo start --host tunnel 