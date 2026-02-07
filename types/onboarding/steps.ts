import { UserSelections } from './selections';

/**
 * Step option for single-select and multi-select steps
 */
export interface StepOption {
  id: string;
  text: string;
  icon?: string;
}

/**
 * Step type enumeration
 */
export type StepType = 'single-select' | 'multi-select' | 'custom';

/**
 * Step definition metadata
 * 
 * Each step in the onboarding flow is defined by this interface,
 * allowing for data-driven step rendering and validation.
 */
export interface StepDefinition {
  id: number;
  type: StepType;
  field: keyof UserSelections;
  title: string;
  subtitle?: string;
  options?: StepOption[];
  validation: (value: any) => boolean;
  gridCols?: string; // CSS grid columns class (e.g., "sm:grid-cols-2")
  showIcon?: boolean; // Whether to show icons for options
}

/**
 * Total number of onboarding steps
 */
export const TOTAL_STEPS = 15;
