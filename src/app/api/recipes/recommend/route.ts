import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import axios from 'axios';
import { AIService, GeneratedRecipe } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { ingredients, language } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { detail: 'Please provide a list of ingredients' },
        { status: 400 }
      );
    }

    let apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      apiKey = 'AIzaSyCuIE_IZLwDzwqwCOPF6dsIbgjCKWdDsMg';
    }
    let recipesList: GeneratedRecipe[] = [];

    // Attempt to query Gemini for dynamic recipes list first
    if (apiKey) {
      try {
        const detectUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const promptText = `
          Generate a list of 3 unique cooking recipes using some or all of the following ingredients: ${ingredients.join(', ')}.
          IMPORTANT: Return all text descriptions, recipe titles, ingredients, instructions, tips, and FAQs in the following language: ${language || 'English'}.
          Return ONLY a valid JSON array of objects matching the following structure (do not wrap in markdown or backticks):
          [
            {
              "title": "Recipe Title",
              "description": "Short SEO description",
              "cookTime": 25,
              "prepTime": 10,
              "difficulty": "Easy",
              "cuisine": "Mexican",
              "ingredients": ["1 cup ingredient A", "2 tablespoons ingredient B"],
              "instructions": ["Step 1 description", "Step 2 description"],
              "calories": 350,
              "protein": 15,
              "carbs": 40,
              "fat": 12,
              "faqs": [{"q": "Question 1?", "a": "Answer 1."}],
              "tips": ["Tip 1", "Tip 2"],
              "servings": 4,
              "additionalIngredients": ["olive oil", "salt"],
              "storageInstructions": "Store in the fridge for up to 2 days.",
              "servingSuggestions": "Garnish with herbs and serve hot.",
              "mealType": "Lunch",
              "rating": 4.8,
              "confidence": 99.0,
              "nutritionTable": {
                "calories": 350,
                "protein": 15,
                "carbohydrates": 40,
                "fat": 12,
                "fiber": 4.5,
                "sugar": 2.5,
                "cholesterol": 15,
                "sodium": 480,
                "potassium": 320,
                "vitaminA": 10,
                "vitaminC": 15,
                "calcium": 6,
                "iron": 8
              }
            }
          ]
        `;

        const response = await axios.post(
          detectUrl,
          {
            contents: [{ parts: [{ text: promptText }] }]
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 20000
          }
        );

        let text = response.data.candidates[0].content.parts[0].text.trim();
        if (text.startsWith('```json')) {
          text = text.substring(7, text.lastIndexOf('```')).trim();
        } else if (text.startsWith('```')) {
          text = text.substring(3, text.lastIndexOf('```')).trim();
        }
        recipesList = JSON.parse(text) as GeneratedRecipe[];
      } catch (err) {
        console.error('Error generating live recipes list, falling back to local registry:', err);
      }
    }

    // Dynamic local registry lookup fallback if Gemini failed or rate-limited
    if (!recipesList || recipesList.length === 0) {
      recipesList = AIService.getDynamicRecipesForIngredients(ingredients, language);
    }

    const savedRecipes = [];

    for (const recipeData of recipesList) {
      // Create unique slug
      const baseSlug = recipeData.title
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

      // Save recipe to DB
      const recipe = await prisma.recipe.create({
        data: {
          slug,
          title: recipeData.title,
          description: recipeData.description,
          cookTime: recipeData.cookTime,
          prepTime: recipeData.prepTime,
          difficulty: recipeData.difficulty,
          cuisine: recipeData.cuisine,
          ingredients: JSON.stringify(recipeData.ingredients),
          instructions: JSON.stringify(recipeData.instructions),
          calories: recipeData.calories,
          protein: recipeData.protein,
          carbs: recipeData.carbs,
          fat: recipeData.fat,
          faqs: JSON.stringify(recipeData.faqs || []),
          tips: JSON.stringify(recipeData.tips || []),
          servings: recipeData.servings || 4,
          additionalIngredients: JSON.stringify(recipeData.additionalIngredients || []),
          storageInstructions: recipeData.storageInstructions || "",
          servingSuggestions: recipeData.servingSuggestions || "",
          mealType: recipeData.mealType || "Lunch",
          rating: recipeData.rating || 4.8,
          confidence: recipeData.confidence || 99.0,
          nutritionTable: JSON.stringify(recipeData.nutritionTable || {}),
        },
      });

      savedRecipes.push({
        id: recipe.id,
        slug: recipe.slug,
        title: recipe.title,
        description: recipe.description,
        cookTime: recipe.cookTime,
        prepTime: recipe.prepTime,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        faqs: recipeData.faqs || [],
        tips: recipeData.tips || [],
        servings: recipe.servings,
        additionalIngredients: recipeData.additionalIngredients || [],
        storageInstructions: recipe.storageInstructions,
        servingSuggestions: recipe.servingSuggestions,
        mealType: recipe.mealType,
        rating: recipe.rating,
        confidence: recipe.confidence,
        nutritionTable: recipeData.nutritionTable || {},
      });
    }

    return NextResponse.json(savedRecipes);
  } catch (error: any) {
    console.error('Recipe recommendation API error:', error);
    return NextResponse.json(
      { detail: 'Internal server error during recipe generation' },
      { status: 500 }
    );
  }
}
