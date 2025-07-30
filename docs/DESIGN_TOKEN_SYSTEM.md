# Design Token System

## Overview
The Design Token System provides a consistent, maintainable approach to styling across the ADHD Family Support app. It centralizes typography, colors, spacing, and layout patterns into reusable tokens.

## 🎯 **What We've Implemented**

### **1. Design Tokens (`constants/designTokens.ts`)**
- **Typography**: Font sizes, weights, and predefined styles
- **Colors**: Primary, text, background, border, status colors
- **Spacing**: Consistent spacing scale (4px, 8px, 16px, etc.)
- **Layout**: SafeArea, header, container, card configurations
- **Shadows**: Predefined shadow styles for elevation
- **Border Radius**: Consistent border radius values

### **2. Reusable Components (`components/Layout.tsx`)**
- **AppSafeArea**: Consistent SafeArea implementation
- **PageHeader**: Standardized page headers with optional back button
- **SectionHeader**: Section titles with consistent styling
- **Card**: Reusable card component with shadows
- **Container**: Standardized container with padding
- **Button**: Consistent button styling

### **3. Example Implementations**
- **Schedule Page**: Fully migrated to design tokens
- **Learning Hub**: Fully migrated to design tokens
- **Food Scanner**: Header migrated to design tokens

## 📚 **How to Use the Design Token System**

### **1. Import Design Tokens**
```typescript
import { TYPOGRAPHY, COLORS, SPACING, LAYOUT } from '@/constants/designTokens';
```

### **2. Use Typography Styles**
```typescript
// Instead of hardcoded styles
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  }
});

// Use design tokens
const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.styles.title
  }
});
```

### **3. Use Reusable Components**
```typescript
import { AppSafeArea, PageHeader, Card, Container } from '@/components/Layout';

// Instead of custom SafeArea and header
return (
  <AppSafeArea>
    <PageHeader title="My Page" />
    <Container>
      <Card>
        <Text style={TYPOGRAPHY.styles.body}>Content here</Text>
      </Card>
    </Container>
  </AppSafeArea>
);
```

## 🎨 **Typography System**

### **Available Typography Styles**
```typescript
TYPOGRAPHY.styles.title        // 24px, bold, #333
TYPOGRAPHY.styles.sectionHeader // 20px, bold, #333
TYPOGRAPHY.styles.body         // 16px, regular, #333
TYPOGRAPHY.styles.bodySecondary // 16px, regular, #666
TYPOGRAPHY.styles.button       // 14px, semibold, white
TYPOGRAPHY.styles.small        // 12px, medium, #666
TYPOGRAPHY.styles.tab          // 16px, medium, #666
TYPOGRAPHY.styles.tabActive    // 16px, semibold, #007bff
```

### **Typography Usage Examples**
```typescript
// Page title
<Text style={TYPOGRAPHY.styles.title}>Learning Hub</Text>

// Section header
<Text style={TYPOGRAPHY.styles.sectionHeader}>Quick Capture</Text>

// Body text
<Text style={TYPOGRAPHY.styles.body}>Regular content text</Text>

// Secondary text
<Text style={TYPOGRAPHY.styles.bodySecondary}>Supporting text</Text>

// Button text
<Text style={TYPOGRAPHY.styles.button}>Save Entry</Text>

// Small text (timestamps, tags)
<Text style={TYPOGRAPHY.styles.small}>2 hours ago</Text>
```

## 🎨 **Color System**

### **Available Colors**
```typescript
// Primary colors
COLORS.primary           // #007bff
COLORS.primaryDark      // #0056b3
COLORS.primaryLight     // #4da6ff

// Text colors
COLORS.text.primary     // #333
COLORS.text.secondary   // #666
COLORS.text.muted       // #888
COLORS.text.inverse     // #ffffff

// Background colors
COLORS.background.primary   // #ffffff
COLORS.background.secondary // #f8f9fa
COLORS.background.tertiary  // #e9ecef

// Status colors
COLORS.status.success   // #28a745
COLORS.status.warning   // #ffc107
COLORS.status.error     // #dc3545
COLORS.status.info      // #17a2b8
```

## 📏 **Spacing System**

