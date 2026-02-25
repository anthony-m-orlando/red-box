# Testing Guide

## Overview

This project uses **Vitest** for unit and integration testing, and **React Testing Library** for component testing.

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm test -- --watch

# Run tests with UI (visual test runner)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Running Specific Tests

```bash
# Run tests in a specific file
npm test dice.test.js

# Run tests matching a pattern
npm test -- --grep="Button"

# Run only tests in changed files
npm test -- --changed
```

## Test Organization

```
src/
├── utils/
│   ├── dice.js
│   ├── dice.test.js          # Unit tests for dice utilities
│   ├── calculations.js
│   └── calculations.test.js  # Unit tests for calculations
├── components/
│   └── common/
│       ├── Button.jsx
│       ├── Button.test.jsx         # Component tests
│       ├── PaperContainer.jsx
│       └── PaperContainer.test.jsx
├── contexts/
│   ├── CharacterContext.jsx
│   └── CharacterContext.test.jsx   # Integration tests
└── test/
    └── setup.js                    # Test configuration
```

## Test Types

### Unit Tests
Test individual functions in isolation:
- `dice.test.js` - Dice rolling utilities
- `calculations.test.js` - D&D calculations (HP, AC, THAC0, etc.)

### Component Tests
Test React components:
- `Button.test.jsx` - Button component behavior
- `PaperContainer.test.jsx` - Paper container variants

### Integration Tests
Test contexts and state management:
- `CharacterContext.test.jsx` - Character state management

## Writing New Tests

### Unit Test Example

```javascript
import { describe, it, expect } from 'vitest';
import { rollD20 } from '../utils/dice';

describe('rollD20', () => {
  it('should return a number between 1 and 20', () => {
    const result = rollD20();
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(20);
  });
});
```

### Component Test Example

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

it('should call onClick when clicked', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();
  
  render(<Button onClick={handleClick}>Click</Button>);
  await user.click(screen.getByText('Click'));
  
  expect(handleClick).toHaveBeenCalled();
});
```

### Context Test Example

```javascript
import { renderHook, act } from '@testing-library/react';
import { CharacterProvider, useCharacter } from './CharacterContext';

it('should set character name', () => {
  const wrapper = ({ children }) => (
    <CharacterProvider>{children}</CharacterProvider>
  );
  
  const { result } = renderHook(() => useCharacter(), { wrapper });
  
  act(() => {
    result.current.setName('Thorin');
  });
  
  expect(result.current.character.name).toBe('Thorin');
});
```

## Coverage Goals

Current coverage targets:
- **Utilities**: 100% (pure functions, easy to test)
- **Components**: 80%+ (UI components)
- **Contexts**: 90%+ (state management)
- **Overall**: 85%+

View coverage report:
```bash
npm run test:coverage
# Opens HTML report in coverage/index.html
```

## Best Practices

### Do's ✅
- Test behavior, not implementation
- Use meaningful test descriptions
- Test edge cases and error conditions
- Keep tests isolated and independent
- Mock external dependencies
- Use `describe` blocks to group related tests

### Don'ts ❌
- Don't test library code
- Don't test CSS/styling details
- Don't make tests depend on each other
- Don't test private implementation details
- Don't skip error case testing

## Continuous Integration

Tests run automatically on:
- Every commit (via git hooks - coming soon)
- Pull requests
- Before deployment

All tests must pass before merging code.

## Test Categories

### Critical (Must Always Pass)
- Dice rolling (randomness validation)
- Character calculations (HP, AC, THAC0)
- Class requirements
- State management

### Important (Should Pass)
- Component rendering
- User interactions
- Context state updates
- Data validation

### Nice to Have
- Edge cases
- Error messages
- Accessibility
- Performance

## Debugging Tests

### Failed Test
```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run single test file
npm test dice.test.js

# Use debugger
npm test -- --inspect-brk
```

### Common Issues

**Issue**: "Cannot find module"
- Solution: Check import paths, ensure file exists

**Issue**: "localStorage is not defined"  
- Solution: Already mocked in setup.js

**Issue**: "Component not updating"
- Solution: Wrap state changes in `act()`

## Mocking

### localStorage (Already Set Up)
```javascript
// Automatically mocked in setup.js
localStorage.getItem.mockReturnValue('{"name":"Test"}');
```

### Random Functions
```javascript
import { vi } from 'vitest';

// Mock Math.random for predictable dice rolls
vi.spyOn(Math, 'random').mockReturnValue(0.5);
```

## Test Data

Use realistic test data:
```javascript
const testCharacter = {
  name: 'Test Hero',
  class: 'fighter',
  level: 1,
  abilities: {
    strength: 15,
    intelligence: 10,
    wisdom: 12,
    dexterity: 14,
    constitution: 13,
    charisma: 11
  }
};
```

## Performance

Tests should be fast:
- Unit tests: < 10ms each
- Component tests: < 100ms each
- Integration tests: < 500ms each

Total test suite: < 5 seconds

## Future Tests to Add

### High Priority
- [ ] AdventureContext tests
- [ ] Adventure data validation
- [ ] Combat calculations
- [ ] Map display logic

### Medium Priority
- [ ] NarrationPanel tests
- [ ] MapDisplay component tests
- [ ] ActionPanel tests
- [ ] Routing tests

### Low Priority
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests
- [ ] Performance tests
- [ ] Accessibility tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Questions?

If tests are failing:
1. Check the error message
2. Run with `--reporter=verbose`
3. Check test file for clues
4. Review the component/function being tested
5. Ask for help!

---

**Remember**: Good tests are your safety net. Write them early, run them often! 🎯
