import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useResponsive } from '@/theme/responsive';
import { AppBackButton } from '@/components/common/AppBackButton';

interface IeltsHeaderProps {
  title: string;
  onBack: () => void;
  timerSeconds?: number | null;
  rightAction?: React.ReactNode;
}

function formatAudioTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '00:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const IeltsHeader: React.FC<IeltsHeaderProps> = ({
  title,
  onBack,
  timerSeconds,
  rightAction,
}) => {
  const { s } = useResponsive();

  return (
    <View style={styles.container}>
      <AppBackButton onPress={onBack} />

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {timerSeconds != null ? (
          <View style={styles.timerDisplay}>
            <Feather
              name="clock"
              size={s(13)}
              color={timerSeconds <= 300 ? '#F87171' : '#C55DFE'}
            />
            <Text
              style={[
                styles.timerText,
                timerSeconds <= 300 && { color: '#F87171' },
              ]}
            >
              {formatAudioTime(timerSeconds)}
            </Text>
          </View>
        ) : rightAction ? (
          rightAction
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  rightContainer: {
    minWidth: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  placeholder: {
    width: 42,
    height: 42,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    color: '#C55DFE',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});

export default IeltsHeader;
