import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import { BlogCategories } from '../BlogCategories';
import '@testing-library/jest-dom';
import { Locale } from '@/types/locale';

// Mock next-intl translations
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

// Mock environment for tests
jest.mock('../BlogCategories', () => {
  const originalModule = jest.requireActual('../BlogCategories');
  const BlogCategoriesComponent = (props: { locale: Locale }) => {
    const OriginalBlogCategories = originalModule.BlogCategories;
    return <OriginalBlogCategories {...props} />;
  };
  return {
    ...originalModule,
    BlogCategories: BlogCategoriesComponent
  };
});

describe('BlogCategories Component', () => {
  const mockTranslationFn = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup translations mock
    (useTranslations as jest.Mock).mockReturnValue(mockTranslationFn);
  });

  // Test 1: Test component rendering
  it('renders correctly and loads categories', async () => {
    render(<BlogCategories locale="fa" />);
    
    // Wait for initial data loading
    await waitFor(() => {
      expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
    });
    
    // Check that add new button is rendered
    expect(screen.getByRole('button', { name: /categories\.addNew/i })).toBeInTheDocument();
    
    // Check that category list is rendered with items
    const categoryItems = screen.getAllByRole('listitem');
    expect(categoryItems.length).toBeGreaterThan(0);
  });

  // Test 2: Test category creation
  it('creates a new category correctly', async () => {
    const user = userEvent.setup();
    
    render(<BlogCategories locale="fa" />);
    
    // Wait for initial loading
    await waitFor(() => {
      expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
    });
    
    // Click add new category button
    await user.click(screen.getByRole('button', { name: /categories\.addNew/i }));
    
    // Fill form fields
    await user.type(screen.getByLabelText(/Name \(Persian\)/i), 'دسته جدید');
    await user.type(screen.getByLabelText(/Name \(German\)/i), 'Neue Kategorie');
    await user.type(screen.getByLabelText(/Slug/i), 'new-category');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /categories\.save/i }));
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Category saved successfully')).toBeInTheDocument();
    });
  });

  // Test 3: Test category editing
  it('edits an existing category correctly', async () => {
    const user = userEvent.setup();
    
    render(<BlogCategories locale="fa" />);
    
    // Wait for initial loading
    await waitFor(() => {
      expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
    });
    
    // Click edit button for the first category
    const editButtons = screen.getAllByRole('button', { name: /categories\.edit/i });
    expect(editButtons.length).toBeGreaterThan(0);
    await user.click(editButtons[0]);
    
    // Update form fields
    await user.clear(screen.getByLabelText(/Name \(Persian\)/i));
    await user.type(screen.getByLabelText(/Name \(Persian\)/i), 'دسته به روز شده');
    
    await user.clear(screen.getByLabelText(/Name \(German\)/i));
    await user.type(screen.getByLabelText(/Name \(German\)/i), 'Aktualisierte Kategorie');
    
    await user.clear(screen.getByLabelText(/Slug/i));
    await user.type(screen.getByLabelText(/Slug/i), 'updated-category');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /categories\.save/i }));
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Category saved successfully')).toBeInTheDocument();
    });
  });

  // Test 4: Test category deletion
  it('deletes a category correctly', async () => {
    const user = userEvent.setup();
    
    render(<BlogCategories locale="fa" />);
    
    // Wait for initial loading
    await waitFor(() => {
      expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
    });
    
    // Open delete confirmation modal
    const deleteButtons = screen.getAllByRole('button', { name: /categories\.delete/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
    await user.click(deleteButtons[0]);
    
    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /categories\.confirm/i }));
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Category deleted successfully')).toBeInTheDocument();
    });
  });

  // Test 5: Test error handling
  it('handles API errors correctly', async () => {
    const user = userEvent.setup();
    
    render(<BlogCategories locale="fa" />);
    
    // Wait for initial loading
    await waitFor(() => {
      expect(screen.queryByText('Loading categories...')).not.toBeInTheDocument();
    });
    
    // Click add new category button
    await user.click(screen.getByRole('button', { name: /categories\.addNew/i }));
    
    // Submit form with missing data
    await user.click(screen.getByRole('button', { name: /categories\.save/i }));
    
    // Check that error message is displayed
    await waitFor(() => {
      const errorElement = screen.getByText('All fields are required');
      expect(errorElement).toBeInTheDocument();
    });
  });
}); 