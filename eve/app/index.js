import React, { useState, useEffect, useRef } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  SafeAreaView, 
  TextInput, 
  Keyboard, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  useWindowDimensions 
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle, 
  Easing,
  interpolateColor,
  withSequence 
} from "react-native-reanimated";
import Sidebar from './components/Sidebar';
// Import Tailwind styles
import styles, { tw } from './styles/tailwind';

// Responsive sizing based on screen size
const getResponsiveStyles = (width, height) => {
  const isLargeScreen = width >= 768; // tablet or larger
  const isWebLike = width >= 1024; // desktop or larger browser window
  const isSmallScreen = width < 375; // small phones
  const isLandscape = width > height;
  
  // Sidebar width adjusted for different device sizes
  // For web: fixed width of 300px looks better than percentage
  // For tablets: 30% width provides good balance
  // For mobile: 70% when visible to provide enough space for content
  const sidebarWidth = isWebLike ? 300 : (isLargeScreen ? width * 0.3 : width * 0.7);
  
  // Adjust font sizes for different screen sizes
  const titleSize = isSmallScreen ? 18 : isLargeScreen ? 24 : 22;
  const textSize = isSmallScreen ? 14 : isLargeScreen ? 16 : 15;
  const iconSize = isSmallScreen ? 16 : isLargeScreen ? 22 : 18;
  const buttonSize = isSmallScreen ? 32 : isLargeScreen ? 40 : 36;
  
  return {
    sidebarWidth,
    titleSize,
    textSize,
    iconSize,
    buttonSize,
    isLargeScreen,
    isWebLike,
    isSmallScreen,
    isLandscape
  };
};

