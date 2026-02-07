# OnboardingService

## Overview

The `OnboardingService` is a type-safe service layer that handles all onboarding-related operations including saving onboarding data, progress calculation, and validation. This service acts as the data access layer for onboarding, managing API calls and providing helper methods.

## Architecture

The service follows the same architecture pattern as `AuthService`:

- **Type-safe methods**: All methods use proper TypeScript types
- **Error handling**: Throws typed errors using error handler utilities
- **Progress calculation**: Helper method to calculate completion percentage
- **Validation**: Centralized validation logic
- **Consistent API**: Follows same pattern as AuthService

## API Methods

### `saveOnboarding(data: UserSelections, userId?: string): Promise<OnboardingSaveResponse>`

Saves or updates onboarding data by calling `POST /api/onboarding`.

**Parameters:**
- `data`: UserSelections object with all 15 fields
- `userId`: Optional user ID (can be extracted from auth context)

**Returns:** Promise resolving to save response with progress and completion status

**Throws:**
- `OnboardingSaveError`: If the API call fails
- `OnboardingValidationError`: If validation fails

**Example:**
```typescript
const response = await onboardingService.saveOnboarding(selections, userId);
if (response.success) {
  console.log('Progress:', response.data.onboardingProgress);
}
```

## Helper Methods

### `calculateProgress(selections: UserSelections): number`

Calculates progress percentage based on filled fields.

**Returns:** Progress percentage (0-100)

### `validateSelections(selections: UserSelections): ValidationResult`

Validates onboarding selections.

**Returns:** Validation result with `isValid` flag and error messages

### `isComplete(selections: UserSelections): boolean`

Checks if all onboarding fields are filled.

**Returns:** True if all 15 fields are filled

### `getCompletedStepsCount(selections: UserSelections): number`

Gets count of completed steps.

**Returns:** Number of completed steps (0-15)

### `getInitialSelections(): UserSelections`

Gets initial empty selections.

**Returns:** Initial UserSelections object with all fields null/empty

## Integration with Redux

The service is used by the Redux `onboardingSlice` for:
- Saving onboarding data via `saveOnboarding` thunk
- Calculating progress and step counts
- Validating selections before saving

## Error Handling

All errors are converted to typed `OnboardingError` instances:
- `OnboardingValidationError`: For validation failures
- `OnboardingSaveError`: For save operation failures

## Related Services

- **LifecycleService**: Handles `GET /api/lifecycle` to fetch onboarding status and data
- **AuthService**: Provides user authentication context
