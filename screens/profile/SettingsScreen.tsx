/**
 * Settings Screen
 * 
 * App preferences, account settings, and other configurations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import SettingsItem from '../../components/profile/SettingsItem';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';

interface SettingsScreenProps {
  navigation: any;
}

interface AppSettings {
  notificationEnabled: boolean;
  darkModeEnabled: boolean;
  privateProfile: boolean;
  emailNotifications: boolean;
  language: string;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [settings, setSettings] = useState<AppSettings>({
    notificationEnabled: true,
    darkModeEnabled: false,
    privateProfile: false,
    emailNotifications: true,
    language: 'English',
  });
  const [isLoading, setIsLoading] = useState(true);

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleToggle = (key: keyof AppSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    saveSettings(newSettings);
  };

  const handleLanguageSelect = () => {
    const options = [
      ...languages.map((lang) => ({
        text: lang,
        onPress: () => {
          const newSettings = { ...settings, language: lang };
          saveSettings(newSettings);
        },
      })),
      { text: 'Cancel', onPress: () => {}, style: 'cancel' as const },
    ];

    Alert.alert('Select Language', '', options);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              // Clear local data
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('user');
              dispatch(logoutUser());
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItemWrapper}>
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive app notifications
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notificationEnabled}
              onValueChange={() => handleToggle('notificationEnabled')}
              trackColor={{ false: '#E5E5E5', true: '#B3E5FC' }}
              thumbColor={settings.notificationEnabled ? colors.primary : '#C5C5C5'}
            />
          </View>

          <View style={styles.settingItemWrapper}>
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemIcon}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive emails from us
                </Text>
              </View>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => handleToggle('emailNotifications')}
              trackColor={{ false: '#E5E5E5', true: '#B3E5FC' }}
              thumbColor={settings.emailNotifications ? colors.primary : '#C5C5C5'}
            />
          </View>
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          
          <View style={styles.settingItemWrapper}>
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemIcon}>
                <Ionicons name="moon-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Use dark theme
                </Text>
              </View>
            </View>
            <Switch
              value={settings.darkModeEnabled}
              onValueChange={() => handleToggle('darkModeEnabled')}
              trackColor={{ false: '#E5E5E5', true: '#B3E5FC' }}
              thumbColor={settings.darkModeEnabled ? colors.primary : '#C5C5C5'}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <View style={styles.settingItemWrapper}>
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingLabel}>Private Profile</Text>
                <Text style={styles.settingDescription}>
                  Hide profile from other users
                </Text>
              </View>
            </View>
            <Switch
              value={settings.privateProfile}
              onValueChange={() => handleToggle('privateProfile')}
              trackColor={{ false: '#E5E5E5', true: '#B3E5FC' }}
              thumbColor={settings.privateProfile ? colors.primary : '#C5C5C5'}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <TouchableOpacity
            style={styles.settingItemWrapper}
            onPress={handleLanguageSelect}
          >
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemIcon}>
                <Ionicons name="globe-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingDescription}>
                  {settings.language}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity
            style={styles.settingItemWrapper}
            onPress={() => {
              Alert.alert(
                'Help & Support',
                'For assistance, please contact support@talktivity.com',
              );
            }}
          >
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemIcon}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingLabel}>Help & Support</Text>
                <Text style={styles.settingDescription}>
                  Get help and report issues
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItemWrapper}
            onPress={() => {
              Alert.alert(
                'About Talktivity',
                'Talktivity v1.0.0\n\nAn AI-powered English learning platform',
              );
            }}
          >
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingLabel}>About</Text>
                <Text style={styles.settingDescription}>
                  About Talktivity
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Talktivity v1.0.0</Text>
          <Text style={styles.footerText}>© 2024 Talktivity</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  settingItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  settingItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingItemText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFE5E5',
    borderRadius: 8,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default SettingsScreen;
