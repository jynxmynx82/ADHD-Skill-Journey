import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
  Alert, // Added Alert
  Linking, // Added Linking
  ViewStyle,
  TextStyle,
  SafeAreaView,
  useWindowDimensions,
  ImageStyle,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser'; // Added WebBrowser
import { Search, Camera as CameraIcon, AlertCircle, CheckCircle, ShoppingBag, History, ArrowLeft, Clock } from 'lucide-react-native'; // Renamed Camera to CameraIcon
import { CameraView, useCameraPermissions } from 'expo-camera'; // Import from expo-camera
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
// Assuming theme is correctly imported from its actual path if not a mock
// import { theme } from '@/constants/theme';

// Mock theme object for self-containment if actual theme is not available/relevant for this subtask
const theme = {
  colors: {
    primary: { 600: '#007bff' }, // Adjusted to match usage
    secondary: { 600: '#6c757d' },
    gray: { 50: '#f8f9fa', 200: '#e9ecef', 300: '#dee2e6', 400: '#ced4da', 500: '#adb5bd', 600: '#6c757d', 700: '#495057', 800: '#343a40' },
    error: { 50: '#fdf2f2', 200: '#f9d6d6', 500: '#dc3545', 600: '#c82333', 700: '#bd2130' },
    warning: { 50: '#fff9e6', 200: '#ffeccc', 400: '#ffc107', 500: '#ffbb00', 600: '#cca300', 800: '#997400' },
    success: { 50: '#e6f7ec', 400: '#28a745', 500: '#218838', 600: '#1e7e34' },
    white: '#ffffff',
    accent: { 600: '#ff6f61' }, // Example accent color
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 48, 64], // Example spacing scale
  fontSizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20 },
  borderRadius: { sm: 4, md: 8, lg: 12, full: 9999 },
  shadows: { sm: Platform.OS === 'web' ? { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)' } : { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }, md: Platform.OS === 'web' ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' } : { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 } },
};


// Updated FoodProduct interface to better match Open Food Facts
interface FoodProduct {
  id: string; // Barcode
  name: string;
  brand: string;
  image?: string;
  ingredients_text?: string;
  ingredients_original_tags?: string[]; // For specific ingredient analysis
  nutriScore?: string; // e.g., 'a', 'b', 'c', 'd', 'e'
  nutriments?: {
    energy_kcal_100g?: number;
    sugars_100g?: number;
    fat_100g?: number;
    sodium_100g?: number;
    // Add more nutriments as needed
  };
  allergens_tags?: string[];
  additives_tags?: string[]; // Tags like 'en:e102'
  nova_group?: number; // NOVA group for processing level
  quantity?: string;
  categories?: string;
  // For ADHD considerations
  has_artificial_colors?: boolean;
  has_high_sugar?: boolean;
}

interface ScanHistoryItem {
  timestamp: number;
  product: FoodProduct;
}

