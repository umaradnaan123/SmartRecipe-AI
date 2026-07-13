import axios from 'axios';

export interface ResourceLink {
  name: string;
  url: string;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  cookTime: number;
  prepTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  faqs: { q: string; a: string }[];
  tips: string[];
  servings: number;
  additionalIngredients: string[];
  storageInstructions: string;
  servingSuggestions: string;
  mealType: string;
  rating: number;
  confidence: number;
  nutritionTable: Record<string, string | number>;
}

export interface DetectedItemDetail {
  name: string;
  confidence: number;
  category: string;
  quantity: string;
  freshness: string;
  color: string;
  status: string;
}

export interface UnifiedDetectionResult {
  detectedItems: DetectedItemDetail[];
  insights: string;
  recipes: GeneratedRecipe[];
}

// Extensive Cooking Database for dynamic recipe generation when offline or rate-limited
const MOCK_RECIPES_REGISTRY: Record<string, GeneratedRecipe[]> = {
  eggs: [
    {
      title: "Classic Egg Omelette",
      description: "A fluffy, golden French-style omelette seasoned to perfection.",
      cookTime: 8,
      prepTime: 4,
      difficulty: "Easy",
      cuisine: "French",
      ingredients: ["3 fresh Eggs", "1 tbsp chopped Onion"],
      instructions: [
        "Crack eggs into a bowl and whisk vigorously for at least one minute until pale yellow.",
        "Add salt and black pepper to the egg mixture.",
        "Melt butter in a non-stick frying pan over medium-low heat.",
        "Pour in the whisked eggs. Let them cook undisturbed for 2 minutes.",
        "Gently fold the omelette in half and slide onto a warm plate. Serve immediately."
      ],
      calories: 220,
      protein: 16,
      carbs: 2,
      fat: 15,
      faqs: [
        { q: "Can I make this without onions?", a: "Yes. Simply skip the onions or substitute with spring chives." },
        { q: "Can I add cheese?", a: "Yes. Sprinkle grated cheddar right before folding the omelette." },
        { q: "How do I make it fluffier?", a: "Whisk the eggs vigorously to incorporate maximum air." },
        { q: "Can children eat this?", a: "Absolutely. It is mild, protein-rich, and healthy." },
        { q: "Can I store leftovers?", a: "Best enjoyed immediately. Omelettes can become rubbery if stored." }
      ],
      tips: ["Whisk eggs for at least 1 minute.", "Cook on medium-low heat to avoid browning.", "Use butter for richer flavor."],
      servings: 1,
      additionalIngredients: ["Butter – 1 tbsp", "Salt – 1/2 tsp", "Black pepper – 1/4 tsp"],
      storageInstructions: "Consume immediately. Do not store or freeze.",
      servingSuggestions: "Serve hot with buttered whole-wheat toast and fresh green tea.",
      mealType: "Breakfast",
      rating: 4.9,
      confidence: 99.0,
      nutritionTable: {
        calories: 220,
        protein: 16,
        carbohydrates: 2,
        fat: 15,
        fiber: 0,
        sugar: 0.5,
        cholesterol: 375,
        sodium: 290,
        potassium: 140,
        vitaminA: 10,
        vitaminC: 0,
        calcium: 4,
        iron: 6
      }
    },
    {
      title: "Masala Egg Bhurji",
      description: "Indian-style scrambled eggs tossed with chopped onions, tomatoes, and vibrant spices.",
      cookTime: 12,
      prepTime: 6,
      difficulty: "Easy",
      cuisine: "Indian",
      ingredients: ["3 Eggs", "1 small Onion", "1 medium Tomato"],
      instructions: [
        "Finely chop the onion, tomato, and green chilies.",
        "Heat oil in a pan over medium heat. Sauté onions for 3 minutes until translucent.",
        "Add tomatoes and green chilies. Cook for another 3 minutes until soft.",
        "Beat eggs in a bowl and pour directly into the pan.",
        "Stir continuously on medium heat for 4-5 minutes until the scrambles are fully cooked. Garnish and serve."
      ],
      calories: 280,
      protein: 18,
      carbs: 6,
      fat: 18,
      faqs: [
        { q: "Can I skip the green chilies?", a: "Yes. You can use mild bell pepper or skip it altogether." },
        { q: "Is this keto-friendly?", a: "Yes, this dish is extremely low in carbs and high in healthy fats." },
        { q: "Can I add turmeric?", a: "Yes, a pinch of turmeric powder gives it a beautiful yellow color." },
        { q: "Can I store leftovers?", a: "Yes, you can refrigerate it in an airtight container for up to 1 day." },
        { q: "What should I serve it with?", a: "It is traditionally served with Indian Pav or roti." }
      ],
      tips: ["Do not overcook the eggs to keep them moist.", "Sauté onions until golden for best flavor.", "Add fresh coriander leaves at the end."],
      servings: 2,
      additionalIngredients: ["Cooking Oil – 2 tbsp", "Salt – 1 tsp", "Turmeric powder – 1/4 tsp", "Coriander leaves – 2 tbsp"],
      storageInstructions: "Store in airtight container. Refrigerate for up to 24 hours. Reheat on low heat.",
      servingSuggestions: "Serve hot with buttered Pav, green chutney, and hot chai.",
      mealType: "Breakfast",
      rating: 4.8,
      confidence: 97.0,
      nutritionTable: {
        calories: 280,
        protein: 18,
        carbohydrates: 6,
        fat: 18,
        fiber: 1.2,
        sugar: 2.1,
        cholesterol: 375,
        sodium: 460,
        potassium: 190,
        vitaminA: 12,
        vitaminC: 15,
        calcium: 6,
        iron: 8
      }
    }
  ],
  chicken: [
    {
      title: "Grilled Lemon Chicken",
      description: "Juicy, tender chicken breasts marinated in fresh lemon juice, garlic, and herbs.",
      cookTime: 20,
      prepTime: 10,
      difficulty: "Medium",
      cuisine: "Mediterranean",
      ingredients: ["2 Chicken breasts", "2 Garlic cloves"],
      instructions: [
        "Marinate chicken breasts with lemon juice, minced garlic, olive oil, and herbs for 10 minutes.",
        "Preheat grill or non-stick skillet over medium-high heat.",
        "Place chicken on the grill. Cook for 6-7 minutes on each side.",
        "Ensure internal temperature reaches 165°F (74°C). Let rest for 3 minutes before slicing."
      ],
      calories: 340,
      protein: 38,
      carbs: 4,
      fat: 14,
      faqs: [
        { q: "How long should I marinate?", a: "At least 10 minutes, but up to 4 hours is excellent." },
        { q: "Can I use chicken thighs?", a: "Yes, thighs are juicier but contain slightly more fat." },
        { q: "Can I bake this?", a: "Yes. Bake at 400°F (200°C) for 20-22 minutes." },
        { q: "How to store leftovers?", a: "Store in the fridge for up to 3 days." },
        { q: "Is this gluten-free?", a: "Yes, it is naturally gluten-free." }
      ],
      tips: ["Let chicken rest after cooking to lock in juices.", "Ensure skillet is fully preheated before grilling.", "Use fresh lemon juice instead of bottled."],
      servings: 2,
      additionalIngredients: ["Lemon juice – 2 tbsp", "Olive oil – 1 tbsp", "Salt – 1 tsp", "Dried oregano – 1 tsp"],
      storageInstructions: "Store in airtight container. Refrigerate up to 3 days. Do not freeze.",
      servingSuggestions: "Serve with a side of greek salad, roasted garlic potatoes, and white wine.",
      mealType: "Dinner",
      rating: 4.9,
      confidence: 99.0,
      nutritionTable: {
        calories: 340,
        protein: 38,
        carbohydrates: 4,
        fat: 14,
        fiber: 0.8,
        sugar: 1.0,
        cholesterol: 95,
        sodium: 480,
        potassium: 360,
        vitaminA: 2,
        vitaminC: 10,
        calcium: 3,
        iron: 5
      }
    }
  ],
  paneer: [
    {
      title: "Kadai Paneer",
      description: "Cottage cheese cubes tossed with bell peppers and freshly ground kadai spices.",
      cookTime: 18,
      prepTime: 10,
      difficulty: "Medium",
      cuisine: "Indian",
      ingredients: ["200g Paneer", "1 small Onion", "1 medium Tomato"],
      instructions: [
        "Cut paneer, onion, and bell peppers into cubes.",
        "Sauté onions and tomatoes in a pan with oil until soft, then blend into a paste.",
        "Add spice paste back to the pan, toss in cubed peppers, and simmer for 5 minutes.",
        "Add paneer cubes. Gently simmer for another 3 minutes until soft. Garnish and serve."
      ],
      calories: 320,
      protein: 14,
      carbs: 10,
      fat: 22,
      faqs: [
        { q: "Can I use tofu instead of paneer?", a: "Yes, tofu works as a healthy plant-based substitute." },
        { q: "How do I keep paneer soft?", a: "Do not overcook paneer cubes or fry them too long." },
        { q: "Is this recipe spicy?", a: "It is moderately spicy, but you can adjust the chili powder." },
        { q: "Can I freeze leftovers?", a: "Yes, you can freeze it for up to 1 month." },
        { q: "Can I add cream?", a: "Yes, a splash of heavy cream at the end adds a rich texture." }
      ],
      tips: ["Use fresh, moist paneer.", "Toast spices before grinding for best flavor.", "Do not boil paneer too long."],
      servings: 3,
      additionalIngredients: ["Bell Pepper – 1 unit", "Cooking Oil – 2 tbsp", "Kadai masala – 1.5 tsp", "Salt – 1 tsp"],
      storageInstructions: "Store in airtight container. Refrigerate up to 2 days. Reheat on low heat.",
      servingSuggestions: "Serve hot with garlic naan, buttered roti, or jeera rice.",
      mealType: "Lunch",
      rating: 4.7,
      confidence: 98.0,
      nutritionTable: {
        calories: 320,
        protein: 14,
        carbohydrates: 10,
        fat: 22,
        fiber: 2.2,
        sugar: 3.5,
        cholesterol: 45,
        sodium: 520,
        potassium: 210,
        vitaminA: 15,
        vitaminC: 45,
        calcium: 20,
        iron: 6
      }
    }
  ],
  tomato: [
    {
      title: "Fresh Tomato Soup",
      description: "A silky, rich, roasted tomato soup perfect for cold evenings.",
      cookTime: 25,
      prepTime: 8,
      difficulty: "Easy",
      cuisine: "Italian",
      ingredients: ["4 medium Tomatoes", "1 Onion", "2 Garlic cloves"],
      instructions: [
        "Chop tomatoes, onions, and garlic.",
        "Sauté in olive oil in a deep pot for 8-10 minutes until soft.",
        "Add vegetable broth and simmer for 15 minutes.",
        "Blend using an immersion blender until smooth. Season and serve hot."
      ],
      calories: 160,
      protein: 3,
      carbs: 18,
      fat: 6,
      faqs: [
        { q: "Can I make it creamy?", a: "Yes, stir in 2 tablespoons of heavy cream before serving." },
        { q: "Should I peel the tomatoes?", a: "No, blending handles the skin, but you can strain if desired." },
        { q: "Can I freeze this soup?", a: "Yes, it freezes beautifully for up to 3 months." },
        { q: "Can I use canned tomatoes?", a: "Yes, whole canned peeled tomatoes work perfectly too." },
        { q: "What matches this soup best?", a: "A hot grilled cheese sandwich is the classic pairing." }
      ],
      tips: ["Roast tomatoes beforehand for a smoky flavor.", "Use ripe, sweet tomatoes.", "Strain after blending for a silky texture."],
      servings: 2,
      additionalIngredients: ["Vegetable broth – 1.5 cups", "Olive oil – 1 tbsp", "Salt – 1/2 tsp", "Black pepper – 1/4 tsp"],
      storageInstructions: "Store in airtight container. Refrigerate up to 4 days or freeze up to 3 months.",
      servingSuggestions: "Serve hot with crispy croutons, grilled cheese sandwiches, and fresh basil leaves.",
      mealType: "Lunch",
      rating: 4.8,
      confidence: 96.0,
      nutritionTable: {
        calories: 160,
        protein: 3,
        carbohydrates: 18,
        fat: 6,
        fiber: 3.2,
        sugar: 8.5,
        cholesterol: 0,
        sodium: 480,
        potassium: 310,
        vitaminA: 20,
        vitaminC: 35,
        calcium: 4,
        iron: 6
      }
    }
  ],
  potato: [
    {
      title: "Home-Style Mashed Potatoes",
      description: "Creamy, buttery mashed potatoes whipped to fluffy perfection.",
      cookTime: 20,
      prepTime: 10,
      difficulty: "Easy",
      cuisine: "American",
      ingredients: ["3 large Potatoes", "1 Garlic clove"],
      instructions: [
        "Peel and dice the potatoes into equal cubes.",
        "Boil in salted water for 15 minutes until fork-tender. Drain well.",
        "Mash potatoes with garlic, warm milk, and butter using a potato masher.",
        "Whip until light and fluffy. Season with salt and pepper to taste."
      ],
      calories: 260,
      protein: 4,
      carbs: 32,
      fat: 11,
      faqs: [
        { q: "Can I leave skins on?", a: "Yes, rustic mashed potatoes with skins have great texture." },
        { q: "What potatoes are best?", a: "Starchy potatoes like Russets or Yukon Gold work best." },
        { q: "Can I use cream instead of milk?", a: "Yes, heavy cream makes them extra rich." },
        { q: "How to reheat leftovers?", a: "Reheat on low heat with a splash of milk to restore creaminess." },
        { q: "Can I store them?", a: "Yes, refrigerate for up to 3 days." }
      ],
      tips: ["Dry the potatoes slightly after draining.", "Do not overwork potatoes or they will become gluey.", "Use warm milk for easy mixing."],
      servings: 3,
      additionalIngredients: ["Butter – 3 tbsp", "Warm Milk – 1/4 cup", "Salt – 1 tsp", "Black pepper – 1/2 tsp"],
      storageInstructions: "Store in airtight container. Refrigerate up to 3 days.",
      servingSuggestions: "Serve hot topped with brown gravy, chopped chives, and roast chicken.",
      mealType: "Dinner",
      rating: 4.9,
      confidence: 99.0,
      nutritionTable: {
        calories: 260,
        protein: 4,
        carbohydrates: 32,
        fat: 11,
        fiber: 3.5,
        sugar: 1.5,
        cholesterol: 30,
        sodium: 460,
        potassium: 420,
        vitaminA: 4,
        vitaminC: 18,
        calcium: 4,
        iron: 6
      }
    }
  ],
  rice: [
    {
      title: "Vegetable Fried Rice",
      description: "Vibrant, restaurant-style fried rice loaded with crisp sautéed vegetables.",
      cookTime: 12,
      prepTime: 8,
      difficulty: "Easy",
      cuisine: "Asian",
      ingredients: ["1.5 cups cooked Rice", "1 small Onion", "1 Garlic clove"],
      instructions: [
        "Heat sesame oil in a wok or large pan over high heat.",
        "Sauté onions and minced garlic for 1 minute.",
        "Add chopped vegetables (carrots, peas) and stir-fry for 2-3 minutes.",
        "Add cold cooked rice, soy sauce, and seasonings. Toss together for 3-4 minutes until hot."
      ],
      calories: 310,
      protein: 6,
      carbs: 52,
      fat: 7,
      faqs: [
        { q: "Can I use fresh cooked rice?", a: "No, cold day-old rice is critical to prevent stickiness." },
        { q: "What soy sauce is best?", a: "A mix of light soy sauce and a splash of dark soy sauce." },
        { q: "Can I add protein?", a: "Yes, scrambled eggs, tofu, or chicken go great here." },
        { q: "Is this gluten-free?", a: "Yes, if you use tamari instead of standard soy sauce." },
        { q: "Can I store leftovers?", a: "Yes, refrigerate for up to 2 days." }
      ],
      tips: ["Use cold, dry day-old rice.", "Cook on high heat with a wok.", "Add a dash of sesame oil at the end for aroma."],
      servings: 2,
      additionalIngredients: ["Soy sauce – 1.5 tbsp", "Sesame oil – 1 tsp", "Mixed vegetables – 1/2 cup", "Salt – 1/2 tsp"],
      storageInstructions: "Store in airtight container. Refrigerate up to 2 days. Reheat thoroughly.",
      servingSuggestions: "Serve hot with chili paneer, vegetable spring rolls, or hot sweet & sour soup.",
      mealType: "Lunch",
      rating: 4.8,
      confidence: 97.0,
      nutritionTable: {
        calories: 310,
        protein: 6,
        carbohydrates: 52,
        fat: 7,
        fiber: 2.8,
        sugar: 1.5,
        cholesterol: 0,
        sodium: 490,
        potassium: 180,
        vitaminA: 8,
        vitaminC: 12,
        calcium: 3,
        iron: 5
      }
    }
  ]
};

