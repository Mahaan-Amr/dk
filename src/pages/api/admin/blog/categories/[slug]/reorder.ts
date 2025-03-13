import { NextApiRequest, NextApiResponse } from 'next';

// Mock database for category storage (replace with your actual database logic)
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
    
    // Get the new order from the request body
    const { newOrder } = req.body;
    
    // Validate new order
    if (typeof newOrder !== 'number') {
      return res.status(400).json({ error: 'Invalid order value' });
    }
    
    // Find the category to update
    const categoryIndex = mockCategories.findIndex(c => c.slug === slug);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Update the category order
    mockCategories[categoryIndex].order = newOrder;
    
    // In a real implementation, you would save to your database here
    
    // For testing, if you want to normalize orders to avoid large gaps:
    // 1. Find all siblings (categories with the same parent)
    const parent = mockCategories[categoryIndex].parent;
    const siblings = mockCategories
      .filter(c => c.parent === parent)
      .sort((a, b) => a.order - b.order);
    
    // 2. Normalize the orders (0, 1, 2, ...)
    siblings.forEach((sibling, index) => {
      const categoryToUpdate = mockCategories.findIndex(c => c._id === sibling._id);
      if (categoryToUpdate !== -1) {
        mockCategories[categoryToUpdate].order = index;
      }
    });
    
    // Return success response
    return res.status(200).json({ 
      success: true,
      message: 'Category order updated successfully',
      category: mockCategories[categoryIndex]
    });
  } catch (error) {
    console.error('Error in reorder API:', error);
    return res.status(500).json({ error: 'Server error' });
  }
} 