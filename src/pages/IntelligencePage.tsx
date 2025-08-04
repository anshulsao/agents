import React from 'react';
import { Bot, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const IntelligencePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background-secondary text-text-primary font-sans relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }} />

      <Header />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-6xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-surface/80 backdrop-blur-sm border border-border/50 rounded-full text-sm text-text-secondary mb-8">
            Stop Fighting Your Infrastructure
          </div>
          
          {/* Hero Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
            AI Agents That{' '}
            <span className="text-gradient bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent">
              Actually Fix
            </span>
            <br />
            Your DevOps Nightmares
          </h1>
          
          {/* Hero Subtitle */}
          <p className="text-xl md:text-2xl text-text-tertiary mb-16 leading-relaxed max-w-4xl mx-auto">
            No more 3am debugging, cryptic error messages, or deployment panic. Get
            <br />
            instant expert guidance for every infrastructure challenge.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Kubernetes Expert Card */}
            <div className="group bg-surface/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-left hover:bg-surface/80 hover:border-border-light transition-all duration-300 hover:shadow-glow">
              <div className="p-3 bg-accent/20 rounded-xl w-fit mb-6">
                <Bot className="h-8 w-8 text-accent" />
              </div>
              
              <h3 className="text-2xl font-bold text-text-primary mb-4">
                Kubernetes Expert
              </h3>
              
              <p className="text-text-secondary mb-8 leading-relaxed text-lg">
                Get instant root cause analysis, confident fixes, and proactive 
                recommendations that turn Kubernetes confusion into smooth 
                deployments.
              </p>
              
              <Link 
                to="/?agent=kubernetes-expert"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-soft hover:shadow-medium group-hover:shadow-glow"
              >
                <Bot className="h-5 w-5" />
                Try Now
              </Link>
            </div>

            {/* Module Builder Card */}
            <div className="group bg-surface/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-left hover:bg-surface/80 hover:border-border-light transition-all duration-300">
              <div className="p-3 bg-text-muted/20 rounded-xl w-fit mb-6">
                <Package className="h-8 w-8 text-text-muted" />
              </div>
              
              <h3 className="text-2xl font-bold text-text-primary mb-4">
                Module Builder
              </h3>
              
              <p className="text-text-secondary mb-8 leading-relaxed text-lg">
                Describe what you need and get production-ready modules 
                generated instantly, complete with best practices baked in.
              </p>
              
              <button 
                disabled
                className="inline-flex items-center gap-2 bg-surface hover:bg-surface-hover text-text-muted font-semibold px-6 py-3 rounded-xl transition-all duration-200 cursor-not-allowed opacity-60"
              >
                <Package className="h-5 w-5" />
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background-secondary to-transparent pointer-events-none" />
    </div>
  );
};

export default IntelligencePage;