import { Component, type ErrorInfo, type ReactNode } from "react";
import { ContactButtons } from "./shop";

type Props = { children: ReactNode; label: string; floating?: boolean };
type State = { error: Error | null };

// Keeps a problem in one add-on (chat helper, "Help me choose") from taking down the whole page.
export class SafeBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.label}]`, error, info.componentStack);
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const card = (
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <p className="text-lg font-semibold">The {this.props.label} had a problem. You can still call or WhatsApp us.</p>
        <ContactButtons />
        <button type="button" onClick={() => this.setState({ error: null })} className="min-h-11 rounded-md bg-secondary px-4 font-semibold">
          Try again
        </button>
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer">Technical details</summary>
          <p className="break-words pt-1">{error.message}</p>
        </details>
      </div>
    );
    return this.props.floating ? <div className="fixed inset-x-2 bottom-2 z-40 sm:inset-x-auto sm:right-4 sm:w-96">{card}</div> : card;
  }
}
