'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/store/toastStore';
import { useThemeStore } from '@/store/themeStore';
import api from '@/lib/api';
import {
  Camera,
  UploadCloud,
  Loader2,
  History,
  Trash2,
  ExternalLink,
  Sun,
  Moon,
  Sparkles,
  Info,
  BookOpen,
  ShoppingBag,
  Search,
  ChevronRight,
  Plus,
  X,
  ChefHat,
  Clock,
  UtensilsCrossed,
  Layers,
  Zap,
  TrendingUp,
  Cpu,
  HelpCircle,
  Activity,
  Heart
} from 'lucide-react';
import YouTubeIntegration from './recipes/[slug]/YouTubeIntegration';
import { useTranslation, LANGUAGES } from '@/components/LanguageContext';

interface ResourceLink {
  name: string;
  url: string;
}

interface DetectedItemDetail {
  name: string;
  confidence: number;
  category: string;
  quantity: string;
  freshness: string;
  color: string;
  status: string;
}

interface DetectionResult {
  id: number;
  detected_object: string;
  isLowConfidence?: boolean;
  detectedItems?: DetectedItemDetail[];
  ai_insights: string;
  resource_links: ResourceLink[];
  image_url: string;
  created_at: string;
}

interface HistoryItem {
  id: number;
  detected_object: string;
  image_url: string;
  created_at: string;
}

