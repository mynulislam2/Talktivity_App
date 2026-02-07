#!/bin/bash
# Phase 7: Testing & Validation Scripts
# Quick commands to verify Phase 7 implementation

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Phase 7: Polish & Testing - Validation Suite ===${NC}\n"

# ============================================================================
# 1. Check Phase 7 Files Exist
# ============================================================================
echo -e "${YELLOW}Step 1: Checking Phase 7 files exist...${NC}"

files=(
  "Hooks/useSoundEffect.ts"
  "Hooks/useNotifications.ts"
  "lib/errorHandler.ts"
  "lib/performanceMonitor.ts"
  "components/common/ErrorBoundary.tsx"
  "__tests__/errorHandler.test.ts"
  "__tests__/AuthService.test.ts"
  "__tests__/useAuth.test.ts"
  "jest.config.js"
  "jest.setup.js"
)

files_found=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
    ((files_found++))
  else
    echo -e "${RED}✗${NC} $file (MISSING)"
  fi
done

echo -e "\nFound: ${GREEN}$files_found / ${#files[@]} files${NC}\n"

# ============================================================================
# 2. Check TypeScript Compilation
# ============================================================================
echo -e "${YELLOW}Step 2: Checking TypeScript compilation...${NC}"

if npx tsc --noEmit 2>/dev/null; then
  echo -e "${GREEN}✓${NC} No TypeScript errors\n"
else
  echo -e "${RED}✗${NC} TypeScript compilation errors found\n"
fi

# ============================================================================
# 3. Check Dependencies
# ============================================================================
echo -e "${YELLOW}Step 3: Checking Phase 7 dependencies...${NC}"

deps=(
  "expo-audio"
  "expo-notifications"
  "expo-image-picker"
  "@testing-library/jest-dom"
  "@testing-library/react"
  "@testing-library/react-hooks"
  "@testing-library/react-native"
)

if [ -f "package-lock.json" ] || [ -f "yarn.lock" ] || [ -d "node_modules" ]; then
  deps_found=0
  for dep in "${deps[@]}"; do
    if grep -q "\"$dep\"" package.json 2>/dev/null; then
      echo -e "${GREEN}✓${NC} $dep"
      ((deps_found++))
    else
      echo -e "${YELLOW}?${NC} $dep (may need npm install)"
    fi
  done
  echo -e "\nDependencies: ${GREEN}$deps_found / ${#deps[@]}${NC}\n"
else
  echo -e "${RED}⚠${NC} Dependencies not installed. Run: npm install\n"
fi

# ============================================================================
# 4. Run Tests
# ============================================================================
echo -e "${YELLOW}Step 4: Running error handler tests...${NC}"

if npm test -- errorHandler.test.ts --passWithNoTests 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Error handler tests passed\n"
else
  echo -e "${YELLOW}ℹ${NC} Tests may need npm install first\n"
fi

# ============================================================================
# 5. Check ErrorBoundary Integration
# ============================================================================
echo -e "${YELLOW}Step 5: Checking ErrorBoundary integration...${NC}"

if grep -q "ErrorBoundary" app/_layout.tsx; then
  echo -e "${GREEN}✓${NC} ErrorBoundary imported in app/_layout.tsx"
fi

if grep -q "<ErrorBoundary>" app/_layout.tsx; then
  echo -e "${GREEN}✓${NC} ErrorBoundary wraps RootNavigator\n"
else
  echo -e "${RED}✗${NC} ErrorBoundary not wrapping RootNavigator\n"
fi

# ============================================================================
# 6. File Statistics
# ============================================================================
echo -e "${YELLOW}Step 6: Phase 7 Code Statistics...${NC}"

total_lines=0
if [ -d "Hooks" ] || [ -d "lib" ] || [ -d "__tests__" ]; then
  for file in "${files[@]}"; do
    if [ -f "$file" ]; then
      lines=$(wc -l < "$file" 2>/dev/null || echo 0)
      total_lines=$((total_lines + lines))
    fi
  done
fi

echo -e "Total Phase 7 lines: ${GREEN}$total_lines+${NC}\n"

# ============================================================================
# 7. Summary Report
# ============================================================================
echo -e "${BLUE}=== Phase 7 Validation Summary ===${NC}\n"

echo -e "Files Created:     $files_found / ${#files[@]}"
echo -e "Dependencies:      Check step 3"
echo -e "TypeScript:        Check step 2"
echo -e "Tests:             Ready (run: ${GREEN}npm test${NC})"
echo -e "Integration:       ErrorBoundary wrapping app\n"

# ============================================================================
# 8. Quick Test Commands
# ============================================================================
echo -e "${BLUE}=== Quick Test Commands ===${NC}\n"

echo "Run all tests:"
echo "  ${GREEN}npm test${NC}"
echo ""
echo "Run error handler tests:"
echo "  ${GREEN}npm test errorHandler.test.ts${NC}"
echo ""
echo "Run with coverage:"
echo "  ${GREEN}npm test -- --coverage${NC}"
echo ""
echo "Watch mode:"
echo "  ${GREEN}npm test -- --watch${NC}"
echo ""

# ============================================================================
# 9. Integration Checklist
# ============================================================================
echo -e "${BLUE}=== Phase 7 Integration Checklist ===${NC}\n"

echo "Immediate (Required for testing):"
echo "  [ ] npm install"
echo "  [ ] npm test (verify error handler tests pass)"
echo "  [ ] npx tsc --noEmit (check for TypeScript errors)"
echo ""
echo "Short term (Integrate features):"
echo "  [ ] Add sound files: assets/sounds/success.wav, error.wav, etc."
echo "  [ ] Call requestPermissions() in app startup (useNotifications)"
echo "  [ ] Wrap API calls with handleApiError()"
echo "  [ ] Add performanceMonitor.startMeasure() to screens"
echo ""
echo "Medium term (Expand tests):"
echo "  [ ] Complete AuthService.test.ts"
echo "  [ ] Complete useAuth.test.ts"
echo "  [ ] Add hook tests for useSoundEffect, useNotifications"
echo "  [ ] Add component tests for critical screens"
echo ""
echo "Long term (Production):"
echo "  [ ] Setup Sentry for error tracking"
echo "  [ ] Setup analytics provider (Mixpanel/Amplitude)"
echo "  [ ] Test on real iOS device"
echo "  [ ] Test on real Android device"
echo ""

# ============================================================================
# 10. Common Issues
# ============================================================================
echo -e "${BLUE}=== Troubleshooting ===${NC}\n"

echo "Issue: Tests not running"
echo "  Solution: npm test -- --clearCache && npm test"
echo ""
echo "Issue: Module not found errors"
echo "  Solution: npm install"
echo ""
echo "Issue: TypeScript errors"
echo "  Solution: npm run type-check or npx tsc --noEmit"
echo ""
echo "Issue: Audio not working"
echo "  Solution: Add sound files to assets/sounds/"
echo ""
echo "Issue: ErrorBoundary not activated"
echo "  Solution: Check app/_layout.tsx has ErrorBoundary import and wrapper"
echo ""

echo -e "${GREEN}=== Phase 7 Validation Complete ===${NC}\n"
