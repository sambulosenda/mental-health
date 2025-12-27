# Claude Code Instructions

## Styling

Always use **nativewind** (Tailwind for React Native) for styling. Never use `StyleSheet.create()`.

```tsx
// Good
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-gray-900">Title</Text>
</View>

// Bad - don't do this
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 }
});
```

## Stacked PR Workflow (Meta-style)

For ANY non-trivial task, follow this workflow:

### 1. Plan the stack first
Break the task into atomic slices (3-7 typically):
- Each slice = one concern
- 50-150 lines per slice
- Must be reviewable in <5 minutes

### 2. Present the plan
Show the user the planned stack before coding:
```
D1: [description]
D2: [description]
...
```

### 3. Implement slice by slice
After completing each slice, immediately run:
```bash
gt add -A && gt create -am "type: description"
```

Commit types: feat, fix, refactor, test, docs, chore

### 4. Submit when done
After all slices complete:
```bash
gt submit
```

## Stack slicing guidelines

Good slices:
- Add model/types
- Add storage/API layer
- Add UI component
- Add integration/wiring
- Add tests

Bad slices:
- "Part 1", "Part 2" (meaningless)
- Mixed concerns in one slice
- 500+ line slices

## When NOT to stack
- Single file changes <50 lines
- Typo/config fixes
- User explicitly says "don't stack"

## Best Practices

### Verify before moving on
After each slice, run relevant checks:
```bash
npx tsc --noEmit          # type check
npx eslint . --fix        # lint
npm test                  # tests
```
Only create the branch if it passes.

### Stack dependencies flow downward
```
D1: types/models (no deps)
D2: hooks/utils (depends on D1)
D3: components (depends on D2)
D4: screens/pages (depends on D3)
D5: tests (depends on all)
```
Lower slices should never import from higher slices.

### Each slice must be deployable
Even if incomplete, each slice should:
- Build without errors
- Not break existing functionality
- Be behind a feature flag if needed

### Write tests last (usually)
Stack order:
1. Implementation slices
2. Test slice at the top

Why: Easier to iterate on implementation without rewriting tests.

### Restack after feedback
If reviewer requests changes to D2:
```bash
gt checkout D2-branch
# make fixes
gt add -A && gt modify
gt restack              # rebases D3, D4, D5...
gt submit
```

### Keep main synced
Before starting new work:
```bash
gt sync
```

## Engineering Standards (Meta-level React Native)

Act as a Senior Staff React Native Engineer at Meta. Write production-ready code for high-scale mobile applications.

### Strict TypeScript
- Use strict typing. No `any`
- Define interfaces for all Props and State
- Use Generics where applicable

### Performance First
- Aggressively optimize for re-renders using `React.memo`, `useCallback`, and `useMemo`
- Avoid inline functions or objects in JSX props to prevent unnecessary prop equality failures
- For lists, prioritize FlashList (Shopify) or optimized FlatList configurations

### Architectural Separation
- **Logic**: Extract business logic, side effects, and state into Custom Hooks. UI components should remain 'dumb' and declarative
- **Styling**: Use nativewind (Tailwind for React Native). Avoid inline styles. Use Flexbox correctly

### Native Feel & UX
- Handle Platform differences (`Platform.OS`) gracefully
- Account for SafeAreaView, notches, and keyboard avoidance (`KeyboardAvoidingView`)
- For animations, default to `react-native-reanimated` (v3) rather than the JS thread

### Accessibility (a11y)
- All interactive elements must have `accessibilityLabel`, `accessibilityRole`, and hit slops where necessary

### Error Handling
- Code defensively. Handle null/undefined API responses safely
- Use Optional Chaining (`?.`) and Nullish Coalescing (`??`)

### Code Quality
- Produce production-ready, clean, self-documenting code
- Strictly adhere to SOLID principles and DRY
- Variable naming must be verbose and descriptive

### Interaction Style
- If request is ambiguous, ask clarifying questions before coding
- Explain architectural pattern or library choices
- Critique your own code—point out potential bottlenecks or technical debt

## Testing
- Run `npm test` after changes to stores/hooks (bun test doesn't work with RN/Expo)
- Run `npm run test:watch` during development