export default function FoodScannerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false); // Re-add scanned state to prevent rapid re-scans with CameraView
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<FoodProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const { mode } = useLocalSearchParams<{ mode: string }>();

  // Set initial mode based on URL params
  useEffect(() => {
    if (mode === 'scan') {
      startScanning();
    }
  }, [mode]);

  const isWeb = Platform.OS === 'web';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      flex: 1,
      width: '100%',
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray[200],
      backgroundColor: theme.colors.white,
      gap: theme.spacing[3],
    } as ViewStyle,
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    } as ViewStyle,
    headerTitle: {
      fontSize: theme.fontSizes.xl,
      fontWeight: '600',
      color: colors.text,
    } as TextStyle,
    historyButton: {
      padding: theme.spacing[2],
      borderRadius: theme.borderRadius.md,
    } as ViewStyle,
    scrollView: {
      flex: 1,
    },
    searchContainer: { 
      flexDirection: 'row', 
      width: '100%',
    } as ViewStyle,
    searchInput: Platform.select({
      web: { 
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)', 
        flex: 1, 
        padding: theme.spacing[2], 
        borderRadius: theme.borderRadius.md, 
        borderWidth: 1, 
        borderColor: theme.colors.gray[300],
        marginRight: theme.spacing[2],
      } as ViewStyle,
      default: { 
        flex: 1, 
        padding: theme.spacing[2], 
        borderRadius: theme.borderRadius.md, 
        borderWidth: 1, 
        borderColor: theme.colors.gray[300],
        marginRight: theme.spacing[2],
      } as ViewStyle,
    }),
    searchButton: { 
      backgroundColor: theme.colors.primary[600], 
      padding: theme.spacing[2], 
      borderRadius: theme.borderRadius.md, 
      justifyContent: 'center', 
      alignItems: 'center',
      width: 44,
      height: 44,
    } as ViewStyle,
    searchButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: theme.fontSizes.md } as TextStyle,
    resultContainer: {
      marginTop: theme.spacing[4],
      padding: theme.spacing[4],
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }
      ),
    },
    resultTitle: { fontSize: theme.fontSizes.xl, fontWeight: '600', marginBottom: theme.spacing[2] } as TextStyle,
    resultText: { fontSize: theme.fontSizes.md, color: theme.colors.gray[700] } as TextStyle,
    disclaimerText: { fontSize: theme.fontSizes.sm, color: theme.colors.gray[500], marginTop: theme.spacing[4], textAlign: 'center' } as TextStyle,
    centeredMessageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing[4] } as ViewStyle,
    infoText: { fontSize: theme.fontSizes.md, color: theme.colors.gray[700], textAlign: 'center', marginBottom: theme.spacing[4] } as TextStyle,
    permissionButton: { backgroundColor: theme.colors.primary[600], padding: theme.spacing[4], borderRadius: theme.borderRadius.md, alignItems: 'center' } as ViewStyle,
    permissionButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: theme.fontSizes.md } as TextStyle,
    cameraPreview: { flex: 1, borderRadius: theme.borderRadius.md, overflow: 'hidden' } as ViewStyle,
    scannerInstructionText: { fontSize: theme.fontSizes.md, color: theme.colors.gray[700], textAlign: 'center', marginTop: theme.spacing[4] } as TextStyle,
    scannerContainer: { flex: 1, backgroundColor: theme.colors.gray[800] } as ViewStyle,
    scanner: { ...StyleSheet.absoluteFillObject } as ViewStyle,
    scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' } as ViewStyle,
    scannerTarget: { width: 250, height: 150, borderWidth: 2, borderColor: theme.colors.white, borderRadius: theme.borderRadius.md } as ViewStyle,
    cancelButton: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[4], borderRadius: theme.borderRadius.full } as ViewStyle,
    cancelButtonText: { color: theme.colors.white, fontSize: theme.fontSizes.md } as TextStyle,
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: theme.spacing[4] } as ViewStyle,
    scanButton: {
      backgroundColor: theme.colors.primary[600],
      padding: theme.spacing[4],
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    buttonIcon: {
      marginRight: theme.spacing[2],
    },
    scanButtonText: {
      color: theme.colors.white,
      fontWeight: '600',
      fontSize: theme.fontSizes.lg,
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing[4] } as ViewStyle,
    loadingText: { fontSize: theme.fontSizes.md, color: theme.colors.gray[600], marginTop: theme.spacing[3], textAlign: 'center' } as TextStyle,
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing[4], backgroundColor: theme.colors.error[50], borderRadius: theme.borderRadius.md, margin: theme.spacing[2]},
    errorText: { fontSize: theme.fontSizes.md, color: theme.colors.error[700], marginTop: theme.spacing[3], textAlign: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing[4], marginTop: theme.spacing[4] * 2 },
    emptyText: { fontSize: theme.fontSizes.md, color: theme.colors.gray[600], textAlign: 'center' },
    productContainer: { 
      flex: 1,
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.md,
      marginVertical: theme.spacing[2],
      marginHorizontal: theme.spacing[2],
      overflow: 'hidden',
    },
    productImageContainer: {
      width: '100%',
      height: Platform.select({
        web: 250,
        default: 200
      }),
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    productImage: { 
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    } as ImageStyle,
    productHeader: { padding: theme.spacing[4] },
    productName: { fontSize: theme.fontSizes.xl, fontWeight: 'bold', color: theme.colors.gray[800], marginBottom: theme.spacing[1] },
    productBrand: { fontSize: theme.fontSizes.md, color: theme.colors.gray[600] },
    productCategories: { fontSize: theme.fontSizes.sm, color: theme.colors.gray[500], fontStyle: 'italic', marginTop: theme.spacing[1]},
    nutriScoreContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: theme.spacing[4], marginBottom: theme.spacing[4], paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[3], borderRadius: theme.borderRadius.md },
    nutriScoreLabel: { fontSize: theme.fontSizes.md, fontWeight: '600', color: theme.colors.white },
    nutriScoreValue: { fontSize: theme.fontSizes.xl, fontWeight: '600', color: theme.colors.white },
    adhdAlert: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.colors.warning[50], marginHorizontal: theme.spacing[4], marginBottom: theme.spacing[3], padding: theme.spacing[3], borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.warning[200] },
    adhdAlertText: { flex: 1, fontSize: theme.fontSizes.sm, color: theme.colors.warning[800], marginLeft: theme.spacing[2] },
    section: { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3], borderBottomWidth: 1, borderBottomColor: theme.colors.gray[200] },
    sectionTitle: { fontSize: theme.fontSizes.lg, fontWeight: '600', color: theme.colors.gray[800], marginBottom: theme.spacing[3] },
    nutritionGrid: { 
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing[2],
    },
    nutritionItem: { 
      width: Platform.select({
        web: '48%',
        default: '100%'
      }),
      backgroundColor: theme.colors.gray[50],
      padding: theme.spacing[3],
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing[3],
    },
    nutritionLabel: { fontSize: theme.fontSizes.sm, fontWeight: '600', color: theme.colors.gray[700], marginBottom: 2 },
    nutritionValue: { fontSize: theme.fontSizes.md, color: theme.colors.gray[800] },
    highValueText: { color: theme.colors.error[600], fontWeight: '600' },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    allergenTag: { backgroundColor: theme.colors.error[50], borderRadius: theme.borderRadius.full, paddingVertical: 6, paddingHorizontal: theme.spacing[3], marginRight: theme.spacing[2], marginBottom: theme.spacing[2] },
    allergenText: { fontSize: theme.fontSizes.sm, fontWeight: '600', color: theme.colors.error[700], textTransform: 'capitalize' },
    ingredientsText: { fontSize: theme.fontSizes.md, color: theme.colors.gray[700], lineHeight: 22 },
    additiveTag: { flexDirection: 'row', alignItems: 'center', borderRadius: theme.borderRadius.full, paddingVertical: 6, paddingHorizontal: theme.spacing[3], marginRight: theme.spacing[2], marginBottom: theme.spacing[2] },
    adhdFriendlyTag: { backgroundColor: theme.colors.success[50] },
    adhdCautionTag: { backgroundColor: theme.colors.error[50] },
    tagIcon: { marginRight: 4 },
    additiveText: { fontSize: theme.fontSizes.sm, textTransform: 'capitalize' },
    adhdFriendlyText: { color: theme.colors.success[600] },
    adhdCautionText: { color: theme.colors.error[700] },
    alternativesSection: { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] },
    alternativesContainer: { marginTop: theme.spacing[2] },
    alternativeCard: Platform.select({
      web: { 
        flexDirection: 'row', 
        backgroundColor: theme.colors.primary[600], 
        borderRadius: theme.borderRadius.md, 
        marginBottom: theme.spacing[3], 
        ...theme.shadows.sm,
        overflow: 'hidden',
      } as ViewStyle,
      default: { 
        flexDirection: 'row', 
        backgroundColor: theme.colors.primary[600], 
        borderRadius: theme.borderRadius.md, 
        marginBottom: theme.spacing[3], 
        ...theme.shadows.sm,
        overflow: 'hidden',
      } as ViewStyle,
    }),
    alternativeImageContainer: {
      width: 100,
      minHeight: 100,
      overflow: 'hidden',
    },
    alternativeImage: { 
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    } as ImageStyle,
    alternativeInfo: { flex: 1, padding: theme.spacing[3], justifyContent: 'space-between' },
    alternativeName: { fontSize: theme.fontSizes.md, fontWeight: '600', color: theme.colors.gray[800], marginBottom: 2 },
    alternativeDesc: { fontSize: theme.fontSizes.sm, color: theme.colors.gray[600], marginBottom: theme.spacing[2] },
    shopButtonsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] },
    buyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.accent[600], paddingVertical: 6, paddingHorizontal: theme.spacing[3], borderRadius: theme.borderRadius.full, elevation: 2 },
    buyButtonText: { fontSize: theme.fontSizes.sm, color: theme.colors.white, marginLeft: 4, fontWeight: '600' },
    affiliateDisclaimerText: { fontSize: theme.fontSizes.xs, color: theme.colors.gray[500], textAlign: 'center', marginTop: theme.spacing[3], fontStyle: 'italic' },
    disclaimer: { padding: theme.spacing[4], marginHorizontal: theme.spacing[4], marginTop: theme.spacing[2], marginBottom: theme.spacing[4], backgroundColor: theme.colors.gray[200], borderRadius: theme.borderRadius.md },
    historyContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.white,
      zIndex: 1000,
    } as ViewStyle,
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray[200],
    } as ViewStyle,
    historyTitle: {
      fontSize: theme.fontSizes.xl,
      fontWeight: '600',
      color: theme.colors.gray[800],
    } as TextStyle,
    closeButton: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.primary[600],
      fontWeight: '600',
    } as TextStyle,
    historyList: {
      flex: 1,
    } as ViewStyle,
    historyItem: {
      flexDirection: 'row',
      padding: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray[200],
    } as ViewStyle,
    historyItemImage: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.md,
      resizeMode: 'cover',
    } as ImageStyle,
    historyItemInfo: {
      flex: 1,
      justifyContent: 'center',
    } as ViewStyle,
    historyItemName: {
      fontSize: theme.fontSizes.md,
      fontWeight: '600',
      color: theme.colors.gray[800],
      marginBottom: 2,
    } as TextStyle,
    historyItemBrand: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.gray[600],
      marginBottom: 2,
    } as TextStyle,
    historyItemDate: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.gray[500],
    } as TextStyle,
    headerButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing[2],
      gap: theme.spacing[2],
    } as ViewStyle,
    historyButton: {
      padding: theme.spacing[2],
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.gray[200],
    } as ViewStyle,
    emptyHistoryText: {
      textAlign: 'center',
      padding: theme.spacing[4],
      color: theme.colors.gray[500],
      fontSize: theme.fontSizes.md,
    } as TextStyle,
    scrollContent: {
      flexGrow: 1,
    },
    mainContent: {
      padding: theme.spacing[4],
    },
    buttonContainer: {
      marginVertical: theme.spacing[4],
    },
  });

  // Load scan history on component mount
  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('scanHistory');
      if (history) {
        setScanHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  const saveToHistory = async (product: FoodProduct) => {
    try {
      const newHistoryItem: ScanHistoryItem = {
        timestamp: Date.now(),
        product,
      };
      const updatedHistory = [newHistoryItem, ...scanHistory].slice(0, 50); // Keep last 50 scans
      setScanHistory(updatedHistory);
      await AsyncStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  // useEffect for permission is handled by useCameraPermissions hook's `permission` object

  const isBarcode = (query: string) => /^\d{8,13}$/.test(query); // Basic check for 8 to 13 digits

  const processProductData = (data: any): FoodProduct | null => {
    if (!data || !data.product) {
      if (data.products && data.products.length > 0) { // From search results
        data.product = data.products[0]; // Take the first product from search
      } else {
        return null;
      }
    }

    const p = data.product;
    const ingredientsList = (p.ingredients_text_with_allergens || p.ingredients_text || '').toLowerCase().split(/[,()\[\]]/).map((i: string) => i.trim()).filter(Boolean);
    const sugarPer100g = p.nutriments?.sugars_100g || 0;

    // Example ADHD-related checks (can be much more sophisticated)
    const artificialColorRegex = /e1\d{2}|colour|colorant|tartrazine|sunset yellow|quinoline yellow|carmoisine|ponceau 4r|allura red/i;
    const hasArtificialColors = ingredientsList.some((ing: string) => artificialColorRegex.test(ing)) ||
                                (p.additives_tags || []).some((tag: string) => /en:e1\d{2}/i.test(tag) && !/en:e16\d|en:e17\d|en:e150|en:e14\d|en:e100|en:e101/.test(tag)); // crude check, exclude natural colors
    const hasHighSugar = sugarPer100g > 15; // Example: >15g sugar per 100g is high

    return {
      id: p.code || p.id || 'N/A',
      name: p.product_name || p.product_name_en || 'Unknown Product',
      brand: p.brands || 'Unknown Brand',
      image: p.image_front_url || p.image_url,
      ingredients_text: p.ingredients_text_with_allergens || p.ingredients_text,
      ingredients_original_tags: p.ingredients_original_tags,
      nutriScore: p.nutriscore_grade,
      nutriments: {
        energy_kcal_100g: p.nutriments?.['energy-kcal_100g'] || p.nutriments?.energy_100g, //OFF uses energy-kcal
        sugars_100g: sugarPer100g,
        fat_100g: p.nutriments?.fat_100g,
        sodium_100g: p.nutriments?.sodium_100g,
      },
      allergens_tags: p.allergens_tags,
      additives_tags: p.additives_tags,
      nova_group: p.nova_group,
      quantity: p.quantity,
      categories: p.categories,
      has_artificial_colors: hasArtificialColors,
      has_high_sugar: hasHighSugar,
    };
  };

  const fetchData = async (query: string) => {
    setError(null);
    setProduct(null);
    setLoading(true);

    let url = '';
    if (isBarcode(query)) {
      // Using v0 for barcode as it's simpler and often more reliable for basic info
      url = `https://world.openfoodfacts.org/api/v0/product/${query}.json`;
    } else {
      url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`; // Fetch only 1 product for simplicity
    }

    try {
      console.log("Fetching URL:", url);
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 0 && !isBarcode(query)) { // Search API specific: status 0 means product not found
         setError(`No products found for "${query}". Please try a different search term.`);
         setProduct(null);
      } else if (json.status === 0 && isBarcode(query)) { // Barcode API specific
         setError(`Product with barcode "${query}" not found.`);
         setProduct(null);
      } else if ((isBarcode(query) && json.product) || (!isBarcode(query) && json.products && json.products.length > 0)) {
        const processedProduct = processProductData(json);
        if (processedProduct) {
          setProduct(processedProduct);
          saveToHistory(processedProduct); // Save to history when product is found
        } else {
          setError(`Product information for "${query}" could not be processed or is incomplete.`);
          setProduct(null);
        }
      } else {
         setError(`No product found for "${query}".`);
         setProduct(null);
      }
    } catch (e: any) {
      console.error("API Fetch Error:", e);
      setError(`Failed to fetch product data. Error: ${e.message || 'Unknown error'}. Please check your internet connection.`);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // Updated for expo-camera, which passes an object with a 'data' field
  const handleBarcodeScannedFromCameraView = (scanningResult: { data: string; type?: string; cornerPoints?: any[]; boundingBox?: any }) => {
    if (scanned) return; // Prevent multiple scans if already processing one
    setScanned(true); // Mark as scanned to prevent immediate re-scan
    setScanning(false);
    setSearchQuery(scanningResult.data);
    fetchData(scanningResult.data);
    // Alert.alert('Barcode Scanned!', `Type: ${scanningResult.type}\nData: ${scanningResult.data}`);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError('Please enter a product name or barcode');
      return;
    }
    fetchData(searchQuery.trim());
  };


  const startScanning = async () => {
    setProduct(null); // Clear previous product/error when starting a new scan
    setError(null);
    setScanned(false); // Reset scanned state for a new session

    if (!permission) {
      // Permissions are still loading
      return;
    }

    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to scan barcodes.');
        return;
      }
    }
    // If permission was already granted or granted just now
    setScanning(true);
  };

  const stopScanning = () => setScanning(false);

  const handleShopPress = async (productName: string, shopType: 'amazon' | 'walmart') => {
    let url = '';
    const encodedProductName = encodeURIComponent(productName);
    const affiliateTag = 'YOUR_AFFILIATE_TAG'; // Replace with actual tag
    const walmartAffiliateId = 'YOUR_AFFILIATE_ID'; // Replace with actual ID

    if (shopType === 'amazon') {
      url = `https://www.amazon.com/s?k=${encodedProductName}&tag=${affiliateTag}`;
    } else if (shopType === 'walmart') {
      url = `https://www.walmart.com/search/?query=${encodedProductName}&affiliate_id=${walmartAffiliateId}`;
    }

    if (url) {
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch (error) {
        Alert.alert('Error', 'Could not open the link.');
        console.error("Failed to open web browser", error);
      }
    }
  };

  const renderScanner = () => {
    if (!scanning) return null;

    if (!permission) {
      // Permissions are still loading
      return (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.infoText}>Loading camera...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.infoText}>Camera permission is not granted.</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
           <TouchableOpacity style={styles.cancelButton} onPress={stopScanning}>
            <Text style={styles.cancelButtonText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // Permission granted and scanning is true
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.cameraPreview}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScannedFromCameraView}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'qr', 'pdf417', 'upc_e', 'upc_a', 'datamatrix', 'code39', 'code93', 'itf14', 'codabar', 'code128'],
          }}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerTarget} />
            <Text style={styles.scannerInstructionText}>Align barcode within the frame</Text>
          </View>
        </CameraView>
        <TouchableOpacity style={styles.cancelButton} onPress={stopScanning}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderProductInfo = () => {
    if (!product) return null;

    const {
        name, brand, image, ingredients_text, nutriScore, nutriments,
        allergens_tags, additives_tags, quantity, categories,
        has_artificial_colors, has_high_sugar
    } = product;

    const adhdConcerns = [];
    if (has_artificial_colors) adhdConcerns.push("artificial colors");
    if (has_high_sugar) adhdConcerns.push("high sugar content");


    return (
      <ScrollView style={styles.productContainer}>
        <View style={styles.productImageContainer}>
          <Image 
            style={styles.productImage}
            source={{ uri: product?.image }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.productHeader}>
          <Text style={styles.productName}>{name}</Text>
          <Text style={styles.productBrand}>{brand} {quantity ? `(${quantity})` : ''}</Text>
          {categories && <Text style={styles.productCategories}>Categories: {categories}</Text>}
        </View>

        {nutriScore && (
          <View style={[styles.nutriScoreContainer, { backgroundColor: getNutriScoreColor(nutriScore) }]}>
            <Text style={styles.nutriScoreLabel}>Nutri-Score</Text>
            <Text style={styles.nutriScoreValue}>{nutriScore.toUpperCase()}</Text>
          </View>
        )}

        {adhdConcerns.length > 0 && (
            <View style={styles.adhdAlert}>
                <AlertCircle size={20} color={theme.colors.warning[600]} />
                <Text style={styles.adhdAlertText}>
                Potential ADHD considerations: {adhdConcerns.join(', ')}.
                </Text>
            </View>
        )}

        {nutriments && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutritional Information (per 100g)</Text>
            <View style={styles.nutritionGrid}>
              {nutriments.energy_kcal_100g && <NutritionItem label="Calories" value={`${nutriments.energy_kcal_100g} kcal`} />}
              {nutriments.sugars_100g !== undefined && <NutritionItem label="Sugar" value={`${nutriments.sugars_100g} g`} isHigh={nutriments.sugars_100g > 15} />}
              {nutriments.fat_100g !== undefined && <NutritionItem label="Fat" value={`${nutriments.fat_100g} g`} />}
              {nutriments.sodium_100g !== undefined && <NutritionItem label="Sodium" value={`${nutriments.sodium_100g * 1000} mg`} />}
            </View>
          </View>
        )}

        {allergens_tags && allergens_tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergens</Text>
            <View style={styles.tagContainer}>
              {allergens_tags.map((allergen, index) => (
                <View key={index} style={styles.allergenTag}>
                  <Text style={styles.allergenText}>{allergen.replace(/^en:/, '').replace(/-/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {ingredients_text && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Text style={styles.ingredientsText}>{ingredients_text}</Text>
          </View>
        )}

        {additives_tags && additives_tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additives</Text>
            <View style={styles.tagContainer}>
              {additives_tags.map((additive, index) => {
                const isFriendly = isAdditiveADHDFriendly(additive);
                return (
                  <View key={index} style={[styles.additiveTag, isFriendly ? styles.adhdFriendlyTag : styles.adhdCautionTag]}>
                    {isFriendly ? <CheckCircle size={14} color={theme.colors.success[600]} style={styles.tagIcon} /> : <AlertCircle size={14} color={theme.colors.error[600]} style={styles.tagIcon} />}
                    <Text style={[styles.additiveText, isFriendly ? styles.adhdFriendlyText : styles.adhdCautionText]}>
                      {additive.replace(/^en:/, '').replace(/-/g, ' ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.alternativesSection}>
          <Text style={styles.sectionTitle}>ADHD-Friendly Alternatives (Examples)</Text>
          <View style={styles.alternativesContainer}>
            {/* Example Alternative 1 */}
            <View style={styles.alternativeCard}>
              <View style={styles.alternativeImageContainer}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/5695880/pexels-photo-5695880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
                  style={styles.alternativeImage}
                />
              </View>
              <View style={styles.alternativeInfo}>
                <Text style={styles.alternativeName}>Organic Oat Cookies</Text>
                <Text style={styles.alternativeDesc}>No artificial colors or preservatives</Text>
                <View style={styles.shopButtonsContainer}>
                  <TouchableOpacity style={styles.buyButton} onPress={() => handleShopPress("Organic Oat Cookies", "amazon")}>
                    <ShoppingBag size={14} color={theme.colors.white} />
                    <Text style={styles.buyButtonText}>Shop Amazon</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyButton} onPress={() => handleShopPress("Organic Oat Cookies", "walmart")}>
                    <ShoppingBag size={14} color={theme.colors.white} />
                    <Text style={styles.buyButtonText}>Shop Walmart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* Example Alternative 2 (Add more if needed) */}
            <View style={styles.alternativeCard}>
               <View style={styles.alternativeImageContainer}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/1580465/pexels-photo-1580465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} // Different example image
                  style={styles.alternativeImage}
                />
              </View>
              <View style={styles.alternativeInfo}>
                <Text style={styles.alternativeName}>Natural Fruit Snacks</Text>
                <Text style={styles.alternativeDesc}>Made with real fruit, no added sugars</Text>
                 <View style={styles.shopButtonsContainer}>
                    <TouchableOpacity style={styles.buyButton} onPress={() => handleShopPress("Natural Fruit Snacks", "amazon")}>
                        <ShoppingBag size={14} color={theme.colors.white} />
                        <Text style={styles.buyButtonText}>Shop Amazon</Text>
                    </TouchableOpacity>
                     <TouchableOpacity style={styles.buyButton} onPress={() => handleShopPress("Natural Fruit Snacks", "walmart")}>
                        <ShoppingBag size={14} color={theme.colors.white} />
                        <Text style={styles.buyButtonText}>Shop Walmart</Text>
                    </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.affiliateDisclaimerText}>
            (As an Amazon/Walmart Associate, we may earn from qualifying purchases made through these links.)
          </Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Disclaimer: Data from Open Food Facts. This information is for educational purposes and not medical advice. Verify information and consult with healthcare providers for dietary needs.
          </Text>
        </View>
      </ScrollView>
    );
  };

  const NutritionItem = ({ label, value, isHigh }: { label: string; value: string; isHigh?: boolean }) => (
    <View style={styles.nutritionItem}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={[styles.nutritionValue, isHigh && styles.highValueText]}>{value}</Text>
    </View>
  );

  const renderHistory = () => {
    if (!showHistory) return null;

    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Scan History</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowHistory(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.historyList}>
          {scanHistory.length === 0 ? (
            <Text style={styles.emptyHistoryText}>No scan history yet</Text>
          ) : (
            scanHistory.map((item, index) => (
              <TouchableOpacity
                key={item.timestamp}
                style={styles.historyItem}
                onPress={() => {
                  setProduct(item.product);
                  setShowHistory(false);
                }}
              >
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.historyItemImage}
                  defaultSource={require('@/assets/images/placeholder.png')}
                />
                <View style={styles.historyItemInfo}>
                  <Text style={styles.historyItemName}>{item.product.name}</Text>
                  <Text style={styles.historyItemBrand}>{item.product.brand}</Text>
                  <Text style={styles.historyItemDate}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Food Scanner</Text>
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => setShowHistory(!showHistory)}
            >
              <History color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by name or barcode"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Search color={theme.colors.white} size={20} />
            </TouchableOpacity>
          </View>
        </View>
        
        {showHistory ? (
          renderHistory()
        ) : scanning ? (
          renderScanner()
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.mainContent}>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={startScanning}
              >
                <CameraIcon size={24} color={theme.colors.white} />
                <Text style={styles.scanButtonText}>Scan Barcode</Text>
              </TouchableOpacity>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary[600]} />
                  <Text style={styles.loadingText}>Searching for product...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <AlertCircle color={theme.colors.error[600]} size={24} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : product ? (
                renderProductInfo()
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Search for a product or scan a barcode to get started
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// Helper functions (can be moved to a separate utils file)
const getNutriScoreColor = (score?: string) => {
  if (!score) return theme.colors.gray[400];
  switch (score.toLowerCase()) {
    case 'a': return theme.colors.success[500];
    case 'b': return theme.colors.success[400];
    case 'c': return theme.colors.warning[400];
    case 'd': return theme.colors.warning[500];
    case 'e': return theme.colors.error[500];
    default: return theme.colors.gray[400];
  }
};

const isAdditiveADHDFriendly = (additiveTag: string) => {
  // Example: E102 (Tartrazine), E110 (Sunset Yellow FCF), E129 (Allura Red AC) are often cited
  const problematicECodes = ['e102', 'e110', 'e122', 'e124', 'e129', 'e104', 'e127']; // Simplified list
  const normalizedTag = additiveTag.toLowerCase().replace(/^en:/, '');
  return !problematicECodes.some(code => normalizedTag.includes(code));
};