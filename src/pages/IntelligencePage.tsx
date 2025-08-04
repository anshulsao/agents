import React from 'react';
import { Bot, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const IntelligencePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans relative overflow-hidden">
      {/* Background SVG */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: `url('/bg.svg')`
        }}
      />
      
      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-background/40" />

      <Header />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-surface/60 backdrop-blur-sm border border-border/30 rounded-full text-sm text-text-secondary mb-8">
            Stop Fighting Your Infrastructure
          </div>
          
          {/* Hero Title */}
          <h1 className="hero-title font-medium mb-4 max-w-[721px] mx-auto">
            AI Agents That{' '}
            <span className="hero-gradient">
              Actually Fix
            </span>
            <br />
            Your DevOps Nightmares
          </h1>
          
          {/* Hero Subtitle */}
          <p className="text-lg md:text-xl text-text-tertiary mb-12 leading-relaxed max-w-3xl mx-auto">
            No more 3am debugging, cryptic error messages, or deployment panic. Get
            instant expert guidance for every infrastructure challenge.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Kubernetes Expert Card */}
            <div className="group bg-surface/40 backdrop-blur-md border border-border/30 rounded-2xl p-6 text-left hover:bg-surface/60 hover:border-border-light transition-all duration-300">
              <div className="p-2.5 bg-accent/20 rounded-xl w-fit mb-4">
                <Bot className="h-6 w-6 text-accent" />
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-3">
                Kubernetes Expert
              </h3>
              
              <p className="text-text-secondary mb-6 leading-relaxed text-base">
                Get instant root cause analysis, confident fixes, and proactive 
                recommendations that turn Kubernetes confusion into smooth 
                deployments.
              </p>
              
              <Link 
                to="/?agent=kubernetes-expert"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200 text-sm"
              >
                <Bot className="h-4 w-4" />
                Try Now
              </Link>
            </div>

            {/* Module Builder Card */}
            <div className="group bg-surface/40 backdrop-blur-md border border-border/30 rounded-2xl p-6 text-left hover:bg-surface/60 hover:border-border-light transition-all duration-300">
              <div className="p-2.5 bg-text-muted/20 rounded-xl w-fit mb-4">
                <Package className="h-6 w-6 text-text-muted" />
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-3">
                Module Builder
              </h3>
              
              <p className="text-text-secondary mb-6 leading-relaxed text-base">
                Describe what you need and get production-ready modules 
                generated instantly, complete with best practices baked in.
              </p>
              
              <button 
                disabled
                className="inline-flex items-center gap-2 bg-surface/60 hover:bg-surface/80 text-text-muted font-medium px-4 py-2.5 rounded-lg transition-all duration-200 cursor-not-allowed opacity-60 text-sm"
              >
                <Package className="h-4 w-4" />
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntelligencePage;