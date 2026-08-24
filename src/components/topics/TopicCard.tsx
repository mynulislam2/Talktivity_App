import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Topic } from '@/types/topics';
import { getGenericTopicImageUrl } from '@/utils/topicImageUrl';
import { useAppSelector } from '@/store/hooks';

const MicIcon = () => (
  <View style={{ width: 12, height: 12 }}>
    <Ionicons name="mic" size={12} color="#fff" />
  </View>
);

export interface TopicCardProps {
  topic: Topic;
  onDiscuss: (topic: Topic, categoryName: string) => void;
  onCustomClick: () => void;
  categoryName: string;
}

export function TopicCard({
  topic,
  onDiscuss,
  onCustomClick,
  categoryName,
}: TopicCardProps) {
  const subscriptionState = useAppSelector((state) => state.subscription);
  const isExpired = subscriptionState?.currentSubscription?.active === false;
  
  const [imageError, setImageError] = useState(false);
  const isPlaceholder =
    !!topic.imageUrl && topic.imageUrl.includes('placehold.co');
  const hasRealImage = !!topic.imageUrl && !isPlaceholder && !imageError;
  const isRoleplay = categoryName === 'Role Play Scenarios';
  // Only use fallback images for Role Play Scenarios category
  const imageSrc = hasRealImage
    ? topic.imageUrl!
    : isRoleplay
    ? getGenericTopicImageUrl(topic.id || topic.title)
    : null;
  const showImage = imageSrc !== null;

  if (topic.isCustom) {
    return (
      <Pressable onPress={onCustomClick} style={styles.customCard}>
        <LinearGradient
          colors={['#4a2e2c', '#5c3835', '#4a2e2c']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(139,92,246,0)', 'rgba(12,0,48,0.3)']}
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity: 0.5,
          }}
        />
        <View style={styles.customContent}>
          <View style={styles.customIconCircle}>
            <Ionicons name="add" size={16} color="rgba(139,92,246,0.9)" />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.customTitle}>Create Your Own</Text>
            <Text style={styles.customSubtitle}>Custom Roleplay</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.card, !showImage && styles.cardNoImage, isExpired && styles.cardDisabled]}
      onPress={() => {
        if (!isExpired) onDiscuss(topic, categoryName);
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageSrc! }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : null}
      <LinearGradient
        colors={['rgba(131,90,254,0)', 'rgba(12,0,48,0.85)']}
        style={styles.bottomGradient}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {topic.title}
        </Text>
        <Pressable
          style={[styles.discussButton, isExpired && styles.buttonDisabled]}
          onPress={(e) => {
            e.stopPropagation();
            if (!isExpired) onDiscuss(topic, categoryName);
          }}
        >
          <Ionicons name="mic" size={10} color="#fff" />
          <Text style={styles.discussButtonText}>Start Speaking</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 146,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardNoImage: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '72%',
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
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  discussButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  discussButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
  customCard: {
    flex: 1,
    height: 146,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(139,92,246,0.25)',
    backgroundColor: '#4a2e2c',
  },
  customContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  customIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.45)',
    backgroundColor: 'rgba(139,92,246,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  customSubtitle: {
    color: 'rgba(139,92,246,0.6)',
    fontSize: 9,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginTop: 2,
  },
  cardDisabled: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
