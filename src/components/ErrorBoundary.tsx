import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      window.location.href = window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 selection:bg-rose-500">
          <div className="max-w-md w-full bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white">
                Ups, vyskytla sa chyba
              </h2>
              <p className="text-xs text-slate-400">
                Aplikácia narazila na neočakávaný problém pri vykresľovaní.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950/70 rounded-xl text-left border border-slate-800 text-[11px] font-mono text-rose-300 max-h-32 overflow-y-auto no-scrollbar">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Znovu načítať stránku</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-700/60 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>Vyčistiť vyrovnávaciu pamäť a reštartovať</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
