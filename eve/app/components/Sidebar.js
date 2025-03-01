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

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.3; // 30% of screen width

const Sidebar = ({ 
  onSelectConversation,
  currentConversationId 
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
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2
      }
    ]
  });
  
  useEffect(() => {
    // Load conversations initially
    loadConversations();
    
    // Load reflections if tab is reflections
    if (activeTab === 'reflections') {
      loadReflections();
    }
  }, [activeTab]);
  
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
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2
          }
        ]
      });
    }, 1000);
  };
  
  // Function to submit a new reflection
  const submitReflection = () => {
    if (reflection.trim() === '') return;
    
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
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 2
        }
      ]
    });
  };
  
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
        style={[styles.card, isActive && styles.activeCard]}
        onPress={() => onSelectConversation(conversation.id)}
      >
        <Text style={styles.cardTitle}>{conversation.title}</Text>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {conversation.preview}
        </Text>
        <Text style={styles.cardDate}>{conversation.date}</Text>
      </TouchableOpacity>
    );
  };
  
  // Render reflection card
  const renderReflectionCard = (reflection) => {
    return (
      <View key={reflection.id} style={styles.reflectionCard}>
        <Text style={styles.reflectionDate}>{reflection.date}</Text>
        <Text style={styles.reflectionContent}>{reflection.content}</Text>
        <View style={styles.reflectionScore}>
          {[...Array(5)].map((_, i) => (
            <FontAwesome
              key={i}
              name="star"
              size={14}
              color={i < reflection.score ? '#FFD700' : '#E0E0E0'}
            />
          ))}
        </View>
      </View>
    );
  };
  
  // AI insight component
  const renderAIInsight = () => {
    return (
      <View style={styles.insightContainer}>
        <View style={styles.insightHeader}>
          <FontAwesome name="lightbulb-o" size={16} color="#000" />
          <Text style={styles.insightTitle}>AI Insight</Text>
        </View>
        <Text style={styles.insightText}>
          Based on your recent reflections, you've been making steady progress in managing stress.
          Your scores have improved over time, indicating that the mindfulness techniques are working well for you.
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Profile section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://via.placeholder.com/60' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>User Name</Text>
      </View>
      
      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'conversations' && styles.activeTab]}
          onPress={() => setActiveTab('conversations')}
        >
          <Text style={styles.tabText}>Conversations</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reflections' && styles.activeTab]}
          onPress={() => setActiveTab('reflections')}
        >
          <Text style={styles.tabText}>Reflections</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content container */}
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'conversations' && (
          <View>
            {conversations.map(renderConversationCard)}
            
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {activeTab === 'reflections' && (
          <View>
            {/* New reflection input */}
            <View style={styles.reflectionInputContainer}>
              <TextInput
                style={styles.reflectionInput}
                placeholder="Write your reflection for today..."
                value={reflection}
                onChangeText={setReflection}
                multiline
              />
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={submitReflection}
              >
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>
            
            {/* Reflection chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Mood Trend</Text>
              <LineChart
                data={reflectionData}
                width={SIDEBAR_WIDTH * 0.8}
                height={180}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
            <Text style={styles.sectionTitle}>Past Reflections</Text>
            {reflectionHistory.map(renderReflectionCard)}
          </View>
        )}
      </ScrollView>
    </View>
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
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
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
  activeCard: {
    borderLeftColor: '#000',
    backgroundColor: '#f0f0f0',
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
  submitButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
});

export default Sidebar; 