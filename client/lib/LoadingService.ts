type Listener = (isLoading: boolean, activeCount: number) => void;

class LoadingService {
  private activeRequests = new Set<string>();
  private listeners = new Set<Listener>();

  public startRequest(requestId: string): void {
    if (!requestId) return;
    this.activeRequests.add(requestId);
    this.notify();
  }

  public finishRequest(requestId: string): void {
    if (!requestId) return;
    this.activeRequests.delete(requestId);
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately notify initial state
    listener(this.getIsLoading(), this.getActiveCount());

    return () => {
      this.listeners.delete(listener);
    };
  }

  public getIsLoading(): boolean {
    return this.activeRequests.size > 0;
  }

  public getActiveCount(): number {
    return this.activeRequests.size;
  }

  private notify(): void {
    const isLoading = this.getIsLoading();
    const activeCount = this.getActiveCount();
    this.listeners.forEach((listener) => listener(isLoading, activeCount));
  }
}

export const loadingService = new LoadingService();
export default loadingService;