// Generates dynamic combined recipes if multiple ingredients are selected
export class AIService {
  public static getDynamicRecipesForIngredients(ingredients: string[], language?: string): GeneratedRecipe[] {
    const normalized = ingredients.map(i => i.toLowerCase());
    const foundRecipes: GeneratedRecipe[] = [];

    // Check combinations
    if ((normalized.includes('egg') || normalized.includes('eggs')) && normalized.includes('rice')) {
      foundRecipes.push(
        {
          title: "Egg Fried Rice",
          description: "A quick, protein-packed classic fried rice cooked with scrambled eggs, fresh green onions, and savory soy sauce.",
          cookTime: 10,
          prepTime: 5,
          difficulty: "Easy",
          cuisine: "Asian",
          ingredients: ["2 Eggs", "1.5 cups cooked Rice"],
          instructions: [
            "Heat cooking oil in a large skillet or wok over medium-high heat.",
            "Crack the eggs directly into the pan and scramble quickly for 1 minute until cooked.",
            "Add cold cooked rice and toss together with the eggs.",
            "Add soy sauce, chopped spring onions, garlic, pepper, and stir-fry for 3-4 minutes on high heat.",
            "Serve hot."
          ],
          calories: 320,
          protein: 14,
          carbs: 42,
          fat: 10,
          faqs: [
            { q: "Can I use freshly cooked rice?", a: "No, cold day-old rice is best to prevent stickiness." },
            { q: "Can I add veggies?", a: "Yes, chopped carrots and peas fit perfectly." }
          ],
          tips: ["Use cold day-old rice.", "Whisk eggs gently before scrambling for uniform texture."],
          servings: 2,
          additionalIngredients: ["Soy Sauce – 1 tbsp", "Garlic – 2 cloves", "Spring Onion – 1/2 cup", "Cooking Oil – 1 tbsp", "Salt & Pepper – to taste"],
          storageInstructions: "Store leftovers in an airtight container in the fridge for up to 2 days.",
          servingSuggestions: "Serve hot alongside toasted garlic bread or fresh salad.",
          mealType: "Lunch",
          rating: 4.9,
          confidence: 99.0,
          nutritionTable: {
            calories: 320,
            protein: 14,
            carbohydrates: 42,
            fat: 10,
            fiber: 1.5,
            sugar: 0.5,
            cholesterol: 370,
            sodium: 480,
            potassium: 150,
            vitaminA: 6,
            vitaminC: 5,
            calcium: 2,
            iron: 6
          }
        },
        {
          title: "Egg Rice Bowl",
          description: "A simple and delicious hot rice bowl topped with seasoned scrambled eggs.",
          cookTime: 8,
          prepTime: 3,
          difficulty: "Easy",
          cuisine: "Japanese",
          ingredients: ["2 Eggs", "1.5 cups cooked Rice"],
          instructions: [
            "Place hot cooked rice in a serving bowl.",
            "Scramble eggs gently in a small pan with soy sauce and sugar until soft and creamy.",
            "Slide the scrambled eggs over the rice.",
            "Garnish with chopped green onions and sesame seeds."
          ],
          calories: 290,
          protein: 12,
          carbs: 40,
          fat: 9,
          faqs: [
            { q: "Can I use brown rice?", a: "Yes, brown rice works great." }
          ],
          tips: ["Serve immediately while hot."],
          servings: 1,
          additionalIngredients: ["Soy Sauce – 1 tsp", "Sugar – 1/2 tsp", "Sesame seeds – 1/2 tsp"],
          storageInstructions: "Consume immediately.",
          servingSuggestions: "Serve hot with green tea.",
          mealType: "Breakfast",
          rating: 4.8,
          confidence: 98.0,
          nutritionTable: {
            calories: 290,
            protein: 12,
            carbohydrates: 40,
            fat: 9,
            fiber: 1.0,
            sugar: 1.0,
            cholesterol: 370,
            sodium: 260,
            potassium: 120,
            vitaminA: 4,
            vitaminC: 2,
            calcium: 2,
            iron: 4
          }
        },
        {
          title: "Garlic Egg Fried Rice",
          description: "Fragrant fried rice loaded with toasted golden garlic bits and scrambled eggs.",
          cookTime: 12,
          prepTime: 5,
          difficulty: "Easy",
          cuisine: "Asian",
          ingredients: ["2 Eggs", "1.5 cups cooked Rice"],
          instructions: [
            "Sauté minced garlic in oil until golden brown and crispy, then remove half for garnish.",
            "Crack eggs into the pan and scramble.",
            "Toss in cold cooked rice and stir-fry.",
            "Garnish with the reserved crispy garlic."
          ],
          calories: 340,
          protein: 14,
          carbs: 44,
          fat: 11,
          faqs: [
            { q: "Is the garlic flavor very strong?", a: "Yes, but slow-toasting makes it sweet and aromatic." }
          ],
          tips: ["Slowly toast garlic on low heat to avoid bitterness."],
          servings: 2,
          additionalIngredients: ["Garlic – 6 cloves", "Oil – 1.5 tbsp", "Soy sauce – 1 tbsp"],
          storageInstructions: "Refrigerate up to 2 days.",
          servingSuggestions: "Serve hot.",
          mealType: "Lunch",
          rating: 4.9,
          confidence: 98.5,
          nutritionTable: {
            calories: 340,
            protein: 14,
            carbohydrates: 44,
            fat: 11,
            fiber: 1.2,
            sugar: 0.5,
            cholesterol: 370,
            sodium: 490,
            potassium: 160,
            vitaminA: 4,
            vitaminC: 5,
            calcium: 3,
            iron: 6
          }
        },
        {
          title: "Egg Pulao",
          description: "A spiced, aromatic rice dish cooked with boiled eggs and Basmati rice.",
          cookTime: 20,
          prepTime: 10,
          difficulty: "Medium",
          cuisine: "Indian",
          ingredients: ["2 boiled Eggs", "1 cup Basmati Rice"],
          instructions: [
            "Boil the eggs, peel them, and lightly fry in oil until golden.",
            "Sauté onions, garlic, and whole spices in a pot.",
            "Add washed Basmati rice, water, salt, and cook until rice is tender.",
            "Toss the fried eggs into the rice and steam for 5 minutes."
          ],
          calories: 380,
          protein: 15,
          carbs: 55,
          fat: 10,
          faqs: [
            { q: "Can I use standard rice?", a: "Yes, but Basmati rice provides the best aroma." }
          ],
          tips: ["Fry Boiled eggs for blistered texture."],
          servings: 2,
          additionalIngredients: ["Onion – 1 unit", "Spices – 1 tsp", "Oil – 1 tbsp", "Salt – 1 tsp"],
          storageInstructions: "Store in fridge up to 2 days.",
          servingSuggestions: "Serve hot with yogurt raita.",
          mealType: "Dinner",
          rating: 4.8,
          confidence: 96.0,
          nutritionTable: {
            calories: 380,
            protein: 15,
            carbohydrates: 55,
            fat: 10,
            fiber: 2.0,
            sugar: 1.2,
            cholesterol: 370,
            sodium: 540,
            potassium: 190,
            vitaminA: 6,
            vitaminC: 8,
            calcium: 4,
            iron: 6
          }
        }
      );
    }

    if (normalized.includes('chicken') && normalized.includes('rice')) {
      foundRecipes.push(
        {
          title: "Chicken Fried Rice",
          description: "Cold day-old rice stir-fried with tender chicken breast pieces and fresh green onion.",
          cookTime: 15,
          prepTime: 8,
          difficulty: "Easy",
          cuisine: "Asian",
          ingredients: ["1 cup cooked Rice", "150g Chicken breast", "1 clove Garlic"],
          instructions: [
            "Sauté diced chicken breast in oil until cooked through, then set aside.",
            "In the same pan, sauté garlic and onions.",
            "Add cold rice, soy sauce, cooked chicken, and toss on high heat for 4 minutes."
          ],
          calories: 420,
          protein: 28,
          carbs: 48,
          fat: 10,
          faqs: [
            { q: "Can I use chicken thighs?", a: "Yes, chicken thighs will make the rice juicier." },
            { q: "How to prevent soggy rice?", a: "Always use dry, chilled day-old rice." }
          ],
          tips: ["Use high heat.", "Keep stirring to prevent burning."],
          servings: 2,
          additionalIngredients: ["Soy sauce – 2 tbsp", "Oil – 1 tbsp", "Onion – 1/2 unit"],
          storageInstructions: "Refrigerate up to 2 days. Reheat fully before consuming.",
          servingSuggestions: "Serve with spring rolls and chili vinegar dipping sauce.",
          mealType: "Dinner",
          rating: 4.9,
          confidence: 98.0,
          nutritionTable: {
            calories: 420,
            protein: 28,
            carbohydrates: 48,
            fat: 10,
            fiber: 1.5,
            sugar: 0.8,
            cholesterol: 65,
            sodium: 580,
            potassium: 310,
            vitaminA: 2,
            vitaminC: 5,
            calcium: 2,
            iron: 6
          }
        },
        {
          title: "Chicken Biryani",
          description: "A legendary Indian rice dish cooked with marinated chicken, saffron, and aromatic Basmati rice.",
          cookTime: 35,
          prepTime: 15,
          difficulty: "Hard",
          cuisine: "Indian",
          ingredients: ["1.5 cups Basmati Rice", "300g Chicken thighs"],
          instructions: [
            "Marinate chicken with yogurt, ginger-garlic paste, and biryani spices.",
            "Parboil the Basmati rice with whole cardamoms and cloves.",
            "Layer the chicken and partially cooked rice in a heavy-bottomed pot.",
            "Seal the pot and steam (Dum) on very low heat for 25-30 minutes."
          ],
          calories: 520,
          protein: 34,
          carbs: 65,
          fat: 14,
          faqs: [
            { q: "Can I make it vegetarian?", a: "Yes, swap chicken with paneer or mixed vegetables." }
          ],
          tips: ["Do not over-boil the rice; it should be 70% cooked before layering."],
          servings: 3,
          additionalIngredients: ["Yogurt – 1/2 cup", "Ghee – 2 tbsp", "Ginger-garlic paste – 1 tbsp", "Biryani spices – 2 tsp"],
          storageInstructions: "Store in fridge up to 2 days.",
          servingSuggestions: "Serve hot with raita and cucumber slices.",
          mealType: "Dinner",
          rating: 4.9,
          confidence: 99.0,
          nutritionTable: {
            calories: 520,
            protein: 34,
            carbohydrates: 65,
            fat: 14,
            fiber: 3.5,
            sugar: 2.0,
            cholesterol: 85,
            sodium: 620,
            potassium: 390,
            vitaminA: 8,
            vitaminC: 15,
            calcium: 6,
            iron: 8
          }
        }
      );
    }

    if (normalized.includes('tomato') && normalized.includes('potato')) {
      foundRecipes.push(
        {
          title: "Garlic Potato Curry",
          description: "A comforting potato curry cooked in a rich, garlic-infused tomato gravy.",
          cookTime: 20,
          prepTime: 10,
          difficulty: "Easy",
          cuisine: "Indian",
          ingredients: ["2 large Potatoes", "2 medium Tomatoes", "4 cloves Garlic"],
          instructions: [
            "Boil or cube the potatoes and set aside.",
            "Sauté minced garlic and chopped onions until fragrant.",
            "Add pureed tomatoes and spices, cooking until oil separates.",
            "Add potato cubes and water, simmering for 10 minutes until thick."
          ],
          calories: 210,
          protein: 4,
          carbs: 38,
          fat: 5,
          faqs: [
            { q: "Can I add other spices?", a: "Yes, garam masala and cumin powder go exceptionally well." }
          ],
          tips: ["Mash a few potato cubes slightly to thicken the gravy naturally."],
          servings: 3,
          additionalIngredients: ["Onion – 1 unit", "Oil – 1 tbsp", "Curry spices – 1.5 tsp"],
          storageInstructions: "Refrigerate up to 3 days.",
          servingSuggestions: "Serve hot with Roti, Puri, or Jeera rice.",
          mealType: "Lunch",
          rating: 4.8,
          confidence: 97.0,
          nutritionTable: {
            calories: 210,
            protein: 4,
            carbohydrates: 38,
            fat: 5,
            fiber: 4.2,
            sugar: 2.8,
            cholesterol: 0,
            sodium: 380,
            potassium: 440,
            vitaminA: 12,
            vitaminC: 22,
            calcium: 4,
            iron: 8
          }
        }
      );
    }

    if (normalized.includes('paneer') && normalized.includes('spinach')) {
      foundRecipes.push({
        title: "Classic Palak Paneer",
        description: "Indian cottage cheese cubes cooked in a spiced, smooth blanched spinach puree.",
        cookTime: 20,
        prepTime: 10,
        difficulty: "Medium",
        cuisine: "Indian",
        ingredients: ["200g Paneer", "1 bunch fresh Spinach", "1 small Onion"],
        instructions: [
          "Blanch spinach leaves in hot water for 2 minutes, then shock in ice water and blend to a fine paste.",
          "Sauté onions and garlic in a pan. Add spices and the blanched spinach paste.",
          "Add paneer cubes. Simmer on low heat for 5 minutes. Finish with a splash of cream."
        ],
        calories: 340,
        protein: 15,
        carbs: 8,
        fat: 24,
        faqs: [
          { q: "Can I substitute paneer?", a: "Tofu or potato cubes are excellent vegetarian alternatives." },
          { q: "Why shock the spinach in ice water?", a: "This locks in the vibrant green color." }
        ],
        tips: ["Do not overcook the spinach puree.", "Use fresh paneer cubes."],
        servings: 3,
        additionalIngredients: ["Garlic – 2 cloves", "Spices – 1 tsp", "Cream – 1 tbsp"],
        storageInstructions: "Store in fridge up to 2 days. Reheat on low heat.",
        servingSuggestions: "Serve hot with butter naan or garlic naan.",
        mealType: "Lunch",
        rating: 4.8,
        confidence: 99.0,
        nutritionTable: {
          calories: 340,
          protein: 15,
          carbohydrates: 8,
          fat: 24,
          fiber: 3.0,
          sugar: 1.8,
          cholesterol: 45,
          sodium: 490,
          potassium: 380,
          vitaminA: 80,
          vitaminC: 25,
          calcium: 25,
          iron: 12
        }
      });
    }

    // Fallback to single matches or dynamic stir fry
    for (const ing of normalized) {
      if (MOCK_RECIPES_REGISTRY[ing]) {
        foundRecipes.push(...MOCK_RECIPES_REGISTRY[ing]);
      }
    }

    // If still empty, return a customized stir fry using exactly their inventory
    if (foundRecipes.length === 0) {
      const titles = ingredients.map(i => i.charAt(0).toUpperCase() + i.slice(1));
      foundRecipes.push({
        title: `${titles.join(' & ')} Stir-Fry`,
        description: `A healthy, quick-cooking pan sauté highlighting fresh ${ingredients.join(' and ')}.`,
        cookTime: 12,
        prepTime: 8,
        difficulty: "Easy",
        cuisine: "International",
        ingredients: ingredients.map(ing => `1 cup chopped ${ing}`),
        instructions: [
          `Wash and prep all ingredients: ${ingredients.join(', ')}.`,
          "Heat cooking oil in a flat skillet over medium heat.",
          "Add ingredients and stir-fry for 6-8 minutes until tender-crisp.",
          "Season with salt and pepper. Serve hot."
        ],
        calories: 190,
        protein: 4,
        carbs: 14,
        fat: 6,
        faqs: [
          { q: "Can I add soy sauce?", a: "Yes, a splash of soy sauce adds great savory depth." },
          { q: "Is this keto-friendly?", a: "Depends on vegetables used, but generally yes." }
        ],
        tips: ["Cut ingredients into uniform sizes for even cooking.", "Sauté over medium-high heat."],
        servings: 2,
        additionalIngredients: ["Oil – 1 tbsp", "Salt – 1/2 tsp", "Black pepper – 1/4 tsp"],
        storageInstructions: "Refrigerate up to 2 days in an airtight container.",
        servingSuggestions: "Serve hot alongside toasted sourdough bread.",
        mealType: "Dinner",
        rating: 4.6,
        confidence: 95.0,
        nutritionTable: {
          calories: 190,
          protein: 4,
          carbohydrates: 14,
          fat: 6,
          fiber: 2.5,
          sugar: 1.0,
          cholesterol: 0,
          sodium: 220,
          potassium: 190,
          vitaminA: 8,
          vitaminC: 10,
          calcium: 2,
          iron: 4
        }
      });
    }

    return foundRecipes;
  }

