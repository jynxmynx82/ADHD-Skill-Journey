import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SimpleSkillForm from '@/components/SimpleSkillForm';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

// Simple mock context providers that don't use Firebase or AsyncStorage
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="auth-provider">
    {children}
  </div>
);

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="theme-provider">
    {children}
  </div>
);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MockAuthProvider>
    <MockThemeProvider>
      {children}
    </MockThemeProvider>
  </MockAuthProvider>
);

describe('SimpleSkillForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { getByPlaceholderText, getByText, toJSON, debug } = render(
      <TestWrapper>
        <SimpleSkillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
      </TestWrapper>
    );

    let found = false;
    try {
      expect(getByPlaceholderText('e.g., Tying Shoes, Reading, Making Friends')).toBeTruthy();
      found = true;
    } catch (e) {
      // Print debug output if not found
      debug();
      throw e;
    }
    expect(getByText('Create a New Skill Journey')).toBeTruthy();
  });

  it('renders without providers (minimal)', () => {
    const { getByPlaceholderText, debug, UNSAFE_getAllByType } = render(
      <SimpleSkillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );
    try {
      expect(getByPlaceholderText('e.g., Tying Shoes, Reading, Making Friends')).toBeTruthy();
    } catch (e) {
      // Print all TextInput elements and their props
      const inputs = UNSAFE_getAllByType(require('react-native').TextInput);
      // eslint-disable-next-line no-console
      console.log('TextInput elements:', inputs.map(i => i.props));
      debug();
      throw e;
    }
  });

  it('renders with only AuthProvider', () => {
    const { getByPlaceholderText, debug } = render(
      <MockAuthProvider>
        <SimpleSkillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
      </MockAuthProvider>
    );
    try {
      expect(getByPlaceholderText('e.g., Tying Shoes, Reading, Making Friends')).toBeTruthy();
    } catch (e) {
      debug();
      throw e;
    }
  });

  it('renders with only ThemeProvider', () => {
    const { getByPlaceholderText, debug } = render(
      <MockThemeProvider>
        <SimpleSkillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
      </MockThemeProvider>
    );
    try {
      expect(getByPlaceholderText('e.g., Tying Shoes, Reading, Making Friends')).toBeTruthy();
    } catch (e) {
      debug();
      throw e;
    }
  });

  it('submits form with correct data', async () => {
    const { getByPlaceholderText, getByText, debug } = render(
      <TestWrapper>
        <SimpleSkillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
      </TestWrapper>
    );

    let nameInput, daysInput;
    try {
      nameInput = getByPlaceholderText('e.g., Tying Shoes, Reading, Making Friends');
      daysInput = getByPlaceholderText('e.g., 30');
    } catch (e) {
      debug();
      throw e;
    }
    
    fireEvent.changeText(nameInput, 'Test Skill');
    fireEvent.changeText(daysInput, '30');

    // Select category (Self Care)
    const selfCareButton = getByText('Self Care');
    fireEvent.press(selfCareButton);

    // Select difficulty (Beginner)
    const beginnerButton = getByText('Beginner');
    fireEvent.press(beginnerButton);

    // Submit the form
    const submitButton = getByText('Create Skill');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Skill',
        category: 'self-care',
        difficulty: 'beginner',
        estimatedDays: 30,
      });
    });
  });
}); 