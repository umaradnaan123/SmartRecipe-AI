import { MetadataRoute } from 'next';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RecipeSelectResult {
  slug: string;
  createdAt: Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3000';

  // Fetch all recipes
  let recipes: RecipeSelectResult[] = [];
  try {
    const dbRecipes = await prisma.recipe.findMany({
      select: { slug: true, createdAt: true }
    });
    recipes = dbRecipes as RecipeSelectResult[];
  } catch (e) {
    console.error('Sitemap DB read failed, using empty array fallback', e);
  }

  const recipeUrls = recipes.map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.slug}`,
    lastModified: recipe.createdAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const mainUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  return [...mainUrls, ...recipeUrls];
}
