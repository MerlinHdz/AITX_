import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  Modal,
  ActivityIndicator,
  Switch,
  Alert,
  KeyboardAvoidingView
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

// ChatGPT-inspired color palette
const COLORS = {
  light: {
    primary: '#00a67e', // ChatGPT-like accent
    background: '#f9f9f9',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#555555',
    border: '#e0e0e0',
    hover: '#f7f7f7',
    active: '#f0f0f0',
    activeBorder: '#00a67e',
  },
  dark: {
    primary: '#00a67e', // Keep same accent for consistency
    background: '#1e1e1e',
    card: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#444444',
    hover: '#333333',
    active: '#3a3a3a',
    activeBorder: '#00a67e',
  }
};

// Get responsive dimensions
const { width } = Dimensions.get('window');
const isLargeScreen = width >= 768;
const SIDEBAR_WIDTH = isLargeScreen ? 280 : width * 0.8;

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
  
  // State for user menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // State for modals
  const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign in form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  
  // Sign up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  
  // User settings state
  const [userSettings, setUserSettings] = useState({
    ageRange: '',
    occupation: '',
    sleepPattern: '',
    stressLevel: '',
    therapyGoals: '',
    shareMoodLogs: false,
    allowAIAnalysis: false,
    shareDemographics: false
  });
  
  // Mock user data
  const [user, setUser] = useState({
    isLoggedIn: false, // Changed to false by default
    name: "John Doe",
    avatar: "https://via.placeholder.com/60"
  });
  
  // Animation values
  const tabIndicatorPosition = useSharedValue(0);
  const conversationsOpacity = useSharedValue(1);
  const reflectionsOpacity = useSharedValue(0);
  const themeAnimValue = useSharedValue(isDarkTheme ? 1 : 0);
  const submitButtonScale = useSharedValue(1);
  
  // Get current theme colors
  const getThemeColors = () => isDarkTheme ? COLORS.dark : COLORS.light;
  
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
    const colors = getThemeColors();
    
    return {
      backgroundColor: interpolateColor(
        themeAnimValue.value,
        [0, 1],
        [COLORS.light.card, COLORS.dark.card]
      ),
      borderRightColor: interpolateColor(
        themeAnimValue.value,
        [0, 1],
        [COLORS.light.border, COLORS.dark.border]
      ),
    };
  });
  
  const tabIndicatorStyle = useAnimatedStyle(() => {
    const colors = getThemeColors();
    
    return {
      transform: [{ translateX: tabIndicatorPosition.value }],
      backgroundColor: colors.primary
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
  
  const submitButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: submitButtonScale.value }],
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
  
  // Function to load more conversations (pagination)
  const loadMore = () => {
    setPage(page + 1);
    loadConversations();
  };
  
  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  // Handle logout
  const handleLogout = () => {
    // This would be an API call or auth logout in a real app
    setUser({...user, isLoggedIn: false});
    setIsUserMenuOpen(false);
  };
  
  // Handle login
  const handleLogin = () => {
    // For real app, navigate to login screen or open modal
    setIsSignInModalVisible(true);
  };
  
  // Open sign up modal
  const openSignUp = () => {
    setIsSignInModalVisible(false);
    setIsSignUpModalVisible(true);
  };
  
  // Open sign in modal
  const openSignIn = () => {
    setIsSignUpModalVisible(false);
    setIsSignInModalVisible(true);
  };
  
  // Handle sign in submission
  const handleSignInSubmit = () => {
    // Reset error state
    setSignInError('');
    
    // Validate inputs
    if (!email.trim()) {
      setSignInError('Email is required');
      return;
    }
    
    if (!password.trim()) {
      setSignInError('Password is required');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSignInError('Please enter a valid email address');
      return;
    }
    
    // Show loading indicator
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock successful login for demo purposes
      // In a real app, this would be an API call
      if (email === 'demo@example.com' && password === 'password') {
        setUser({
          isLoggedIn: true,
          name: email.split('@')[0], // Use part of email as name
          avatar: "https://via.placeholder.com/60"
        });
        setIsSignInModalVisible(false);
        // Reset form
        setEmail('');
        setPassword('');
      } else {
        setSignInError('Invalid email or password');
      }
    }, 1500);
  };
  
  // Handle sign up submission
  const handleSignUpSubmit = () => {
    // Reset error state
    setSignUpError('');
    
    // Validate inputs
    if (!signUpName.trim()) {
      setSignUpError('Name is required');
      return;
    }
    
    if (!signUpEmail.trim()) {
      setSignUpError('Email is required');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpEmail)) {
      setSignUpError('Please enter a valid email address');
      return;
    }
    
    if (!signUpPassword.trim()) {
      setSignUpError('Password is required');
      return;
    }
    
    if (signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters long');
      return;
    }
    
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match');
      return;
    }
    
    // Show loading indicator
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock successful registration
      // In a real app, this would be an API call to create the user
      setUser({
        isLoggedIn: true,
        name: signUpName,
        avatar: "https://via.placeholder.com/60"
      });
      
      // Close modal
      setIsSignUpModalVisible(false);
      
      // Reset form
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
      
      // Show success message
      Alert.alert(
        "Account Created",
        "Your account has been created successfully!",
        [{ text: "OK" }]
      );
    }, 2000);
  };
  
  // Open settings modal
  const openSettings = () => {
    setIsSettingsModalVisible(true);
    setIsUserMenuOpen(false);
  };
  
  // Handle settings save
  const handleSettingsSave = () => {
    setIsLoading(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      setIsLoading(false);
      setIsSettingsModalVisible(false);
      
      // Show success message
      Alert.alert(
        "Settings Saved",
        "Your preferences have been updated successfully.",
        [{ text: "OK" }]
      );
    }, 1000);
  };
  
  // Render user section
  const renderUserSection = () => {
    const colors = getThemeColors();
    
    return (
      <View style={[
        styles.userSection,
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border 
        }
      ]}>
        {user.isLoggedIn ? (
          <TouchableOpacity 
            style={styles.userButton}
            onPress={toggleUserMenu}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: user.avatar }}
              style={styles.userAvatar}
            />
            <Text style={[
              styles.userName,
              { color: colors.text }
            ]}>
              {user.name}
            </Text>
            <FontAwesome 
              name={isUserMenuOpen ? "chevron-up" : "chevron-down"} 
              size={12} 
              color={colors.textSecondary} 
              style={styles.userMenuIcon}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.loginButton,
              { 
                backgroundColor: colors.primary,
              }
            ]}
            onPress={handleLogin}
          >
            <FontAwesome 
              name="user" 
              size={14} 
              color="#FFFFFF" 
              style={{marginRight: 8}}
            />
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        )}
        
        {/* User menu dropdown - Positioned as a floating popover */}
        {isUserMenuOpen && user.isLoggedIn && (
          <>
            {/* Semi-transparent overlay to capture touches outside menu */}
            <TouchableOpacity 
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setIsUserMenuOpen(false)}
            />
            
            <View style={[
              styles.userMenu,
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
              }
            ]}>
              <TouchableOpacity 
                style={styles.userMenuItem}
                onPress={openSettings}
              >
                <FontAwesome 
                  name="cog" 
                  size={14} 
                  color={colors.text} 
                  style={styles.userMenuItemIcon}
                />
                <Text style={[
                  styles.userMenuItemText,
                  { color: colors.text }
                ]}>
                  Account Settings
                </Text>
              </TouchableOpacity>
              
              <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
              
              <TouchableOpacity 
                style={styles.userMenuItem}
                onPress={handleLogout}
              >
                <FontAwesome 
                  name="sign-out" 
                  size={14} 
                  color={colors.text} 
                  style={styles.userMenuItemIcon}
                />
                <Text style={[
                  styles.userMenuItemText,
                  { color: colors.text }
                ]}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };
  
  // Render conversation card
  const renderConversationCard = (conversation) => {
    const colors = getThemeColors();
    const isActive = currentConversationId === conversation.id;
    
    return (
      <TouchableOpacity
        key={conversation.id}
        style={[
          styles.conversationCard, 
          { 
            backgroundColor: isActive ? colors.active : colors.card,
            borderLeftColor: isActive ? colors.activeBorder : 'transparent',
            borderColor: colors.border
          }
        ]}
        onPress={() => onSelectConversation(conversation.id)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.conversationTitle,
          { color: colors.text }
        ]}>
          {conversation.title}
        </Text>
        <Text style={[
          styles.conversationPreview,
          { color: colors.textSecondary }
        ]} numberOfLines={1}>
          {conversation.preview}
        </Text>
        <Text style={[
          styles.conversationDate,
          { color: colors.textSecondary }
        ]}>
          {conversation.date}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render reflection card
  const renderReflectionCard = (reflection) => {
    const colors = getThemeColors();
    
    return (
      <View 
        key={reflection.id} 
        style={[
          styles.reflectionCard,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border
          }
        ]}
      >
        <Text style={[
          styles.reflectionDate,
          { color: colors.textSecondary }
        ]}>
          {reflection.date}
        </Text>
        <Text style={[
          styles.reflectionContent,
          { color: colors.text }
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
    const colors = getThemeColors();
    
    return (
      <View style={[
        styles.insightContainer,
        { 
          backgroundColor: isDarkTheme ? '#1e2a3a' : '#f0f8ff',
          borderLeftColor: colors.primary
        }
      ]}>
        <View style={styles.insightHeader}>
          <FontAwesome 
            name="lightbulb-o" 
            size={16} 
            color={isDarkTheme ? "#FFD700" : colors.primary} 
          />
          <Text style={[
            styles.insightTitle,
            { color: colors.text }
          ]}>
            AI Insight
          </Text>
        </View>
        <Text style={[
          styles.insightText,
          { color: colors.textSecondary }
        ]}>
          Based on your recent reflections, you've been making steady progress in managing stress.
          Your scores have improved over time, indicating that the mindfulness techniques are working well for you.
        </Text>
      </View>
    );
  };
  
  // Sign In Modal Component
  const renderSignInModal = () => {
    const colors = getThemeColors();
    
    return (
      <Modal
        visible={isSignInModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSignInModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBackground}>
            {/* Background overlay - only this should close the modal */}
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setIsSignInModalVisible(false)}
            />
            
            {/* Modal content - this should NOT close when clicked */}
            <View 
              style={[
                styles.modalContainer,
                { backgroundColor: colors.card }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Sign In
                </Text>
                <TouchableOpacity
                  onPress={() => setIsSignInModalVisible(false)}
                  style={styles.closeButton}
                >
                  <FontAwesome name="times" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {/* Form fields */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      backgroundColor: isDarkTheme ? colors.background : '#fff',
                      borderColor: colors.border,
                      color: colors.text
                    }
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Password</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      backgroundColor: isDarkTheme ? colors.background : '#fff',
                      borderColor: colors.border,
                      color: colors.text
                    }
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                />
                
                <TouchableOpacity style={styles.forgotPasswordLink}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Error message */}
              {signInError ? (
                <Text style={styles.errorText}>{signInError}</Text>
              ) : null}
              
              {/* Sign In button */}
              <TouchableOpacity
                style={[
                  styles.signInButton,
                  { backgroundColor: colors.primary }
                ]}
                onPress={handleSignInSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
              
              {/* OAuth options */}
              <View style={styles.oauthContainer}>
                <Text style={[styles.oauthText, { color: colors.textSecondary }]}>
                  Or sign in with
                </Text>
                <View style={styles.oauthButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.oauthButton,
                      { backgroundColor: isDarkTheme ? '#333' : '#f1f1f1' }
                    ]}
                  >
                    <FontAwesome name="google" size={18} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.oauthButton,
                      { backgroundColor: isDarkTheme ? '#333' : '#f1f1f1' }
                    ]}
                  >
                    <FontAwesome name="facebook" size={18} color="#4267B2" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Sign up link */}
              <View style={styles.signUpContainer}>
                <Text style={[styles.signUpText, { color: colors.textSecondary }]}>
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={openSignUp}>
                  <Text style={[styles.signUpLink, { color: colors.primary }]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Guest option */}
              <TouchableOpacity 
                style={styles.guestButton}
                onPress={() => {
                  setIsSignInModalVisible(false);
                }}
              >
                <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>
                  Continue as Guest
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };
  
  // Sign Up Modal Component
  const renderSignUpModal = () => {
    const colors = getThemeColors();
    
    return (
      <Modal
        visible={isSignUpModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSignUpModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBackground}>
            {/* Background overlay - only this should close the modal */}
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setIsSignUpModalVisible(false)}
            />
            
            {/* Modal content - this should NOT close when clicked */}
            <View 
              style={[
                styles.modalContainer,
                { backgroundColor: colors.card }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Create Account
                </Text>
                <TouchableOpacity
                  onPress={() => setIsSignUpModalVisible(false)}
                  style={styles.closeButton}
                >
                  <FontAwesome name="times" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {/* Form fields */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Name</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      backgroundColor: isDarkTheme ? colors.background : '#fff',
                      borderColor: colors.border,
                      color: colors.text
                    }
                  ]}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                  value={signUpName}
                  onChangeText={setSignUpName}
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      backgroundColor: isDarkTheme ? colors.background : '#fff',
                      borderColor: colors.border,
                      color: colors.text
                    }
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                  value={signUpEmail}
                  onChangeText={setSignUpEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Password</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      backgroundColor: isDarkTheme ? colors.background : '#fff',
                      borderColor: colors.border,
                      color: colors.text
                    }
                  ]}
                  placeholder="Create a password (min. 6 characters)"
                  placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                  value={signUpPassword}
                  onChangeText={setSignUpPassword}
                  secureTextEntry={true}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Confirm Password</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      backgroundColor: isDarkTheme ? colors.background : '#fff',
                      borderColor: colors.border,
                      color: colors.text
                    }
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                  value={signUpConfirmPassword}
                  onChangeText={setSignUpConfirmPassword}
                  secureTextEntry={true}
                />
              </View>
              
              {/* Error message */}
              {signUpError ? (
                <Text style={styles.errorText}>{signUpError}</Text>
              ) : null}
              
              {/* Privacy policy acceptance */}
              <View style={styles.privacyContainer}>
                <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                  By creating an account, you agree to our{' '}
                  <Text style={[styles.privacyLink, { color: colors.primary }]}>
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text style={[styles.privacyLink, { color: colors.primary }]}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
              
              {/* Sign Up button */}
              <TouchableOpacity
                style={[
                  styles.signInButton,
                  { backgroundColor: colors.primary }
                ]}
                onPress={handleSignUpSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.signInButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
              
              {/* OAuth options */}
              <View style={styles.oauthContainer}>
                <Text style={[styles.oauthText, { color: colors.textSecondary }]}>
                  Or sign up with
                </Text>
                <View style={styles.oauthButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.oauthButton,
                      { backgroundColor: isDarkTheme ? '#333' : '#f1f1f1' }
                    ]}
                  >
                    <FontAwesome name="google" size={18} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.oauthButton,
                      { backgroundColor: isDarkTheme ? '#333' : '#f1f1f1' }
                    ]}
                  >
                    <FontAwesome name="facebook" size={18} color="#4267B2" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Sign in link */}
              <View style={styles.signUpContainer}>
                <Text style={[styles.signUpText, { color: colors.textSecondary }]}>
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={openSignIn}>
                  <Text style={[styles.signUpLink, { color: colors.primary }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };
  
  // User Settings Modal Component
  const renderSettingsModal = () => {
    const colors = getThemeColors();
    
    return (
      <Modal
        visible={isSettingsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSettingsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBackground}>
            {/* Background overlay - only this should close the modal */}
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setIsSettingsModalVisible(false)}
            />
            
            {/* Modal content - this should NOT close when clicked */}
            <View 
              style={[
                styles.modalContainer,
                styles.settingsContainer,
                { backgroundColor: colors.card }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Account Settings
                </Text>
                <TouchableOpacity
                  onPress={() => setIsSettingsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <FontAwesome name="times" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.settingsScrollView}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>
                  Personal Information
                </Text>
                <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                  The following information is optional and helps us personalize your experience. 
                  You can share as much or as little as you're comfortable with.
                </Text>
                
                {/* Personal Info Fields */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Age Range</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { 
                        backgroundColor: isDarkTheme ? colors.background : '#fff',
                        borderColor: colors.border,
                        color: colors.text
                      }
                    ]}
                    placeholder="e.g., 25-34"
                    placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                    value={userSettings.ageRange}
                    onChangeText={(text) => setUserSettings({...userSettings, ageRange: text})}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Occupation</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { 
                        backgroundColor: isDarkTheme ? colors.background : '#fff',
                        borderColor: colors.border,
                        color: colors.text
                      }
                    ]}
                    placeholder="e.g., Designer, Teacher"
                    placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                    value={userSettings.occupation}
                    onChangeText={(text) => setUserSettings({...userSettings, occupation: text})}
                  />
                </View>
                
                <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 20 }]}>
                  Lifestyle Information
                </Text>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Sleep Patterns</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { 
                        backgroundColor: isDarkTheme ? colors.background : '#fff',
                        borderColor: colors.border,
                        color: colors.text
                      }
                    ]}
                    placeholder="e.g., 6-8 hours, Irregular"
                    placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                    value={userSettings.sleepPattern}
                    onChangeText={(text) => setUserSettings({...userSettings, sleepPattern: text})}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Stress Levels</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { 
                        backgroundColor: isDarkTheme ? colors.background : '#fff',
                        borderColor: colors.border,
                        color: colors.text
                      }
                    ]}
                    placeholder="e.g., Moderate, High"
                    placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                    value={userSettings.stressLevel}
                    onChangeText={(text) => setUserSettings({...userSettings, stressLevel: text})}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Therapy Goals</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { 
                        backgroundColor: isDarkTheme ? colors.background : '#fff',
                        borderColor: colors.border,
                        color: colors.text,
                        height: 80
                      }
                    ]}
                    placeholder="What would you like to achieve through therapy?"
                    placeholderTextColor={isDarkTheme ? '#888' : '#999'}
                    value={userSettings.therapyGoals}
                    onChangeText={(text) => setUserSettings({...userSettings, therapyGoals: text})}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                
                <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 20 }]}>
                  Privacy Settings
                </Text>
                <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                  Control how your information is used to enhance your therapy experience.
                  You can adjust these permissions at any time.
                </Text>
                
                {/* Toggle Switches */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={[styles.toggleLabel, { color: colors.text }]}>
                      Share mood logs with the therapist
                    </Text>
                    <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                      Allows the therapist to view your daily mood logs
                    </Text>
                  </View>
                  <Switch
                    value={userSettings.shareMoodLogs}
                    onValueChange={(value) => setUserSettings({...userSettings, shareMoodLogs: value})}
                    trackColor={{ false: "#767577", true: colors.primary }}
                    thumbColor="#f4f3f4"
                  />
                </View>
                
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={[styles.toggleLabel, { color: colors.text }]}>
                      Allow AI to analyze conversation history
                    </Text>
                    <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                      Enables AI to provide personalized insights based on your conversations
                    </Text>
                  </View>
                  <Switch
                    value={userSettings.allowAIAnalysis}
                    onValueChange={(value) => setUserSettings({...userSettings, allowAIAnalysis: value})}
                    trackColor={{ false: "#767577", true: colors.primary }}
                    thumbColor="#f4f3f4"
                  />
                </View>
                
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={[styles.toggleLabel, { color: colors.text }]}>
                      Share demographic information
                    </Text>
                    <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                      Allows the therapist to see your age range and occupation
                    </Text>
                  </View>
                  <Switch
                    value={userSettings.shareDemographics}
                    onValueChange={(value) => setUserSettings({...userSettings, shareDemographics: value})}
                    trackColor={{ false: "#767577", true: colors.primary }}
                    thumbColor="#f4f3f4"
                  />
                </View>
                
                <Text style={[styles.privacyNote, { color: colors.textSecondary }]}>
                  We value your privacy. Your data is securely stored and will only be used as specified by your settings above.
                  See our <Text style={{textDecorationLine: 'underline'}}>Privacy Policy</Text> for more information.
                </Text>
              </ScrollView>
              
              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: colors.primary }
                ]}
                onPress={handleSettingsSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };
  
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* User section at the top */}
      {renderUserSection()}
      
      {/* Tab navigation */}
      <View style={[
        styles.tabContainer,
        { borderBottomColor: getThemeColors().border }
      ]}>
        <Animated.View 
          style={[
            styles.tabIndicator, 
            tabIndicatorStyle
          ]} 
        />
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => switchTab('conversations')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            { color: getThemeColors().text },
            activeTab === 'conversations' && styles.activeTabText
          ]}>
            Conversations
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => switchTab('reflections')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            { color: getThemeColors().text },
            activeTab === 'reflections' && styles.activeTabText
          ]}>
            Reflections
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content container */}
      <ScrollView 
        style={[
          styles.contentContainer,
          { backgroundColor: getThemeColors().background }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Conversations Tab Content */}
        <Animated.View 
          style={[
            styles.tabContent,
            { display: activeTab === 'conversations' ? 'flex' : 'none' },
            conversationsTabStyle
          ]}
        >
          {conversations.map(renderConversationCard)}
          
          {loading ? (
            <Text style={[
              styles.loadingText,
              { color: getThemeColors().textSecondary }
            ]}>
              Loading...
            </Text>
          ) : (
            <TouchableOpacity 
              style={[
                styles.loadMoreButton,
                { 
                  backgroundColor: getThemeColors().background,
                  borderColor: getThemeColors().border
                }
              ]} 
              onPress={loadMore}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.loadMoreText,
                { color: getThemeColors().primary }
              ]}>
                Load More
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
        
        {/* Reflections Tab Content */}
        <Animated.View 
          style={[
            styles.tabContent,
            { display: activeTab === 'reflections' ? 'flex' : 'none' },
            reflectionsTabStyle
          ]}
        >
          {/* New reflection input */}
          <View style={[
            styles.reflectionInputContainer,
            { 
              backgroundColor: getThemeColors().card,
              borderColor: getThemeColors().border
            }
          ]}>
            <TextInput
              style={[
                styles.reflectionInput,
                { 
                  backgroundColor: isDarkTheme ? getThemeColors().background : '#ffffff',
                  borderColor: getThemeColors().border,
                  color: getThemeColors().text
                }
              ]}
              placeholder="Write your reflection for today..."
              placeholderTextColor={isDarkTheme ? '#888' : '#999'}
              value={reflection}
              onChangeText={setReflection}
              multiline
            />
            <Animated.View style={submitButtonStyle}>
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  { backgroundColor: getThemeColors().primary }
                ]}
                onPress={submitReflection}
                activeOpacity={0.7}
              >
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* Reflection chart */}
          <View style={[
            styles.chartContainer,
            { 
              backgroundColor: getThemeColors().card,
              borderColor: getThemeColors().border
            }
          ]}>
            <Text style={[
              styles.chartTitle,
              { color: getThemeColors().text }
            ]}>
              Mood Trend
            </Text>
            <LineChart
              data={reflectionData}
              width={SIDEBAR_WIDTH * 0.85}
              height={180}
              chartConfig={{
                backgroundColor: isDarkTheme ? getThemeColors().background : '#fff',
                backgroundGradientFrom: isDarkTheme ? getThemeColors().background : '#fff',
                backgroundGradientTo: isDarkTheme ? getThemeColors().background : '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => isDarkTheme 
                  ? `rgba(200, 200, 255, ${opacity})` 
                  : `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => isDarkTheme
                  ? `rgba(255, 255, 255, ${opacity})`
                  : `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 8,
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
            { color: getThemeColors().text }
          ]}>
            Past Reflections
          </Text>
          {reflectionHistory.map(renderReflectionCard)}
        </Animated.View>
      </ScrollView>
      
      {/* Render Modals */}
      {renderSignInModal()}
      {renderSignUpModal()}
      {renderSettingsModal()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    borderRightWidth: 1,
  },
  userSection: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    position: 'relative',
    zIndex: 1,  // Ensure proper stacking context
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  userMenuIcon: {
    marginLeft: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loginText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  userMenu: {
    position: 'absolute',
    right: 12,  // Align to right side
    top: 64,    // Position below the user button
    width: SIDEBAR_WIDTH - 24,  // Full width minus margins
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 101,  // Higher than overlay
    overflow: 'hidden',
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userMenuItemIcon: {
    marginRight: 12,
    width: 16,
    textAlign: 'center',
  },
  userMenuItemText: {
    fontSize: 14,
  },
  menuDivider: {
    height: 1,
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    zIndex: 1,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 2,
    zIndex: 0,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 12,
  },
  conversationCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    minHeight: 44, // Touch-friendly target
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 12,
    marginBottom: 8,
  },
  conversationDate: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  loadingText: {
    textAlign: 'center',
    padding: 10,
  },
  loadMoreButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  loadMoreText: {
    fontWeight: '500',
    fontSize: 14,
  },
  reflectionInputContainer: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  reflectionInput: {
    height: 80,
    textAlignVertical: 'top',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  chartContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  reflectionCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  reflectionDate: {
    fontSize: 11,
    marginBottom: 4,
  },
  reflectionContent: {
    fontSize: 13,
    marginBottom: 8,
  },
  reflectionScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightContainer: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  settingsContainer: {
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  linkText: {
    fontSize: 12,
  },
  errorText: {
    color: '#FF4136',
    fontSize: 14,
    marginBottom: 16,
  },
  signInButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  oauthContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  oauthText: {
    fontSize: 14,
    marginBottom: 10,
  },
  oauthButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  oauthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
    marginRight: 4,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
  },
  guestButtonText: {
    fontSize: 14,
  },
  settingsScrollView: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 12,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 10,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 12,
  },
  privacyNote: {
    fontSize: 12,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyContainer: {
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  privacyLink: {
    textDecorationLine: 'underline',
  },
});

export default Sidebar; 