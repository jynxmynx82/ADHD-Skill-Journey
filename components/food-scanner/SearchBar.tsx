import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { isValidBarcode } from '@/lib/validation';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchBar({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  placeholder = "Enter barcode or search product...",
  disabled = false
}: SearchBarProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    searchContainer: { 
      flexDirection: 'row', 
      width: '100%',
    } as ViewStyle,
    searchInput: { 
      flex: 1, 
      padding: 12, 
      borderRadius: 8, 
      borderWidth: 1, 
      borderColor: colors.border,
      marginRight: 12,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: 16,
    } as ViewStyle,
    searchButton: { 
      backgroundColor: colors.primary, 
      padding: 12, 
      borderRadius: 8, 
      justifyContent: 'center', 
      alignItems: 'center',
      width: 44,
      height: 44,
      opacity: disabled ? 0.5 : 1,
    } as ViewStyle,
    searchButtonText: { 
      color: colors.background, 
      fontWeight: '600', 
      fontSize: 16 
    } as TextStyle,
  });

  const handleSearch = () => {
    if (!disabled && searchQuery.trim()) {
      onSearch();
    }
  };

  const isBarcode = isValidBarcode(searchQuery);

  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
      />
      <TouchableOpacity 
        style={styles.searchButton} 
        onPress={handleSearch}
        disabled={disabled || !searchQuery.trim()}
      >
        <Search size={20} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
} 