import React, { useState, useEffect, useRef } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  Keyboard, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  useWindowDimensions,
  StatusBar
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
import { AuthProvider, useAuth } from './context/AuthContext';

// Responsive sizing based on screen size
const getResponsiveStyles = (width, height) => {
  const isLargeScreen = width >= 768; // tablet or larger
  const isSmallScreen = width < 375; // small phones
  const isLandscape = width > height;
  
  // Sidebar width: fixed width on desktop, percentage on mobile
  const sidebarWidth = isLargeScreen ? 280 : width * 0.8; // Changed to 280px to match guidelines
  
  // Adjust font sizes for different screen sizes
  const titleSize = isSmallScreen ? 16 : isLargeScreen ? 20 : 18;
  const textSize = isSmallScreen ? 14 : 16; // More consistent font size
  const iconSize = isSmallScreen ? 16 : 20;
  const buttonSize = isSmallScreen ? 32 : 40;
  
  return {
    sidebarWidth,
    titleSize,
    textSize,
    iconSize,
    buttonSize,
    isLargeScreen,
    isSmallScreen,
    isLandscape
  };
};

// ChatGPT-inspired color palette
const COLORS = {
  light: {
    primary: '#00a67e', // ChatGPT-like accent
    background: '#f9f9f9',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#555555',
    border: '#e0e0e0',
    userBubble: '#d1f1e0', // Soft green bubble for user
    aiBubble: '#ffffff',
    disabled: '#cccccc',
  },
  dark: {
    primary: '#00a67e', // Keep same accent for consistency
    background: '#1e1e1e',
    card: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#444444',
    userBubble: '#155c45', // Darker green for user in dark mode
    aiBubble: '#2a2a2a',
    disabled: '#555555',
  }
};

