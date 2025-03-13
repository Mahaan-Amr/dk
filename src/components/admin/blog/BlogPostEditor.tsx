'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, locales } from '@/i18n';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { FiSave, FiEye, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import MediaPicker from '../media/MediaPicker';
import { PlaceholderImage } from '@/components/ui/placeholder-image';

// Dynamically import the rich text editor to avoid SSR issues
const SunEditor = dynamic(() => import('suneditor-react').then(mod => mod.default), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});
import 'suneditor/dist/css/suneditor.min.css';

interface BlogPostEditorProps {
  locale: Locale;
  slug?: string; // If provided, we're editing an existing post
}

interface Category {
  _id: string;
  name: {
    [key in Locale]: string;
  };
  slug: string;
}

// Define the post status type
type PostStatus = 'draft' | 'published' | 'archived';

interface BlogPost {
  _id?: string;
  slug: string;
  content: {
    [key in Locale]: {
      title: string;
      summary: string;
      content: string;
    };
  };
  categories: string[];
  featuredImage?: string;
  seoMetadata: {
    [key in Locale]: {
      title?: string;
      description?: string;
      keywords?: string[];
      ogImage?: string;
    };
  };
  status: PostStatus;
  publishDate?: string;
  scheduledPublishDate?: string;
  revisions?: RevisionType[]; // Replaced any[] with a more specific type
}

// Define revision type
interface RevisionType {
  _id: string;
  date: string;
  status?: PostStatus;
}

// Type for debug info
interface DebugInfo {
  isAuthenticated: boolean;
  token: string | null;
  serverResponse: {
    status: string;
    categoriesCount?: number;
    message?: string;
  } | null;
}

