'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Play, PlayCircle, Loader2, ExternalLink, X, Search, Globe, Video } from 'lucide-react';

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  duration: string;
  viewCount: string;
  uploadDate: string;
}

interface GoogleResult {
  title: string;
  link: string;
  snippet: string;
  sourceName: string;
  favicon: string;
}

interface Props {
  recipeTitle: string;
}

export default function YouTubeIntegration({ recipeTitle }: Props) {
  const [activeTab, setActiveTab] = useState<'youtube' | 'google'>('youtube');
  
  // Loading and State management
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Lists
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [searchResults, setSearchResults] = useState<GoogleResult[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for quick responsive rendering
      const [ytRes, googleRes] = await Promise.all([
        axios.get(`/api/youtube/search?query=${encodeURIComponent(recipeTitle)}`),
        axios.get(`/api/google/search?query=${encodeURIComponent(recipeTitle)}`)
      ]);
      
      setVideos(ytRes.data);
      setSearchResults(googleRes.data);
      setIsOpen(true);
    } catch (err) {
      console.error('Error loading search integration data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenYouTubeSearch = () => {
    // Standardize title and clean common prefix words
    const cleanTitle = recipeTitle
      .replace(/(easy|classic|savory|traditional|best|quick|healthy)/gi, '')
      .trim();
    const query = `${cleanTitle} Recipe`;
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
  };

  const handleOpenGoogleSearch = () => {
    const cleanTitle = recipeTitle
      .replace(/(easy|classic|savory|traditional|best|quick|healthy)/gi, '')
      .trim();
    const query = `${cleanTitle} Recipe`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  React.useEffect(() => {
    if (recipeTitle) {
      Promise.resolve().then(() => {
        setActiveVideoId(null);
      });
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeTitle]);

  return (
    <div className="space-y-4">
      {/* Visual Action Button Triggers */}
      {!isOpen && (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            suppressHydrationWarning
            onClick={loadData}
            disabled={loading}
            className="flex flex-1 items-center gap-2.5 px-6 py-4.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-wide shadow-lg shadow-red-600/20 transition-all justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Video className="w-5 h-5" /> Watch Recipe Videos
              </>
            )}
          </button>

          <button
            suppressHydrationWarning
            onClick={handleOpenYouTubeSearch}
            className="flex flex-1 items-center gap-2.5 px-6 py-4.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-red-500 hover:text-red-400 font-black text-sm tracking-wide shadow-lg transition-all justify-center cursor-pointer"
          >
            <Video className="w-5 h-5 text-red-500" /> More Recipe Videos
          </button>

          <button
            suppressHydrationWarning
            onClick={handleOpenGoogleSearch}
            className="flex flex-1 items-center gap-2.5 px-6 py-4.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-indigo-400 hover:text-indigo-300 font-black text-sm tracking-wide shadow-lg transition-all justify-center cursor-pointer"
          >
            <Globe className="w-5 h-5 text-indigo-400" /> Google Resources
          </button>

          <button
            suppressHydrationWarning
            onClick={loadData}
            disabled={loading}
            className="flex flex-1 items-center gap-2.5 px-6 py-4.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 font-black text-sm tracking-wide shadow-lg transition-all justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 text-indigo-400" /> Search Recipe on Google
              </>
            )}
          </button>
        </div>
      )}

      {/* Embedded Panel */}
      {isOpen && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
            <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-850 self-start">
              <button
                onClick={() => setActiveTab('youtube')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'youtube'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Video Tutorials
              </button>
              <button
                onClick={() => setActiveTab('google')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'google'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Google Resources
              </button>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={handleOpenYouTubeSearch}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-black border border-red-500/20 transition-all cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" /> More Recipe Videos
              </button>

              <button
                onClick={handleOpenGoogleSearch}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-black border border-indigo-500/20 transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" /> Google Resources
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setActiveVideoId(null);
                }}
                className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* YouTube Video Section */}
          {activeTab === 'youtube' && (
            <div className="space-y-6">
              {/* Embedded Player */}
              {activeVideoId && (
                <div className="space-y-2">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-zinc-850 bg-black relative shadow-2xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      Open on YouTube <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Videos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <div
                    key={video.videoId}
                    onClick={() => setActiveVideoId(video.videoId)}
                    className={`group border rounded-2xl bg-zinc-950 p-3 cursor-pointer transition-all hover:border-zinc-700 ${
                      activeVideoId === video.videoId ? 'border-indigo-500' : 'border-zinc-800/80'
                    }`}
                  >
                    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-850 mb-3 relative">
                      <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <PlayCircle className="w-10 h-10 text-white fill-black/20" />
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-black/85 text-zinc-100 rounded">
                        {video.duration}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {video.title}
                      </h4>
                      <div className="flex flex-col text-[10px] text-zinc-500 font-semibold">
                        <span>{video.channelName}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span>{video.viewCount}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                          <span>{video.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Search Resources Section */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((result, idx) => (
                  <a
                    key={idx}
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-md flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Brand Info */}
                      <div className="flex items-center gap-2 text-[10px] tracking-widest text-zinc-500 font-bold">
                        <img src={result.favicon} alt="" className="w-4.5 h-4.5 rounded bg-zinc-900 object-contain" onError={(e)=>{(e.target as HTMLImageElement).src='https://www.google.com/favicon.ico'}} />
                        <span>{result.sourceName}</span>
                      </div>

                      {/* Snippet Details */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {result.title}
                        </h4>
                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                          {result.snippet}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-900 mt-4">
                      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 group-hover:text-white transition-colors font-bold uppercase tracking-wider">
                        Read Guide <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
