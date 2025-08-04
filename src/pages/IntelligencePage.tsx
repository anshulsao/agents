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
          <h1 className="text-3xl md:text-5xl lg:text-5xl text-text-primary mb-4 leading-tight">
            AI Agents That{' '}
            <span className="text-gradient bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent">
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
            <div className="group bg-surface/20 backdrop-blur-xl border border-border/40 rounded-xl p-6 text-left hover:bg-surface/30 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
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
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 w-[89px] h-8 text-white font-semibold text-xs rounded-md transition-all duration-200 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(92.88deg, #324BA2 9.16%, #5643CC 43.89%, #673FD7 64.72%)'
                }}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/fi.svg" 
                    alt="Fi Icon" 
                    className="w-3.5 h-3.5 filter brightness-0 invert" 
                  />
                </div>
                Try Now
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div 
                    className="absolute -left-10 top-0 w-20 h-full transform -skew-x-12 transition-transform duration-700 group-hover:translate-x-32"
                    style={{
                      background: 'linear-gradient(74.65deg, rgba(255, 255, 255, 0) 31.83%, rgba(255, 255, 255, 0.5) 37.72%, rgba(255, 255, 255, 0) 45.25%)'
                    }}
                  />
                </div>
              </Link>
            </div>

            {/* Module Builder Card */}
            <div className="group bg-surface/20 backdrop-blur-xl border border-border/40 rounded-xl p-6 text-left hover:bg-surface/30 hover:border-border-light transition-all duration-300">
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
                className="inline-flex items-center gap-2 bg-surface/40 text-text-muted font-medium px-4 py-2 rounded-lg cursor-not-allowed opacity-60 text-sm border border-border/30"
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