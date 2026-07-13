import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db';
import { ArrowLeft, Calendar, User, Clock, BookOpen } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const article = await prisma.blogArticle.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} - Smart Recipe Blog`,
    description: article.summary,
    alternates: {
      canonical: `http://localhost:3000/blog/${article.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const article = await prisma.blogArticle.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Navigation Breadcrumbs */}
        <nav className="text-zinc-500 text-xs flex items-center gap-2">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-white font-semibold truncate">{article.title}</span>
        </nav>

        {/* Action Header */}
        <div className="border-b border-zinc-800 pb-6">
          <Link href="/blog" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Blog List
          </Link>
        </div>

        {/* Title and Metadata */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-zinc-400 border-y border-zinc-800/80 py-3">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" /> {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" /> {new Date(article.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" /> 5 Min Read
            </span>
          </div>
        </div>

        {/* Article Body */}
        <article className="prose prose-invert prose-indigo text-zinc-300 max-w-none space-y-4">
          {article.content.split('\n').map((line, idx) => {
            if (line.startsWith('# ')) {
              return null; // Skip title as we outputted it above
            }
            if (line.startsWith('## ')) {
              return <h2 key={idx} className="text-xl font-bold text-white mt-6 mb-2 border-b border-zinc-800 pb-1">{line.substring(3)}</h2>;
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return <li key={idx} className="ml-6 list-disc my-1.5">{line.substring(2)}</li>;
            }
            if (line.match(/^\d+\./)) {
              return <div key={idx} className="pl-6 my-2 text-zinc-300"><strong className="text-white">{line.match(/^\d+\./)?.[0]}</strong> {line.replace(/^\d+\.\s*/, '')}</div>;
            }
            return line.trim() ? <p key={idx} className="text-sm leading-relaxed my-2">{line}</p> : null;
          })}
        </article>
      </div>
    </div>
  );
}
