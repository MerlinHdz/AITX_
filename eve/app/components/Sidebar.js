import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Image
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle,
  withSequence,
  withDelay,
  Easing,
  interpolateColor
} from 'react-native-reanimated';
// Import Tailwind styles
import styles, { tw } from '../styles/tailwind';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.3; // 30% of screen width

const Sidebar = ({ 
  onSelectConversation,
  currentConversationId,
  isDarkTheme = false
}) => {
  // State for tabs
  const [activeTab, setActiveTab] = useState('conversations');
  
  // State for conversations
  const [conversations, setConversations] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // State for reflections
  const [reflection, setReflection] = useState('');
  const [reflectionHistory, setReflectionHistory] = useState([]);
  const [reflectionData, setReflectionData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [3, 4, 2, 5, 4, 3, 4],
        color: (opacity = 1) => isDarkTheme 
          ? `rgba(200, 200, 255, ${opacity})` 
          : `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2
      }
    ]
  });
  
  // Animation values
  const tabIndicatorPosition = useSharedValue(0);
  const conversationsOpacity = useSharedValue(1);
  const reflectionsOpacity = useSharedValue(0);
  const themeAnimValue = useSharedValue(isDarkTheme ? 1 : 0);
  
  useEffect(() => {
    // Animate theme change
    themeAnimValue.value = withTiming(isDarkTheme ? 1 : 0, {
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isDarkTheme]);
  
  useEffect(() => {
    // Load conversations initially
    loadConversations();
    
    // Load reflections if tab is reflections
    if (activeTab === 'reflections') {
      loadReflections();
    }
  }, [activeTab]);
  
  // Animation styles
  const containerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      themeAnimValue.value,
      [0, 1],
      ['#FFFFFF', '#1E1E1E']
    );
    
    return {
      backgroundColor,
    };
  });
  
  const tabIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabIndicatorPosition.value }],
    };
  });
  
  const conversationsTabStyle = useAnimatedStyle(() => {
    return {
      opacity: conversationsOpacity.value,
    };
  });
  
  const reflectionsTabStyle = useAnimatedStyle(() => {
    return {
      opacity: reflectionsOpacity.value,
    };
  });
  
  // Tab switch function with animation
  const switchTab = (tab) => {
    if (tab === activeTab) return;
    
    const isToReflections = tab === 'reflections';
    
    // Animate tab indicator
    tabIndicatorPosition.value = withTiming(
      isToReflections ? SIDEBAR_WIDTH / 2 : 0, 
      { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
    );
    
    // Fade out current content
    if (isToReflections) {
      conversationsOpacity.value = withTiming(0, { duration: 200 });
      reflectionsOpacity.value = withDelay(
        150, 
        withTiming(1, { duration: 250 })
      );
    } else {
      reflectionsOpacity.value = withTiming(0, { duration: 200 });
      conversationsOpacity.value = withDelay(
        150, 
        withTiming(1, { duration: 250 })
      );
    }
    
    setActiveTab(tab);
  };
  
  // Mock function to load conversations
  const loadConversations = async () => {
    setLoading(true);
    // This would be an API call in a real app
    setTimeout(() => {
      const newConversations = [
        { id: '1', title: 'Morning check-in', preview: 'How are you feeling today?', date: '2023-06-01' },
        { id: '2', title: 'Anxiety discussion', preview: 'Let\'s talk about what\'s causing your anxiety.', date: '2023-06-02' },
        { id: '3', title: 'Progress review', preview: 'You\'ve made great progress this week!', date: '2023-06-03' },
        { id: '4', title: 'Stress management', preview: 'Here are some techniques to manage stress.', date: '2023-06-04' },
        { id: '5', title: 'Weekly reflection', preview: 'What did you learn about yourself this week?', date: '2023-06-05' },
      ];
      
      setConversations(page === 1 ? newConversations : [...conversations, ...newConversations]);
      setLoading(false);
    }, 1000);
  };
  
  // Mock function to load reflections
  const loadReflections = async () => {
    // This would be an API call in a real app
    setTimeout(() => {
      const newReflections = [
        { id: '1', content: 'I felt more calm today after practicing mindfulness.', date: '2023-06-01', score: 4 },
        { id: '2', content: 'Had a stressful day at work, but managed to use breathing techniques.', date: '2023-06-02', score: 3 },
        { id: '3', content: 'Slept better last night and feel more energetic.', date: '2023-06-03', score: 5 },
        { id: '4', content: 'Struggled with anxiety before a meeting, but it went well.', date: '2023-06-04', score: 2 },
        { id: '5', content: 'Overall good day, practiced gratitude before bed.', date: '2023-06-05', score: 4 },
      ];
      
      setReflectionHistory(newReflections);
      
      // Update chart data
      setReflectionData({
        labels: newReflections.map(r => r.date.split('-')[2]), // Day of month
        datasets: [
          {
            data: newReflections.map(r => r.score),
            color: (opacity = 1) => isDarkTheme 
              ? `rgba(200, 200, 255, ${opacity})` 
              : `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2
          }
        ]
      });
    }, 1000);
  };
  
  // Function to submit a new reflection
  const submitReflection = () => {
    if (reflection.trim() === '') return;
    
    // Add animation to button
    submitButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // This would be an API call in a real app
    const newReflection = {
      id: Date.now().toString(),
      content: reflection,
      date: new Date().toISOString().split('T')[0],
      score: Math.floor(Math.random() * 5) + 1 // Mock score between 1-5
    };
    
    setReflectionHistory([newReflection, ...reflectionHistory]);
    setReflection('');
    
    // Update chart data
    const newLabels = [newReflection.date.split('-')[2], ...reflectionData.labels.slice(0, 6)];
    const newData = [newReflection.score, ...reflectionData.datasets[0].data.slice(0, 6)];
    
    setReflectionData({
      labels: newLabels,
      datasets: [
        {
          data: newData,
          color: (opacity = 1) => isDarkTheme 
            ? `rgba(200, 200, 255, ${opacity})` 
            : `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 2
        }
      ]
    });
  };
  
  // Animation for submit button
  const submitButtonScale = useSharedValue(1);
  const submitButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: submitButtonScale.value }],
    };
  });
  
  // Function to load more conversations (pagination)
  const loadMore = () => {
    setPage(page + 1);
    loadConversations();
  };
  
  // Render conversation card
  const renderConversationCard = (conversation) => {
    const isActive = currentConversationId === conversation.id;
    
    return (
      <TouchableOpacity
        key={conversation.id}
        style={tw`p-3 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} ${isActive ? (isDarkTheme ? 'bg-gray-700 border-l-white' : 'bg-gray-100 border-l-black') : (isDarkTheme ? 'border-l-gray-700' : 'border-l-gray-200')} rounded-md mb-3 border-l-2`}
        onPress={() => onSelectConversation(conversation.id)}
      >
        <Text style={tw`font-bold mb-1 ${isDarkTheme ? 'text-white' : 'text-black'}`}>
          {conversation.title}
        </Text>
        <Text style={tw`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'} text-xs mb-2`} numberOfLines={2}>
          {conversation.preview}
        </Text>
        <Text style={tw`${isDarkTheme ? 'text-gray-500' : 'text-gray-400'} text-[10px] self-end`}>
          {conversation.date}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render reflection card
  const renderReflectionCard = (reflection) => {
    return (
      <View 
        key={reflection.id} 
        style={tw`p-3 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} rounded-md mb-3`}
      >
        <Text style={tw`${isDarkTheme ? 'text-gray-500' : 'text-gray-400'} text-[10px] mb-1`}>
          {reflection.date}
        </Text>
        <Text style={tw`${isDarkTheme ? 'text-white' : 'text-black'} text-xs mb-2`}>
          {reflection.content}
        </Text>
        <View style={tw`flex-row`}>
          {[...Array(5)].map((_, i) => (
            <FontAwesome
              key={i}
              name="star"
              size={14}
              color={i < reflection.score ? '#FFD700' : isDarkTheme ? '#555' : '#E0E0E0'}
            />
          ))}
        </View>
      </View>
    );
  };
  
  // AI insight component
  const renderAIInsight = () => {
    return (
      <View style={tw`p-3 ${isDarkTheme ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-md mb-4 border-l-2 ${isDarkTheme ? 'border-blue-500' : 'border-blue-400'}`}>
        <View style={tw`flex-row items-center mb-1.5`}>
          <FontAwesome 
            name="lightbulb-o" 
            size={16} 
            color={isDarkTheme ? "#FFD700" : "#4682b4"} 
          />
          <Text style={tw`font-bold ml-1.5 ${isDarkTheme ? 'text-white' : 'text-black'}`}>
            AI Insight
          </Text>
        </View>
        <Text style={tw`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-xs`}>
          Based on your recent reflections, you've been making steady progress in managing stress.
          Your scores have improved over time, indicating that the mindfulness techniques are working well for you.
        </Text>
      </View>
    );
  };
  
  return (
    <Animated.View style={[tw`h-full`, containerStyle]}>
      {/* Profile section */}
      <View style={tw`items-center py-8 px-2 ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'} border-b`}>
        <View style={tw`rounded-full overflow-hidden shadow-md mb-2.5 border-2 ${isDarkTheme ? 'border-gray-700' : 'border-white'}`}>
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }}
            style={tw`w-15 h-15 rounded-full`}
          />
        </View>
        <Text style={tw`font-bold ${isDarkTheme ? 'text-white' : 'text-black'}`}>
          User Name
        </Text>
      </View>
      
      {/* Tab navigation */}
      <View style={tw`flex-row ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'} border-b relative`}>
        <Animated.View 
          style={[
            tw`absolute bottom-0 w-1/2 h-0.5 ${isDarkTheme ? 'bg-white' : 'bg-black'}`, 
            tabIndicatorStyle
          ]} 
        />
        
        <TouchableOpacity
          style={tw`flex-1 py-4 items-center z-1`}
          onPress={() => switchTab('conversations')}
        >
          <Text style={tw`${activeTab === 'conversations' ? 'font-bold' : ''} ${isDarkTheme ? 'text-white' : 'text-black'}`}>
            Conversations
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={tw`flex-1 py-4 items-center z-1`}
          onPress={() => switchTab('reflections')}
        >
          <Text style={tw`${activeTab === 'reflections' ? 'font-bold' : ''} ${isDarkTheme ? 'text-white' : 'text-black'}`}>
            Reflections
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content container */}
      <ScrollView style={tw`flex-1 px-2.5 py-2`}>
        {/* Conversations Tab Content */}
        <Animated.View 
          style={[
            { display: activeTab === 'conversations' ? 'flex' : 'none' },
            conversationsTabStyle
          ]}
        >
          {conversations.map(renderConversationCard)}
          
          {loading ? (
            <Text style={tw`text-center py-2.5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading...
            </Text>
          ) : (
            <TouchableOpacity 
              style={tw`p-2.5 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'} rounded-md items-center mt-2.5 mb-5`} 
              onPress={loadMore}
            >
              <Text style={tw`${isDarkTheme ? 'text-white' : 'text-gray-800'} font-medium text-xs`}>
                Load More
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
        
        {/* Reflections Tab Content */}
        <Animated.View 
          style={[
            { display: activeTab === 'reflections' ? 'flex' : 'none' },
            reflectionsTabStyle
          ]}
        >
          {/* New reflection input */}
          <View style={tw`mb-4 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} rounded-md p-2`}>
            <TextInput
              style={tw`h-20 p-2 ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'} rounded-md border text-xs`}
              placeholder="Write your reflection for today..."
              placeholderTextColor={isDarkTheme ? '#888' : '#999'}
              value={reflection}
              onChangeText={setReflection}
              multiline
              color={isDarkTheme ? '#FFF' : '#000'}
            />
            <Animated.View style={submitButtonStyle}>
              <TouchableOpacity 
                style={tw`${isDarkTheme ? 'bg-primary-light' : 'bg-primary'} p-2.5 rounded-md items-center mt-2`}
                onPress={submitReflection}
              >
                <Text style={tw`text-white font-bold text-xs`}>Submit</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* Reflection chart */}
          <View style={tw`mb-4 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'} rounded-md p-2 items-center`}>
            <Text style={tw`font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-black'}`}>
              Mood Trend
            </Text>
            <LineChart
              data={reflectionData}
              width={SIDEBAR_WIDTH * 0.8}
              height={180}
              chartConfig={{
                backgroundColor: isDarkTheme ? '#222' : '#fff',
                backgroundGradientFrom: isDarkTheme ? '#222' : '#fff',
                backgroundGradientTo: isDarkTheme ? '#222' : '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => isDarkTheme 
                  ? `rgba(200, 200, 255, ${opacity})` 
                  : `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => isDarkTheme
                  ? `rgba(255, 255, 255, ${opacity})`
                  : `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={tw`rounded-md mt-1.5`}
            />
          </View>
          
          {/* AI Insight */}
          {renderAIInsight()}
          
          {/* Reflection history */}
          <Text style={tw`font-bold ${isDarkTheme ? 'text-white' : 'text-black'} text-base mt-2 mb-3`}>
            Past Reflections
          </Text>
          {reflectionHistory.map(renderReflectionCard)}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};

export default Sidebar; 