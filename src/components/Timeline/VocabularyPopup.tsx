/**
 * VocabularyPopup Component (React Native)
 *
 * Simplified version - shows vocabulary words in a modal.
 * Matches Next.js implementation structure.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { CourseStatus } from '@/services/course';
import { vocabularyService, VocabularyWord } from '@/services/vocabulary';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface VocabularyPopupProps {
  courseStatus: CourseStatus | null;
}

export const VocabularyPopup: React.FC<VocabularyPopupProps> = ({
  courseStatus,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [wordsLoading, setWordsLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      if (!courseStatus) {
        setWordsLoading(false);
        return;
      }

      setWordsLoading(true);
      const currentWeek = courseStatus?.course?.currentWeek;
      const currentDay = courseStatus?.course?.currentDay;

      try {
        const result = await vocabularyService.getVocabularyByWeekAndDay(
          currentWeek && currentWeek > 0 ? currentWeek : undefined,
          currentDay && currentDay > 0 ? currentDay : undefined
        );

        if (result.success && result.data) {
          setWords(result.data.words || []);
          if (result.data.isCompleted) {
            setShowPopup(false);
            setCompleted(true);
          } else {
            setCompleted(false);
          }
        } else {
          setShowPopup(false);
        }
      } catch (err) {
        setShowPopup(false);
      } finally {
        setWordsLoading(false);
      }
    };

    fetchWords();
  }, [courseStatus]);

  // Show popup once per day (only if not completed)
  useEffect(() => {
    const checkAndShowPopup = async () => {
      try {
        const lastShown = await AsyncStorage.getItem('popup_last_shown');
        const today = new Date().toDateString();

        if (lastShown !== today && words.length > 0 && !completed) {
          const timer = setTimeout(() => {
            setShowPopup(true);
            AsyncStorage.setItem('popup_last_shown', today);
          }, 2000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        // Error checking storage
      }
    };

    checkAndShowPopup();
  }, [words, completed]);

  const nextSlide = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(words.length - 1);
      setCompleted(true);
      markVocabularyAsCompleted();
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const markVocabularyAsCompleted = async () => {
    if (!courseStatus) return;
    try {
      const currentWeek = courseStatus.course.currentWeek;
      const currentDay = courseStatus.course.currentDay;
      await vocabularyService.markVocabularyAsCompleted(
        currentWeek,
        currentDay
      );
      setShowPopup(false);
    } catch (err) {
      // Error marking as completed
    }
  };

  const currentWord = words[currentIndex];

  if (!showPopup || words.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={showPopup}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPopup(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Today's Vocabulary</Text>
            <TouchableOpacity
              onPress={() => setShowPopup(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {currentWord && (
            <ScrollView style={styles.wordContent}>
              <Text style={styles.wordText}>{currentWord.word}</Text>
              <Text style={styles.wordDefinition}>
                {currentWord.definition}
              </Text>
              {currentWord.example && (
                <Text style={styles.wordExample}>
                  Example: {currentWord.example}
                </Text>
              )}
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={prevSlide}
              disabled={currentIndex === 0}
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.counter}>
              {currentIndex + 1} / {words.length}
            </Text>
            <TouchableOpacity
              onPress={nextSlide}
              disabled={currentIndex === words.length - 1}
              style={[
                styles.navButton,
                currentIndex === words.length - 1 && styles.navButtonDisabled,
              ]}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.dark.backgroundCard,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: colors.white,
  },
  closeButton: {
    padding: spacing.xs,
  },
  wordContent: {
    marginBottom: spacing.md,
    minHeight: 120,
  },
  wordText: {
    fontSize: 20,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  wordDefinition: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  wordExample: {
    fontSize: 13,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  counter: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
});