export default function HomePage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const { theme, toggleTheme } = useThemeStore();
  const { currentLang, setLanguage, t, isRtl, speakText, stopSpeaking, startVoiceListening, isListening } = useTranslation();

  // Mount status to suppress hydration warning
  const [mounted, setMounted] = useState(false);

  // Ingredient list builder state
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');

  // Vision detection states
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visionResult, setVisionResult] = useState<DetectionResult | null>(null);

  // Recommendations state
  const [isRecommending, setIsRecommending] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<any | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'detector' | 'history'>('detector');

  // Dynamic Scoring and Ranking algorithm
  const rankedRecipes = React.useMemo(() => {
    if (!recipes || recipes.length === 0) return [];
    
    return recipes.map((recipe: any) => {
      // Parse recipe ingredients array
      const recipeIngs: string[] = Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : JSON.parse(recipe.ingredients || '[]');

      // Normalize inventory ingredients for matching
      const normalizedInventory = ingredients.map(i => i.toLowerCase());

      // Calculate matches
      const matched: string[] = [];
      const missing: string[] = [];

      recipeIngs.forEach((ingStr: string) => {
        const lower = ingStr.toLowerCase();
        // Check if any inventory ingredient is a substring of the recipe ingredient
        const isMatched = normalizedInventory.some(inv => lower.includes(inv));
        if (isMatched) {
          matched.push(ingStr);
        } else {
          missing.push(ingStr);
        }
      });

      const totalIngs = recipeIngs.length || 1;
      const matchScore = Math.round((matched.length / totalIngs) * 100);

      // Extract quantities from ingredients
      return {
        ...recipe,
        matchScore,
        matchedIngredients: matched,
        missingIngredients: missing,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [recipes, ingredients]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const SUGGESTED_INGREDIENTS = ['Tomato', 'Onion', 'Garlic', 'Potato', 'Spinach', 'Paneer', 'Chicken', 'Egg', 'Rice', 'Milk'];

  const POPULAR_SEARCHES = [
    'AI Recipe Generator', 'Recipe Generator from Image', 'Food Image Recognition', 'Ingredient Detector',
    'Smart Recipe Finder', 'AI Cooking Assistant', 'Refrigerator Recipe Generator', 'Leftover Food Recipe Generator',
    'Healthy Recipe Generator', 'AI Meal Planner', 'Recipe Finder by Ingredients', 'AI Food Scanner',
    'Nutrition Calculator', 'Cooking Assistant AI'
  ];

  const fetchHistory = async () => {
    try {
      const res = await api.get('/detections/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchHistory();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['jpg', 'jpeg', 'png'].includes(ext)) {
      addToast('Invalid format. JPG, JPEG or PNG only.', 'error');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setVisionResult(null);
    setAiRecipe(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('language', currentLang);

    try {
      const res = await api.post('/detections/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVisionResult(res.data);
      
      if (res.data.isLowConfidence) {
        addToast("We couldn't confidently identify this image. Please upload a clearer image.", 'error');
        setRecipes([]);
      } else {
        const detected = res.data.detectedItems || [];
        const names = detected.map((d: any) => d.name);
        setIngredients((prev) => {
          const combined = [...prev, ...names];
          // Remove duplicates case-insensitively while preserving capitalizations
          const seen = new Set();
          return combined.filter((item) => {
            const lower = item.toLowerCase();
            if (seen.has(lower)) return false;
            seen.add(lower);
            return true;
          });
        });
        setRecipes(res.data.recipes || []);
        addToast(`Successfully identified: ${names.join(', ')}!`, 'success');
      }
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Vision analysis failed.';
      addToast(detail, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddIngredient = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (ingredients.includes(clean)) {
      addToast('Ingredient already added!', 'info');
      return;
    }
    setIngredients((prev) => [...prev, clean]);
    setNewIngredient('');
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGetRecommendations = async () => {
    if (ingredients.length === 0) {
      addToast('Please add at least one ingredient.', 'error');
      return;
    }

    setIsRecommending(true);
    try {
      const res = await api.post('/recipes/recommend', { ingredients, language: currentLang });
      if (Array.isArray(res.data)) {
        setRecipes(res.data);
        addToast(`Successfully generated ${res.data.length} recipes!`, 'success');
      } else {
        setRecipes([res.data]);
        addToast(`Generated Recipe: ${res.data.title}!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to recommend recipes.';
      addToast(detail, 'error');
    } finally {
      setIsRecommending(false);
    }
  };

  const deleteHistoryItem = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/detections/history/${id}`);
      setHistory(history.filter((item) => item.id !== id));
      addToast('History item deleted', 'success');
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-full bg-zinc-950 items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      {/* Premium Gradient Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blob-indigo"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blob-purple"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/20 backdrop-blur-md flex flex-col justify-between p-4 flex-shrink-0 animate-slide-in-left z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/25 text-indigo-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide block">GourmetAI</span>
              <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-black">Next-Gen SaaS</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('detector')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                activeTab === 'detector'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white border border-transparent hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-4.5 h-4.5" />
                <span>Recipe Engine</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white border border-transparent hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="w-4.5 h-4.5" />
                <span>Detection History</span>
              </div>
              <span className="bg-zinc-950 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/25 font-black">
                {history.length}
              </span>
            </button>

            <Link
              href="/blog"
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide text-zinc-400 hover:bg-zinc-900/60 hover:text-white border border-transparent hover:border-zinc-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4.5 h-4.5" />
                <span>Cooking Blog</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex-1 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col bg-transparent overflow-y-auto relative z-10">
        {/* Floating Glass Header */}
        <header className="h-18 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/20 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-wider">{activeTab} Console</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Smart Object-Based Recipe Recommender</p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Multilingual Selector Dropdown */}
            <select
              value={currentLang}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:border-zinc-700 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>

            <span className="text-[10px] font-black tracking-widest uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse-slow">
              <Sparkles className="w-3.5 h-3.5" /> API Active
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-6xl w-full mx-auto space-y-8">
          {activeTab === 'detector' && (
            <div className="space-y-8">
              {/* Premium Hero Section */}
              <div className="glass-panel rounded-3xl p-8 text-center space-y-4 hover-glow animate-slide-up relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-600/10 rounded-full filter blur-xl"></div>
                
                <ChefHat className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {t('generateSmartRecipes')}
                </h1>
                <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
                  Upload a photo of your ingredients, refrigerator, vegetables, fruits, or cooked food, and let AI instantly detect ingredients, generate personalized recipes, provide nutrition information, suggest ingredient substitutions, and recommend the best YouTube cooking videos and trusted recipe guides.
                </p>
              </div>

              {/* Partner/Sponsor Resources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
                <a
                  href="https://www.effectivecpmnetwork.com/cy6kqza0?key=da63ef5ed9dd1f39cf2d3a87de42e253"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 text-xs font-black tracking-wide shadow-md transition-all text-center cursor-pointer hover-glow"
                >
                  🚀 Featured Offer 1
                </a>
                <a
                  href="https://www.effectivecpmnetwork.com/hgz53fwb?key=604f09908fc20874955621b88a9c8ca6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 text-xs font-black tracking-wide shadow-md transition-all text-center cursor-pointer hover-glow"
                >
                  🔥 Popular Cooking Deal
                </a>
                <a
                  href="https://www.effectivecpmnetwork.com/x946vg2zs4?key=247400cdfbed66491d3f84b3f3652bc6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 text-xs font-black tracking-wide shadow-md transition-all text-center cursor-pointer hover-glow"
                >
                  ⚡ Premium Recipe Guide
                </a>
                <a
                  href="https://www.effectivecpmnetwork.com/y64k0hg8e?key=b6e031570e1ac4dcce264194b1bf0101"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 text-xs font-black tracking-wide shadow-md transition-all text-center cursor-pointer hover-glow"
                >
                  🎁 Exclusive Cooking Gift
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Visual Vision Uploader */}
                <div className="lg:col-span-5 space-y-6 animate-slide-up">
                  <div className="glass-panel rounded-3xl p-6 space-y-6 hover-glow relative overflow-hidden">
                    <h3 className="text-xs uppercase font-black tracking-widest text-zinc-400">{t('scanning')}</h3>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[180px] relative ${
                        dragActive ? 'border-indigo-500 bg-indigo-600/5' : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700 animate-pulse-slow'
                      }`}
                    >
                      {isProcessing && <div className="scanner-line"></div>}

                      <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
                      <p className="text-xs font-semibold text-zinc-300">Drag or click to upload photo</p>
                      <span className="mt-3 px-3 py-1.5 text-[9px] font-black tracking-widest uppercase bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-850">
                        Upload Food Image
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs font-bold tracking-wide hover:bg-zinc-800 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-indigo-400" /> Use Camera
                      </button>

                      {selectedFile && (
                        <button
                          onClick={handleAnalyze}
                          disabled={isProcessing}
                          className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold tracking-wide hover:bg-indigo-500 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 animate-pulse-slow"
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Generate AI Recipe</>}
                        </button>
                      )}
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="glass-panel rounded-3xl p-4 shadow-xl hover-glow overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-2xl border border-zinc-850 max-h-[220px] object-cover card-zoom" />
                    </div>
                  )}
                </div>

                {/* Manual List builder and Engine request */}
                <div className="lg:col-span-7 space-y-6 animate-slide-up">
                  {/* Dynamic Ingredient Selection List */}
                  <div className="glass-panel rounded-3xl p-6 space-y-6 hover-glow">
                    <h3 className="text-xs uppercase font-black tracking-widest text-zinc-400 flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-indigo-400" /> {t('availableIngredients')}
                    </h3>

                    {/* Manual entry */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type ingredient (e.g. Potato)..."
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient(newIngredient)}
                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/40 py-3 px-4 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none transition-all"
                      />
                      <button
                        onClick={() => handleAddIngredient(newIngredient)}
                        className="p-3 bg-zinc-900/60 hover:bg-zinc-800 text-white border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Suggestion Chips */}
                    <div className="space-y-2.5">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Try Sample Image</span>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_INGREDIENTS.map((ing) => (
                          <button
                            key={ing}
                            onClick={() => handleAddIngredient(ing)}
                            className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-850 rounded-lg hover:border-zinc-700 hover:text-white transition-all font-medium text-zinc-400 hover-glow cursor-pointer"
                          >
                            + {ing}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Added Ingredients tags list */}
                    <div className="space-y-2.5 pt-4 border-t border-zinc-900">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Your Inventory ({ingredients.length})</span>
                        {ingredients.length > 0 && (
                          <button onClick={() => setIngredients([])} className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider cursor-pointer">
                            Clear all
                          </button>
                        )}
                      </div>

                      {ingredients.length === 0 ? (
                        <div className="text-center py-6 text-zinc-500 text-xs font-semibold">
                          No items added yet. Use manual inputs or scanner tools.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {ingredients.map((ing, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-xl hover-glow"
                            >
                              {ing}
                              <button onClick={() => handleRemoveIngredient(idx)} className="text-indigo-400 hover:text-indigo-300 cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recommendation request trigger button */}
                    {ingredients.length > 0 && (
                      <button
                        onClick={handleGetRecommendations}
                        disabled={isRecommending}
                        className="flex w-full items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 text-white text-xs font-black tracking-widest uppercase hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 animate-pulse-slow cursor-pointer"
                      >
                        {isRecommending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Generate Smart Recipes</>}
                      </button>
                    )}
                  </div>

                  {/* Step 5: Confidence Validation Warning */}
                  {visionResult && visionResult.isLowConfidence && (
                    <div className="glass-panel rounded-3xl p-6 border-rose-500/25 bg-rose-500/5 text-rose-200 hover-glow">
                      <p className="text-sm font-semibold text-center leading-relaxed">
                        We couldn't confidently identify this image. Please upload a clearer image.
                      </p>
                    </div>
                  )}

                  {/* Step 2: Display Detected Objects */}
                  {visionResult && !visionResult.isLowConfidence && visionResult.detectedItems && (
                    <div className="glass-panel rounded-3xl p-6 space-y-4 hover-glow">
                      <h3 className="text-xs uppercase font-black tracking-widest text-zinc-400">
                        Detected Items
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {visionResult.detectedItems.map((item: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white text-sm">{item.name} ({item.confidence}%)</span>
                              <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{item.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 font-medium">
                              <div><span className="text-zinc-400">Category:</span> {item.category}</div>
                              <div><span className="text-zinc-400">Count:</span> {item.quantity}</div>
                              <div><span className="text-zinc-400">Freshness:</span> {item.freshness}</div>
                              <div><span className="text-zinc-400">Color:</span> {item.color}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Recommended Recipes list */}
                  {rankedRecipes && rankedRecipes.length > 0 && (
                    <div className="glass-panel rounded-3xl p-6 space-y-4 hover-glow">
                      <h3 className="text-xs uppercase font-black tracking-widest text-zinc-400">
                        Recommended Recipes
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {rankedRecipes.map((recipe: any, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => router.push(`/recipes/${recipe.slug}`)}
                            className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 hover:border-indigo-500/50 transition-all cursor-pointer space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-white text-sm hover:text-indigo-400 transition-colors leading-snug">{recipe.title}</h4>
                              <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {recipe.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{recipe.description}</p>
                            
                            {/* Matches & Missing Ingredient Checklist */}
                            <div className="space-y-1.5 pt-2 border-t border-zinc-900 text-[9px] font-semibold">
                              {recipe.matchedIngredients.length > 0 && (
                                <div className="text-emerald-400 truncate">
                                  ✔ Used: {recipe.matchedIngredients.join(', ')}
                                </div>
                              )}
                              {recipe.missingIngredients.length > 0 && (
                                <div className="text-amber-400 truncate">
                                  • Missing: {recipe.missingIngredients.join(', ')}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-3 text-[9px] text-zinc-400 uppercase font-black tracking-wider pt-2 border-t border-zinc-900">
                              <span>⏱️ {recipe.prepTime + recipe.cookTime} Min</span>
                              <span>🔥 {recipe.calories} kcal</span>
                              <span>💪 {recipe.difficulty}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* WHY CHOOSE SEO SECTION */}
              <div className="glass-panel rounded-3xl p-8 space-y-6 hover-glow animate-slide-up">
                <h3 className="text-xl font-black text-white tracking-tight">Why Choose Our AI Recipe Generator?</h3>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-4xl">
                  Our AI-powered recipe generator transforms your uploaded food images into delicious recipes within seconds. Whether you have vegetables, fruits, spices, leftovers, or a full refrigerator, our intelligent system detects ingredients and recommends the best recipes while providing cooking videos, nutrition facts, and trusted recipe resources.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-900">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI-powered Food Recognition</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Instantly identifies dishes and raw ingredients inside uploaded photos.</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-indigo-400" /> Smart Ingredient Detection</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Confidence-scored parsing of refrigerator items and groceries.</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-indigo-400" /> Personalized Recipe Generation</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Intelligently selects the best cooking guides for your catalog.</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-indigo-400" /> Nutrition Analysis</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Calculates calories, protein, and macros automatically.</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Video Tutorials</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Recommends YouTube cooking guides directly inside the platform.</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-indigo-400" /> Diet Specifics</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Supports vegan, vegetarian, high-protein, and calorie parameters.</p>
                  </div>
                </div>
              </div>

              {/* HOW IT WORKS SECTION */}
              <div className="glass-panel rounded-3xl p-8 space-y-6 hover-glow animate-slide-up">
                <h3 className="text-xl font-black text-white tracking-tight">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                    <span className="text-[10px] font-black text-indigo-400 tracking-wider block">STEP 1</span>
                    <h5 className="font-bold text-white text-xs">Upload Photo</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Upload a photo of your food, ingredients, or refrigerator.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                    <span className="text-[10px] font-black text-indigo-400 tracking-wider block">STEP 2</span>
                    <h5 className="font-bold text-white text-xs">AI Ingredient Detection</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Our AI analyzes the image and detects all visible ingredients.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                    <span className="text-[10px] font-black text-indigo-400 tracking-wider block">STEP 3</span>
                    <h5 className="font-bold text-white text-xs">Recipe Generation</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">The AI generates personalized recipes based on the detected ingredients.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                    <span className="text-[10px] font-black text-indigo-400 tracking-wider block">STEP 4</span>
                    <h5 className="font-bold text-white text-xs">Video & Guides</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Watch recommended YouTube videos and explore recipe websites.</p>
                  </div>
                </div>
              </div>

              {/* POPULAR SEARCHES */}
              <div className="glass-panel rounded-3xl p-8 space-y-4 hover-glow animate-slide-up">
                <h3 className="text-xs uppercase font-black tracking-widest text-zinc-400 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-indigo-400" /> Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleAddIngredient(search.replace(' Generator', '').replace(' AI', ''))}
                      className="px-3.5 py-2 text-xs font-bold bg-zinc-950 border border-zinc-850 text-zinc-400 rounded-xl hover:border-zinc-700 hover:text-white transition-colors cursor-pointer"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="glass-panel rounded-3xl p-8 space-y-6 hover-glow animate-slide-up">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2"><HelpCircle className="w-5 h-5 text-indigo-400" /> Frequently Asked Questions</h3>
                <div className="space-y-4 divide-y divide-zinc-900">
                  <div className="pt-0">
                    <h5 className="font-bold text-white text-xs">Can AI identify food from an image?</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">Yes. Our AI analyzes uploaded food images to detect ingredients and identify dishes with high accuracy.</p>
                  </div>
                  <div className="pt-4">
                    <h5 className="font-bold text-white text-xs">Can I generate recipes from available ingredients?</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">Yes. Upload a picture of your available ingredients, and AI will recommend recipes you can prepare.</p>
                  </div>
                  <div className="pt-4">
                    <h5 className="font-bold text-white text-xs">Does the application recommend YouTube cooking videos?</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">Yes. Every generated recipe includes relevant YouTube cooking tutorials.</p>
                  </div>
                  <div className="pt-4">
                    <h5 className="font-bold text-white text-xs">Does it provide nutrition information?</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">Yes. Each recipe includes estimated calories, protein, carbohydrates, fat, fiber, and other nutritional details.</p>
                  </div>
                  <div className="pt-4">
                    <h5 className="font-bold text-white text-xs">Can I use it for healthy meal planning?</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">Absolutely. AI can recommend healthy, vegetarian, vegan, high-protein, low-calorie, and diet-specific recipes.</p>
                  </div>
                </div>
              </div>

              {/* Footer Content */}
              <footer className="border-t border-zinc-900 pt-8 text-center text-[10px] text-zinc-500 leading-relaxed max-w-3xl mx-auto space-y-2">
                <p>
                  Discover smarter cooking with AI. Upload food images, detect ingredients, generate personalized recipes, explore cooking videos, learn from trusted recipe websites, and enjoy delicious meals every day with your intelligent cooking assistant.
                </p>
                <p className="font-black text-zinc-650 tracking-wider">
                  © 2026 GOURMETAI SAAS PLATFORM. ALL RIGHTS RESERVED.
                </p>
              </footer>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="glass-panel rounded-3xl p-8 space-y-6 animate-slide-up">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Saved Detection History</h2>
                <p className="text-sm text-zinc-400 font-medium">Review fridge and ingredient photos analyzed in the past.</p>
              </div>

              {historyLoading ? (
                <div className="flex py-12 justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
                  <History className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-zinc-400">No scanner history</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition-all hover:border-zinc-700 hover:shadow-lg hover-glow"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/80 mb-3 overflow-hidden">
                        <img src={item.image_url} alt={item.detected_object} className="h-full w-full object-cover card-zoom" />
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white text-base">{item.detected_object}</h4>
                          <span className="text-[10px] text-zinc-500 font-semibold block mt-1">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <button
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-950/20 text-zinc-500 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
