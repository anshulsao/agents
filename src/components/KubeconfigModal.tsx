import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Upload } from 'lucide-react';
import KubeconfigUpload from './KubeconfigUpload';

interface KubeconfigModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  isReady: boolean;
  onReady: () => void;
  onReset: () => void;
}

const KubeconfigModal: React.FC<KubeconfigModalProps> = ({ 
  sessionId, 
  isOpen, 
  onClose, 
  isReady, 
  onReady, 
  onReset 
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-surface border border-border shadow-strong p-5 text-left align-middle transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-accent/10 rounded-lg">
                      <Upload className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-base font-semibold text-text-primary">
                        Kubeconfig Setup
                      </Dialog.Title>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4 text-text-tertiary" />
                  </button>
                </div>
                
                <KubeconfigUpload
                  sessionId={sessionId}
                  isReady={isReady}
                  onReady={onReady}
                  onReset={onReset}
                  onClose={onClose}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default KubeconfigModal;