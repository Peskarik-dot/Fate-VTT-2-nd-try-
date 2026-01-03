
import React from 'react';
import { FateDiceResult } from '../types';

interface Props {
  result: FateDiceResult;
  size?: 'sm' | 'md' | 'lg';
}

export const FateDiceIcon: React.FC<Props> = ({ result, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-2xl',
  };

  const getStyle = () => {
    switch (result) {
      case 1: return 'bg-emerald-600 text-white border-emerald-400';
      case -1: return 'bg-rose-700 text-white border-rose-500';
      default: return 'bg-slate-700 text-slate-300 border-slate-500';
    }
  };

  const getLabel = () => {
    switch (result) {
      case 1: return '+';
      case -1: return '-';
      default: return '0';
    }
  };

  return (
    <div className={`${sizeClasses[size]} ${getStyle()} border-2 rounded-lg flex items-center justify-center font-bold shadow-inner`}>
      {getLabel()}
    </div>
  );
};
