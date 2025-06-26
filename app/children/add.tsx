// app/children/add.tsx

import React from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import { useFamily } from '@/context/FamilyContext';
import { useTheme } from '@/context/ThemeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';

const AddChildSchema = Yup.object().shape({
  name: Yup.string().required("Please enter your child's name").min(2, 'Name must be at least 2 characters'),
  age: Yup.number().positive('Age must be a positive number').integer('Age must be a whole number').min(1, 'Age must be at least 1').max(25, 'Age must be 25 or younger').required("Please enter your child's age"),
  diagnosis: Yup.string().required("Please enter your child's diagnosis"),
  keyStrengths: Yup.string().required("Please describe your child's strengths"),
  keyChallenges: Yup.string().required("Please describe your child's challenges"),
  medications: Yup.string(),
  allergies: Yup.string(),
});

export default function AddChildScreen() {
  const router = useRouter();
  const { addChild, children, deleteAllChildren } = useFamily();
  const { colors } = useTheme();
  const { user } = useAuth();

  // Add error boundary and default values
  if (!colors) {
    console.error('❌ Theme colors not available');
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#000000' }}>
            Loading theme...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const initialValues = { name: '', age: '', diagnosis: '', keyStrengths: '', keyChallenges: '', medications: '', allergies: '' };

  const handleSubmit = async (values: typeof initialValues, { setSubmitting, setFieldError }: any) => {
    console.log('🚀 Starting form submission...', { values, user: user?.uid });
    
    try {
      console.log('🔍 Step 1: Checking authentication...');
      // Check if user is authenticated
      if (!user || !user.uid) {
        Alert.alert(
          'Authentication Required',
          'Please sign in to add a child to your family.',
          [{ text: 'OK' }]
        );
        setSubmitting(false);
        return;
      }
      console.log('✅ Step 1: User authenticated');

      console.log('🔍 Step 2: Checking for duplicate names...');
      // Check if child with same name already exists
      const existingChild = children.find(child => 
        child.name.toLowerCase().trim() === values.name.toLowerCase().trim()
      );

      if (existingChild) {
        Alert.alert(
          'Child Already Exists',
          `You already have a child named "${values.name}" in your family. Please use a different name or nickname.`,
          [{ text: 'OK' }]
        );
        setSubmitting(false);
        return;
      }
      console.log('✅ Step 2: No duplicate names found');

      console.log('🔍 Step 3: Preparing child data...');
      // Prepare child data - FIXED: Don't use undefined values
      const childData: any = {
        name: values.name.trim(),
        age: parseInt(values.age),
        diagnosis: values.diagnosis.trim(),
        strengths: values.keyStrengths.split(',').map(s => s.trim()).filter(s => s.length > 0),
        challenges: values.keyChallenges.split(',').map(c => c.trim()).filter(c => c.length > 0),
      };

      // Only add optional fields if they have content
      if (values.medications.trim()) {
        childData.medications = values.medications.trim();
      }
      
      if (values.allergies.trim()) {
        childData.allergies = values.allergies.trim();
      }

      console.log('📝 Prepared child data:', childData);
      console.log('✅ Step 3: Child data prepared');
      
      console.log('🔍 Step 4: Calling addChild...');
      // Add child to Firebase
      const childId = await addChild(childData);
      console.log('✅ Step 4: addChild completed, ID:', childId);
      
      console.log('🔍 Step 5: Showing success feedback...');
      
      if (Platform.OS === 'web') {
        // Web-compatible success feedback
        console.log('🎉 SUCCESS: Child added successfully!');
        alert(`🎉 ${values.name} has been added to your family!`);
        
        // Force navigation back to children list
        console.log('🔄 Navigating back to children list...');
        router.replace('/(tabs)/children'); // Use replace instead of back
      } else {
        // Mobile Alert
        Alert.alert(
          'Child Added Successfully! 🎉',
          `${values.name} has been added to your family. You can now create personalized routines and track their progress.`,
          [
            {
              text: 'Great!',
              onPress: () => router.back()
            }
          ]
        );
      }
      console.log('✅ Step 5: Success feedback shown');
    } catch (error: any) {
      console.error('❌ Error adding child:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Something went wrong while adding your child. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'You don\'t have permission to add children. Please check your account settings.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error.code === 'resource-exhausted') {
        errorMessage = 'You\'ve reached the limit for adding children. Please contact support.';
      } else if (error.message?.includes('User not authenticated')) {
        errorMessage = 'Please sign in to add a child to your family.';
      } else if (error.message?.includes('Failed to add child')) {
        errorMessage = 'Unable to save your child\'s information. Please check your connection and try again.';
      } else if (error.message?.includes('invalid data')) {
        errorMessage = 'There was an issue with the data format. Please try again.';
      }
      
      Alert.alert(
        'Unable to Add Child',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      console.log('🔍 Step 6: Setting submitting to false...');
      setSubmitting(false);
      console.log('✅ Step 6: Form submission complete');
    }
  };

  const handleDeleteAll = async () => {
    try {
      console.log('🗑️ Starting delete all children...');
      await deleteAllChildren();
      alert('🗑️ All children deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting all children:', error);
      alert('❌ Failed to delete all children');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    outerContainer: {
      flex: 1,
    },
    keyboardAvoidingContainer: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    contentContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40, // Extra padding for delete button
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
    },
    form: {
      gap: 20,
    },
    buttonContainer: {
      marginTop: 8,
    },
    tipsContainer: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    tipsText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    deleteButtonContainer: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    deleteButton: {
      backgroundColor: colors.error,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  try {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Child Profile</Text>
        </View>

        <View style={styles.outerContainer}>
          {Platform.OS === 'web' ? (
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={styles.contentContainer} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              alwaysBounceVertical={false}
            >
              <View style={styles.iconContainer}>
                <UserPlus size={48} color={colors.primary} />
              </View>
              
              <Text style={styles.title}>Add Your Child</Text>
              <Text style={styles.subtitle}>
                Create a profile to track your child's progress and create personalized routines.
              </Text>

              <Formik
                initialValues={initialValues}
                validationSchema={AddChildSchema}
                onSubmit={handleSubmit}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, isValid }) => (
                  <View style={styles.form}>
                    <Input label="Name (Nickname)" placeholder="Enter your child's name or nickname" onChangeText={handleChange('name')} onBlur={handleBlur('name')} value={values.name} error={errors.name} touched={touched.name} />
                    <Input label="Age" placeholder="How old is your child?" onChangeText={handleChange('age')} onBlur={handleBlur('age')} value={values.age} error={errors.age} touched={touched.age} keyboardType="numeric" />
                    <Input label="Diagnosis" placeholder="e.g., ADHD - Combined Type, Autism Spectrum Disorder" onChangeText={handleChange('diagnosis')} onBlur={handleBlur('diagnosis')} value={values.diagnosis} error={errors.diagnosis} touched={touched.diagnosis} />
                    <Input label="Key Strengths" placeholder="What are your child's strengths? (e.g., creative, energetic, kind)" onChangeText={handleChange('keyStrengths')} onBlur={handleBlur('keyStrengths')} value={values.keyStrengths} error={errors.keyStrengths} touched={touched.keyStrengths} multiline numberOfLines={3} />
                    <Input label="Key Challenges" placeholder="What challenges does your child face? (e.g., focus, transitions, social skills)" onChangeText={handleChange('keyChallenges')} onBlur={handleBlur('keyChallenges')} value={values.keyChallenges} error={errors.keyChallenges} touched={touched.keyChallenges} multiline numberOfLines={3} />
                    <Input label="Medications (Optional)" placeholder="Any medications your child takes (no dosages needed)" onChangeText={handleChange('medications')} onBlur={handleBlur('medications')} value={values.medications} error={errors.medications} touched={touched.medications} multiline numberOfLines={2} />
                    <Input label="Allergies/Dietary Restrictions (Optional)" placeholder="e.g., peanuts, gluten-free, dairy" onChangeText={handleChange('allergies')} onBlur={handleBlur('allergies')} value={values.allergies} error={errors.allergies} touched={touched.allergies} multiline numberOfLines={2} />
                    <View style={styles.buttonContainer}><Button title={isSubmitting ? "Adding Child..." : "Add Child to Family"} onPress={() => handleSubmit()} loading={isSubmitting} disabled={isSubmitting || !isValid} fullWidth size="lg" /></View>
                    <View style={styles.tipsContainer}><Text style={styles.tipsTitle}>💡 Tips for a Great Profile</Text><Text style={styles.tipsText}>• Use your child's preferred name or nickname{'\n'}• Be specific about strengths and challenges{'\n'}• You can always update this information later{'\n'}• This helps create better personalized routines</Text></View>
                    <View style={styles.deleteButtonContainer}><TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAll}><Text style={styles.deleteButtonText}>🗑️ Delete All Children (Testing)</Text></TouchableOpacity></View>
                  </View>
                )}
              </Formik>
            </ScrollView>
          ) : (
            <KeyboardAvoidingView
              style={styles.keyboardAvoidingContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={styles.contentContainer} 
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.iconContainer}>
                  <UserPlus size={48} color={colors.primary} />
                </View>
                
                <Text style={styles.title}>Add Your Child</Text>
                <Text style={styles.subtitle}>
                  Create a profile to track your child's progress and create personalized routines.
                </Text>

                <Formik
                  initialValues={initialValues}
                  validationSchema={AddChildSchema}
                  onSubmit={handleSubmit}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, isValid }) => (
                    <View style={styles.form}>
                      <Input label="Name (Nickname)" placeholder="Enter your child's name or nickname" onChangeText={handleChange('name')} onBlur={handleBlur('name')} value={values.name} error={errors.name} touched={touched.name} />
                      <Input label="Age" placeholder="How old is your child?" onChangeText={handleChange('age')} onBlur={handleBlur('age')} value={values.age} error={errors.age} touched={touched.age} keyboardType="numeric" />
                      <Input label="Diagnosis" placeholder="e.g., ADHD - Combined Type, Autism Spectrum Disorder" onChangeText={handleChange('diagnosis')} onBlur={handleBlur('diagnosis')} value={values.diagnosis} error={errors.diagnosis} touched={touched.diagnosis} />
                      <Input label="Key Strengths" placeholder="What are your child's strengths? (e.g., creative, energetic, kind)" onChangeText={handleChange('keyStrengths')} onBlur={handleBlur('keyStrengths')} value={values.keyStrengths} error={errors.keyStrengths} touched={touched.keyStrengths} multiline numberOfLines={3} />
                      <Input label="Key Challenges" placeholder="What challenges does your child face? (e.g., focus, transitions, social skills)" onChangeText={handleChange('keyChallenges')} onBlur={handleBlur('keyChallenges')} value={values.keyChallenges} error={errors.keyChallenges} touched={touched.keyChallenges} multiline numberOfLines={3} />
                      <Input label="Medications (Optional)" placeholder="Any medications your child takes (no dosages needed)" onChangeText={handleChange('medications')} onBlur={handleBlur('medications')} value={values.medications} error={errors.medications} touched={touched.medications} multiline numberOfLines={2} />
                      <Input label="Allergies/Dietary Restrictions (Optional)" placeholder="e.g., peanuts, gluten-free, dairy" onChangeText={handleChange('allergies')} onBlur={handleBlur('allergies')} value={values.allergies} error={errors.allergies} touched={touched.allergies} multiline numberOfLines={2} />
                      <View style={styles.buttonContainer}><Button title={isSubmitting ? "Adding Child..." : "Add Child to Family"} onPress={() => handleSubmit()} loading={isSubmitting} disabled={isSubmitting || !isValid} fullWidth size="lg" /></View>
                      <View style={styles.tipsContainer}><Text style={styles.tipsTitle}>💡 Tips for a Great Profile</Text><Text style={styles.tipsText}>• Use your child's preferred name or nickname{'\n'}• Be specific about strengths and challenges{'\n'}• You can always update this information later{'\n'}• This helps create better personalized routines</Text></View>
                      <View style={styles.deleteButtonContainer}><TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAll}><Text style={styles.deleteButtonText}>🗑️ Delete All Children (Testing)</Text></TouchableOpacity></View>
                    </View>
                  )}
                </Formik>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </View>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('❌ Error rendering AddChildScreen:', error);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#000000', textAlign: 'center', marginBottom: 10 }}>
            Something went wrong loading this page
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center' }}>
            Please try refreshing the page
          </Text>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#007AFF', 
              paddingHorizontal: 20, 
              paddingVertical: 10, 
              borderRadius: 8, 
              marginTop: 20 
            }}
            onPress={() => window.location.reload()}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
              Refresh Page
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}