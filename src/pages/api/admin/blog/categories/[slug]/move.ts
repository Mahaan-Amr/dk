import { NextApiRequest, NextApiResponse } from 'next';

// Using the same mock categories for testing
// In a real implementation, this would be a database connection
const mockCategories = [
  { 
    _id: 'cat1', 
    slug: 'technology', 
    name: { fa: 'فناوری', de: 'Technologie' }, 
    parent: null, 
    order: 0, 
    isActive: true,
    visibility: 'public' as const,
  },
  { 
    _id: 'cat2', 
    slug: 'science', 
    name: { fa: 'علم', de: 'Wissenschaft' }, 
    parent: null, 
    order: 1, 
    isActive: true,
    visibility: 'public' as const,
  },
  { 
    _id: 'cat3', 
    slug: 'programming', 
    name: { fa: 'برنامه‌نویسی', de: 'Programmierung' }, 
    parent: 'cat1', 
    order: 0, 
    isActive: true,
    visibility: 'public' as const,
  },
];

// Helper function to check if a move would create a circular reference
const wouldCreateCircularReference = (
  categories: typeof mockCategories,
  categoryId: string,
  newParentId: string
): boolean => {
  if (!newParentId || categoryId === newParentId) {
    return false;
  }
  
  // Check if the new parent is a descendant of the category
  const isDescendant = (
    parentId: string,
    potentialChildId: string
  ): boolean => {
    if (parentId === potentialChildId) {
      return true;
    }
    
    // Get all direct children of the parent
    const children = categories.filter(c => c.parent === parentId);
    
    // Recursively check if any child is the potential child or contains it
    return children.some(child => isDescendant(child._id, potentialChildId));
  };
  
  return isDescendant(categoryId, newParentId);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PATCH method
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the slug from the URL
    const { slug } = req.query;
    
    // Check if slug exists
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid category slug' });
    }
    
    // Get the new parent and order from the request body
    const { newParent, newOrder } = req.body;
    
    // Validate new order
    if (typeof newOrder !== 'number') {
      return res.status(400).json({ error: 'Invalid order value' });
    }
    
    // Find the category to update
    const categoryIndex = mockCategories.findIndex(c => c.slug === slug);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const categoryToMove = mockCategories[categoryIndex];
    
    // Check if new parent exists (if specified)
    if (newParent && newParent !== '') {
      const parentExists = mockCategories.some(c => c._id === newParent);
      
      if (!parentExists) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
      
      // Check for circular reference
      if (wouldCreateCircularReference(mockCategories, categoryToMove._id, newParent)) {
        return res.status(400).json({ 
          error: 'Cannot move a category inside its own descendant'
        });
      }
    }
    
    // Update the category's parent and order
    mockCategories[categoryIndex] = {
      ...categoryToMove,
      parent: newParent || null,
      order: newOrder
    };
    
    // In a real implementation, you would save to your database here
    
    // Return success response
    return res.status(200).json({ 
      success: true,
      message: 'Category moved successfully',
      category: mockCategories[categoryIndex]
    });
  } catch (error) {
    console.error('Error in move API:', error);
    return res.status(500).json({ error: 'Server error' });
  }
} 