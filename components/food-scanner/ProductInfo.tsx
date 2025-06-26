import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { ShoppingBag, AlertCircle, CheckCircle, Clock } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Linking, Alert } from 'react-native';

interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  image?: string;
  ingredients_text?: string;
  ingredients_original_tags?: string[];
  nutriScore?: string;
  nutriments?: {
    energy_kcal_100g?: number;
    sugars_100g?: number;
    fat_100g?: number;
    sodium_100g?: number;
  };
  allergens_tags?: string[];
  additives_tags?: string[];
  nova_group?: number;
  quantity?: string;
  categories?: string;
  has_artificial_colors?: boolean;
  has_high_sugar?: boolean;
}

interface ProductInfoProps {
  product: FoodProduct;
  onShopPress: (productName: string, shopType: 'amazon' | 'walmart') => void;
}

export default function ProductInfo({ product, onShopPress }: ProductInfoProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    resultContainer: {
      marginTop: 16,
      padding: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
    resultTitle: { 
      fontSize: 20, 
      fontWeight: '600', 
      marginBottom: 8,
      color: colors.text,
    } as TextStyle,
    resultText: { 
      fontSize: 16, 
      color: colors.textSecondary,
      marginBottom: 8,
    } as TextStyle,
    imageContainer: {
      alignItems: 'center',
      marginVertical: 12,
    } as ViewStyle,
    productImage: {
      width: 120,
      height: 120,
      borderRadius: 8,
      backgroundColor: colors.border,
    } as ImageStyle,
    nutritionContainer: {
      marginTop: 16,
    } as ViewStyle,
    nutritionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      color: colors.text,
    } as TextStyle,
    nutritionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    } as ViewStyle,
    nutritionLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    } as TextStyle,
    nutritionValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    } as TextStyle,
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '20',
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
    } as ViewStyle,
    warningText: {
      marginLeft: 8,
      color: colors.error,
      fontSize: 14,
      fontWeight: '500',
    } as TextStyle,
    shopButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    } as ViewStyle,
    shopButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.primary,
      gap: 8,
    } as ViewStyle,
    shopButtonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    } as ViewStyle,
    scoreBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    } as ViewStyle,
    scoreText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.background,
    } as TextStyle,
  });

  const getNutriScoreColor = (score?: string) => {
    switch (score?.toLowerCase()) {
      case 'a': return '#038141';
      case 'b': return '#85BB2F';
      case 'c': return '#FECB02';
      case 'd': return '#EF8200';
      case 'e': return '#E63E11';
      default: return colors.border;
    }
  };

  const isAdditiveADHDFriendly = (additiveTag: string) => {
    const adhdUnfriendlyAdditives = [
      'en:e102', 'en:e104', 'en:e110', 'en:e122', 'en:e124', 'en:e129', // Artificial colors
      'en:e621', 'en:e622', 'en:e623', 'en:e624', 'en:e625', // MSG
      'en:e951', // Aspartame
      'en:e954', // Saccharin
    ];
    return !adhdUnfriendlyAdditives.includes(additiveTag.toLowerCase());
  };

  const hasADHDUnfriendlyIngredients = product.additives_tags?.some(
    additive => !isAdditiveADHDFriendly(additive)
  ) || product.has_artificial_colors || product.has_high_sugar;

  const NutritionItem = ({ label, value, isHigh }: { label: string; value: string; isHigh?: boolean }) => (
    <View style={styles.nutritionItem}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={[styles.nutritionValue, isHigh && { color: colors.error }]}>
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.resultContainer}>
      <Text style={styles.resultTitle}>{product.name}</Text>
      <Text style={styles.resultText}>Brand: {product.brand}</Text>
      
      {product.image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>
      )}

      {product.nutriScore && (
        <View style={styles.scoreContainer}>
          <Text style={styles.resultText}>Nutri-Score:</Text>
          <View style={[styles.scoreBadge, { backgroundColor: getNutriScoreColor(product.nutriScore) }]}>
            <Text style={styles.scoreText}>{product.nutriScore.toUpperCase()}</Text>
          </View>
        </View>
      )}

      {product.nutriments && (
        <View style={styles.nutritionContainer}>
          <Text style={styles.nutritionTitle}>Nutrition (per 100g)</Text>
          <NutritionItem 
            label="Energy" 
            value={`${product.nutriments.energy_kcal_100g || 0} kcal`} 
          />
          <NutritionItem 
            label="Sugars" 
            value={`${product.nutriments.sugars_100g || 0}g`}
            isHigh={(product.nutriments.sugars_100g || 0) > 15}
          />
          <NutritionItem 
            label="Fat" 
            value={`${product.nutriments.fat_100g || 0}g`}
            isHigh={(product.nutriments.fat_100g || 0) > 20}
          />
          <NutritionItem 
            label="Sodium" 
            value={`${product.nutriments.sodium_100g || 0}mg`}
            isHigh={(product.nutriments.sodium_100g || 0) > 500}
          />
        </View>
      )}

      {hasADHDUnfriendlyIngredients && (
        <View style={styles.warningContainer}>
          <AlertCircle size={20} color={colors.error} />
          <Text style={styles.warningText}>
            Contains ingredients that may affect ADHD symptoms
          </Text>
        </View>
      )}

      {product.ingredients_text && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.nutritionTitle}>Ingredients</Text>
          <Text style={styles.resultText}>{product.ingredients_text}</Text>
        </View>
      )}

      <View style={styles.shopButtonsContainer}>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => onShopPress(product.name, 'amazon')}
        >
          <ShoppingBag size={16} color={colors.background} />
          <Text style={styles.shopButtonText}>Amazon</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => onShopPress(product.name, 'walmart')}
        >
          <ShoppingBag size={16} color={colors.background} />
          <Text style={styles.shopButtonText}>Walmart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 