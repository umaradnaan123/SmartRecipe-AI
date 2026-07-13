import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { BookOpen, Calendar, User, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const SEED_ARTICLES = [
  {
    slug: 'ultimate-guide-to-meal-prep',
    title: 'The Ultimate Guide to Meal Prep for Busy Professionals',
    summary: 'Discover how to save hours in the kitchen and eat healthy all week with our structured meal prepping guidelines.',
    author: 'Chef Alex',
    content: `
# The Ultimate Guide to Meal Prep for Busy Professionals

Meal prepping is one of the most effective ways to save time, reduce stress, and maintain a healthy diet. By dedicating a few hours over the weekend to plan and cook, you can set yourself up for a week of delicious, home-cooked meals.

## Why Meal Prep?
1. **Saves Money**: Buying ingredients in bulk and reducing takeout orders will significantly cut your food budget.
2. **Saves Time**: Instead of cooking every single night, you only cook once or twice a week.
3. **Controls Portions**: Pre-packing meals helps you stay on track with nutritional goals.

## Step-by-Step Meal Prep Plan
- **Plan your menu**: Choose recipes that share common ingredients to simplify shopping.
- **Invest in good containers**: Use BPA-free, leakproof, airtight glass containers.
- **Batch cook**: Roast a large tray of vegetables and cook bulk grains (like quinoa or brown rice) and proteins.
    `,
  },
  {
    slug: 'top-healthy-kitchen-hacks',
    title: '10 Healthy Kitchen Hacks That Will Save You Time',
    summary: 'Improve your culinary speed and nutrient intake with these smart kitchen optimization tips.',
    author: 'Sarah Jenkins',
    content: `
# 10 Healthy Kitchen Hacks That Will Save You Time

Making healthy meals doesn't have to be a slow or grueling process. Here are ten practical kitchen hacks to optimize your workflow:

1. **Prep vegetables immediately**: Wash, chop, and store your greens as soon as you get home from the market.
2. **Freeze fresh herbs in olive oil**: Pour oil over chopped herbs in ice cube trays for instant cooking bases.
3. **Use yogurt as a sour cream substitute**: Lower fat and increase protein instantly.
4. **Toast your grains**: Toasting oats or rice for 2 minutes before cooking adds immense nutty flavor.
    `,
  },
];

async function ensureSeededArticles() {
  const count = await prisma.blogArticle.count();
  if (count === 0) {
    for (const article of SEED_ARTICLES) {
      await prisma.blogArticle.create({
        data: article,
      });
    }
  }
}

export default async function BlogIndexPage() {
  await ensureSeededArticles();
  const articles = await prisma.blogArticle.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-semibold bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Healthy Living Blog
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Culinary Guides & Meal Planning
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Explore recipes, substitute ingredients, meal preps, and food storage hacks designed to make your home cooking experience simple and healthy.
          </p>
        </div>

        {/* Article Grid */}
        <div className="space-y-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl transition-all shadow-xl space-y-4 group"
            >
              <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {article.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(article.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {article.title}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/blog/${article.slug}`}
                  className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-sm hover:text-indigo-300 transition-all"
                >
                  Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
