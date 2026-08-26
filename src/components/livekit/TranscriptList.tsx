import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import type { TranscriptMessage } from './SimpleVoiceAssistant';

const COACH_AVATAR = require('../../../assets/figma/coach/alina-intro.png');

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mon = months[d.getMonth()];
  const day = d.getDate();
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  const mm = String(m).padStart(2, '0');
  return `${day} ${mon} AT ${hh}:${mm} ${ampm}`;
}

export function TranscriptList({ messages }: { messages: TranscriptMessage[] }) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((msg) =>
        msg.sender === 'user' ? (
          <View key={msg.id} style={styles.userRow}>
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{msg.text}</Text>
            </View>
          </View>
        ) : (
          <View key={msg.id} style={styles.agentRow}>
            <View style={styles.agentAvatar}>
              <Image source={COACH_AVATAR} style={styles.avatarImg} />
            </View>
            <View>
              <View style={styles.agentBubble}>
                <Text style={styles.agentText}>{msg.text}</Text>
              </View>
              <Text style={styles.agentTime}>{formatTimestamp(msg.timestamp)}</Text>
            </View>
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120, gap: 8 },
  userRow: { alignItems: 'flex-end', marginBottom: 4 },
  userBubble: {
    maxWidth: 224,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 4,
    backgroundColor: '#2879ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userText: { fontSize: 12, fontFamily: 'Poppins', lineHeight: 16.8, color: '#fff' },
  agentRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  agentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  avatarImg: { width: '100%', height: '100%' },
  agentBubble: {
    maxWidth: 220,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 10,
    backgroundColor: 'rgba(47,65,145,0.2)',
    padding: 12,
  },
  agentText: { fontSize: 12, fontFamily: 'Poppins', lineHeight: 16.8, color: '#fdfdfd' },
  agentTime: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: 'Poppins',
    lineHeight: 14,
    color: '#c6c6c6',
  },
});