export default function yolo() {
  // Get screen dimensions (responsive to changes)
  const dimensions = useWindowDimensions();
  const { 
    sidebarWidth, 
    titleSize, 
    textSize, 
    iconSize, 
    buttonSize,
    isLargeScreen,
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
  
  // Get current theme colors
  const getThemeColors = () => isDarkTheme ? COLORS.dark : COLORS.light;
  
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
      flex: 1,
      width: isLargeScreen ? undefined : '100%',
    };
  });
  
  // Sidebar animation style
  const sidebarStyle = useAnimatedStyle(() => {
    const colors = getThemeColors();
    
    return {
      transform: [
        { scale: sidebarScale.value },
        { translateX: sidebarTranslateX.value }
      ],
      position: isLargeScreen ? 'relative' : 'absolute',
      zIndex: 100,
      height: '100%',
      width: sidebarWidth,
      maxWidth: sidebarWidth,
      left: 0,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: colors.card,
    };
  });
  
  // Container animation style for theme transitions
  const containerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      themeAnimValue.value,
      [0, 1],
      [COLORS.light.background, COLORS.dark.background]
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

  // Render header component
  const renderHeader = () => {
    const colors = getThemeColors();
    
    return (
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border 
        }
      ]}>
        {!isLargeScreen && (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleSidebar}
          >
            <FontAwesome 
              name="bars" 
              size={iconSize} 
              color={colors.text} 
            />
          </TouchableOpacity>
        )}
        
        <Text style={[
          styles.headerTitle, 
          { 
            fontSize: titleSize * 1.4,
            color: colors.text, 
            
          }
        ]}>
          Eve – Smart Therapy, Real Support
        </Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={toggleTheme}
        >
          <FontAwesome 
            name={isDarkTheme ? "sun-bright" : "moon-o"} 
            size={iconSize} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Render the conversation view (historic conversations)
  const renderConversationView = () => {
    const colors = getThemeColors();
    
    return (
      <View style={styles.conversationContainer}>
        <View style={[
          styles.conversationHeader, 
          { 
            backgroundColor: colors.card,
            borderBottomColor: colors.border 
          }
        ]}>
          <TouchableOpacity 
            onPress={() => handleNavigate('dashboard')}
            style={styles.backButton}
          >
            <FontAwesome name="arrow-left" size={iconSize} color={colors.text} />
          </TouchableOpacity>
          <Text style={[
            styles.conversationTitle, 
            { 
              fontSize: titleSize * 0.8,
              color: colors.text 
            }
          ]}>
            Conversation #{currentConversationId}
          </Text>
        </View>
        <View style={[
          styles.messageContainer,
          { backgroundColor: colors.background }
        ]}>
          <Text style={[
            styles.messageText, 
            { 
              fontSize: textSize,
              color: colors.text 
            }
          ]}>
            This is where the conversation content would appear.
          </Text>
        </View>
      </View>
    );
  };

  // Render the chat dashboard view
  const renderChatDashboard = () => {
    const colors = getThemeColors();
    
    return (
      <KeyboardAvoidingView 
        style={[
          styles.dashboardContainer,
          { backgroundColor: colors.background }
        ]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {/* Messages container - scrollable area for chat */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyMessagesContent
          ]}
          ref={scrollViewRef}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Text style={[
                styles.welcomeTitle, 
                { 
                  fontSize: titleSize,
                  color: colors.text
                }
              ]}>
                How can I help you today?
              </Text>
              
              <Text style={[
                styles.welcomeSubtitle, 
                { 
                  fontSize: textSize,
                  color: colors.textSecondary 
                }
              ]}>
                Type a message to begin your conversation
              </Text>
            </View>
          )}
        
          {messages.map(message => (
            <View 
              key={message.id} 
              style={[
                styles.messageBubble,
                message.sender === 'user' 
                  ? [styles.userBubble, { backgroundColor: colors.userBubble }]
                  : [styles.aiBubble, { 
                      backgroundColor: colors.aiBubble,
                      borderColor: colors.border 
                    }]
              ]}
            >
              <Text style={[
                styles.messageText,
                { 
                  fontSize: textSize,
                  color: message.sender === 'user' 
                    ? (isDarkTheme ? '#ffffff' : '#333333') 
                    : colors.text
                }
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
              { 
                backgroundColor: colors.aiBubble,
                borderColor: colors.border,
                paddingVertical: 8,
                paddingHorizontal: 14
              }
            ]}>
              <Text style={{ 
                fontSize: textSize * 0.85,
                color: colors.textSecondary
              }}>
                Eve is typing
                <Text style={styles.typingDots}>...</Text>
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Chat input area at the bottom */}
        <View style={[
          styles.chatInputWrapper,
          { 
            backgroundColor: colors.card,
            borderTopColor: colors.border
          }
        ]}>
          <View 
            style={[
              styles.chatInputContainer,
              { 
                backgroundColor: isDarkTheme ? colors.background : '#F5F5F5',
                borderColor: colors.border,
                height: Math.max(buttonSize + 10, 50)
              }
            ]}
          >
            {/* Microphone button (inside the input) */}
            <Animated.View style={micButtonAnimStyle}>
              <TouchableOpacity 
                onPress={handleMicPress}
                style={[
                  styles.micButton, 
                  { 
                    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    width: buttonSize, 
                    height: buttonSize, 
                    borderRadius: buttonSize / 2
                  },
                  isRecording && { backgroundColor: 'rgba(255, 65, 54, 0.1)' }
                ]}
              >
                <FontAwesome 
                  name={isRecording ? "stop-circle" : "microphone"} 
                  size={buttonSize * 0.5} 
                  color={isRecording 
                    ? "#FF4136" 
                    : colors.text} 
                />
              </TouchableOpacity>
            </Animated.View>

            <TextInput
              ref={inputRef}
              style={[
                styles.chatInput,
                { 
                  fontSize: textSize,
                  color: colors.text 
                }
              ]}
              placeholder="Type a message..."
              placeholderTextColor={isDarkTheme ? "#777" : "#999"}
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline={false}
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                { 
                  backgroundColor: chatMessage.trim() ? colors.primary : colors.disabled,
                  width: buttonSize, 
                  height: buttonSize, 
                  borderRadius: buttonSize / 2
                }
              ]} 
              onPress={handleSendMessage}
              disabled={!chatMessage.trim()}
            >
              <FontAwesome 
                name="paper-plane" 
                size={buttonSize * 0.45} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <AuthProvider>
      <SafeAreaView style={styles.safeAreaContainer}>
        <Animated.View style={[styles.container, containerStyle]}>
          <StatusBar 
            barStyle={isDarkTheme ? "light-content" : "dark-content"} 
            backgroundColor={isDarkTheme ? COLORS.dark.background : COLORS.light.background}
          />
          
          {/* Main app structure */}
          <View style={styles.appLayout}>
            {/* Header Section - Always visible */}
            {renderHeader()}
            
            {/* Main Content Area */}
            <View style={styles.mainContainer}>
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
              
              {/* Main content area */}
              <Animated.View style={contentStyle}>
                {activeView === 'conversation' && currentConversationId 
                  ? renderConversationView() 
                  : renderChatDashboard()
                }
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  appLayout: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
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
  dashboardContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    textAlign: 'center',
    maxWidth: 250,
  },
  conversationContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  conversationTitle: {
    fontWeight: '600',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Message display styles
  messagesContainer: {
    flex: 1,
    width: '100%',
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyMessagesContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 2,
    borderWidth: 1,
  },
  messageText: {
    lineHeight: 22,
  },
  typingDots: {
    letterSpacing: 2,
  },
  // Chat input styles
  chatInputWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: '100%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  micButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chatInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 40,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
