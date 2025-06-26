import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text }
from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Placeholder for custom UI components - assume they exist
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';
// Placeholder for theme - assume it exists
// import { theme } from '@/constants/theme';

// Mock Input component for demonstration purposes
const Input = (props: any) => (
  <View style={styles.inputContainer}>
    {props.label && <Text style={styles.label}>{props.label}</Text>}
    {/* For multiline, we just show a taller mock input */}
    <Text style={[styles.mockInput, props.multiline && { height: 80, textAlignVertical: 'top' }]}>
      {props.value || props.placeholder || 'Input Field'}
    </Text>
    {props.touched && props.error && <Text style={styles.errorText}>{props.error}</Text>}
  </View>
);

// Mock Button component
const Button = (props: any) => (
  <View style={styles.buttonContainer}>
    <Text style={styles.buttonText} onPress={props.onPress}>{props.title || 'Submit'}</Text>
  </View>
);

// Mock theme object
const theme = {
  colors: {
    primary: '#007bff',
    background: '#f0f0f0',
    text: '#333',
    error: '#dc3545',
    lightGray: '#d3d3d3',
  },
  spacing: {
    m: 16,
    s: 8,
  },
  fontSize: {
    body: 16,
    label: 14,
  }
};

// Same validation schema as AddChildScreen
const EditChildSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  age: Yup.number().positive('Age must be positive').integer('Age must be an integer').required('Age is required'),
  diagnosis: Yup.string().required('Diagnosis is required'),
  keyStrengths: Yup.string().required('Key strengths are required'),
  keyChallenges: Yup.string().required('Key challenges are required'),
  medications: Yup.string(),
  allergies: Yup.string(),
});

// Mock child data structure
interface ChildProfile {
  id: string;
  name: string;
  age: number | string; // Formik values will be string initially if coming from text input
  diagnosis: string;
  keyStrengths: string;
  keyChallenges: string;
  medications?: string;
  allergies?: string;
}

// Mock function to fetch child data - in a real app, this would be an API call
const fetchChildData = (id: string): ChildProfile | null => {
  console.log(`Fetching data for child ID: ${id}`);
  // For demonstration, return mock data if id matches, otherwise null
  if (id === '1' || id) { // Accept any id for mock purposes for now
    return {
      id: id,
      name: 'Emma',
      age: 8,
      diagnosis: 'ADHD - Combined',
      keyStrengths: 'Creative, Energetic, Quick learner',
      keyChallenges: 'Focus in distracting environments, Transitions between tasks',
      medications: 'Methylphenidate 10mg (morning)',
      allergies: 'Peanuts, Shellfish',
    };
  }
  return null;
};


export default function EditChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<ChildProfile | null>(null);

  useEffect(() => {
    if (id) {
      const childData = fetchChildData(id);
      if (childData) {
        setInitialValues({
          ...childData,
          age: childData.age.toString(), // Ensure age is a string for Formik input
        });
      } else {
        // Handle case where child data is not found, e.g., show error or redirect
        console.error(`Child with ID ${id} not found.`);
        // Optionally, redirect: router.replace('/children');
      }
    }
  }, [id]);

  const handleSubmit = (values: ChildProfile) => {
    console.log('Updated Child Profile Data:', { ...values, id });
    // Here you would typically save the updated data to a store or API
    alert('Child profile updated (see console for data)!');
    // router.back(); // Example: navigate back after submission
  };

  if (!initialValues) {
    // Display loading indicator or a message while data is being "fetched"
    // Or if id was invalid and childData was null
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading child data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Edit {initialValues.name}'s Profile</Text>
      <Formik
        initialValues={initialValues}
        validationSchema={EditChildSchema}
        onSubmit={handleSubmit}
        enableReinitialize // Important to reinitialize form when initialValues change
      >
        {({ handleChange, handleBlur, handleSubmit: formikSubmit, values, errors, touched }) => (
          <View>
            <Input
              label="Name (Nickname)"
              placeholder="Enter child's nickname"
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
              error={errors.name}
              touched={touched.name}
            />
            <Input
              label="Age"
              placeholder="Enter child's age"
              onChangeText={handleChange('age')}
              onBlur={handleBlur('age')}
              value={values.age.toString()}
              error={errors.age}
              touched={touched.age}
              keyboardType="numeric"
            />
            <Input
              label="Diagnosis"
              placeholder="e.g., ADHD - Combined Type"
              onChangeText={handleChange('diagnosis')}
              onBlur={handleBlur('diagnosis')}
              value={values.diagnosis}
              error={errors.diagnosis}
              touched={touched.diagnosis}
            />
            <Input
              label="Key Strengths"
              placeholder="Describe key strengths"
              onChangeText={handleChange('keyStrengths')}
              onBlur={handleBlur('keyStrengths')}
              value={values.keyStrengths}
              error={errors.keyStrengths}
              touched={touched.keyStrengths}
              multiline
            />
            <Input
              label="Key Challenges"
              placeholder="Describe key challenges"
              onChangeText={handleChange('keyChallenges')}
              onBlur={handleBlur('keyChallenges')}
              value={values.keyChallenges}
              error={errors.keyChallenges}
              touched={touched.keyChallenges}
              multiline
            />
            <Input
              label="Medications (Optional)"
              placeholder="List any medications"
              onChangeText={handleChange('medications')}
              onBlur={handleBlur('medications')}
              value={values.medications}
              error={errors.medications}
              touched={touched.medications}
              multiline
            />
            <Input
              label="Allergies/Dietary Restrictions (Optional)"
              placeholder="e.g., peanuts, gluten-free"
              onChangeText={handleChange('allergies')}
              onBlur={handleBlur('allergies')}
              value={values.allergies}
              error={errors.allergies}
              touched={touched.allergies}
              multiline
            />
            <Button title="Save Changes" onPress={formikSubmit} />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    color: theme.colors.text,
  },
  inputContainer: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: theme.fontSize.label,
    color: theme.colors.text,
    marginBottom: theme.spacing.s / 2,
  },
  mockInput: {
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.s * 1.2, // A bit more padding for text inputs
    borderRadius: 4,
    fontSize: theme.fontSize.body,
    minHeight: 40,
    color: theme.colors.text,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.s / 2,
  },
  buttonContainer: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  buttonText: {
    color: '#fff',
    fontSize: theme.fontSize.body,
    fontWeight: 'bold',
  }
});
