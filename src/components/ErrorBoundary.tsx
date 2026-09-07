import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackView?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Component Tree:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-right" dir="rtl">
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#0D1527] via-[#080D21] to-[#0B0B0F] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-[#F97316] border border-amber-400/40 shadow-md">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  عذرًا، حدث خطأ غير متوقع أثناء عرض هذه الصفحة
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                  لا تقلق، بياناتك وتقدمك في المناهج محفوظ بأمان. يرجى إعادة تحميل الصفحة أو العودة للرئيسية.
                </p>
              </div>
            </div>

            {this.state.error?.message && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-mono text-rose-200 dir-ltr overflow-x-auto relative z-10">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-xs sm:text-sm font-black text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <Home className="h-4 w-4" />
                <span>العودة للرئيسية</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