export default function Index() {
  // Get screen dimensions (responsive to changes)
  const dimensions = useWindowDimensions();
  const { 
    sidebarWidth, 
    titleSize, 
    textSize, 
    iconSize, 
    buttonSize,
    isLargeScreen,
    isWebLike,
    isSmallScreen
  } = getResponsiveStyles(dimensions.width, dimensions.height);
  
  // State for showing/hiding sidebar on mobile
  const [isSidebarVisible, setIsSidebarVisible] = useState(isLargeScreen);
  
  const micButtonScale = useSharedValue(1);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);
  
  // Animation values for smooth transitions
  const contentOpacity = useSharedValue(1);
  const contentTranslateX = useSharedValue(0);
  const sidebarScale = useSharedValue(1);
  const sidebarTranslateX = useSharedValue(isLargeScreen ? 0 : -sidebarWidth);
  
  // Theme state
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const themeAnimValue = useSharedValue(0);
  
  // Get dynamic Tailwind styles
  const dynamicStyles = styles.getDynamicStyles(isDarkTheme, isLargeScreen, isWebLike);
  
  // Update sidebar visibility when screen size changes
  useEffect(() => {
    if (isLargeScreen) {
      setIsSidebarVisible(true);
      sidebarTranslateX.value = withTiming(0, { duration: 300 });
    } else if (!isSidebarVisible) {
      sidebarTranslateX.value = withTiming(-sidebarWidth, { duration: 300 });
    }
  }, [isLargeScreen, dimensions.width]);
  
  useEffect(() => {
    // Animate theme change
    themeAnimValue.value = withTiming(isDarkTheme ? 1 : 0, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isDarkTheme]);
  
  const micButtonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: micButtonScale.value }],
    };
  });

  // Main content animation style
  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [
        { translateX: contentTranslateX.value },
      ],
      width: isLargeScreen && isSidebarVisible 
        ? dimensions.width - sidebarWidth 
        : '100%',
      marginLeft: isLargeScreen && isSidebarVisible ? sidebarWidth : 0,
      flex: 1,
      paddingTop: 70, // Add space for the floating navbar
    };
  });
  
  // Sidebar animation style - now using the floating sidebar style from Tailwind
  const sidebarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: sidebarScale.value },
        { translateX: sidebarTranslateX.value }
      ],
      ...dynamicStyles.floatingSidebarStyle,
    };
  });
  
  // Floating navbar animation style
  const navbarStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      themeAnimValue.value,
      [0, 1],
      ['#FFFFFF', '#121212']
    );
    
    return {
      backgroundColor,
      ...tw`rounded-xl shadow-lg py-3 px-5`,
      position: 'absolute',
      top: 20,
      left: isLargeScreen ? (isWebLike ? 320 : 300) : 20,
      right: 80,
      zIndex: 90,
    };
  });
  
  // Container animation style for theme transitions
  const containerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      themeAnimValue.value,
      [0, 1],
      ['#FFFFFF', '#121212']
    );
    
    return {
      backgroundColor,
    };
  });

  // Toggle sidebar visibility (for mobile)
  const toggleSidebar = () => {
    if (isLargeScreen) return; // No toggle on large screens
    
    setIsSidebarVisible(!isSidebarVisible);
    sidebarTranslateX.value = withTiming(
      !isSidebarVisible ? 0 : -sidebarWidth,
      { duration: 300 }
    );
  };

  // Handle microphone button press
  const handleMicPress = () => {
    // Animate microphone button
    micButtonScale.value = withSequence(
      withTiming(0.8, { duration: 150 }),
      withTiming(1.1, { duration: 200 }),
      withTiming(1, { duration: 150 })
    );
    
    // Toggle recording state
    setIsRecording(prev => !prev);
    
    if (isRecording) {
      // Stop recording
      // For now, simulate getting text from speech
      const transcription = simulateSpeechToText();
      setChatMessage(prev => prev + transcription);
      
      // Let user know recording has stopped
      Alert.alert(
        "Recording Stopped",
        "Text has been added to your message.",
        [{ text: "OK" }]
      );
    } else {
      // Start recording - simulate
      // For demo purposes, show an alert
      Alert.alert(
        "Recording Started",
        "Speak now... (This is a simulation - in a real app, speech recognition would be active)",
        [{ text: "OK" }]
      );
      
      // Set a timer to automatically stop "recording" after 3 seconds
      setTimeout(() => {
        if (isRecording) {
          handleMicPress(); // Call again to stop recording
        }
      }, 3000);
    }
    
    // Focus the chat input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
  };
  
  // Simulate getting text from speech (this would be replaced with actual speech recognition)
  const simulateSpeechToText = () => {
    const phrases = [
      " I'm feeling anxious today",
      " Can we talk about my stress levels",
      " I had a difficult conversation yesterday",
      " I'm having trouble sleeping lately"
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };
  
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleSelectConversation = (conversationId) => {
    // Animate out
    contentOpacity.value = withTiming(0.5, { duration: 200 });
    contentTranslateX.value = withTiming(20, { duration: 200 });
    
    // Wait and update conversation
    setTimeout(() => {
      setCurrentConversationId(conversationId);
      setActiveView('conversation');
      
      // On mobile, hide sidebar after selection
      if (!isLargeScreen) {
        setIsSidebarVisible(false);
        sidebarTranslateX.value = withTiming(-sidebarWidth, { duration: 300 });
      }
      
      // Animate back in
      contentOpacity.value = withTiming(1, { duration: 300 });
      contentTranslateX.value = withTiming(0, { duration: 300 });
    }, 200);
    
    console.log(`Selected conversation: ${conversationId}`);
  };
  
  const handleNavigate = (view) => {
    // Animate out
    contentOpacity.value = withTiming(0.5, { duration: 200 });
    contentTranslateX.value = withTiming(20, { duration: 200 });
    
    // Scale effect on sidebar
    sidebarScale.value = withTiming(0.98, { duration: 200 });
    
    // Wait and update view
    setTimeout(() => {
      setActiveView(view);
      
      // Animate back in
      contentOpacity.value = withTiming(1, { duration: 300 });
      contentTranslateX.value = withTiming(0, { duration: 300 });
      sidebarScale.value = withTiming(1, { duration: 300 });
    }, 200);
  };
  
  // Store the current conversation if it becomes a real conversation
  useEffect(() => {
    if (messages.length > 0 && !currentConversationId) {
      // Generate a timestamp-based ID for this new conversation
      const newConversationId = `new-${Date.now()}`;
      setCurrentConversationId(newConversationId);
    }
  }, [messages]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Create the user message
    const userMessage = {
      id: Date.now().toString(),
      text: chatMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Add message to state
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input and dismiss keyboard
    setChatMessage('');
    
    // If recording is active, stop it
    if (isRecording) {
      setIsRecording(false);
    }
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate Eve's response after a small delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Sample responses - in a real app, this would come from your AI backend
      const responses = [
        "I understand how you feel. Can you tell me more about that?",
        "That's interesting. How does that make you feel?",
        "I appreciate you sharing that with me. What do you think led to this?",
        "I'm here to listen. Would you like to explore this further?",
        "Thank you for opening up. Is there anything specific you'd like to focus on today?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    }, 1500);
  };

  // Render the appropriate view based on active view state
  const renderMainContent = () => {
    if (activeView === 'conversation' && currentConversationId) {
      // Render conversation view (for historic conversations)
      return (
        <View style={tw`flex-1 w-full p-5`}>
          <View style={tw`flex-row items-center py-4 border-b ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'} mb-5`}>
            <TouchableOpacity 
              onPress={() => handleNavigate('dashboard')}
              style={tw`p-2.5 mr-2.5`}
            >
              <FontAwesome name="arrow-left" size={iconSize} color={isDarkTheme ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
            <Text style={tw`font-bold ${isDarkTheme ? 'text-white' : 'text-black'} text-lg`}>
              Conversation #{currentConversationId}
            </Text>
          </View>
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`${isDarkTheme ? 'text-white' : 'text-black'} text-base`}>
              This is where the conversation content would appear.
            </Text>
          </View>
        </View>
      );
    }
    
    // Default dashboard view with chat functionality
    return (
      <KeyboardAvoidingView 
        style={tw`flex-1 justify-between items-center relative w-full`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {/* Sidebar toggle button - only on mobile */}
        {!isLargeScreen && (
          <TouchableOpacity 
            style={tw`absolute top-5 left-5 z-10 p-2.5 rounded-full ${isDarkTheme ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-200 bg-opacity-30'}`}
            onPress={toggleSidebar}
          >
            <FontAwesome 
              name="bars" 
              size={iconSize} 
              color={isDarkTheme ? "#FFFFFF" : "#000000"} 
            />
          </TouchableOpacity>
        )}
        
        {/* Messages container */}
        <ScrollView
          style={tw`flex-1 w-full px-5`}
          contentContainerStyle={tw`flex-grow justify-end py-5 pb-7.5`}
          ref={scrollViewRef}
        >
          {messages.map(message => (
            <View 
              key={message.id} 
              style={[
                tw`max-w-[80%] p-3 rounded-xl mb-2.5`,
                message.sender === 'user' 
                  ? tw`self-end ${isDarkTheme ? 'bg-primary-light' : 'bg-primary'} rounded-tr-sm ml-[50px]`
                  : tw`self-start ${isDarkTheme ? 'bg-accent-dark' : 'bg-accent'} rounded-tl-sm mr-[50px]`
              ]}
            >
              <Text style={[
                tw`leading-[22px]`,
                message.sender === 'user' 
                  ? tw`text-white`
                  : isDarkTheme ? tw`text-white` : tw`text-black`
              ]}>
                {message.text}
              </Text>
            </View>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <View style={tw`self-start max-w-[80%] p-3 rounded-xl mb-2.5 py-2 px-3.5 ${isDarkTheme ? 'bg-accent-dark' : 'bg-accent'} rounded-tl-sm mr-[50px]`}>
              <Text style={tw`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                Eve is typing
                <Text style={tw`tracking-widest`}>...</Text>
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Chat input area at the bottom */}
        <View style={tw`w-full px-5 items-center mb-5 mt-2.5 ${isWebLike && 'px-[50px]'}`}>
          <View 
            style={tw`flex-row items-center ${isDarkTheme ? 'bg-accent-dark border-secondary-dark' : 'bg-secondary-light border-secondary'} rounded-full px-3 py-1.5 w-[95%] max-w-[600px] border shadow-sm`}
          >
            {/* Microphone button (now inside the input) */}
            <Animated.View style={micButtonAnimStyle}>
              <TouchableOpacity 
                onPress={handleMicPress}
                style={[
                  tw`justify-center items-center mr-2 ${isDarkTheme ? 'bg-white bg-opacity-10' : 'bg-black bg-opacity-5'} ${isRecording && 'bg-error bg-opacity-10'}`,
                  { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }
                ]}
              >
                <FontAwesome 
                  name={isRecording ? "stop-circle" : "microphone"} 
                  size={buttonSize * 0.5} 
                  color={isRecording 
                    ? "#FF4136" 
                    : (isDarkTheme ? "#FFFFFF" : "#000000")} 
                />
              </TouchableOpacity>
            </Animated.View>
          
            <TextInput
              ref={inputRef}
              style={tw`flex-1 py-2.5 pr-2.5 pl-1.5 min-h-[40px] ${isDarkTheme && 'text-white'}`}
              placeholder="Type a message..."
              placeholderTextColor={isDarkTheme ? "#777" : "#999"}
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline={false}
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
              color={isDarkTheme ? "#FFFFFF" : "#000000"}
            />
            <TouchableOpacity 
              style={[
                tw`${!chatMessage.trim() ? (isDarkTheme ? 'bg-secondary-dark' : 'bg-secondary') : (isDarkTheme ? 'bg-primary-light' : 'bg-primary')} justify-center items-center`,
                { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }
              ]} 
              onPress={handleSendMessage}
              disabled={!chatMessage.trim()}
            >
              <FontAwesome 
                name="paper-plane" 
                size={buttonSize * 0.45} 
                color={!chatMessage.trim() 
                  ? (isDarkTheme ? "#555" : "#CCC") 
                  : "#FFFFFF"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <Animated.View style={[tw`flex-1`, containerStyle]}>
      <SafeAreaView style={tw`flex-1 flex-row`}>
        {/* Theme toggle button */}
        <TouchableOpacity 
          style={[
            tw`absolute top-5 right-5 z-[101] p-2.5 rounded-full ${isDarkTheme ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-200 bg-opacity-30'}`,
            { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }
          ]}
          onPress={toggleTheme}
        >
          <FontAwesome 
            name={isDarkTheme ? "sun-o" : "moon-o"} 
            size={buttonSize * 0.5} 
            color={isDarkTheme ? "#FFFFFF" : "#000000"} 
          />
        </TouchableOpacity>
        
        {/* Floating Navbar */}
        <Animated.View style={navbarStyle}>
          <Text style={tw`font-bold text-center ${isDarkTheme ? 'text-white' : 'text-black'} ${messages.length > 0 ? 'text-lg' : 'text-xl'}`}>
            Eve Your Therapist on the Go
          </Text>
        </Animated.View>
        
        {/* Sidebar overlay - shown when sidebar is visible on mobile */}
        {!isLargeScreen && isSidebarVisible && (
          <TouchableOpacity
            style={tw`absolute inset-0 bg-black bg-opacity-50 z-50`}
            activeOpacity={1}
            onPress={toggleSidebar}
          />
        )}
        
        {/* Floating Sidebar with animation */}
        <Animated.View style={sidebarStyle}>
          <View style={tw`h-full rounded-xl overflow-hidden`}>
            <Sidebar 
              onSelectConversation={handleSelectConversation}
              currentConversationId={currentConversationId}
              isDarkTheme={isDarkTheme}
            />
          </View>
        </Animated.View>
        
        {/* Main content with animation */}
        <Animated.View style={contentStyle}>
          {renderMainContent()}
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
} 