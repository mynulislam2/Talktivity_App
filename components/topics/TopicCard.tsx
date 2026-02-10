/**
 * TopicCard Component
 * 
 * Individual topic card with image and discuss button.
 */

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Topic } from '@/types/topics';

export interface TopicCardProps {
  topic: Topic;
  onDiscuss: (topic: Topic, categoryName: string) => void;
  onCustomClick: () => void;
  categoryName: string;
}

export function TopicCard({ topic, onDiscuss, onCustomClick, categoryName }: TopicCardProps) {
  if (topic.isCustom) {
    return (
      <Pressable
        style={styles.customCard}
        onPress={onCustomClick}
      >
        <Ionicons name="add" size={32} color="#9ca3af" />
        <Text style={styles.customTitle}>Create Your Own</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={styles.card}
      onPress={() => onDiscuss(topic, categoryName)}
    >
      <Image
        source={{
          uri: topic.imageUrl || topic.coverImage || 'https://placehold.co/400x600/1a202c/ffffff?text=Image+Not+Available',
        }}
        style={styles.image}
        resizeMode="cover"
        onError={() => {
          // Image error handling - fallback URI will be used
        }}
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {topic.title}
        </Text>
        <Pressable
          style={styles.discussButton}
          onPress={(e) => {
            e.stopPropagation();
            onDiscuss(topic, categoryName);
          }}
        >
          <Ionicons name="mic" size={12} color="#fff" />
          <Text style={styles.discussButtonText}>Discuss</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  discussButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  discussButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  customCard: {
    flex: 1,
    height: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4b5563',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  customTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
});
