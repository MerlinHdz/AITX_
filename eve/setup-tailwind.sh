#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")"

# Install dependencies
echo "Installing Tailwind CSS for React Native..."
npm install twrnc@latest

# Create directories if they don't exist
mkdir -p app/styles

echo "Setup complete! You can now use Tailwind CSS in your project."
echo "Check the README.md file for usage instructions."
echo ""
echo "To start using Tailwind CSS, import it in your components:"
echo "import { tw } from '../styles/tailwind';"
echo "import styles from '../styles/tailwind';"
echo ""
echo "Example usage:"
echo "<View style={tw\`flex-1 p-4 bg-white\`}>"
echo "  <Text style={styles.title}>Hello, Tailwind!</Text>"
echo "</View>" 