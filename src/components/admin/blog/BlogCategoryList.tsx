'use client';

import { useState, useEffect } from 'react';
import { Locale } from '@/i18n';
import { useTranslations } from 'next-intl';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiChevronRight, 
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

interface BlogCategory {
  _id: string;
  slug: string;
  name: {
    [key in Locale]: string;
  };
  description?: {
    [key in Locale]?: string;
  };
  parent?: string | null;
  order: number;
  isActive: boolean;
  visibility: 'public' | 'registered' | 'admin';
  children?: BlogCategory[];
  expanded?: boolean;
}

interface CategoryFormData {
  slug: string;
  name: {
    fa: string;
    de: string;
  };
  description: {
    fa: string;
    de: string;
  };
  parent: string;
  order: number;
  isActive: boolean;
  visibility: 'public' | 'registered' | 'admin';
}

interface BlogCategoryListProps {
  locale: Locale;
}

export function BlogCategoryList({ locale }: BlogCategoryListProps) {
  const t = useTranslations('admin.blog');
  
  // State
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<BlogCategory | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'above' | 'below' | 'inside' | null>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    slug: '',
    name: { fa: '', de: '' },
    description: { fa: '', de: '' },
    parent: '',
    order: 0,
    isActive: true,
    visibility: 'public',
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/blog/categories');
      if (!response.ok) {
        throw new Error('Failed to load categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err: unknown) {
      console.error('Error fetching categories:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (slug: string) => {
    if (!confirm(t('categories.confirmDeleteCategory'))) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/admin/blog/categories/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete category');
      }
      
      // Refresh categories
      fetchCategories();
    } catch (err: unknown) {
      console.error('Error deleting category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category. Please try again.';
      setError(errorMessage);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // Prepare data
      const data = {
        ...formData,
        // Remove empty parent
        parent: formData.parent || undefined,
      };
      
      // Determine if we're creating or updating
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `/api/admin/blog/categories/${editingCategory.slug}`
        : '/api/admin/blog/categories';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || `Failed to ${editingCategory ? 'update' : 'create'} category`);
      }
      
      // Reset form and refresh categories
      resetForm();
      fetchCategories();
    } catch (err: unknown) {
      console.error('Error saving category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save category. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Reset form and close it
  const resetForm = () => {
    setFormData({
      slug: '',
      name: { fa: '', de: '' },
      description: { fa: '', de: '' },
      parent: '',
      order: 0,
      isActive: true,
      visibility: 'public',
    });
    setEditingCategory(null);
    setShowForm(false);
  };
  
  // Handle edit button click
  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      name: { 
        fa: category.name.fa, 
        de: category.name.de 
      },
      description: { 
        fa: category.description?.fa || '', 
        de: category.description?.de || '' 
      },
      parent: category.parent || '',
      order: category.order,
      isActive: category.isActive,
      visibility: category.visibility,
    });
    setShowForm(true);
  };
  
  // Convert flat list to tree
  const buildCategoryTree = (categories: BlogCategory[]): BlogCategory[] => {
    const categoryMap = new Map<string, BlogCategory>();
    const roots: BlogCategory[] = [];
    
    // First pass: create a map of categories by id
    categories.forEach(category => {
      categoryMap.set(category._id, { ...category, children: [], expanded: false });
    });
    
    // Second pass: build the tree
    categories.forEach(category => {
      const id = category._id;
      const mappedCategory = categoryMap.get(id);
      
      if (!mappedCategory) return;
      
      if (category.parent && categoryMap.has(category.parent)) {
        // This is a child category
        const parent = categoryMap.get(category.parent);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(mappedCategory);
        }
      } else {
        // This is a root category
        roots.push(mappedCategory);
      }
    });
    
    // Sort roots by order
    roots.sort((a, b) => a.order - b.order);
    
    // Sort children by order
    const sortChildren = (category: BlogCategory) => {
      if (category.children?.length) {
        category.children.sort((a, b) => a.order - b.order);
        category.children.forEach(sortChildren);
      }
    };
    
    roots.forEach(sortChildren);
    
    return roots;
  };
  
  // Toggle expand/collapse
  const toggleExpand = (category: BlogCategory) => {
    const updateCategories = (cats: BlogCategory[]): BlogCategory[] => {
      return cats.map(cat => {
        if (cat._id === category._id) {
          return { ...cat, expanded: !cat.expanded };
        }
        if (cat.children?.length) {
          return { ...cat, children: updateCategories(cat.children) };
        }
        return cat;
      });
    };
    
    setCategories(prevCategories => updateCategories(prevCategories));
  };
  
  // Move category up or down in order
  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // Find the category and its siblings (categories with the same parent)
      const findCategoryAndSiblings = (
        categories: BlogCategory[],
        categoryId: string
      ): { category: BlogCategory | null; siblings: BlogCategory[] } => {
        for (const cat of categories) {
          if (cat._id === categoryId) {
            // Find siblings at root level
            return { 
              category: cat, 
              siblings: categories.filter(c => 
                c.parent === cat.parent
              ) 
            };
          }
          
          if (cat.children?.length) {
            // Search in children
            const result = findCategoryAndSiblings(cat.children, categoryId);
            if (result.category) {
              return result;
            }
          }
        }
        
        return { category: null, siblings: [] };
      };
      
      const { category, siblings } = findCategoryAndSiblings(categories, categoryId);
      
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Sort siblings by order
      siblings.sort((a, b) => a.order - b.order);
      
      // Find current index
      const currentIndex = siblings.findIndex(s => s._id === categoryId);
      
      if (
        (direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === siblings.length - 1)
      ) {
        // Already at the top/bottom
        return;
      }
      
      // Calculate new order
      let newOrder: number;
      
      if (direction === 'up') {
        // Get order of the previous sibling
        const prevSibling = siblings[currentIndex - 1];
        newOrder = prevSibling.order - 1;
      } else {
        // Get order of the next sibling
        const nextSibling = siblings[currentIndex + 1];
        newOrder = nextSibling.order + 1;
      }
      
      // Update the category order
      const response = await fetch(`/api/admin/blog/categories/${category.slug}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newOrder }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reorder category');
      }
      
      // Refresh categories
      fetchCategories();
    } catch (err: unknown) {
      console.error('Error reordering category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder category. Please try again.';
      setError(errorMessage);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, category: BlogCategory) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', category._id); // Required for Firefox
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, category: BlogCategory) => {
    e.preventDefault();
    
    if (!draggedCategory || draggedCategory._id === category._id) {
      setDragOverCategory(null);
      setDragPosition(null);
      return;
    }
    
    // Determine drop position based on cursor Y position
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Top 25% - drop above
    if (y < rect.height * 0.25) {
      setDragPosition('above');
    } 
    // Bottom 25% - drop below
    else if (y > rect.height * 0.75) {
      setDragPosition('below');
    } 
    // Middle 50% - drop inside (as child)
    else {
      setDragPosition('inside');
    }
    
    setDragOverCategory(category._id);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverCategory(null);
    setDragPosition(null);
  };

  // Handle drop 
  const handleDrop = async (e: React.DragEvent, targetCategory: BlogCategory) => {
    e.preventDefault();
    
    if (!draggedCategory || draggedCategory._id === targetCategory._id) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // Prevent circular reference - make sure target is not a descendant of dragged
      const isDescendant = (parent: BlogCategory, childId: string): boolean => {
        if (parent._id === childId) return true;
        if (!parent.children?.length) return false;
        
        return parent.children.some(child => isDescendant(child, childId));
      };
      
      if (dragPosition === 'inside' && isDescendant(draggedCategory, targetCategory._id)) {
        throw new Error('Cannot move a category inside its own descendant');
      }
      
      let newParent = '';
      let newOrder = 0;
      
      // Set new parent and order based on drop position
      if (dragPosition === 'inside') {
        // Move as child of target
        newParent = targetCategory._id;
        
        // Order after the last child
        newOrder = targetCategory.children?.length 
          ? Math.max(...targetCategory.children.map(c => c.order)) + 1 
          : 0;
      } else {
        // Move as sibling of target
        newParent = targetCategory.parent || '';
        
        // Calculate new order based on position
        if (dragPosition === 'above') {
          // Place right before target
          newOrder = targetCategory.order - 0.5;
        } else {
          // Place right after target
          newOrder = targetCategory.order + 0.5;
        }
      }
      
      // Update the category position
      const response = await fetch(`/api/admin/blog/categories/${draggedCategory.slug}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          newParent, 
          newOrder 
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to move category');
      }
      
      // Refresh categories
      fetchCategories();
    } catch (err: unknown) {
      console.error('Error moving category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to move category. Please try again.';
      setError(errorMessage);
    } finally {
      // Reset drag state
      setDraggedCategory(null);
      setDragOverCategory(null);
      setDragPosition(null);
    }
  };
  
  // Get the breadcrumb path for a category
  const getCategoryPath = (categoryId: string, allCategories: BlogCategory[]): BlogCategory[] => {
    const path: BlogCategory[] = [];
    
    const findPath = (categoryId: string, categories: BlogCategory[]): boolean => {
      for (const cat of categories) {
        if (cat._id === categoryId) {
          path.unshift(cat);
          return true;
        }
        
        if (cat.children?.length && findPath(categoryId, cat.children)) {
          path.unshift(cat);
          return true;
        }
      }
      
      return false;
    };
    
    findPath(categoryId, allCategories);
    return path;
  };

  // Render a category and its children
  const renderCategory = (category: BlogCategory, level = 0) => {
    const isDragging = draggedCategory?._id === category._id;
    const isDragOver = dragOverCategory === category._id;
    
    // Determine class based on drag state
    let dragClass = '';
    if (isDragOver) {
      if (dragPosition === 'above') {
        dragClass = 'border-t-2 border-blue-500';
      } else if (dragPosition === 'below') {
        dragClass = 'border-b-2 border-blue-500';
      } else if (dragPosition === 'inside') {
        dragClass = 'bg-blue-50 dark:bg-blue-900/20';
      }
    }
    
    return (
      <div 
        key={category._id} 
        className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
          isDragging ? 'opacity-50' : ''
        } ${dragClass}`}
        draggable 
        onDragStart={(e) => handleDragStart(e, category)}
        onDragOver={(e) => handleDragOver(e, category)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, category)}
      >
        <div className="flex items-center py-2 px-2">
          <div
            className="flex-1 flex items-center cursor-pointer"
            onClick={() => toggleExpand(category)}
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {category.children && category.children.length > 0 ? (
              category.expanded ? (
                <FiChevronDown className="mr-2 text-gray-500 dark:text-gray-400" />
              ) : (
                <FiChevronRight className="mr-2 text-gray-500 dark:text-gray-400" />
              )
            ) : (
              <span className="w-5"></span>
            )}
            <div className="flex flex-col">
              <span className={`${category.isActive ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
                {category.name[locale]} 
                {!category.isActive && ` (${t('categories.inactive')})`}
                {category.visibility !== 'public' && ` [${t(`categories.visibility.${category.visibility}`)}]`}
              </span>
              
              {/* Show breadcrumb path */}
              {level > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getCategoryPath(category._id, categories)
                    .slice(0, -1) // Remove current category
                    .map(c => c.name[locale])
                    .join(' > ')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Reorder buttons */}
            <button
              onClick={() => moveCategory(category._id, 'up')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title={t('categories.moveUp')}
            >
              <FiArrowUp />
            </button>
            <button
              onClick={() => moveCategory(category._id, 'down')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title={t('categories.moveDown')}
            >
              <FiArrowDown />
            </button>
            
            {/* Visibility indicator */}
            <span 
              className="text-gray-500 dark:text-gray-400"
              title={t(`categories.visibility.${category.visibility}`)}
            >
              {category.visibility === 'public' ? (
                <FiEye />
              ) : (
                <FiEyeOff />
              )}
            </span>
            
            {/* Edit button */}
            <button
              onClick={() => handleEdit(category)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              title={t('categories.edit')}
            >
              <FiEdit />
            </button>
            
            {/* Delete button */}
            <button
              onClick={() => handleDeleteCategory(category.slug)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title={t('categories.delete')}
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
        
        {category.children && category.children.length > 0 && category.expanded && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // If loading, show loading indicator
  if (loading && categories.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-center text-gray-500 dark:text-gray-400">
            {t('categories.loading')}
          </div>
        </div>
      </div>
    );
  }
  
  // Get the tree structure
  const categoryTree = buildCategoryTree(categories);
  
  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('categories.title')}
        </h1>
        
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiPlus /> {t('categories.create')}
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Category form */}
        {showForm && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingCategory ? t('categories.edit') : t('categories.create')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.slug')}
                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  disabled={!!editingCategory}
                  required
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    editingCategory ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                  }`}
                />
                {editingCategory && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('categories.slugReadOnly')}
                  </p>
                )}
              </div>
              
              {/* Name (Persian) */}
              <div>
                <label htmlFor="name-fa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.nameFa')}
                </label>
                <input
                  id="name-fa"
                  type="text"
                  value={formData.name.fa}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    name: { ...formData.name, fa: e.target.value } 
                  })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  dir="rtl"
                />
              </div>
              
              {/* Name (German) */}
              <div>
                <label htmlFor="name-de" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.nameDe')}
                </label>
                <input
                  id="name-de"
                  type="text"
                  value={formData.name.de}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    name: { ...formData.name, de: e.target.value } 
                  })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Description (Persian) */}
              <div>
                <label htmlFor="description-fa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.descriptionFa')}
                </label>
                <textarea
                  id="description-fa"
                  value={formData.description.fa}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    description: { ...formData.description, fa: e.target.value } 
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  dir="rtl"
                ></textarea>
              </div>
              
              {/* Description (German) */}
              <div>
                <label htmlFor="description-de" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.descriptionDe')}
                </label>
                <textarea
                  id="description-de"
                  value={formData.description.de}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    description: { ...formData.description, de: e.target.value } 
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              
              {/* Parent category */}
              <div>
                <label htmlFor="parent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.parent')}
                </label>
                <select
                  id="parent"
                  value={formData.parent}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('categories.noParent')}</option>
                  {categories.map((cat) => (
                    <option 
                      key={cat._id} 
                      value={cat._id}
                      disabled={editingCategory ? cat._id === editingCategory._id : false}
                    >
                      {cat.name[locale]}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Visibility */}
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.visibility.label')}
                </label>
                <select
                  id="visibility"
                  value={formData.visibility}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    visibility: e.target.value as 'public' | 'registered' | 'admin' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="public">{t('categories.visibility.public')}</option>
                  <option value="registered">{t('categories.visibility.registered')}</option>
                  <option value="admin">{t('categories.visibility.admin')}</option>
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('categories.visibility.description')}
                </p>
              </div>
              
              {/* Order */}
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.order')}
                </label>
                <input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Active status */}
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {formData.isActive ? t('categories.active') : t('categories.inactive')}
                </label>
              </div>
              
              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('categories.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {submitting ? '...' : editingCategory ? t('categories.update') : t('categories.create')}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Categories list */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {categoryTree.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {t('categories.noCategories')}
            </div>
          ) : (
            categoryTree.map((category) => renderCategory(category))
          )}
        </div>
      </div>
    </div>
  );
} 