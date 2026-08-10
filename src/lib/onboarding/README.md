# Onboarding Step Definitions

## Overview

This module contains data-driven step configuration that replaces the hardcoded switch statement. Each step in the onboarding flow is defined with its type, field, title, options, and validation.

## Files

- **stepDefinitions.ts**: All 15 step definitions with metadata
- **stepOptions.ts**: Step option data (all option arrays)
- **stepValidation.ts**: Step-specific validation rules
- **validation.ts**: General validation utilities

## Step Definition Structure

Each step is defined as:

```typescript
{
  id: number;
  type: 'single-select' | 'multi-select' | 'custom';
  field: keyof UserSelections;
  title: string;
  subtitle?: string;
  options?: StepOption[];
  validation: (value: any) => boolean;
  gridCols?: string;
  showIcon?: boolean;
}
```

## Step Types

### Single-Select Steps
- User selects one option
- Automatically advances to next step on selection
- Examples: Industry, Gender, Current Level

### Multi-Select Steps
- User can select multiple options
- Requires clicking "Continue" to proceed
- Examples: Learning Methods, Interests, Tutor Style

### Custom Steps
- Special handling for unique layouts
- Examples: Step 0 (Skill selection), Step 1 (Language statement), Step 3 (Speaking feelings)

## Usage

```typescript
import { getStepDefinition, STEP_DEFINITIONS } from '@/lib/onboarding/stepDefinitions';

// Get a specific step
const step = getStepDefinition(0);

// Validate step completion
const isValid = validateStepCompletion(0, selections);

// Find next incomplete step
const nextStep = findNextIncompleteStep(0, selections);
```

## Adding New Steps

1. Add step definition to `STEP_DEFINITIONS` array
2. Add options to `stepOptions.ts` if needed
3. Add validation rule to `stepValidation.ts`
4. Update `TOTAL_STEPS` constant

## Validation

Each step has a validation function that checks if the step is completed:

```typescript
validation: (value: any) => boolean
```

For array fields (multi-select), validation checks if array length > 0.
For string fields (single-select), validation checks if value is not null/empty.
