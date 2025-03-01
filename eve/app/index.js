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
    };
  });
  
  // Sidebar animation style
  const sidebarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: sidebarScale.value },
        { translateX: sidebarTranslateX.value }
      ],
      position: isLargeScreen ? 'relative' : 'absolute',
      zIndex: 100,
      height: '100%',
      width: sidebarWidth,
      left: 0,
      borderRightWidth: 1,
      borderRightColor: isDarkTheme ? '#333333' : '#e0e0e0',
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
        <View style={styles.conversationContainer}>
          <View style={styles.conversationHeader}>
            <TouchableOpacity 
              onPress={() => handleNavigate('dashboard')}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={iconSize} color={isDarkTheme ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
            <Text style={[
              styles.conversationTitle, 
              isDarkTheme && styles.textLight,
              { fontSize: titleSize * 0.8 }
            ]}>
              Conversation #{currentConversationId}
            </Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={[
              styles.messageText, 
              isDarkTheme && styles.textLight,
              { fontSize: textSize }
            ]}>
              This is where the conversation content would appear.
            </Text>
          </View>
        </View>
      );
    }
    
    // Default dashboard view with chat functionality
    return (
      <KeyboardAvoidingView 
        style={styles.dashboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {/* Sidebar toggle button - only on mobile */}
        {!isLargeScreen && (
          <TouchableOpacity 
            style={[styles.sidebarToggle, isDarkTheme && styles.sidebarToggleDark]}
            onPress={toggleSidebar}
          >
            <FontAwesome 
              name="bars" 
              size={iconSize} 
              color={isDarkTheme ? "#FFFFFF" : "#000000"} 
            />
          </TouchableOpacity>
        )}
        
        {/* App title - right aligned for web, centered for mobile */}
        <View style={[
          styles.titleContainer,
          isWebLike ? styles.titleContainerWeb : {}
        ]}>
          <Text style={[
            styles.title, 
            isDarkTheme && styles.textLight, 
            messages.length > 0 && styles.titleSmall,
            { fontSize: messages.length > 0 ? titleSize * 0.8 : titleSize }
          ]}>
            Eve Your Therapist on the Go
          </Text>
        </View>
        
        {/* Messages container */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          ref={scrollViewRef}
        >
          {messages.map(message => (
            <View 
              key={message.id} 
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userBubble : styles.aiBubble,
                message.sender === 'user' 
                  ? (isDarkTheme ? styles.userBubbleDark : {}) 
                  : (isDarkTheme ? styles.aiBubbleDark : {})
              ]}
            >
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                message.sender === 'ai' && isDarkTheme && styles.aiMessageTextDark,
                { fontSize: textSize }
              ]}>
                {message.text}
              </Text>
            </View>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <View style={[
              styles.messageBubble, 
              styles.aiBubble,
              isDarkTheme && styles.aiBubbleDark,
              styles.typingBubble
            ]}>
              <Text style={[
                styles.typingText,
                isDarkTheme && styles.typingTextDark,
                { fontSize: textSize * 0.85 }
              ]}>
                Eve is typing
                <Text style={styles.typingDots}>...</Text>
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Chat input area at the bottom */}
        <View style={[
          styles.chatInputWrapper,
          isWebLike && { paddingHorizontal: 50 }
        ]}>
          <View 
            style={[
              styles.chatInputContainer,
              isDarkTheme && styles.chatInputContainerDark,
              { height: Math.max(buttonSize + 10, 50) }
            ]}
          >
            {/* Microphone button (now inside the input) */}
            <Animated.View style={micButtonAnimStyle}>
              <TouchableOpacity 
                onPress={handleMicPress}
                style={[
                  styles.micButton, 
                  isDarkTheme && styles.micButtonDark,
                  isRecording && styles.micButtonRecording,
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
              style={[
                styles.chatInput,
                isDarkTheme && styles.chatInputDark,
                { fontSize: textSize }
              ]}
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
                styles.sendButton,
                isDarkTheme && styles.sendButtonDark,
                !chatMessage.trim() && styles.sendButtonDisabled,
                !chatMessage.trim() && isDarkTheme && styles.sendButtonDisabledDark,
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
                  : (isDarkTheme ? "#FFFFFF" : "#FFFFFF")} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Theme toggle button */}
        <TouchableOpacity 
          style={[
            styles.themeToggle, 
            isDarkTheme && styles.themeToggleDark,
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
        
        {/* Sidebar overlay - shown when sidebar is visible on mobile */}
        {!isLargeScreen && isSidebarVisible && (
          <TouchableOpacity
            style={styles.sidebarOverlay}
            activeOpacity={1}
            onPress={toggleSidebar}
          />
        )}
        
        {/* Sidebar with animation */}
        <Animated.View style={sidebarStyle}>
          <Sidebar 
            onSelectConversation={handleSelectConversation}
            currentConversationId={currentConversationId}
            isDarkTheme={isDarkTheme}
          />
        </Animated.View>
        
        {/* Main content with animation */}
        <Animated.View style={contentStyle}>
          {renderMainContent()}
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 50,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    paddingTop: Platform.OS === 'web' ? 40 : 40,
  },
  sidebarToggle: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
  },
  sidebarToggleDark: {
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
  },
  titleContainer: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
    zIndex: 5,
  },
  titleContainerWeb: {
    alignItems: 'flex-end',
    paddingRight: 60,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  titleSmall: {
    marginBottom: 10,
  },
  textLight: {
    color: '#FFFFFF',
  },
  themeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 101, // Above sidebar
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
  },
  themeToggleDark: {
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
  },
  conversationContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  conversationTitle: {
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Message display styles
  messagesContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingVertical: 20,
    paddingBottom: 30,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    borderTopRightRadius: 4,
    marginLeft: 50,
  },
  userBubbleDark: {
    backgroundColor: '#4682b4',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 4,
    marginRight: 50,
  },
  aiBubbleDark: {
    backgroundColor: '#333',
  },
  messageText: {
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#000',
  },
  aiMessageTextDark: {
    color: '#fff',
  },
  typingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  typingText: {
    color: '#555',
  },
  typingTextDark: {
    color: '#ccc',
  },
  typingDots: {
    letterSpacing: 2,
  },
  // Chat input styles
  chatInputWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
    marginTop: 10,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 5,
    width: '95%',
    maxWidth: 600,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    transform: [{scale: 1}],
    opacity: 1,
  },
  chatInputContainerDark: {
    backgroundColor: '#2A2A2A',
    borderColor: '#444',
  },
  // New microphone button styles
  micButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  micButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  micButtonRecording: {
    backgroundColor: 'rgba(255, 65, 54, 0.1)',
  },
  chatInput: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10,
    paddingLeft: 5,
    minHeight: 40,
  },
  chatInputDark: {
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDark: {
    backgroundColor: '#4682b4',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  sendButtonDisabledDark: {
    backgroundColor: '#444',
  },
}); 