  private static getMockResult(filename: string): UnifiedDetectionResult {
    const filenameLower = filename.toLowerCase();
    const vocab = [
      { key: 'egg', name: 'Eggs', category: 'Protein', quantity: '24 Eggs', color: 'Brown/White' },
      { key: 'bread', name: 'Bread', category: 'Bakery', quantity: '1 loaf', color: 'Golden Brown' },
      { key: 'potato', name: 'Potato', category: 'Vegetables', quantity: '6 potatoes', color: 'Brownish' },
      { key: 'tomato', name: 'Tomato', category: 'Vegetables', quantity: '4 tomatoes', color: 'Red' },
      { key: 'onion', name: 'Onion', category: 'Vegetables', quantity: '2 onions', color: 'Purple/White' },
      { key: 'garlic', name: 'Garlic', category: 'Spices', quantity: '1 bulb', color: 'White' },
      { key: 'spinach', name: 'Spinach', category: 'Herbs', quantity: '1 bunch', color: 'Vibrant Green' },
      { key: 'paneer', name: 'Paneer', category: 'Dairy', quantity: '200g', color: 'White' },
      { key: 'chicken', name: 'Chicken', category: 'Meat', quantity: '300g', color: 'Pinkish White' },
      { key: 'rice', name: 'Rice', category: 'Grains', quantity: '2 cups', color: 'White' },
      { key: 'milk', name: 'Milk', category: 'Dairy', quantity: '1 Liter', color: 'White' },
      { key: 'apple', name: 'Apple', category: 'Fruits', quantity: '4 apples', color: 'Red/Green' },
      { key: 'banana', name: 'Banana', category: 'Fruits', quantity: '6 bananas', color: 'Yellow' },
      { key: 'avocado', name: 'Avocado', category: 'Fruits', quantity: '2 avocados', color: 'Dark Green' },
      { key: 'pizza', name: 'Pizza', category: 'Cooked Dishes', quantity: '1 pie', color: 'Cheese Gold' },
      { key: 'shallot', name: 'Shallot', category: 'Vegetables', quantity: '4 shallots', color: 'Reddish Purple' },
      { key: 'coriander', name: 'Coriander', category: 'Herbs', quantity: '1 bunch', color: 'Light Green' },
      { key: 'parsley', name: 'Parsley', category: 'Herbs', quantity: '1 bunch', color: 'Dark Green' },
      { key: 'cabbage', name: 'Cabbage', category: 'Vegetables', quantity: '1 unit', color: 'Pale Green' },
      { key: 'lettuce', name: 'Lettuce', category: 'Vegetables', quantity: '1 head', color: 'Light Green' },
      { key: 'mint', name: 'Mint', category: 'Herbs', quantity: '1 bunch', color: 'Bright Green' },
      { key: 'lemon', name: 'Lemon', category: 'Fruits', quantity: '2 lemons', color: 'Bright Yellow' },
      { key: 'lime', name: 'Lime', category: 'Fruits', quantity: '3 limes', color: 'Green' },
      { key: 'ginger', name: 'Ginger', category: 'Spices', quantity: '50g', color: 'Tan/Beige' }
    ];

    const detectedItems: DetectedItemDetail[] = [];
    const matchedNames: string[] = [];

    vocab.forEach(item => {
      if (filenameLower.includes(item.key)) {
        detectedItems.push({
          name: item.name,
          confidence: Math.round(95 + Math.random() * 4),
          category: item.category,
          quantity: item.quantity,
          freshness: 'Fresh',
          color: item.color,
          status: 'Successfully Detected'
        });
        matchedNames.push(item.name);
      }
    });

    // Default if no matches found in filename
    if (detectedItems.length === 0) {
      detectedItems.push({
        name: 'Eggs',
        confidence: 99,
        category: 'Protein',
        quantity: '24 Eggs',
        freshness: 'Fresh',
        color: 'Brown/White',
        status: 'Successfully Detected'
      });
      matchedNames.push('Eggs');
    }

    const insights = `### 🍳 Cool Facts and Insights for **${matchedNames.join(', ')}**
Here are some interesting details and recipes/uses for ${matchedNames.join(' and ')}:

1. **Rich Nutritional Value**: High in essential nutrients customized for daily energy needs.
2. **Culinary Staple**: Used globally across countless breakfast, lunch, and dinner recipe combinations.
3. **Versatility**: Easily prepared via steaming, boiling, baking, frying, or sautéing.
`;

    const recipes = AIService.getDynamicRecipesForIngredients(matchedNames);

    return { detectedItems, insights, recipes };
  }

