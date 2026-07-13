import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { AIService } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ detail: 'Could not validate credentials' }, { status: 401 });
    }

    const data = await req.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ detail: 'No file uploaded' }, { status: 400 });
    }

    // Validate size (5MB)
    const maxSize = Number(process.env.MAX_UPLOAD_SIZE) || 5242880;
    if (file.size > maxSize) {
      return NextResponse.json({ detail: 'File too large. Max size is 5MB.' }, { status: 400 });
    }

    // Validate extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png').split(',');
    if (!ext || !allowed.includes(ext)) {
      return NextResponse.json({ detail: 'Invalid file format. Allowed: JPG, JPEG, PNG.' }, { status: 400 });
    }

    // Read bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFilename = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    fs.writeFileSync(filePath, buffer);

    const language = (data.get('language') as string | null) || 'en';

    // Call unified AI vision service
    const result = await AIService.detectObjectAndInsights(buffer, file.name, language);

    // Validate confidence score
    const primaryItem = result.detectedItems?.[0];
    const isLowConfidence = !primaryItem || primaryItem.confidence < 70;

    const primaryObjectName = primaryItem ? primaryItem.name : 'Unknown';

    // Save detection history
    const historyItem = await prisma.detectionHistory.create({
      data: {
        userId: user.id,
        imagePath: uniqueFilename,
        detectedObject: primaryObjectName,
        aiInsights: result.insights,
      },
    });

    const savedRecipes = [];

    if (!isLowConfidence && result.recipes && result.recipes.length > 0) {
      for (const recipeItem of result.recipes) {
        const baseSlug = recipeItem.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        
        let slug = baseSlug;
        let count = 1;
        while (true) {
          const existing = await prisma.recipe.findUnique({ where: { slug } });
          if (!existing) break;
          slug = `${baseSlug}-${count}`;
          count++;
        }

        const dbRecipe = await prisma.recipe.create({
          data: {
            slug,
            title: recipeItem.title,
            description: recipeItem.description,
            cookTime: recipeItem.cookTime,
            prepTime: recipeItem.prepTime,
            difficulty: recipeItem.difficulty,
            cuisine: recipeItem.cuisine,
            ingredients: JSON.stringify(recipeItem.ingredients),
            instructions: JSON.stringify(recipeItem.instructions),
            calories: recipeItem.calories,
            protein: recipeItem.protein,
            carbs: recipeItem.carbs,
            fat: recipeItem.fat,
            faqs: JSON.stringify(recipeItem.faqs || []),
            tips: JSON.stringify(recipeItem.tips || []),
            servings: recipeItem.servings || 4,
            additionalIngredients: JSON.stringify(recipeItem.additionalIngredients || []),
            storageInstructions: recipeItem.storageInstructions || "",
            servingSuggestions: recipeItem.servingSuggestions || "",
            mealType: recipeItem.mealType || "Breakfast",
            rating: recipeItem.rating || 4.8,
            confidence: recipeItem.confidence || 99.0,
            nutritionTable: JSON.stringify(recipeItem.nutritionTable || {}),
          },
        });

        savedRecipes.push({
          id: dbRecipe.id,
          slug: dbRecipe.slug,
          title: dbRecipe.title,
          description: dbRecipe.description,
          cookTime: dbRecipe.cookTime,
          prepTime: dbRecipe.prepTime,
          difficulty: dbRecipe.difficulty,
          cuisine: dbRecipe.cuisine,
          ingredients: recipeItem.ingredients,
          instructions: recipeItem.instructions,
          calories: dbRecipe.calories,
          protein: dbRecipe.protein,
          carbs: dbRecipe.carbs,
          fat: dbRecipe.fat,
          faqs: recipeItem.faqs || [],
          tips: recipeItem.tips || [],
          servings: dbRecipe.servings,
          additionalIngredients: recipeItem.additionalIngredients || [],
          storageInstructions: dbRecipe.storageInstructions,
          servingSuggestions: dbRecipe.servingSuggestions,
          mealType: dbRecipe.mealType,
          rating: dbRecipe.rating,
          confidence: dbRecipe.confidence,
          nutritionTable: recipeItem.nutritionTable || {},
        });
      }
    }

    const resourceLinks = AIService.generateResourceLinks(primaryObjectName);
    const imageUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      id: historyItem.id,
      detected_object: primaryObjectName,
      detectedItems: isLowConfidence ? [] : result.detectedItems,
      isLowConfidence,
      ai_insights: result.insights,
      resource_links: resourceLinks,
      image_url: imageUrl,
      created_at: historyItem.createdAt,
      recipes: savedRecipes
    });
  } catch (error: any) {
    console.error('Detection API error:', error);
    return NextResponse.json({ detail: 'Internal server error during detection' }, { status: 500 });
  }
}
