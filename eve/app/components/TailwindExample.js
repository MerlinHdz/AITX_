import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { tw } from '../styles/tailwind';
import styles from '../styles/tailwind';

/**
 * Example component showing how to use Tailwind CSS in a React Native component
 */
const TailwindExample = ({ isDarkTheme = false }) => {
  return (
    <View style={tw`flex-1 p-4 ${isDarkTheme ? 'bg-primary-dark' : 'bg-white'}`}>
      {/* Using pre-defined styles from our tailwind.js */}
      <View style={styles.titleContainer}>
        <Text style={[
          styles.title, 
          isDarkTheme && styles.textLight,
        ]}>
          Tailwind CSS Example
        </Text>
      </View>
      
      {/* Composing styles inline with tw */}
      <View style={tw`p-5 mb-4 rounded-lg ${isDarkTheme ? 'bg-accent-dark' : 'bg-accent'}`}>
        <Text style={tw`text-lg mb-2 ${isDarkTheme ? 'text-white' : 'text-black'}`}>
          Using Tailwind in React Native
        </Text>
        <Text style={tw`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
          This component shows how to use Tailwind CSS to style your React Native components.
          You can use both predefined styles and inline tw backtick syntax.
        </Text>
      </View>
      
      {/* Buttons with Tailwind CSS */}
      <View style={tw`flex-row justify-center space-x-4 mt-4`}>
        <TouchableOpacity 
          style={tw`py-3 px-5 bg-primary rounded-full ${isDarkTheme ? 'bg-primary-light' : 'bg-primary'}`}
          onPress={() => console.log('Primary button pressed')}
        >
          <Text style={tw`text-white font-bold text-center`}>
            Primary Button
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={tw`py-3 px-5 rounded-full ${isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'} border`}
          onPress={() => console.log('Secondary button pressed')}
        >
          <Text style={tw`${isDarkTheme ? 'text-white' : 'text-black'} font-bold text-center`}>
            Secondary Button
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Using dynamic styles */}
      <View style={tw`mt-8`}>
        <Text style={[
          tw`font-bold mb-2 text-center`,
          isDarkTheme ? tw`text-white` : tw`text-black`
        ]}>
          Dynamic Styles Example
        </Text>
        
        {/* Using the helper function for dynamic styles */}
        <View style={tw`${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-lg`}>
          <Text style={tw`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            The getDynamicStyles helper function lets you generate styles based on state
            like screen size, theme, and more.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TailwindExample; 