export function BlogPostEditor({ locale, slug }: BlogPostEditorProps) {
  const defaultT = useTranslations('admin.blog');
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<Locale>(locale);
  
  // Added for debugging
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    isAuthenticated: false,
    token: null,
    serverResponse: null
  });
  
  // Custom translation function with fallbacks
  const t = (key: string) => {
    try {
      return defaultT(key);
    } catch {
      // Fallbacks for known problematic keys
      if (key === 'categories.back') return 'Back';
      if (key === 'editor.back') return 'Back';
      if (key === 'editor.seoOgImagePlaceholder') return 'Enter image URL for social sharing';
      
      // Log the error for debugging
      console.warn(`Missing translation for key: admin.blog.${key}`);
      
      // Return the key as a last resort
      return key.split('.').pop() || key;
    }
  };
  
  // State for loading and errors
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State for the post being edited
  const [post, setPost] = useState<BlogPost>({
    _id: '',
    slug: '',
    content: {
      fa: { title: '', summary: '', content: '' },
      de: { title: '', summary: '', content: '' },
    },
    categories: [],
    featuredImage: '',
    seoMetadata: {
      fa: { title: '', description: '', keywords: [], ogImage: '' },
      de: { title: '', description: '', keywords: [], ogImage: '' },
    },
    status: 'draft',
    publishDate: '',
    scheduledPublishDate: '',
  });

  // Function to check authentication status (for debugging)
  const checkAuthStatus = useCallback(() => {
    // Get the auth token from cookies
    const cookies = document.cookie.split(';');
    let token = null;
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'admin_token') {
        token = value;
        break;
      }
    }
    
    setDebugInfo(prev => ({
      ...prev,
      isAuthenticated: !!token,
      token: token ? `${token.substring(0, 10)}...` : null
    }));
    
    // Test the auth token with a simple API call
    if (token) {
      fetch('/api/admin/blog/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(`API test failed with status: ${response.status}`);
        })
        .then(data => {
          setDebugInfo(prev => ({
            ...prev,
            serverResponse: {
              status: 'success',
              categoriesCount: Array.isArray(data) ? data.length : 0
            }
          }));
        })
        .catch(error => {
          setDebugInfo(prev => ({
            ...prev,
            serverResponse: {
              status: 'error',
              message: error instanceof Error ? error.message : String(error)
            }
          }));
        });
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/blog/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while fetching categories');
      }
    };

    const fetchPost = async () => {
      if (!slug) {
        // If we're creating a new post and we have a title in the primary locale,
        // generate a slug from it
        setPost(prevPost => {
          const primaryLocaleTitle = prevPost.content.fa.title;
          if (primaryLocaleTitle && !prevPost.slug) {
            return {
              ...prevPost,
              slug: generateSlugFromTitle(primaryLocaleTitle)
            };
          }
          return prevPost;
        });
        
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/blog/posts/${slug}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.post) {
          setPost(data.post);
          
          // If the post has a scheduled publish date, set the form fields
          if (data.post.scheduledPublishDate) {
            const date = new Date(data.post.scheduledPublishDate);
            setPost(prev => ({
              ...prev,
              scheduledPublishDate: date.toISOString(),
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchPost();
  }, [slug]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Validate required fields for the active locale
      const contentForActiveLocale = post.content[activeLocale];
      if (!contentForActiveLocale.title.trim()) {
        throw new Error(`${t('editor.titleRequired')}`);
      }
      if (!contentForActiveLocale.summary.trim()) {
        throw new Error(`${t('editor.summaryRequired')}`);
      }
      if (!contentForActiveLocale.content.trim()) {
        throw new Error(`${t('editor.contentRequired')}`);
      }
      
      // Validate slug
      if (!post.slug.trim()) {
        // Try to generate a slug from the primary locale title
        const primaryLocaleTitle = post.content.fa.title;
        if (primaryLocaleTitle) {
          const generatedSlug = generateSlugFromTitle(primaryLocaleTitle);
          if (generatedSlug) {
            // Update the post with the generated slug
            setPost(prev => ({...prev, slug: generatedSlug}));
            // Continue with submission using the new slug
            post.slug = generatedSlug;
          } else {
            throw new Error('Could not generate a slug from the title. Please provide a slug manually.');
          }
        } else {
          throw new Error('A slug is required. Please provide a title or enter a slug manually.');
        }
      }
      
      // Ensure German content is not empty (required by the schema)
      let updatedPost = {...post};
      if (!updatedPost.content.de.title.trim()) {
        updatedPost.content.de.title = updatedPost.content.fa.title || 'Title (German translation needed)';
      }
      if (!updatedPost.content.de.summary.trim()) {
        updatedPost.content.de.summary = updatedPost.content.fa.summary || 'Summary (German translation needed)';
      }
      if (!updatedPost.content.de.content.trim()) {
        updatedPost.content.de.content = updatedPost.content.fa.content || '<p>Content (German translation needed)</p>';
      }
      
      // Prepare the API endpoint and method
      const apiUrl = updatedPost._id 
        ? `/api/admin/blog/posts/${updatedPost.slug}` 
        : '/api/admin/blog/posts';
      const method = updatedPost._id ? 'PUT' : 'POST';
      
      // Remove _id field for new posts (MongoDB will generate it)
      if (!updatedPost._id) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...postWithoutId } = updatedPost;
        updatedPost = postWithoutId as BlogPost;
      }
      
      // Get authentication token from cookie
      const cookies = document.cookie.split(';');
      let authToken = '';
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'admin_token') {
          authToken = value;
          break;
        }
      }
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Send the request
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedPost),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update the post state with the returned data
      if (data._id) {
        setPost(data);
        
        // For new posts, update the URL
        if (!updatedPost._id && data._id) {
          router.push(`/${locale}/admin/blog/posts/${data.slug}/edit`);
        }
        
        setSuccess(t('editor.saveSuccess'));
      } else if (data.post && data.post._id) {
        setPost(data.post);
        
        // For new posts, update the URL
        if (!updatedPost._id && data.post._id) {
          router.push(`/${locale}/admin/blog/posts/${data.post.slug}/edit`);
        }
        
        setSuccess(t('editor.saveSuccess'));
      } else {
        setSuccess('Post saved successfully, but the response format was unexpected.');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle content changes for the rich text editor
  const handleContentChange = (content: string) => {
    setPost(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [activeLocale]: {
          ...prev.content[activeLocale],
          content
        }
      }
    }));
  };

  // Handle generic input changes for text fields
  const handleInputChange = (locale: Locale, field: string, value: string) => {
    const updatedContent = { ...(post.content || {}) };
    
    if (!updatedContent[locale]) {
      updatedContent[locale] = { title: '', summary: '', content: '' };
    }
    
    updatedContent[locale] = {
      ...updatedContent[locale],
      [field]: value,
    };
    
    setPost({ ...post, content: updatedContent });
    
    // If this is the primary locale title field and we don't have a slug yet, generate one
    if (field === 'title' && locale === 'fa' && !post.slug) {
      const generatedSlug = generateSlugFromTitle(value);
      setPost(prev => ({...prev, slug: generatedSlug}));
    }
  };

  // Function to generate a slug from the title
  const generateSlugFromTitle = (title: string): string => {
    if (!title) return '';
    
    // Convert to lowercase, replace spaces with hyphens, and remove special characters
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, '')       // Remove non-word chars (except hyphens)
      .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '')             // Trim hyphens from start
      .replace(/-+$/, '');            // Trim hyphens from end
  };
  
  // Handle slug input changes
  const handleSlugChange = (value: string) => {
    // Convert the input to a valid slug format
    const formattedSlug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
      
    setPost({...post, slug: formattedSlug});
  };

  // Handle preview post
  const handlePreviewPost = async () => {
    try {
      setPreviewLoading(true);
      setError(null);
      
      // Create a preview version of the post
      const previewData = {
        ...post,
        preview: true
      };
      
      // Send the request to create a preview
      const response = await fetch('/api/admin/blog/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Open the preview in a new tab
      if (data.previewUrl) {
        window.open(data.previewUrl, '_blank');
      } else {
        throw new Error('No preview URL returned from server');
      }
    } catch (error) {
      console.error('Error creating preview:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setPreviewLoading(false);
    }
  };

  // State for preview loading
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  
  // State for revisions panel
  const [showRevisionsPanel, setShowRevisionsPanel] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-pulse text-xl text-gray-600 dark:text-gray-400">
            {t('editor.loading')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Authentication debug info - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-bold">Debug Info</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Authentication Status:</div>
            <div>{debugInfo.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
            
            <div>Token:</div>
            <div>{debugInfo.token || 'None'}</div>
            
            <div>Server Test:</div>
            <div>
              {debugInfo.serverResponse ? (
                debugInfo.serverResponse.status === 'success' 
                  ? `✅ Success (${debugInfo.serverResponse.categoriesCount} categories)` 
                  : `❌ Error: ${debugInfo.serverResponse.message}`
              ) : 'Testing...'}
            </div>
          </div>
          <button 
            onClick={checkAuthStatus}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Refresh Status
          </button>
        </div>
      )}

      {/* Header with back button and title */}
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-primary transition"
        >
          <FiArrowLeft className="mr-2" />
          {t('editor.back')}
        </button>
        <h1 className="text-2xl font-bold">
          {post._id ? t('editor.editPost') : t('editor.newPost')}
        </h1>
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error and success messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}
          
          {/* Language tabs */}
          <div className="flex space-x-2 mb-4">
            {locales.map((loc: Locale) => (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocale(loc)}
                className={`px-4 py-2 rounded-lg ${
                  activeLocale === loc
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t(`languages.${loc}`)}
              </button>
            ))}
          </div>
          
          {/* Editor fields */}
          <div className="space-y-4">
            {/* Title field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('editor.title')}
              </label>
              <input
                type="text"
                id="title"
                value={post.content[activeLocale].title}
                onChange={(e) => handleInputChange(activeLocale, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                placeholder={t('editor.titlePlaceholder')}
              />
            </div>
            
            {/* Slug field */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('editor.slug') || 'Slug'}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                  {window.location.origin}/{locale}/blog/
                </span>
                <input
                  type="text"
                  id="slug"
                  value={post.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-r-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                  placeholder="your-post-url"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('editor.slugHelp') || 'URL-friendly identifier for your post. Auto-generated from title.'}
              </p>
            </div>
            
            {/* Summary field */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('editor.summary')}
              </label>
              <textarea
                id="summary"
                value={post.content[activeLocale].summary}
                onChange={(e) => handleInputChange(activeLocale, 'summary', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                placeholder={t('editor.summaryPlaceholder')}
              />
            </div>
            
            {/* Content editor */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('editor.content')}
              </label>
              <SunEditor
                setContents={post.content[activeLocale].content}
                onChange={(content) => handleContentChange(content)}
                setOptions={{
                  height: '400px',
                  buttonList: [
                    ['undo', 'redo'],
                    ['font', 'fontSize', 'formatBlock'],
                    ['paragraphStyle', 'blockquote'],
                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                    ['fontColor', 'hiliteColor', 'textStyle'],
                    ['removeFormat'],
                    ['outdent', 'indent'],
                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                    ['table', 'link', 'image', 'video'],
                    ['fullScreen', 'showBlocks', 'codeView'],
                  ],
                }}
              />
            </div>
            
            {/* Categories */}
            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('editor.categories')}
              </label>
              <select
                id="categories"
                multiple
                value={post.categories}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                  setPost({ ...post, categories: selectedOptions });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name[activeLocale]}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Featured image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('editor.featuredImage')}
              </label>
              
              {post.featuredImage ? (
                <div className="relative h-48 mb-2 rounded-lg overflow-hidden">
                  <PlaceholderImage
                    src={post.featuredImage}
                    alt="Featured image"
                    fill
                    className="object-cover rounded-lg"
                    category="blog"
                  />
                  <button
                    type="button"
                    onClick={() => setPost({ ...post, featuredImage: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <MediaPicker
                  value={post.featuredImage || ""}
                  onChange={(url) => setPost({ ...post, featuredImage: url })}
                  allowMultiple={false}
                />
              )}
            </div>
            
            {/* Status selection */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('editor.status')}
              </label>
              <select
                id="status"
                value={post.status}
                onChange={(e) => setPost({ ...post, status: e.target.value as PostStatus })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
              >
                <option value="draft">{t('editor.statusDraft')}</option>
                <option value="published">{t('editor.statusPublished')}</option>
                <option value="archived">{t('editor.statusArchived')}</option>
              </select>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 flex items-center"
              >
                <FiSave className="mr-2" />
                {submitting ? t('editor.saving') : t('editor.save')}
              </button>
              
              {/* Preview button */}
              <button
                type="button"
                onClick={handlePreviewPost}
                disabled={previewLoading}
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 flex items-center"
              >
                <FiEye className="mr-2" />
                {previewLoading ? t('editor.preparing') : t('editor.preview')}
              </button>
              
              {/* Revisions button - only show if post has revisions */}
              {post.revisions && post.revisions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRevisionsPanel(!showRevisionsPanel)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 flex items-center"
                >
                  <FiRefreshCw className="mr-2" />
                  {t('editor.revisions')} ({post.revisions.length})
                </button>
              )}
            </div>
          </div>
          
          {/* Revisions panel */}
          {showRevisionsPanel && post.revisions && post.revisions.length > 0 && (
            <div className="mt-8 p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium mb-4">{t('editor.revisionsTitle')}</h3>
              <div className="max-h-96 overflow-y-auto">
                {post.revisions.map((revision, index) => (
                  <div 
                    key={revision._id || index}
                    className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {new Date(revision.date).toLocaleString(locale === 'fa' ? 'fa-IR' : 'de-DE')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {revision.status && <span className="mr-2">{t(`editor.status${revision.status.charAt(0).toUpperCase() + revision.status.slice(1)}`)}</span>}
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            // This button can stay but we've removed the unused state settings
                            // and will need to implement the actual view functionality later
                            console.log('View revision', revision._id);
                          }}
                          className="text-sm text-gray-500 hover:text-primary"
                        >
                          {t('editor.view')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}