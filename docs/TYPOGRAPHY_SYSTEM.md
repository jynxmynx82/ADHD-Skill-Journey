# Typography System

## Overview
This document defines the consistent typography system used throughout the ADHD Family Support app.

## Font Hierarchy

### Main Page Titles
- **Font Size**: 24px
- **Font Weight**: Bold
- **Usage**: Page headers (Home, Learning Hub, etc.)
- **Example**: `fontSize: 24, fontWeight: 'bold'`

### Section Headers
- **Font Size**: 20px
- **Font Weight**: Bold
- **Usage**: Section titles (Quick Capture, Recent Activity, Today's Overview, etc.)
- **Example**: `fontSize: 20, fontWeight: 'bold'`

### Tab Navigation
- **Font Size**: 16px
- **Font Weight**: Medium (500) for inactive, Semi-bold (600) for active
- **Usage**: Tab navigation (Notes, Strategies, Advice)
- **Example**: `fontSize: 16, fontWeight: '500'` (inactive), `fontSize: 16, fontWeight: '600'` (active)

### Body Text
- **Font Size**: 16px
- **Font Weight**: Regular (400)
- **Usage**: Main content, descriptions, entry content
- **Example**: `fontSize: 16, fontWeight: '400'`

### Button Text
- **Font Size**: 14px
- **Font Weight**: Semi-bold (600)
- **Usage**: Action buttons, quick capture buttons
- **Example**: `fontSize: 14, fontWeight: '600'`

### Small Text
- **Font Size**: 12px
- **Font Weight**: Medium (500)
- **Usage**: Timestamps, tags, metadata
- **Example**: `fontSize: 12, fontWeight: '500'`

## Color System

### Text Colors
- **Primary Text**: `#333` (dark gray)
- **Secondary Text**: `#666` (medium gray)
- **Muted Text**: `#888` (light gray)
- **Active Text**: `#007bff` (blue)

## Implementation Guidelines

### 1. Use Consistent Font Sizes
Always use the defined font sizes: 24px, 20px, 16px, 14px, 12px

### 2. Maintain Visual Hierarchy
- Main titles should be the largest (24px)
- Section headers should be clearly smaller (20px)
- Body text should be readable (16px)
- Small text should be subtle (12px)

### 3. Font Weight Guidelines
- **Bold**: Use for titles and headers
- **Semi-bold (600)**: Use for active states and important text
- **Medium (500)**: Use for navigation and secondary text
- **Regular (400)**: Use for body text

### 4. Color Guidelines
- Use primary text color (`#333`) for main content
- Use secondary text color (`#666`) for supporting text
- Use active color (`#007bff`) for interactive elements

## Example Implementation

```typescript
const styles = StyleSheet.create({
  // Main page title
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  
  // Section header
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  
  // Tab navigation
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666'
  },
  
  // Body text
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333'
  },
  
  // Button text
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  
  // Small text
  smallText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666'
  }
});
```

## Files Updated
- `app/(tabs)/journal.tsx` - Learning Hub page typography
- `app/(tabs)/index.tsx` - Landing page typography
- `app/(tabs)/schedule.tsx` - Schedule page typography
- `app/(tabs)/skill-journey.tsx` - Skill Journey page typography
- `app/(tabs)/resources.tsx` - Resources page typography
- `app/(tabs)/flow.tsx` - Flow page typography

## Future Considerations
- Consider implementing a design token system for even better consistency
- Evaluate custom fonts for brand identity
- Ensure accessibility compliance with font sizes and contrast ratios 