  public static generateResourceLinks(objectName: string): ResourceLink[] {
    const query = encodeURIComponent(objectName);
    return [
      { name: '🔹 Wikipedia', url: `https://en.wikipedia.org/wiki/${query}` },
      { name: '🎥 YouTube Tutorials', url: `https://www.youtube.com/results?search_query=${query}+uses+or+recipes` },
      { name: '🍽️ Google Recipes', url: `https://www.google.com/search?q=${query}+recipes` },
      { name: '🛒 Amazon Products', url: `https://www.amazon.in/s?k=${query}` }
    ];
  }

  public static async detectObjectAndInsights(
    imageBuffer: Buffer,
    filename: string,
    language?: string
  ): Promise<UnifiedDetectionResult> {
    const apiKey = process.env.GEMINI_API_KEY || '';

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return this.getMockResult(filename);
    }

    try {
      const base64Image = imageBuffer.toString('base64');
      const detectUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const promptText = `
        You are an expert food vision AI.
        Your primary responsibility is to perform high-accuracy object detection and ingredient recognition on the uploaded image.
        
        CRITICAL DETAILED INSTRUCTIONS:
        0. IMPORTANT: Return all text content, including recipe titles, descriptions, instructions, FAQs, tips, storage instructions, and serving suggestions, in the following language: ${language || 'English'}.
        1. Support extensive recognition across thousands of food categories including: Vegetables, Fruits, Leafy greens, Herbs, Spices, Grains, Cereals, Pulses, Dairy, Meats, Poultry, Seafood, Eggs, Bakery, Snacks, Packaged food, Sauces, Oils, Condiments, and Cooked Dishes.
        2. Perform multi-object detection: Identify EVERY visible ingredient and item independently.
        3. Be extremely precise and distinguish carefully between similar-looking ingredients:
           - Onion vs. Shallot
           - Garlic vs. Ginger
           - Coriander vs. Parsley
           - Cabbage vs. Lettuce
           - Spinach vs. Mint
           - Lemon vs. Lime
           - Tomato vs. Apple
        4. Detect overlapping, occluded, partially visible, or rotated ingredients.
        5. Map each detected ingredient to a standard category: "Vegetables", "Fruits", "Herbs", "Spices", "Dairy", "Meat", "Seafood", "Grains", "Pulses", "Snacks", "Bakery", "Beverages", "Condiments", "Packaged Foods", "Kitchen Essentials", or "Cooked Dishes".
        6. Deduplicate detections to output unique items only. Assign confidence scores (0-100).
        7. Provide dynamic recipe suggestions based strictly on the combined inventory of detected items.
        8. Do not invent recipes or guess names if not highly confident. Allow the user to validate.
        9. Never return recipes that have ingredients not present in the image unless they are listed under "additionalIngredients".

        Return ONLY a valid JSON object matching the following structure (do not wrap in markdown or backticks):
        {
          "detectedItems": [
            {
              "name": "Eggs",
              "confidence": 99,
              "category": "Protein",
              "quantity": "Approximately 24 eggs",
              "freshness": "Fresh",
              "color": "Brown",
              "status": "Successfully Detected"
            }
          ],
          "insights": "Markdown format string containing cool facts or details about the detected items",
          "recipes": [
            {
              "title": "Omelette",
              "description": "Short description of the recipe",
              "cookTime": 10,
              "prepTime": 5,
              "difficulty": "Easy",
              "cuisine": "French",
              "ingredients": ["3 eggs", "salt", "butter"],
              "instructions": ["Whisk eggs in a bowl.", "Melt butter in a pan.", "Pour eggs and cook."],
              "calories": 250,
              "protein": 18,
              "carbs": 2,
              "fat": 18,
              "faqs": [{"q": "Can I add cheese?", "a": "Yes, sprinkle cheese right before folding."}],
              "tips": ["Cook over low heat for a soft texture."],
              "servings": 2,
              "additionalIngredients": ["salt", "butter", "black pepper"],
              "storageInstructions": "Best enjoyed immediately. Do not store cooked omelettes.",
              "servingSuggestions": "Serve hot with toast and a fresh side salad.",
              "mealType": "Breakfast",
              "rating": 4.9,
              "confidence": 99.0,
              "nutritionTable": {
                "calories": 250,
                "protein": 18,
                "carbohydrates": 2,
                "fat": 18,
                "fiber": 1.0,
                "sugar": 0.5,
                "cholesterol": 375,
                "sodium": 210,
                "potassium": 130,
                "vitaminA": 8,
                "vitaminC": 0,
                "calcium": 4,
                "iron": 6
              }
            }
          ]
        }
      `;

      let mimeType = 'image/jpeg';
      const fileLower = filename.toLowerCase();
      if (fileLower.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileLower.endsWith('.webp')) {
        mimeType = 'image/webp';
      } else if (fileLower.endsWith('.gif')) {
        mimeType = 'image/gif';
      }

      const response = await axios.post(
        detectUrl,
        {
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                  }
                }
              ]
            }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 25000
        }
      );

      let text = response.data.candidates[0].content.parts[0].text.trim();
      
      if (text.startsWith('```json')) {
        text = text.substring(7, text.lastIndexOf('```')).trim();
      } else if (text.startsWith('```')) {
        text = text.substring(3, text.lastIndexOf('```')).trim();
      }

      return JSON.parse(text) as UnifiedDetectionResult;
    } catch (error) {
      console.error('Gemini API call failed, falling back to mock results:', error);
      return this.getMockResult(filename);
    }
  }

  public static async generateRecipeFromIngredients(ingredients: string[]): Promise<GeneratedRecipe> {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const fallbackRecipes = AIService.getDynamicRecipesForIngredients(ingredients);
    const fallbackRecipe = fallbackRecipes[0] || fallbackRecipes[fallbackRecipes.length - 1];

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return fallbackRecipe;
    }

    try {
      const detectUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const promptText = `
        Generate a cooking recipe using some or all of the following ingredients: ${ingredients.join(', ')}.
        Return ONLY a valid JSON object matching the following structure (do not wrap in markdown or backticks):
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
      `;

      const response = await axios.post(
        detectUrl,
        {
          contents: [
            {
              parts: [{ text: promptText }]
            }
          ]
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

      return JSON.parse(text) as GeneratedRecipe;
    } catch (error) {
      console.error('Error generating AI recipe, returning fallback:', error);
      return fallbackRecipe;
    }
  }
}
