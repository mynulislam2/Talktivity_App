/**
 * Step Options Data
 * 
 * Contains all option data for onboarding steps.
 * This data is used by step definitions to render options.
 */

import { StepOption } from '@/types/onboarding/steps';

// Step 0: Skill to improve
export const SKILL_OPTIONS: StepOption[] = [
  { id: 'grammar', text: 'Grammar', icon: '🖊️' },
  { id: 'vocabulary', text: 'Vocabulary', icon: '📖' },
  { id: 'fluency', text: 'Fluency', icon: '🌊' },
  { id: 'pronunciation', text: 'Pronunciation', icon: '🔊' },
];

// Step 1: Language statement
export const LANGUAGE_STATEMENT_OPTIONS: StepOption[] = [
  { id: 'No', text: 'No', icon: '❌' },
  { id: 'Maybe', text: 'Maybe', icon: '🤔' },
  { id: 'Yes', text: 'Yes', icon: '✅' },
];

// Step 2: Industry
export const INDUSTRY_OPTIONS: StepOption[] = [
  { id: 'tech', text: 'Tech & Engineering', icon: '💻' },
  { id: 'business', text: 'Business & Finance', icon: '📊' },
  { id: 'education', text: 'Students & Education', icon: '🎓' },
  { id: 'creative', text: 'Creative & Media', icon: '🎨' },
  { id: 'services', text: 'Services & Skilled Jobs', icon: '🔧' },
  { id: 'marketing', text: 'Marketing & Sales', icon: '📈' },
  { id: 'healthcare', text: 'Healthcare & Science', icon: '👨‍⚕️' },
  { id: 'other', text: 'Other Fields', icon: '🌐' },
];

// Step 3: Speaking feelings
export const SPEAKING_FEELINGS_OPTIONS: StepOption[] = [
  { id: 'anxious', text: 'I get anxious', icon: '😰' },
  { id: 'freeze', text: 'I freeze and forget', icon: '🥶' },
  { id: 'avoid', text: 'I avoid speaking', icon: '🙈' },
  { id: 'embarrassed', text: 'I feel embarrassed', icon: '😳' },
  { id: 'confident', text: 'I feel confident', icon: '😎' },
];

// Step 4: Speaking frequency
export const SPEAKING_FREQUENCY_OPTIONS: StepOption[] = [
  { id: 'monthly', text: 'A few times per month', icon: '📅' },
  { id: 'weekly', text: 'A few times per week', icon: '🗓️' },
  { id: 'daily', text: 'Every day', icon: '☀️' },
  { id: 'none', text: 'None', icon: '🙊' },
];

// Step 5: Main goal
export const MAIN_GOAL_OPTIONS: StepOption[] = [
  { id: 'work', text: 'Speak confidently at work', icon: '💼' },
  { id: 'job', text: 'Find a new job', icon: '🔍' },
  { id: 'abroad', text: 'Live comfortably abroad', icon: '🏙️' },
  { id: 'travel', text: 'Travel with ease', icon: '✈️' },
  { id: 'skills', text: 'Expand my skills', icon: '🧠' },
  { id: 'connect', text: 'Connect with family & friends', icon: '👨‍👩‍👧‍👦' },
];

// Step 6: Gender
export const GENDER_OPTIONS: StepOption[] = [
  { id: 'male', text: 'Male', icon: '👨' },
  { id: 'female', text: 'Female', icon: '👩' },
];

// Step 7: Current learning methods
export const LEARNING_METHODS_OPTIONS: StepOption[] = [
  { id: 'classes', text: 'Classes or courses', icon: '🏫' },
  { id: 'apps', text: 'Learning apps', icon: '📱' },
  { id: 'videos', text: 'Videos or movies', icon: '🎬' },
  { id: 'podcasts', text: 'Podcasts or audiobooks', icon: '🎧' },
  { id: 'speaking', text: 'Speaking with others', icon: '🗣️' },
  { id: 'none', text: 'Not learning right now', icon: '⏸️' },
];

// Step 8: Current level
export const CURRENT_LEVEL_OPTIONS: StepOption[] = [
  { id: 'beginner', text: 'Beginner: I can buy things & order food', icon: '🔤' },
  { id: 'intermediate', text: 'Intermediate: I can have simple conversations', icon: '💬' },
  { id: 'upper', text: 'Upper-Intermediate: I can explain my opinions', icon: '🗣️' },
  { id: 'advanced', text: 'Advanced: I speak confidently in any situation', icon: '🏆' },
];

