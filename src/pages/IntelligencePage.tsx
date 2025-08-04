import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const IntelligencePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="p-6 bg-accent/10 rounded-3xl w-fit mx-auto mb-6">
            <Sparkles className="h-12 w-12 text-accent" />
          </div>
          
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Intelligence Platform
          </h1>
          
          <p className="text-lg text-text-secondary mb-8 leading-relaxed">
            Welcome to the Intelligence platform. This is a placeholder page where you can build 
            advanced AI-powered features and analytics for your Kubernetes infrastructure.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-surface rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-text-primary mb-2">AI Analytics</h3>
              <p className="text-sm text-text-tertiary">
                Advanced insights and predictions for your cluster performance
              </p>
            </div>
            
            <div className="bg-surface rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-text-primary mb-2">Smart Monitoring</h3>
              <p className="text-sm text-text-tertiary">
                Intelligent alerting and anomaly detection for your workloads
              </p>
            </div>
            
            <div className="bg-surface rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-text-primary mb-2">Optimization</h3>
              <p className="text-sm text-text-tertiary">
                AI-driven recommendations for resource optimization
              </p>
            </div>
            
            <div className="bg-surface rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-text-primary mb-2">Automation</h3>
              <p className="text-sm text-text-tertiary">
                Intelligent automation workflows for common operations
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link 
              to="/"
              className="button-secondary"
            >
              Back to Chat
            </Link>
            <button className="button-primary">
              Coming Soon
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntelligencePage;