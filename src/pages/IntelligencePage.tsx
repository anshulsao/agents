import React from 'react';
import { Bot, Package } from 'lucide-react';
import Header from '../components/Header';
import FeatureCard from '../components/FeatureCard';

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
          <p className="text-lg md:text-xl text-text-tertiary mb-24 leading-relaxed max-w-3xl mx-auto">
            No more 3am debugging, cryptic error messages, or deployment panic. Get
            instant expert guidance for every infrastructure challenge.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              icon={Bot}
              title="Kubernetes Expert"
              description="Get instant root cause analysis, confident fixes, and proactive recommendations that turn Kubernetes confusion into smooth deployments."
              isActive={true}
              buttonProps={{
                to: "/?agent=kubernetes-expert"
              }}
            />

            <FeatureCard
              icon={Package}
              title="Module Builder"
              description="Describe what you need and get production-ready modules generated instantly, complete with best practices baked in."
              isActive={false}
              buttonProps={{
                disabled: true,
                text: "Coming Soon"
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntelligencePage;