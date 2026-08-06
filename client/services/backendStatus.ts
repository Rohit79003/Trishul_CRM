export interface BackendStatusState {
  isReady: boolean;
  isChecking: boolean;
  isSleeping: boolean;
  lastChecked: Date | null;
  error: string | null;
  retryCount: number;
}

type Listener = (state: BackendStatusState) => void;

class BackendStatusService {
  private state: BackendStatusState = {
    isReady: false,
    isChecking: true,
    isSleeping: false,
    lastChecked: null,
    error: null,
    retryCount: 0,
  };

  private listeners: Set<Listener> = new Set();
  private pollIntervalId: NodeJS.Timeout | null = null;
  private queuedResolvers: Array<() => void> = [];
  private healthUrl: string;

  constructor() {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    // Target both /api/health or root /health
    if (rawApiUrl.endsWith("/api")) {
      this.healthUrl = `${rawApiUrl}/health`;
    } else if (rawApiUrl.endsWith("/")) {
      this.healthUrl = `${rawApiUrl}health`;
    } else {
      this.healthUrl = `${rawApiUrl}/health`;
    }
  }

  public getState(): BackendStatusState {
    return { ...this.state };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately send current state to new listener
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error("Error in backend status listener:", err);
      }
    });
  }

  public async checkHealth(): Promise<boolean> {
    this.state.isChecking = true;
    this.notify();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      // Primary check
      let response: Response;
      try {
        response = await fetch(this.healthUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
          cache: "no-store",
        });
      } catch (primaryErr) {
        // Fallback check to root /health if API prefix failed
        const fallbackUrl = this.healthUrl.replace(/\/api\/health$/, "/health");
        if (fallbackUrl !== this.healthUrl) {
          response = await fetch(fallbackUrl, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
            cache: "no-store",
          });
        } else {
          throw primaryErr;
        }
      }

      clearTimeout(timeoutId);

      if (response && response.ok) {
        this.setReadyState();
        return true;
      } else {
        this.setSleepingState(`Backend returned HTTP status ${response?.status}`);
        return false;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err.name === "AbortError";
      const errMsg = isAbort
        ? "Connection request timed out (Backend sleeping)"
        : err.message || "Network connection failure";

      this.setSleepingState(errMsg);
      return false;
    }
  }

  private setReadyState(): void {
    const wasSleeping = this.state.isSleeping || !this.state.isReady;

    this.state = {
      isReady: true,
      isChecking: false,
      isSleeping: false,
      lastChecked: new Date(),
      error: null,
      retryCount: 0,
    };

    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }

    this.notify();

    if (wasSleeping) {
      this.flushQueue();
    }
  }

  private setSleepingState(errorMessage: string): void {
    this.state = {
      isReady: false,
      isChecking: false,
      isSleeping: true,
      lastChecked: new Date(),
      error: errorMessage,
      retryCount: this.state.retryCount + 1,
    };

    this.notify();
    this.ensurePolling();
  }

  public markAsSleeping(customError?: string): void {
    if (!this.state.isSleeping) {
      this.setSleepingState(customError || "Backend connection lost");
    }
  }

  public ensurePolling(intervalMs = 3000): void {
    if (this.pollIntervalId) return;

    this.pollIntervalId = setInterval(async () => {
      await this.checkHealth();
    }, intervalMs);
  }

  public async retry(): Promise<boolean> {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    return this.checkHealth();
  }

  public waitUntilReady(): Promise<void> {
    if (this.state.isReady) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.queuedResolvers.push(resolve);
    });
  }

  private flushQueue(): void {
    const resolvers = [...this.queuedResolvers];
    this.queuedResolvers = [];
    resolvers.forEach((resolve) => {
      try {
        resolve();
      } catch (err) {
        console.error("Error executing queued request resolver:", err);
      }
    });
  }
}

export const backendStatusService = new BackendStatusService();
export default backendStatusService;
