import { create } from 'twrnc';

// Create a tailwind instance with custom configuration
const tw = create({
  // You can customize your color palette
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4682b4', // Steel blue
          DEFAULT: '#000000', // Black
          dark: '#121212', // Almost black
        },
        secondary: {
          light: '#f5f5f5',
          DEFAULT: '#e0e0e0',
          dark: '#333333',
        },
        accent: {
          DEFAULT: '#f0f0f0',
          dark: '#2A2A2A',
        },
        error: '#FF4136',
        success: '#2ECC40',
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'full': '9999px',
      },
    },
  },
});

// Add custom utilities and components
const styles = {
  // Layout
  container: tw`flex-1`,
  safeArea: tw`flex-1 flex-row`,
  mainContent: tw`flex-1 justify-center items-center`,
  dashboardContainer: tw`flex-1 justify-between items-center relative w-full pt-10`,
  
  // Floating Navbar
  floatingNavbar: tw`absolute top-10 right-10 left-10 z-50 bg-white rounded-xl py-3 px-5 shadow-md`,
  floatingNavbarDark: tw`bg-primary-dark`,
  floatingNavbarTitle: tw`font-bold text-center`,
  floatingNavbarTitleSmall: tw`text-lg`,
  
  // Floating Sidebar
  floatingSidebar: tw`m-4 rounded-xl shadow-lg overflow-hidden`,
  floatingSidebarContent: tw`h-full rounded-xl overflow-hidden`,
  sidebarOverlay: tw`absolute inset-0 bg-black bg-opacity-50 z-50`,
  sidebarToggle: tw`absolute top-5 left-5 z-10 p-2.5 rounded-full bg-gray-200 bg-opacity-30`,
  sidebarToggleDark: tw`bg-gray-800 bg-opacity-50`,
  
  // Titles and Headers
  titleContainer: tw`w-full pt-5 pb-2.5 items-center z-5`,
  titleContainerWeb: tw`items-end pr-15`,
  title: tw`font-bold mb-5 text-center px-10`,
  titleSmall: tw`mb-2.5`,
  
  // Theme
  textLight: tw`text-white`,
  themeToggle: tw`absolute top-5 right-5 z-101 p-2.5 rounded-full bg-gray-200 bg-opacity-30`,
  themeToggleDark: tw`bg-gray-800 bg-opacity-50`,
  
  // Conversation
  conversationContainer: tw`flex-1 w-full p-5`,
  conversationHeader: tw`flex-row items-center py-4 border-b border-gray-200 mb-5`,
  backButton: tw`p-2.5 mr-2.5`,
  conversationTitle: tw`font-bold`,
  messageContainer: tw`flex-1 justify-center items-center`,
  
  // Messages
  messagesContainer: tw`flex-1 w-full px-5`,
  messagesContent: tw`flex-grow justify-end py-5 pb-7.5`,
  messageBubble: tw`max-w-[80%] p-3 rounded-xl mb-2.5`,
  userBubble: tw`self-end bg-primary rounded-tr-sm ml-[50px]`,
  userBubbleDark: tw`bg-primary-light`,
  aiBubble: tw`self-start bg-accent rounded-tl-sm mr-[50px]`,
  aiBubbleDark: tw`bg-accent-dark`,
  messageText: tw`leading-[22px]`,
  userMessageText: tw`text-white`,
  aiMessageText: tw`text-black`,
  aiMessageTextDark: tw`text-white`,
  typingBubble: tw`py-2 px-3.5`,
  typingText: tw`text-gray-600`,
  typingTextDark: tw`text-gray-400`,
  
  // Input
  chatInputWrapper: tw`w-full px-5 items-center mb-5 mt-2.5`,
  chatInputContainer: tw`flex-row items-center bg-secondary-light rounded-full px-3 py-1.5 w-[95%] max-w-[600px] border border-secondary shadow-sm`,
  chatInputContainerDark: tw`bg-accent-dark border-secondary-dark`,
  micButton: tw`justify-center items-center mr-2 bg-black bg-opacity-5`,
  micButtonDark: tw`bg-white bg-opacity-10`,
  micButtonRecording: tw`bg-error bg-opacity-10`,
  chatInput: tw`flex-1 py-2.5 pr-2.5 pl-1.5 min-h-[40px]`,
  chatInputDark: tw`text-white`,
  sendButton: tw`bg-primary justify-center items-center`,
  sendButtonDark: tw`bg-primary-light`,
  sendButtonDisabled: tw`bg-secondary`,
  sendButtonDisabledDark: tw`bg-secondary-dark`,
  
  // Helper for dynamic styles
  getDynamicStyles: (isDarkTheme, isLargeScreen, isWebLike) => {
    return {
      // Dynamic styles based on theme, screen size, etc.
      container: tw`${isDarkTheme ? 'bg-primary-dark' : 'bg-white'}`,
      sidebarStyle: {
        ...tw`h-full border-r z-[100]`,
        ...(isLargeScreen ? tw`relative` : tw`absolute`),
        ...(isDarkTheme ? tw`border-secondary-dark` : tw`border-secondary`),
      },
      floatingSidebarStyle: {
        ...tw`h-full z-[100] overflow-hidden rounded-xl shadow-xl`,
        ...(isLargeScreen ? tw`relative m-4` : tw`absolute my-4 mx-0 left-0`),
        ...(isDarkTheme ? tw`bg-primary-dark` : tw`bg-white`),
        height: isLargeScreen ? 'calc(100% - 32px)' : 'calc(100% - 32px)',
        width: isWebLike ? 280 : (isLargeScreen ? 280 : 'calc(70% - 16px)'),
      },
      floatingNavbarStyle: {
        ...tw`absolute z-50 rounded-xl py-3 px-5 shadow-md`,
        ...(isDarkTheme ? tw`bg-primary-dark` : tw`bg-white`),
        top: 20,
        right: isWebLike ? 80 : 20,
        left: isLargeScreen ? (isWebLike ? 320 : 300) : (isSidebarVisible ? '75%' : 20),
      },
      contentStyle: {
        ...tw`flex-1`,
        width: isLargeScreen ? 'calc(100% - sidebarWidth)' : '100%',
      },
      buttonSize: isLargeScreen ? 40 : 36,
      fontSize: isLargeScreen ? 16 : 14,
      titleSize: isLargeScreen ? 24 : 20,
    }
  }
};

export default styles;
export { tw }; 