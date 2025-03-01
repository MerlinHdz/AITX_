# Using Tailwind CSS in the Eve App

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling through the [twrnc](https://github.com/jaredh159/twrnc) package, which brings Tailwind's utility-first approach to React Native.

## Setup

The project is already configured with Tailwind CSS. Here's what's included:

1. A centralized styling file: `eve/app/styles/tailwind.js`
2. The `twrnc` package in dependencies 

## How to Use

There are two main ways to use Tailwind CSS in your components:

### 1. Pre-defined styles from the tailwind.js file

```javascript
import styles from '../styles/tailwind';

// In your component:
<View style={styles.container}>
  <Text style={styles.title}>Hello World</Text>
</View>

// With conditionals:
<Text style={[
  styles.messageText,
  message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
  isDarkTheme && styles.textLight
]}>
  {message.text}
</Text>
```

### 2. Inline styles with the `tw` template function

```javascript
import { tw } from '../styles/tailwind';

// In your component:
<View style={tw`flex-1 p-4 bg-white`}>
  <Text style={tw`text-lg font-bold text-center`}>
    Hello World
  </Text>
</View>

// With conditionals:
<View style={tw`p-4 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
  <Text style={tw`${isDarkTheme ? 'text-white' : 'text-black'}`}>
    Dynamic theming
  </Text>
</View>
```

### 3. Helper function for dynamic styles

For complex dynamic styles based on multiple conditions, use the `getDynamicStyles` helper:

```javascript
import styles from '../styles/tailwind';

// In your component:
const { buttonSize, fontSize, container } = styles.getDynamicStyles(
  isDarkTheme, 
  isLargeScreen,
  isWebLike
);

// Then use these values in your component
<View style={container}>
  <TouchableOpacity 
    style={{ width: buttonSize, height: buttonSize }}
  >
    {/* Button content */}
  </TouchableOpacity>
</View>
```

## Customization

To customize Tailwind's theme or add new utilities, modify the configuration in `eve/app/styles/tailwind.js`.

## Example Component

Check out `eve/app/components/TailwindExample.js` for a complete example of using Tailwind CSS in a component.

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [twrnc GitHub Repository](https://github.com/jaredh159/twrnc) 