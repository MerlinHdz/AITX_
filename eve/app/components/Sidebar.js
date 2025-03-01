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
      borderRightColor: interpolateColor(
        themeAnimValue.value,
        [0, 1],
        ['#e0e0e0', '#333333']
      ),
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
        style={[
          styles.card, 
          isActive && styles.activeCard,
          isDarkTheme && styles.cardDark,
          isActive && isDarkTheme && styles.activeCardDark
        ]}
        onPress={() => onSelectConversation(conversation.id)}
      >
        <Text style={[
          styles.cardTitle,
          isDarkTheme && styles.textLight
        ]}>
          {conversation.title}
        </Text>
        <Text style={[
          styles.cardPreview,
          isDarkTheme && styles.textLightSecondary
        ]} numberOfLines={2}>
          {conversation.preview}
        </Text>
        <Text style={[
          styles.cardDate,
          isDarkTheme && styles.textLightTertiary
        ]}>
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
        style={[
          styles.reflectionCard,
          isDarkTheme && styles.cardDark
        ]}
      >
        <Text style={[
          styles.reflectionDate,
          isDarkTheme && styles.textLightTertiary
        ]}>
          {reflection.date}
        </Text>
        <Text style={[
          styles.reflectionContent,
          isDarkTheme && styles.textLight
        ]}>
          {reflection.content}
        </Text>
        <View style={styles.reflectionScore}>
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
      <View style={[
        styles.insightContainer,
        isDarkTheme && styles.insightContainerDark
      ]}>
        <View style={styles.insightHeader}>
          <FontAwesome 
            name="lightbulb-o" 
            size={16} 
            color={isDarkTheme ? "#FFD700" : "#000"} 
          />
          <Text style={[
            styles.insightTitle,
            isDarkTheme && styles.textLight
          ]}>
            AI Insight
          </Text>
        </View>
        <Text style={[
          styles.insightText,
          isDarkTheme && styles.textLightSecondary
        ]}>
          Based on your recent reflections, you've been making steady progress in managing stress.
          Your scores have improved over time, indicating that the mindfulness techniques are working well for you.
        </Text>
      </View>
    );
  };
  
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Profile section */}
      <View style={[
        styles.profileSection,
        isDarkTheme && styles.profileSectionDark
      ]}>
        <Image
          source={{ uri: 'https://via.placeholder.com/60' }}
          style={styles.profileImage}
        />
        <Text style={[
          styles.profileName,
          isDarkTheme && styles.textLight
        ]}>
          User Name
        </Text>
      </View>
      
      {/* Tab navigation */}
      <View style={[
        styles.tabContainer,
        isDarkTheme && styles.tabContainerDark
      ]}>
        <Animated.View 
          style={[
            styles.tabIndicator, 
            tabIndicatorStyle,
            isDarkTheme && styles.tabIndicatorDark
          ]} 
        />
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => switchTab('conversations')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'conversations' && styles.activeTabText,
            isDarkTheme && styles.textLight,
            activeTab === 'conversations' && isDarkTheme && styles.activeTabTextDark
          ]}>
            Conversations
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => switchTab('reflections')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'reflections' && styles.activeTabText,
            isDarkTheme && styles.textLight,
            activeTab === 'reflections' && isDarkTheme && styles.activeTabTextDark
          ]}>
            Reflections
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content container */}
      <ScrollView style={styles.contentContainer}>
        {/* Conversations Tab Content */}
        <Animated.View 
          style={[
            { display: activeTab === 'conversations' ? 'flex' : 'none' },
            conversationsTabStyle
          ]}
        >
          {conversations.map(renderConversationCard)}
          
          {loading ? (
            <Text style={[
              styles.loadingText,
              isDarkTheme && styles.textLightTertiary
            ]}>
              Loading...
            </Text>
          ) : (
            <TouchableOpacity 
              style={[
                styles.loadMoreButton,
                isDarkTheme && styles.loadMoreButtonDark
              ]} 
              onPress={loadMore}
            >
              <Text style={[
                styles.loadMoreText,
                isDarkTheme && styles.textLight
              ]}>
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
          <View style={[
            styles.reflectionInputContainer,
            isDarkTheme && styles.cardDark
          ]}>
            <TextInput
              style={[
                styles.reflectionInput,
                isDarkTheme && styles.reflectionInputDark
              ]}
              placeholder="Write your reflection for today..."
              placeholderTextColor={isDarkTheme ? '#888' : '#999'}
              value={reflection}
              onChangeText={setReflection}
              multiline
              color={isDarkTheme ? '#FFF' : '#000'}
            />
            <Animated.View style={submitButtonStyle}>
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  isDarkTheme && styles.submitButtonDark
                ]}
                onPress={submitReflection}
              >
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* Reflection chart */}
          <View style={[
            styles.chartContainer,
            isDarkTheme && styles.cardDark
          ]}>
            <Text style={[
              styles.chartTitle,
              isDarkTheme && styles.textLight
            ]}>
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
              style={styles.chart}
            />
          </View>
          
          {/* AI Insight */}
          {renderAIInsight()}
          
          {/* Reflection history */}
          <Text style={[
            styles.sectionTitle,
            isDarkTheme && styles.textLight
          ]}>
            Past Reflections
          </Text>
          {reflectionHistory.map(renderReflectionCard)}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileSectionDark: {
    borderBottomColor: '#333',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
  },
  tabContainerDark: {
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    zIndex: 1,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 2,
    backgroundColor: '#000',
    zIndex: 0,
  },
  tabIndicatorDark: {
    backgroundColor: '#FFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  activeTabTextDark: {
    color: '#FFF',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  card: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ddd',
  },
  cardDark: {
    backgroundColor: '#2A2A2A',
    borderLeftColor: '#444',
  },
  activeCard: {
    borderLeftColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  activeCardDark: {
    borderLeftColor: '#FFF',
    backgroundColor: '#333',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardPreview: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'flex-end',
  },
  loadingText: {
    textAlign: 'center',
    padding: 10,
    color: '#666',
  },
  loadMoreButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loadMoreButtonDark: {
    backgroundColor: '#333',
  },
  loadMoreText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 12,
  },
  reflectionInputContainer: {
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  reflectionInput: {
    height: 80,
    textAlignVertical: 'top',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 12,
  },
  reflectionInputDark: {
    backgroundColor: '#333',
    borderColor: '#444',
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDark: {
    backgroundColor: '#4682b4',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  chartContainer: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
  },
  reflectionCard: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  reflectionDate: {
    fontSize: 10,
    color: '#999',
    marginBottom: 3,
  },
  reflectionContent: {
    fontSize: 12,
    marginBottom: 8,
  },
  reflectionScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightContainer: {
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#4682b4',
  },
  insightContainerDark: {
    backgroundColor: '#1e2a3a',
    borderLeftColor: '#4682b4',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  insightText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  textLight: {
    color: '#FFF',
  },
  textLightSecondary: {
    color: '#AAA',
  },
  textLightTertiary: {
    color: '#777',
  },
});

export default Sidebar; 