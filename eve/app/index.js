import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle, 
  Easing,
  interpolateColor 
} from "react-native-reanimated";
import Sidebar from './components/Sidebar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.3; // 30% of screen width for sidebar

export default function Index() {
  const micOpacity = useSharedValue(1);
  const circleScale = useSharedValue(0);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Animation values for smooth transitions
  const contentOpacity = useSharedValue(1);
  const contentTranslateX = useSharedValue(0);
  const sidebarScale = useSharedValue(1);
  
  // Theme state
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const themeAnimValue = useSharedValue(0);
  
  useEffect(() => {
    // Animate theme change
    themeAnimValue.value = withTiming(isDarkTheme ? 1 : 0, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isDarkTheme]);

  const micStyle = useAnimatedStyle(() => ({
    opacity: micOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleScale.value > 0 ? 1 : 0,
  }));

  // Main content animation style
  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [
        { translateX: contentTranslateX.value },
      ],
    };
  });
  
  // Sidebar animation style
  const sidebarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: sidebarScale.value },
      ],
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

  const startAnimation = () => {
    micOpacity.value = withTiming(0, { duration: 500 });
    circleScale.value = withTiming(1, { duration: 600 });
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

  // Render the appropriate view based on active view state
  const renderMainContent = () => {
    if (activeView === 'conversation' && currentConversationId) {
      // Render conversation view
      return (
        <View style={styles.conversationContainer}>
          <View style={styles.conversationHeader}>
            <TouchableOpacity 
              onPress={() => handleNavigate('dashboard')}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={18} color={isDarkTheme ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
            <Text style={[styles.conversationTitle, isDarkTheme && styles.textLight]}>
              Conversation #{currentConversationId}
            </Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, isDarkTheme && styles.textLight]}>
              This is where the conversation content would appear.
            </Text>
          </View>
        </View>
      );
    }
    
    // Default dashboard view
    return (
      <View style={styles.dashboardContainer}>
        <Text style={[styles.title, isDarkTheme && styles.textLight]}>Eve Your Therapist on the Go</Text>

        <Animated.View style={[micStyle, styles.micContainer]}>
          <TouchableOpacity onPress={startAnimation}>
            <FontAwesome name="microphone" size={40} color={isDarkTheme ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.circle, circleStyle, isDarkTheme && styles.circleDark]} />
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Theme toggle button */}
        <TouchableOpacity 
          style={styles.themeToggle}
          onPress={toggleTheme}
        >
          <FontAwesome 
            name={isDarkTheme ? "sun-o" : "moon-o"} 
            size={20} 
            color={isDarkTheme ? "#FFFFFF" : "#000000"} 
          />
        </TouchableOpacity>
        
        {/* Sidebar with animation */}
        <Animated.View style={[styles.sidebarContainer, sidebarStyle]}>
          <Sidebar 
            onSelectConversation={handleSelectConversation}
            currentConversationId={currentConversationId}
            isDarkTheme={isDarkTheme}
          />
        </Animated.View>
        
        {/* Main content with animation */}
        <Animated.View style={[styles.mainContent, contentStyle]}>
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
  sidebarContainer: {
    width: SIDEBAR_WIDTH,
    height: '100%',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  micContainer: {
    marginBottom: 5,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 150,
    backgroundColor: 'black',
  },
  circleDark: {
    backgroundColor: '#4682b4',
  },
  textLight: {
    color: '#FFFFFF',
  },
  themeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
  },
}); 