// Step 9: Native language
export const NATIVE_LANGUAGE_OPTIONS: StepOption[] = [
  { id: 'bangla', text: 'Bangla' },
  { id: 'chinese', text: 'Chinese' },
  { id: 'french', text: 'French' },
  { id: 'german', text: 'German' },
  { id: 'english', text: 'English' },
  { id: 'hindi', text: 'Hindi' },
  { id: 'italian', text: 'Italian' },
  { id: 'japanese', text: 'Japanese' },
  { id: 'korean', text: 'Korean' },
  { id: 'polish', text: 'Polish' },
  { id: 'russian', text: 'Russian' },
  { id: 'spanish', text: 'Spanish' },
  { id: 'turkish', text: 'Turkish' },
  { id: 'ukrainian', text: 'Ukrainian' },
  { id: 'other', text: 'Other' },
];

// Step 10 & 11: Known words
export const KNOWN_WORDS_1: StepOption[] = [
  { id: 'improve', text: 'improve' },
  { id: 'opportunity', text: 'opportunity' },
  { id: 'recognize', text: 'recognize' },
  { id: 'achievement', text: 'achievement' },
  { id: 'conscientious', text: 'conscientious' },
  { id: 'perspective', text: 'perspective' },
  { id: 'different', text: 'different' },
  { id: 'modify', text: 'modify' },
  { id: 'acquisition', text: 'acquisition' },
  { id: 'decision', text: 'decision' },
  { id: 'solution', text: 'solution' },
  { id: 'paradigm', text: 'paradigm' },
  { id: 'many', text: 'many' },
  { id: 'facilitate', text: 'facilitate' },
  { id: 'sovereignty', text: 'sovereignty' },
];

export const KNOWN_WORDS_2: StepOption[] = [
  { id: 'enough', text: 'enough' },
  { id: 'procrastinate', text: 'procrastinate' },
  { id: 'confidence', text: 'confidence' },
  { id: 'discourse', text: 'discourse' },
  { id: 'always', text: 'always' },
  { id: 'something', text: 'something' },
  { id: 'complicated', text: 'complicated' },
  { id: 'perplexed', text: 'perplexed' },
  { id: 'place', text: 'place' },
  { id: 'inference', text: 'inference' },
  { id: 'never', text: 'never' },
  { id: 'during', text: 'during' },
  { id: 'sometimes', text: 'sometimes' },
  { id: 'before', text: 'before' },
  { id: 'people', text: 'people' },
];

// Step 12: Interests
export const INTERESTS_OPTIONS: StepOption[] = [
  { id: 'memes', text: 'memes' },
  { id: 'humor', text: 'humor' },
  { id: 'tech', text: 'tech' },
  { id: 'diy', text: 'diy' },
  { id: 'music', text: 'music' },
  { id: 'business', text: 'business' },
  { id: 'news', text: 'news' },
  { id: 'food', text: 'food' },
  { id: 'sports', text: 'sports' },
  { id: 'gaming', text: 'gaming' },
  { id: 'movies', text: 'movies' },
  { id: 'art', text: 'art' },
  { id: 'cooking', text: 'cooking' },
  { id: 'anime', text: 'anime' },
  { id: 'travel', text: 'travel' },
  { id: 'cars', text: 'cars' },
  { id: 'fitness', text: 'fitness' },
  { id: 'books', text: 'books' },
  { id: 'science', text: 'science' },
  { id: 'fashion', text: 'fashion' },
  { id: 'growth', text: 'growth' },
  { id: 'mindfulness', text: 'mindfulness' },
  { id: 'streaming', text: 'streaming' },
  { id: 'podcasts', text: 'podcasts' },
];

// Step 13: English style
export const ENGLISH_STYLE_OPTIONS: StepOption[] = [
  { id: 'casual', text: 'Casual English', icon: '🗣️' },
  { id: 'business', text: 'Business English', icon: '💼' },
  { id: 'slang', text: 'Slang and idioms', icon: '🤙' },
  { id: 'academic', text: 'Academic English', icon: '🎓' },
  { id: 'travel', text: 'Travel English', icon: '✈️' },
];

// Step 14: Tutor style
export const TUTOR_STYLE_OPTIONS: StepOption[] = [
  { id: 'cheerful', text: 'cheerful' },
  { id: 'energetic', text: 'energetic' },
  { id: 'patient', text: 'patient' },
  { id: 'strict', text: 'strict' },
  { id: 'academic', text: 'academic' },
  { id: 'demanding', text: 'demanding' },
  { id: 'friendly', text: 'friendly' },
  { id: 'relaxed', text: 'relaxed' },
  { id: 'encouraging', text: 'encouraging' },
];
