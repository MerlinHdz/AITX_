import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import Sidebar from './components/Sidebar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.3; // 30% of screen width for sidebar

export default function Index() {
  const micOpacity = useSharedValue(1); // Opacidad del micrófono
  const circleScale = useSharedValue(0); // Tamaño del círculo
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const micStyle = useAnimatedStyle(() => ({
    opacity: micOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleScale.value > 0 ? 1 : 0, // Evita que el círculo parpadee
  }));

  const startAnimation = () => {
    micOpacity.value = withTiming(0, { duration: 500 }); // Micrófono desaparece
    circleScale.value = withTiming(1, { duration: 600 }); // Círculo crece
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    // Here you would load the conversation data
    console.log(`Selected conversation: ${conversationId}`);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar - now always visible */}
      <View style={styles.sidebarContainer}>
        <Sidebar 
          isVisible={true}
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversationId}
        />
      </View>
      
      {/* Main content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>Eve Your Therapist on the Go</Text>

        {/* Micrófono con animación */}
        <Animated.View style={[micStyle, styles.micContainer]}>
          <TouchableOpacity onPress={startAnimation}>
            <FontAwesome name="microphone" size={40} color="black" />
          </TouchableOpacity>
        </Animated.View>

        {/* Círculo animado */}
        <Animated.View style={[styles.circle, circleStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Horizontal layout
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
}); 