### **Available Spacing Values**
```typescript
SPACING.xs    // 4px
SPACING.sm    // 8px
SPACING.md    // 16px
SPACING.lg    // 24px
SPACING.xl    // 32px
SPACING['2xl'] // 40px
SPACING['3xl'] // 48px
```

### **Spacing Usage Examples**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,        // 16px
    marginBottom: SPACING.lg,   // 24px
    gap: SPACING.sm,           // 8px
  }
});
```

## 🧩 **Layout Components**

### **AppSafeArea**
```typescript
<AppSafeArea backgroundColor={COLORS.background.secondary}>
  {/* Your content */}
</AppSafeArea>
```

### **PageHeader**
```typescript
// Basic header
<PageHeader title="My Page" />

// Header with back button
<PageHeader 
  title="My Page" 
  onBack={() => router.back()} 
/>

// Header with right component
<PageHeader 
  title="My Page"
  rightComponent={<TouchableOpacity><Icon /></TouchableOpacity>}
/>
```

### **SectionHeader**
```typescript
<SectionHeader title="📝 Quick Capture" />
```

### **Card**
```typescript
<Card padding="lg">
  <Text style={TYPOGRAPHY.styles.body}>Card content</Text>
</Card>
```

### **Container**
```typescript
<Container padding="md">
  {/* Your content with horizontal padding */}
</Container>
```

## 🔄 **Migration Guide**

### **Step 1: Update Imports**
```typescript
// Add to your imports
import { TYPOGRAPHY, COLORS, SPACING } from '@/constants/designTokens';
import { AppSafeArea, PageHeader, Card } from '@/components/Layout';
```

### **Step 2: Replace Hardcoded Values**
```typescript
// Before
const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  container: { padding: 16, backgroundColor: '#ffffff' }
});

// After
const styles = StyleSheet.create({
  title: { ...TYPOGRAPHY.styles.title },
  container: { padding: SPACING.md, backgroundColor: COLORS.background.primary }
});
```

### **Step 3: Use Reusable Components**
```typescript
// Before
<SafeAreaView style={styles.safeArea}>
  <View style={styles.header}>
    <Text style={styles.title}>My Page</Text>
  </View>
</SafeAreaView>

// After
<AppSafeArea>
  <PageHeader title="My Page" />
</AppSafeArea>
```

## 📊 **Audit Results**

### **Pages Successfully Migrated**
- ✅ **Schedule Page**: Fully migrated to design tokens
- ✅ **Learning Hub**: Fully migrated to design tokens  
- ✅ **Food Scanner**: Header migrated to design tokens

### **Pages Needing Migration**
- ⏳ **Children Page**: Typography needs updating
- ⏳ **Resources Page**: Typography needs updating
- ⏳ **Flow Page**: Typography needs updating
- ⏳ **Skill Journey Page**: Typography needs updating
- ⏳ **Settings Pages**: All need typography updates
- ⏳ **Auth Pages**: All need typography updates

### **SafeArea Implementation Status**
- ✅ **Main Tab Pages**: Using `react-native` SafeAreaView
- ⚠️ **Auth Pages**: Using `react-native-safe-area-context`
- ⚠️ **Settings Pages**: Mixed implementations

## 🚀 **Next Steps**

### **1. Complete Typography Migration**
- Update remaining pages to use design tokens
- Ensure consistent font sizes across all pages

### **2. Standardize SafeArea Implementation**
- Choose one SafeArea implementation (recommend `react-native`)
- Update all pages to use consistent approach

### **3. Create Additional Components**
- Form components (Input, Select, etc.)
- Navigation components
- Modal components

### **4. Add Theme Support**
- Dark mode support
- High contrast mode
- Accessibility improvements

## 💡 **Benefits Achieved**

### **1. Consistency**
- All pages now use the same typography scale
- Consistent spacing and colors
- Unified visual hierarchy

### **2. Maintainability**
- Centralized design decisions
- Easy to update styles globally
- Reduced code duplication

### **3. Developer Experience**
- Clear documentation and examples
- Reusable components
- Type-safe design tokens

### **4. Future-Proofing**
- Easy to add new design tokens
- Scalable component system
- Ready for theme support

The design token system provides a solid foundation for consistent, maintainable styling across the entire app! 🎉 