import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import SimpleSkillForm from '@/components/SimpleSkillForm';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AuthProvider>
);

describe('SimpleSkillForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { getByPlaceholderText, getByText } = await waitFor(() =>
      render(
        <TestWrapper>
          <SimpleSkillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
        </TestWrapper>
      )
    );

    expect(getByPlaceholderText('e.g., Tying Shoes, Reading, Making Friends')).toBeTruthy();
    expect(getByText('Create a New Skill Journey')).toBeTruthy();
  });

  it('submits form with correct data', async () => {
    const { getByPlaceholderText, getByText, getByDisplayValue } = await waitFor(() =>
      render(
        <TestWrapper>
          <SimpleSkillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
        </TestWrapper>
      )
    );

    // Fill out all required fields
    const nameInput = getByPlaceholderText('e.g., Tying Shoes, Reading, Making Friends');
    const daysInput = getByPlaceholderText('e.g., 30');
    
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