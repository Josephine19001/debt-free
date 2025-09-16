import React, { useState, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChefHat, Send, Sparkles, Calendar, Heart, Brain } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';

interface MealPlanGeneratorProps {
  onClose: () => void;
  userContext?: {
    cyclePhase?: string;
    symptoms?: string[];
    mood?: string;
    foodPreferences?: string[];
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function MealPlanGenerator({ onClose, userContext }: MealPlanGeneratorProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm here to help create a personalized meal plan for you. 

Based on your current cycle phase (${userContext?.cyclePhase || 'unknown'}), I can suggest foods that support your energy levels and help with any symptoms you're experiencing.

What are you in the mood for this week? Any specific cravings or dietary goals?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMealPlanResponse(inputText, userContext),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsGenerating(false);
      
      // Scroll to bottom after adding message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const generateMealPlanResponse = (userInput: string, context?: typeof userContext): string => {
    // This would integrate with actual AI service
    const responses = [
      `Great choice! Based on your ${context?.cyclePhase} phase, I recommend foods rich in iron and magnesium. Here's a 3-day meal plan:

**Day 1:**
🍳 Breakfast: Spinach & mushroom omelet with avocado
🥗 Lunch: Quinoa bowl with roasted vegetables and chickpeas  
🍽️ Dinner: Baked salmon with sweet potato and steamed broccoli

**Day 2:**
🥞 Breakfast: Oatmeal with berries and almonds
🥙 Lunch: Turkey and hummus wrap with mixed greens
🍝 Dinner: Lentil pasta with marinara and a side salad

**Day 3:**
🥑 Breakfast: Avocado toast with poached egg
🍲 Lunch: Vegetable soup with whole grain bread
🐟 Dinner: Grilled chicken with roasted Brussels sprouts and brown rice

These meals include foods that can help with energy and mood during your cycle. Would you like me to adjust anything?`,
      
      `Perfect! Since you're feeling ${context?.mood}, I'll focus on comfort foods that still support your nutritional needs:

**Comfort Meal Plan:**
- Dark chocolate and berry smoothie bowls
- Warming soups with bone broth
- Herbal teas for relaxation
- Foods rich in omega-3s for mood support

What specific comfort foods are you craving?`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickSuggestions = [
    { text: "I want comfort foods", icon: Heart },
    { text: "Energy-boosting meals", icon: Sparkles },
    { text: "Quick 15-min recipes", icon: Calendar },
    { text: "Foods for my symptoms", icon: Brain },
  ];

  return (
    <View className={themed("flex-1 bg-white", "flex-1 bg-gray-900")}>
      {/* Header */}
      <View className={themed("bg-white border-b border-gray-200 px-4 py-4", "bg-gray-900 border-b border-gray-700 px-4 py-4")}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
              <ChefHat size={20} color="#F59E0B" />
            </View>
            <View>
              <Text className={themed("text-lg font-bold text-gray-900", "text-lg font-bold text-white")}>
                AI Meal Planner
              </Text>
              <Text className={themed("text-sm text-gray-600", "text-sm text-gray-400")}>
                Personalized for your cycle
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text className={themed("text-blue-600 font-medium", "text-blue-400 font-medium")}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id} className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
            <View
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500'
                  : themed("bg-gray-100", "bg-gray-800")
              }`}
            >
              <Text
                className={`${
                  message.role === 'user' 
                    ? 'text-white' 
                    : themed("text-gray-900", "text-white")
                }`}
              >
                {message.content}
              </Text>
            </View>
            <Text className={themed("text-xs text-gray-500 mt-1", "text-xs text-gray-400 mt-1")}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}

        {isGenerating && (
          <View className="items-start mb-4">
            <View className={themed("bg-gray-100 p-3 rounded-2xl", "bg-gray-800 p-3 rounded-2xl")}>
              <Text className={themed("text-gray-600", "text-gray-300")}>AI is thinking...</Text>
            </View>
          </View>
        )}

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <View className="mb-4">
            <Text className={themed("text-sm text-gray-600 mb-3", "text-sm text-gray-400 mb-3")}>
              Quick suggestions:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setInputText(suggestion.text)}
                  className={themed("bg-gray-50 border border-gray-200 rounded-full px-3 py-2 flex-row items-center", "bg-gray-800 border border-gray-600 rounded-full px-3 py-2 flex-row items-center")}
                >
                  <suggestion.icon size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text className={themed("text-sm text-gray-700 ml-2", "text-sm text-gray-300 ml-2")}>
                    {suggestion.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className={themed("border-t border-gray-200 p-4", "border-t border-gray-700 p-4")}>
        <View className="flex-row items-center space-x-3">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about meal plans, recipes, or food suggestions..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            className={themed("flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-gray-900", "flex-1 bg-gray-800 border border-gray-600 rounded-full px-4 py-3 text-white")}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || isGenerating}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              inputText.trim() && !isGenerating ? 'bg-blue-500' : themed("bg-gray-300", "bg-gray-600")
            }`}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}