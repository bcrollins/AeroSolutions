import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../../storage';

const router = Router();

// Get all AI products
router.get('/', async (req, res) => {
  try {
    const products = await storage.getAllAiProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching AI products:', error);
    res.status(500).json({ error: 'Failed to fetch AI products' });
  }
});

// Get active AI products
router.get('/active', async (req, res) => {
  try {
    const products = await storage.getActiveAiProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching active AI products:', error);
    res.status(500).json({ error: 'Failed to fetch active AI products' });
  }
});

// Get AI products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await storage.getAiProductsByCategory(category);
    res.json(products);
  } catch (error) {
    console.error(`Error fetching AI products for category ${req.params.category}:`, error);
    res.status(500).json({ error: 'Failed to fetch AI products by category' });
  }
});

// Get AI products by required subscription plan
router.get('/plan/:plan', async (req, res) => {
  try {
    const { plan } = req.params;
    const products = await storage.getAiProductsByRequiredPlan(plan);
    res.json(products);
  } catch (error) {
    console.error(`Error fetching AI products for plan ${req.params.plan}:`, error);
    res.status(500).json({ error: 'Failed to fetch AI products by plan' });
  }
});

// Get a specific AI product by ID
router.get('/id/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const product = await storage.getAiProduct(id);
    if (!product) {
      return res.status(404).json({ error: 'AI product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(`Error fetching AI product with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch AI product' });
  }
});

// Get a specific AI product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await storage.getAiProductBySlug(slug);
    
    if (!product) {
      return res.status(404).json({ error: 'AI product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(`Error fetching AI product with slug ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to fetch AI product' });
  }
});

// Create a new AI product
router.post('/', async (req, res) => {
  try {
    // Validate request body using Zod
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().min(1, "Description is required"),
      shortDescription: z.string().optional(),
      slug: z.string().min(1, "Slug is required"),
      imageUrl: z.string().optional(),
      features: z.array(z.string()).optional(),
      category: z.string().optional(),
      requiredPlan: z.string().optional(),
      isActive: z.boolean().optional(),
      usageLimit: z.number().optional(),
      apiCredits: z.number().optional(),
      pricing: z.string().optional()
    });

    const validatedData = schema.parse(req.body);
    const product = await storage.createAiProduct(validatedData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating AI product:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create AI product' });
  }
});

// Update an existing AI product
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // Validate request body using Zod
    const schema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      slug: z.string().optional(),
      imageUrl: z.string().optional(),
      features: z.array(z.string()).optional(),
      category: z.string().optional(),
      requiredPlan: z.string().optional(),
      isActive: z.boolean().optional(),
      usageLimit: z.number().optional(),
      apiCredits: z.number().optional(),
      pricing: z.string().optional()
    });

    const validatedData = schema.parse(req.body);
    
    // Check if product exists
    const existingProduct = await storage.getAiProduct(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'AI product not found' });
    }
    
    const updatedProduct = await storage.updateAiProduct(id, validatedData);
    res.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating AI product with ID ${req.params.id}:`, error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update AI product' });
  }
});

// Delete an AI product
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // Check if product exists
    const existingProduct = await storage.getAiProduct(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'AI product not found' });
    }
    
    await storage.deleteAiProduct(id);
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting AI product with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete AI product' });
  }
});

// Log AI product usage
router.post('/usage', async (req, res) => {
  try {
    // Validate request body using Zod
    const schema = z.object({
      userId: z.number(),
      productId: z.number(),
      sessionDuration: z.number().optional(),
      actionPerformed: z.string().optional(),
      apiCreditsUsed: z.number().optional()
    });

    const validatedData = schema.parse(req.body);
    const usage = await storage.logAiProductUsage(validatedData);
    res.status(201).json(usage);
  } catch (error) {
    console.error('Error logging AI product usage:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to log AI product usage' });
  }
});

// Get AI product usage for a user
router.get('/usage/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    const usageHistory = await storage.getUserProductUsageHistory(userId);
    res.json(usageHistory);
  } catch (error) {
    console.error(`Error fetching AI product usage for user ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Failed to fetch AI product usage history' });
  }
});

export default router;