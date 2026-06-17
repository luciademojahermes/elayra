import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useElayraChat } from '../hooks/useElayraChat';
import { ChatMessage } from '../types/elayra';

export default function ChatScreen() {
  const { messages, isStreaming, sendMessage, stopStreaming, context } = useElayraChat();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [input, setInput] = React.useState('');

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.role === 'user';
    return (
      <View key={msg.id} style={[styles.messageContainer, isUser && styles.userMessage]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.elayraBubble]}>
          {isUser ? (
            <Text style={[styles.messageText, styles.userText]}>
              {msg.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles} markdownit={undefined}>
              {msg.content}
            </Markdown>
          )}
          {msg.isStreaming && msg.content.trim() === '' && (
            <Text style={styles.thinkingText}>Sto pensando...</Text>
          )}
          {msg.isStreaming && msg.content.trim() !== '' && (
            <Text style={styles.streamingIndicator}>●</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.symbol}>△</Text>
          <Text style={styles.title}>Elayra</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.phase}>{context.ritualPhase}</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeSymbol}>• ◯ △</Text>
            <Text style={styles.welcomeText}>
              Ciao. Sono qui. Cosa porti oggi?
            </Text>
          </View>
        )}
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            placeholder="Scrivi a Elayra..."
            placeholderTextColor="#888"
            multiline
            maxLength={2000}
            autoFocus
          />
          <TouchableOpacity 
            style={[styles.sendButton, isStreaming && styles.sendButtonDisabled]}
            onPress={isStreaming ? stopStreaming : handleSend}
            disabled={!input.trim() && !isStreaming}
          >
            <Text style={styles.sendButtonText}>
              {isStreaming ? '✕' : '→'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = StyleSheet.create({
  text: { 
    fontSize: 15, 
    lineHeight: 22, 
    color: '#f0ebe0',
  },
  strong: { 
    fontWeight: '600', 
    color: '#f5f0e8' 
  },
  em: { 
    fontStyle: 'italic', 
    color: '#e8d5b7' 
  },
  paragraph: { 
    marginVertical: 8 
  },
  br: { 
    marginVertical: 4 
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: 24,
    color: '#e8d5b7',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f5f0e8',
    letterSpacing: 0.5,
  },
  headerRight: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
  },
  phase: {
    fontSize: 11,
    color: '#a09070',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeSymbol: {
    fontSize: 32,
    color: '#e8d5b7',
    marginBottom: 16,
    letterSpacing: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: '#c0b8a8',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '300',
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flexShrink: 1,
    minWidth: 0,
  },
  userBubble: {
    backgroundColor: '#1e2a3a',
    borderBottomRightRadius: 4,
  },
  elayraBubble: {
    backgroundColor: '#1a1a2e',
    borderBottomLeftRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#e8d5b7',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#f0ebe0',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  userText: {
    color: '#e8e0d0',
  },
  elayraText: {
    color: '#f0ebe0',
  },
  symbolInline: {
    fontSize: 16,
    color: '#e8d5b7',
    marginHorizontal: 2,
  },
  thinkingText: {
    fontSize: 14,
    color: '#a09070',
    fontStyle: 'italic',
    marginTop: 4,
  },
  streamingIndicator: {
    color: '#e8d5b7',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0f',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: '#12121a',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#f5f0e8',
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8d5b7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4a4a5a',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#0a0a0f',
    fontWeight: '600',
    lineHeight: 20,
  },
});