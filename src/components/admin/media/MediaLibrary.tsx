'use client';

import { useState, useEffect, useCallback, ChangeEvent, Fragment } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  PencilIcon,
} from '@heroicons/react/24/outline';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { MediaItem } from '@/types/media';

// Media type filter options
type MediaTypeFilter = 'all' | 'image' | 'video' | 'audio' | 'document';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Define strict prop types
interface SingleSelectLibraryProps {
  onSelect?: (media: MediaItem) => void;
  isModal?: boolean;
  allowMultiple: false;
  onClose?: () => void;
}

interface MultiSelectLibraryProps {
  onSelect?: (media: MediaItem[]) => void;
  isModal?: boolean;
  allowMultiple: true;
  onClose?: () => void;
}

type MediaLibraryProps = SingleSelectLibraryProps | MultiSelectLibraryProps;

// New interfaces for categorization
interface CategoryCount {
  name: string;
  count: number;
}

interface TagCount {
  name: string;
  count: number;
}

export default function MediaLibrary(props: MediaLibraryProps) {
  const { isModal = false, onClose } = props;
  const allowMultiple = 'allowMultiple' in props ? props.allowMultiple : false;
  const router = useRouter();
  
  // Type-safe onSelect based on allowMultiple
  const onSelect = allowMultiple 
    ? (props as MultiSelectLibraryProps).onSelect 
    : (props as SingleSelectLibraryProps).onSelect;

  const t = useTranslations('admin.media');
  const commonT = useTranslations('common');
  
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Assume authenticated until proven otherwise
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAlt, setEditedAlt] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
  
  // Keep these state variables for future functionality
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [isApplyingBulkAction, setIsApplyingBulkAction] = useState(false);
  
  // Fetch media items with enhanced filters
  // Update function signature to accept string|null
  const fetchMedia = useCallback(async (
    page = 1, 
    search = '', 
    type = '', 
    category: string | null = null, 
    tag: string | null = null
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (search) queryParams.append('search', search);
      if (type && type !== 'all') queryParams.append('type', type);
      if (category) queryParams.append('category', category);
      if (tag) queryParams.append('tag', tag);
      
      const response = await fetch(`/api/admin/media?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setMedia(data.media);
      setPagination(data.pagination);
      
      // Update categories and tags counts
      if (data.categories) {
        setCategories(data.categories);
      }
      
      if (data.tags) {
        setTags(data.tags);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);
  
  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth/check');
      
      if (response.status === 401) {
        setIsAuthenticated(false);
        return false;
      }
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Handle redirect to login
  const handleLoginRedirect = () => {
    try {
      router.push('/admin/login?redirect=' + encodeURIComponent(window.location.pathname));
    } catch (error) {
      console.error('Router navigation error:', error);
      // Fallback for when router isn't available
      window.location.href = '/admin/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
  };
  
  // Load media on component mount with all filters
  useEffect(() => {
    fetchMedia(
      pagination.page, 
      searchQuery, 
      mediaTypeFilter === 'all' ? '' : mediaTypeFilter,
      selectedCategory,
      selectedTag
    );
  }, [fetchMedia, pagination.page, searchQuery, mediaTypeFilter, selectedCategory, selectedTag]);
  
  // Handle file upload
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional metadata
      formData.append('title', file.name);
      formData.append('alt', '');
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          // Could add a progress bar here
        }
      });
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('Upload success:', response);
              // Refresh the media list after upload
              fetchMedia(pagination.page, searchQuery, mediaTypeFilter === 'all' ? '' : mediaTypeFilter, selectedCategory, selectedTag);
              setIsUploading(false);
            } catch {
              console.error('Error parsing success response');
              setIsUploading(false);
              setError('Upload completed but encountered an error processing the response');
            }
          } else if (xhr.status !== 0) { // status 0 means aborted
            console.error('Upload error, status:', xhr.status);
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              console.error('Error details:', errorResponse);
            } catch {
              console.error('Response text:', xhr.responseText);
            }
            setIsUploading(false);
            setError('Upload failed');
          }
        }
      };
      
      // Send the request
      xhr.open('POST', '/api/admin/media/upload', true);
      
      // Include credentials (cookies)
      xhr.withCredentials = true;
      
      // Send the form data
      xhr.send(formData);
      
    } catch (err) {
      setError('Upload failed');
      setIsUploading(false);
      console.error('Upload exception:', err);
    }
  };
  
  // Handle media selection
  const handleMediaSelect = (item: MediaItem) => {
    if (allowMultiple) {
      // Toggle selection in multiple selection mode
      const isSelected = selectedItems.some(selected => selected.id === item.id);
      if (isSelected) {
        setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    } else {
      // Single selection mode
      setSelectedMedia(item);
      if (onSelect) {
        (onSelect as (media: MediaItem) => void)(item);
      }
      if (isModal && onClose) {
        onClose();
      }
    }
  };
  
  // Handle media delete
  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirmation'))) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Remove from UI
      setMedia(media.filter(item => item.id !== id));
      
      // If the deleted item was selected, clear selection
      if (selectedMedia?.id === id) {
        setSelectedMedia(null);
      }
      
      setSelectedItems(selectedItems.filter(item => item.id !== id));
      
    } catch (err) {
      console.error('Error deleting media:', err);
      setError('Failed to delete media');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedia) return;
    
    try {
      fetch(`/api/admin/media/${selectedMedia.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle,
          alt: editedAlt,
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return response.json();
      })
      .then(updatedMediaData => {
        // Update the media item
        setMedia(media.map(item => 
          item.id === selectedMedia.id 
            ? { ...item, ...updatedMediaData }
            : item
        ));
        
        // Exit edit mode
        setEditMode(false);
      })
      .catch(error => {
        console.error('Error updating media:', error);
        setError('Failed to update media');
      });
    } catch (err) {
      console.error('Error updating media:', err);
      setError('Failed to update media');
    }
  };
  
  // Start editing a media item
  const startEdit = (item: MediaItem) => {
    setSelectedMedia(item);
    setEditedTitle(item.title || '');
    setEditedAlt(item.alt || '');
    setEditMode(true);
  };
  
  // Handle page change for pagination
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };
  
  // Handle multi-select confirmation
  const handleConfirmSelection = () => {
    if (onSelect && selectedItems.length > 0) {
      if (allowMultiple) {
        // We know onSelect expects MediaItem[] when allowMultiple is true
        (onSelect as (media: MediaItem[]) => void)(selectedItems);
      } else {
        // This shouldn't actually happen in the UI flow,
        // but just to be safe, we'll handle single selection too
        (onSelect as (media: MediaItem) => void)(selectedItems[0]);
      }
      
      if (isModal && onClose) {
        onClose();
      }
    }
  };

  // Handle filter by media type
  const handleFilterChange = (type: MediaTypeFilter) => {
    setMediaTypeFilter(type);
    // Reset pagination to page 1 when changing filters
    setPagination({ ...pagination, page: 1 });
    // Immediately trigger a search with the new filter
    fetchMedia(1, searchQuery, type === 'all' ? '' : type, selectedCategory, selectedTag);
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  // Helper to determine if item is an image
  const isImage = (mimetype: string) => mimetype.startsWith('image/');
  
  // Helper to determine media type based on mimetype
  const getMediaType = (mimetype: string): MediaTypeFilter => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'document';
  };
  
  // Get the icon for a media type
  const getMediaTypeIcon = (type: MediaTypeFilter) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  // Handle adding a tag to a media item
  const handleAddTag = async (mediaId: string, tag: string) => {
    if (!tag.trim()) return;
    
    try {
      const response = await fetch(`/api/admin/media/${mediaId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add tag');
      }
      
      // Update the media list
      setMedia(prev => 
        prev.map(item => 
          item._id === mediaId
            ? { ...item, tags: [...(item.tags || []), tag] }
            : item
        )
      );
      
      // Update tags list with new tag if it doesn't exist
      setTags(prev => {
        const tagExists = prev.some(t => t.name === tag);
        if (!tagExists) {
          return [...prev, { name: tag, count: 1 }];
        }
        // Increment count for existing tag
        return prev.map(t => t.name === tag ? { ...t, count: t.count + 1 } : t);
      });
      
      setNewTag('');
      setShowTagsInput(false);
    } catch (err) {
      console.error('Error adding tag:', err);
      setError('Failed to add tag');
    }
  };
  
  // Handle removing a tag from a media item
  const handleRemoveTag = async (mediaId: string, tag: string) => {
    try {
      const response = await fetch(`/api/admin/media/${mediaId}/tags/${encodeURIComponent(tag)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove tag');
      }
      
      // Update the media list
      setMedia(prev => 
        prev.map(item => 
          item._id === mediaId
            ? { ...item, tags: (item.tags || []).filter((t: string) => t !== tag) }
            : item
        )
      );
      
      // Update tags list by decrementing count or removing if count is 1
      setTags(prev => {
        const updatedTags = prev.map(t => 
          t.name === tag ? { ...t, count: t.count - 1 } : t
        ).filter(t => t.count > 0);
        return updatedTags;
      });
    } catch (err) {
      console.error('Error removing tag:', err);
      setError('Failed to remove tag');
    }
  };
  
  // Handle adding a category to a media item
  const handleAddCategory = async (mediaId: string, category: string) => {
    if (!category.trim()) return;
    
    try {
      const response = await fetch(`/api/admin/media/${mediaId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add category');
      }
      
      // Update the media list
      setMedia(prev => 
        prev.map(item => 
          item._id === mediaId
            ? { ...item, categories: [...(item.categories || []), category] }
            : item
        )
      );
      
      // Update categories list with new category if it doesn't exist
      setCategories(prev => {
        const categoryExists = prev.some(c => c.name === category);
        if (!categoryExists) {
          return [...prev, { name: category, count: 1 }];
        }
        // Increment count for existing category
        return prev.map(c => c.name === category ? { ...c, count: c.count + 1 } : c);
      });
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
    }
  };
  
  // Handle removing a category from a media item
  const handleRemoveCategory = async (mediaId: string, category: string) => {
    try {
      const response = await fetch(`/api/admin/media/${mediaId}/categories/${encodeURIComponent(category)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove category');
      }
      
      // Update the media list
      setMedia(prev => 
        prev.map(item => 
          item._id === mediaId
            ? { ...item, categories: (item.categories || []).filter((c: string) => c !== category) }
            : item
        )
      );
      
      // Update categories list by decrementing count or removing if count is 1
      setCategories(prev => {
        const updatedCategories = prev.map(c => 
          c.name === category ? { ...c, count: c.count - 1 } : c
        ).filter(c => c.count > 0);
        return updatedCategories;
      });
    } catch (err) {
      console.error('Error removing category:', err);
      setError('Failed to remove category');
    }
  };
  
  // Toggle select media item for bulk operations
  const toggleSelectItem = (item: MediaItem) => {
    if (selectedItems.some(selected => selected._id === item._id)) {
      setSelectedItems(prev => prev.filter(selected => selected._id !== item._id));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    const confirmDelete = window.confirm(
      t('bulkDeleteConfirm', { count: selectedItems.length })
    );
    
    if (!confirmDelete) return;
    
    setIsApplyingBulkAction(true);
    
    try {
      const itemIds = selectedItems.map(item => item._id);
      
      const response = await fetch('/api/admin/media/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: itemIds }),
      });
      
      if (!response.ok) {
        throw new Error('Bulk delete failed');
      }
      
      // Remove deleted items from the list
      setMedia(prev => prev.filter(item => !itemIds.includes(item._id)));
      setSelectedItems([]);
      setBulkMode(false);
    } catch (err) {
      console.error('Error during bulk delete:', err);
      setError('Failed to delete selected items');
    } finally {
      setIsApplyingBulkAction(false);
    }
  };
  
  // Handle bulk add tag
  const handleBulkAddTag = async (tag: string) => {
    if (selectedItems.length === 0 || !tag.trim()) return;
    
    setIsApplyingBulkAction(true);
    
    try {
      const itemIds = selectedItems.map(item => item._id);
      
      const response = await fetch('/api/admin/media/bulk/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: itemIds, tag }),
      });
      
      if (!response.ok) {
        throw new Error('Bulk tag addition failed');
      }
      
      // Update tags for all selected items
      setMedia(prev => 
        prev.map(item => 
          itemIds.includes(item._id)
            ? { 
                ...item, 
                tags: [...new Set([...(item.tags || []), tag])] 
              }
            : item
        )
      );
      
      // Update tag counts in the tag list
      setTags(prev => {
        // Check if tag already exists in the list
        const existingTag = prev.find(t => t.name === tag);
        if (existingTag) {
          // Count how many items didn't already have this tag
          const newTagCount = selectedItems.filter(item => 
            !item.tags || !item.tags.includes(tag)
          ).length;
          
          // Update the count for the existing tag
          return prev.map(t => 
            t.name === tag 
              ? { ...t, count: t.count + newTagCount }
              : t
          );
        } else {
          // If tag doesn't exist in the list, add it with the count of selected items
          return [...prev, { name: tag, count: selectedItems.length }];
        }
      });
      
      setNewTag('');
    } catch (err) {
      console.error('Error during bulk tag addition:', err);
      setError('Failed to add tag to selected items');
    } finally {
      setIsApplyingBulkAction(false);
    }
  };
  
  // Handle bulk add category
  const handleBulkAddCategory = async (category: string) => {
    if (selectedItems.length === 0 || !category.trim()) return;
    
    setIsApplyingBulkAction(true);
    
    try {
      const itemIds = selectedItems.map(item => item._id);
      
      const response = await fetch('/api/admin/media/bulk/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: itemIds, category }),
      });
      
      if (!response.ok) {
        throw new Error('Bulk category addition failed');
      }
      
      // Update categories for all selected items
      setMedia(prev => 
        prev.map(item => 
          itemIds.includes(item._id)
            ? { 
                ...item, 
                categories: [...new Set([...(item.categories || []), category])]
              }
            : item
        )
      );
      
      // Update category counts in the category list
      setCategories(prev => {
        // Check if category already exists in the list
        const existingCategory = prev.find(c => c.name === category);
        if (existingCategory) {
          // Count how many items didn't already have this category
          const newCategoryCount = selectedItems.filter(item => 
            !item.categories || !item.categories.includes(category)
          ).length;
          
          // Update the count for the existing category
          return prev.map(c => 
            c.name === category 
              ? { ...c, count: c.count + newCategoryCount }
              : c
          );
        } else {
          // If category doesn't exist in the list, add it with the count of selected items
          return [...prev, { name: category, count: selectedItems.length }];
        }
      });
    } catch (err) {
      console.error('Error during bulk category addition:', err);
      setError('Failed to add category to selected items');
    } finally {
      setIsApplyingBulkAction(false);
    }
  };

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <div className={`${isModal ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50' : ''}`}>
      {/* Authentication check */}
      {!isAuthenticated ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">{commonT('loginRequired')}</h2>
          <p className="mb-6">{t('authMessage')}</p>
          <button
            onClick={handleLoginRedirect}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            {commonT('login')}
          </button>
        </div>
      ) : (
        <div className={`bg-white dark:bg-gray-800 ${isModal ? 'w-[90%] h-[90%] max-w-6xl rounded-lg shadow-lg' : 'w-full'} overflow-hidden flex flex-col`}>
          {isModal && (
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('mediaLibrary')}</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          )}
          
          {/* Toolbar */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 flex flex-wrap gap-3 items-center justify-between border-b border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchMedia(1, searchQuery, mediaTypeFilter === 'all' ? '' : mediaTypeFilter, selectedCategory, selectedTag);
                  }
                }}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  fetchMedia(1, searchQuery, mediaTypeFilter === 'all' ? '' : mediaTypeFilter, selectedCategory, selectedTag);
                }}
                className="absolute right-3 top-2 bg-blue-500 text-white p-1 rounded-md"
              >
                {t('search')}
              </button>
            </div>
            
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <label htmlFor="mediaFilter" className="text-sm text-gray-700 dark:text-gray-300">
                {t('filterBy')}:
              </label>
              <select
                id="mediaFilter"
                value={mediaTypeFilter}
                onChange={(e) => handleFilterChange(e.target.value as MediaTypeFilter)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">{t('allFiles')}</option>
                <option value="image">{t('images')}</option>
                <option value="video">{t('videos')}</option>
                <option value="audio">{t('audio')}</option>
                <option value="document">{t('documents')}</option>
              </select>
            </div>
            
            {/* Category filter */}
            <div className="flex items-center space-x-2">
              <label htmlFor="categoryFilter" className="text-sm text-gray-700 dark:text-gray-300">
                {t('category')}:
              </label>
              <select
                id="categoryFilter"
                value={selectedCategory || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategory(value === '' ? null : value);
                  setPagination({ ...pagination, page: 1 });
                  // Trigger immediate search with the new category filter
                  fetchMedia(
                    1, 
                    searchQuery, 
                    mediaTypeFilter === 'all' ? '' : mediaTypeFilter, 
                    value === '' ? null : value, 
                    selectedTag
                  );
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tag filter */}
            <div className="flex items-center space-x-2">
              <label htmlFor="tagFilter" className="text-sm text-gray-700 dark:text-gray-300">
                {t('tag')}:
              </label>
              <select
                id="tagFilter"
                value={selectedTag || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedTag(value === '' ? null : value);
                  setPagination({ ...pagination, page: 1 });
                  // Trigger immediate search with the new tag filter
                  fetchMedia(
                    1, 
                    searchQuery, 
                    mediaTypeFilter === 'all' ? '' : mediaTypeFilter, 
                    selectedCategory, 
                    value === '' ? null : value
                  );
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">{t('allTags')}</option>
                {tags.map(tag => (
                  <option key={tag.name} value={tag.name}>
                    {tag.name} ({tag.count})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Add Tag Input */}
            {showTagsInput && selectedMedia && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder={t('enterTag')}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        e.preventDefault();
                        handleAddTag(selectedMedia.id, newTag);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddTag(selectedMedia.id, newTag)}
                    disabled={!newTag.trim()}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50"
                  >
                    {t('addTag')}
                  </button>
                  <button
                    onClick={() => setShowTagsInput(false)}
                    className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            )}
            
            {/* Toggle Bulk Mode */}
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`px-3 py-1 rounded-md text-sm ${
                bulkMode 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {bulkMode ? t('exitBulkMode') : t('bulkSelect')}
            </button>
            
            {/* Upload button */}
            <div className="relative">
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <label
                htmlFor="fileUpload"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  isUploading
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white'
                }`}
              >
                {isUploading ? (
                  <>
                    <span>Uploading...</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 animate-pulse"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>{t('uploadNew')}</span>
                  </>
                )}
              </label>
            </div>
            
            {/* Bulk actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedItems.length} {t('itemsSelected')}
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-1 text-sm"
                  disabled={isApplyingBulkAction}
                >
                  <TrashIcon className="w-4 h-4" />
                  {t('delete')}
                </button>
                {/* Add Tag Button */}
                <button
                  onClick={() => {
                    const tag = prompt(t('enterTag'));
                    if (tag) handleBulkAddTag(tag);
                  }}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center gap-1 text-sm"
                  disabled={isApplyingBulkAction}
                >
                  + {t('tag')}
                </button>
                {/* Add Category Button */}
                <button
                  onClick={() => {
                    const category = prompt(t('enterCategory'));
                    if (category) handleBulkAddCategory(category);
                  }}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-1 text-sm"
                  disabled={isApplyingBulkAction}
                >
                  + {t('category')}
                </button>
                <button
                  onClick={() => {
                    setBulkMode(false);
                    setSelectedItems([]);
                  }}
                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md text-sm"
                >
                  {t('cancel')}
                </button>
              </div>
            )}
            
            {/* Multiple selection confirm button */}
            {allowMultiple && selectedItems.length > 0 && (
              <button
                onClick={handleConfirmSelection}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <span>{t('selectCount', { count: selectedItems.length })}</span>
              </button>
            )}
          </div>
          
          {/* Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading && media.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 p-4">{error}</div>
              ) : media.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <p>{t('noMediaFound')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {media.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => bulkMode ? toggleSelectItem(item) : handleMediaSelect(item)}
                      className={`relative rounded-lg border overflow-hidden cursor-pointer group transition-all hover:shadow-lg ${
                        (selectedMedia?.id === item.id || selectedItems.some(selected => selected.id === item.id))
                          ? 'ring-2 ring-blue-500 border-blue-500'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Add bulk checkbox */}
                      {bulkMode && (
                        <div className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-full p-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.some(selected => selected.id === item.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectItem(item);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      )}
                      
                      {/* Media preview */}
                      <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {/* Thumbnail */}
                        <div className="relative h-32 bg-gray-100 dark:bg-gray-900">
                          {isImage(item.mimetype) ? (
                            <Image
                              src={item.url}
                              alt={item.alt || item.filename}
                              fill
                              sizes="(max-width: 768px) 100vw, 300px"
                              className="object-contain"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="flex flex-col items-center">
                                <span className="text-3xl mb-1">{getMediaTypeIcon(getMediaType(item.mimetype))}</span>
                                <span className="text-xs font-mono">.{item.filename.split('.').pop()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* File info */}
                      <div className="p-2">
                        <p className="text-xs truncate font-medium text-gray-800 dark:text-gray-200">
                          {item.title || item.originalFilename}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <span className="mr-1">{getMediaTypeIcon(getMediaType(item.mimetype))}</span>
                          {formatFileSize(item.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('previous')}
                  </button>
                  
                  {/* Show page numbers */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.page - 1 && page <= pagination.page + 1)
                    ))
                    .map((page, i, array) => (
                      <Fragment key={page}>
                        {i > 0 && array[i - 1] !== page - 1 && (
                          <span className="px-3 py-1">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-md ${
                            pagination.page === page
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      </Fragment>
                    ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === pagination.totalPages
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('next')}
                  </button>
                </div>
              )}
            </div>
            
            {/* Details Panel (when media is selected) */}
            {selectedMedia && !isModal && !editMode && (
              <div className="w-[300px] border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('mediaDetails')}</h3>
                
                {/* Preview */}
                <div className="mb-4 flex justify-center rounded-lg bg-white dark:bg-gray-800 p-2">
                  {isImage(selectedMedia.mimetype) ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={selectedMedia.url}
                        alt={selectedMedia.alt || selectedMedia.filename}
                        fill
                        sizes="300px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full flex items-center justify-center">
                      <div className="text-2xl font-bold bg-gray-200 dark:bg-gray-700 p-4 rounded">
                        {selectedMedia.filename.split('.').pop()?.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('filename')}</h4>
                    <p className="break-all text-gray-900 dark:text-white">{selectedMedia.filename}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('originalFilename')}</h4>
                    <p className="break-all text-gray-900 dark:text-white">{selectedMedia.originalFilename}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('title')}</h4>
                    <p className="break-all text-gray-900 dark:text-white">{selectedMedia.title || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('altText')}</h4>
                    <p className="break-all text-gray-900 dark:text-white">{selectedMedia.alt || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('mimeType')}</h4>
                    <p className="text-gray-900 dark:text-white">{selectedMedia.mimetype}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('size')}</h4>
                    <p className="text-gray-900 dark:text-white">{formatFileSize(selectedMedia.size)}</p>
                  </div>
                  
                  {selectedMedia.width && selectedMedia.height && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dimensions')}</h4>
                      <p className="text-gray-900 dark:text-white">{selectedMedia.width} × {selectedMedia.height}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('url')}</h4>
                    <p className="break-all text-blue-500 hover:text-blue-600 cursor-pointer" onClick={() => navigator.clipboard.writeText(selectedMedia.url)}>
                      {selectedMedia.url}
                    </p>
                  </div>
                  
                  {/* Tags section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('tags')}</h4>
                      <button
                        onClick={() => setShowTagsInput(!showTagsInput)}
                        className="text-xs text-blue-500 hover:text-blue-600"
                      >
                        {showTagsInput ? t('cancel') : t('addTag')}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {selectedMedia.tags && selectedMedia.tags.length > 0 ? (
                        selectedMedia.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                          >
                            {tag}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(selectedMedia.id, tag);
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('noTags')}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Categories section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('categories')}</h4>
                      <button
                        onClick={() => {
                          const category = prompt(t('enterCategory'));
                          if (category) handleAddCategory(selectedMedia.id, category);
                        }}
                        className="text-xs text-blue-500 hover:text-blue-600"
                      >
                        {t('addCategory')}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {selectedMedia.categories && selectedMedia.categories.length > 0 ? (
                        selectedMedia.categories.map(category => (
                          <span 
                            key={category} 
                            className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-md"
                          >
                            {category}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCategory(selectedMedia.id, category);
                              }}
                              className="ml-1 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('noCategories')}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="pt-2 flex space-x-2">
                    <button
                      onClick={() => startEdit(selectedMedia)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMedia.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Edit Mode */}
            {editMode && selectedMedia && (
              <div className="w-[300px] border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('editMedia')}</h3>
                
                {/* Preview */}
                <div className="mb-4 flex justify-center rounded-lg bg-white dark:bg-gray-800 p-2">
                  {isImage(selectedMedia.mimetype) ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={selectedMedia.url}
                        alt={selectedMedia.alt || selectedMedia.filename}
                        fill
                        sizes="300px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full flex items-center justify-center">
                      <div className="text-2xl font-bold bg-gray-200 dark:bg-gray-700 p-4 rounded">
                        {selectedMedia.filename.split('.').pop()?.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Edit Form */}
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('title')}
                    </label>
                    <input
                      id="editTitle"
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="editAlt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('altText')}
                    </label>
                    <input
                      id="editAlt"
                      type="text"
                      value={editedAlt}
                      onChange={(e) => setEditedAlt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('altTextHelp')}
                    </p>
                  </div>
                  
                  {/* Form actions */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      {t('save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Full-size preview modal */}
      {previewOpen && selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-[90%] max-h-[90%] flex items-center justify-center">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            {isImage(selectedMedia.mimetype) ? (
              <div className="relative w-full h-full max-h-[90vh]">
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.alt || selectedMedia.filename}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
                <p className="text-lg text-center mb-2">{selectedMedia.originalFilename}</p>
                <p className="text-center">
                  <a
                    href={selectedMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    {t('download')}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 