import { renderHook, act } from '@testing-library/react';
import { useBlogEditorForm } from '../useBlogEditorForm';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { waitFor } from '@testing-library/react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Sample test data
const mockPost = {
  _id: 'post1',
  slug: 'test-post',
  content: {
    fa: { title: 'عنوان تست', summary: 'خلاصه تست', content: '<p>محتوای تست</p>' },
    de: { title: 'Test Titel', summary: 'Test Zusammenfassung', content: '<p>Test Inhalt</p>' },
  },
  categories: ['cat1'],
  featuredImage: 'https://example.com/image.jpg',
  seoMetadata: {
    fa: { title: 'عنوان سئو', description: 'توضیحات سئو', keywords: ['کلیدواژه۱', 'کلیدواژه۲'], ogImage: '' },
    de: { title: 'SEO Titel', description: 'SEO Beschreibung', keywords: ['Stichwort1', 'Stichwort2'], ogImage: '' },
  },
  status: 'draft',
};

// Mock environment for tests
jest.mock('../useBlogEditorForm', () => {
  const originalModule = jest.requireActual('../useBlogEditorForm');
  return {
    ...originalModule,
    // Override the implementation for tests
  };
});

describe('useBlogEditorForm Hook', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useBlogEditorForm('fa'));
    
    expect(result.current.post).toEqual({
      slug: '',
      content: {
        fa: { title: '', summary: '', content: '' },
        de: { title: '', summary: '', content: '' },
      },
      categories: [],
      seoMetadata: {
        fa: { title: '', description: '', keywords: [], ogImage: '' },
        de: { title: '', description: '', keywords: [], ogImage: '' },
      },
      status: 'draft',
    });
    
    // Since we're using mock data in test mode, loading should be false
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loads an existing post when slug is provided', async () => {
    const { result, rerender } = renderHook(() => useBlogEditorForm('fa', 'test-post'));
    
    // Wait for the post to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    rerender();
    
    expect(result.current.post).toEqual(mockPost);
    expect(result.current.loading).toBe(false);
  });

  it('handles form field changes', () => {
    const { result } = renderHook(() => useBlogEditorForm('fa'));
    
    act(() => {
      result.current.handleFieldChange('title', 'New Title');
    });
    
    expect(result.current.post.content.fa.title).toBe('New Title');
    
    act(() => {
      result.current.handleFieldChange('slug', 'new-slug');
    });
    
    expect(result.current.post.slug).toBe('new-slug');
    
    act(() => {
      result.current.handleFieldChange('categories', ['cat1', 'cat2']);
    });
    
    expect(result.current.post.categories).toEqual(['cat1', 'cat2']);
  });

  it('generates slug from title', () => {
    const { result } = renderHook(() => useBlogEditorForm('fa'));
    
    act(() => {
      result.current.handleFieldChange('title', 'This is a Test Title');
    });
    
    act(() => {
      result.current.generateSlug();
    });
    
    expect(result.current.post.slug).toBe('this-is-a-test-title');
  });

  it('switches between languages', () => {
    const { result } = renderHook(() => useBlogEditorForm('fa'));
    
    expect(result.current.activeLocale).toBe('fa');
    
    act(() => {
      result.current.switchLanguage('de');
    });
    
    expect(result.current.activeLocale).toBe('de');
  });

  it('handles form submission errors', async () => {
    const { result } = renderHook(() => useBlogEditorForm('fa'));
    
    // Submit the form without setting required fields
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Slug is required');
    
    // Set slug but not titles
    act(() => {
      result.current.handleFieldChange('slug', 'error-test');
    });
    
    // Submit the form again
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Title is required in all languages');
    
    // Set title for fa but not de
    act(() => {
      result.current.handleFieldChange('title', 'Error Test');
    });
    
    // Submit the form again
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Title is required in all languages');
  });

  it('handles form submission successfully', async () => {
    // Mock the router first, before rendering the hook
    const mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    
    // Create a custom hook for this test with direct post manipulation
    const useCustomHook = () => {
      const hookResult = useBlogEditorForm('fa');
      
      useEffect(() => {
        // Set up a complete post object with all required fields
        const completePost = {
          slug: 'test-post-new',
          content: {
            fa: { title: 'عنوان تست جدید', summary: 'خلاصه تست', content: '<p>محتوای تست</p>' },
            de: { title: 'Neuer Test Titel', summary: 'Test Zusammenfassung', content: '<p>Test Inhalt</p>' },
          },
          categories: ['cat1'],
          featuredImage: 'https://example.com/image.jpg',
          seoMetadata: {
            fa: { title: 'عنوان سئو', description: 'توضیحات سئو', keywords: ['کلیدواژه۱', 'کلیدواژه۲'], ogImage: '' },
            de: { title: 'SEO Titel', description: 'SEO Beschreibung', keywords: ['Stichwort1', 'Stichwort2'], ogImage: '' },
          },
          status: 'draft' as const  // Explicitly type as PostStatus
        };
        
        // Manually set the post to ensure all required fields are present
        if (hookResult.setPost) {
          hookResult.setPost(completePost);
        }
      }, [hookResult]);
      
      return hookResult;
    };
    
    // Render the custom hook
    const { result } = renderHook(() => useCustomHook());
    
    // Wait for the initial setup to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Submit the form
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    // Wait for the form submission to complete and check results
    await waitFor(() => {
      expect(result.current.success).toBe('Post saved successfully');
      expect(mockRouterPush).toHaveBeenCalledWith('/admin/blog');
    }, { timeout: 3000 });
  });
}); 