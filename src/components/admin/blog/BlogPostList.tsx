'use client';

import { useState, useEffect } from 'react';
import { Locale } from '@/i18n';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiEye, FiSearch, FiPlus } from 'react-icons/fi';

interface BlogPost {
  _id: string;
  slug: string;
  content: {
    [key in Locale]: {
      title: string;
      summary: string;
    };
  };
  status: 'draft' | 'published' | 'archived';
  publishDate?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  categories: {
    _id: string;
    name: {
      [key in Locale]: string;
    };
    slug: string;
  }[];
  author: {
    _id: string;
    name: string;
    username: string;
  };
}

interface BlogPostListProps {
  locale: Locale;
}

export function BlogPostList({ locale }: BlogPostListProps) {
  const t = useTranslations('admin.blog');
  
  // State for posts and pagination
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  
  // Define a proper type for categories
  interface Category {
    _id: string;
    name: {
      [key in Locale]: string;
    };
    slug: string;
  }
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State for sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/blog/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch posts when filters, pagination, or sorting changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query string
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          sort: sortField,
          order: sortOrder,
        });
        
        if (searchTerm) params.append('search', searchTerm);
        if (status) params.append('status', status);
        if (category) params.append('category', category);
        
        // Fetch posts
        const response = await fetch(`/api/admin/blog/posts?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const responseData = await response.json();
        setPosts(responseData.posts);
        setTotalPages(responseData.pagination.totalPages);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load blog posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [page, searchTerm, status, category, sortField, sortOrder]);
  
  // Handle post deletion
  const handleDelete = async (slug: string) => {
    if (!confirm(t('confirmDelete'))) return;
    
    try {
      // Get the token from cookies or localStorage
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/admin/blog/posts/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      // Remove the deleted post from the list
      setPosts(posts.filter(post => post.slug !== slug));
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    }
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for new sort field
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };
  
  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('posts.title')}</h1>
        <Link 
          href={`/${locale}/admin/blog/posts/new`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiPlus /> {t('posts.create')}
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('posts.search')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <button type="submit" className="sr-only">{t('posts.search')}</button>
            </div>
          </form>
          
          {/* Status filter */}
          <div className="w-full md:w-48">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('posts.allStatuses')}</option>
              <option value="draft">{t('posts.draft')}</option>
              <option value="published">{t('posts.published')}</option>
              <option value="archived">{t('posts.archived')}</option>
            </select>
          </div>
          
          {/* Category filter */}
          <div className="w-full md:w-48">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('posts.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name[locale]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {/* Posts table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('content.fa.title')}
                >
                  {t('posts.title')}{renderSortIndicator('content.fa.title')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  {t('posts.status')}{renderSortIndicator('status')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('publishDate')}
                >
                  {t('posts.date')}{renderSortIndicator('publishDate')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('viewCount')}
                >
                  {t('posts.views')}{renderSortIndicator('viewCount')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('posts.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('posts.loading')}
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('posts.noPosts')}
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {post.content[locale]?.title || post.content.fa?.title || post.content.de?.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {t(`posts.${post.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.publishDate ? new Date(post.publishDate).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'de-DE') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.viewCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/${locale}/blog/${post.slug}`}
                          target="_blank"
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title={t('posts.view')}
                        >
                          <FiEye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/${locale}/admin/blog/posts/${post.slug}/edit`}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('posts.edit')}
                        >
                          <FiEdit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.slug)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title={t('posts.delete')}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          {posts.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('posts.pageInfo', { current: page, total: totalPages })}
            </p>
          )}
        </div>
        <div>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('posts.previous')}
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('posts.next')}
          </button>
        </div>
      </div>
    </div>
  );
}