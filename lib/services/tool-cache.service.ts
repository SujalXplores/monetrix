/**
 * Tool Cache Service
 * Manages caching for AI tool calls to prevent duplicate requests
 */
export class ToolCacheService {
  private cache = new Set<string>();
  private readonly maxCacheSize = 1000; // Prevent memory leaks

  /**
   * Generate a cache key for a tool call
   */
  private generateKey(toolName: string, params: any): string {
    return JSON.stringify({ toolName, params });
  }

  /**
   * Check if a tool call should be executed (not cached)
   */
  shouldExecute(toolName: string, params: any): boolean {
    const key = this.generateKey(toolName, params);

    if (this.cache.has(key)) {
      return false;
    }

    // Prevent memory leaks by limiting cache size
    if (this.cache.size >= this.maxCacheSize) {
      this.clearOldest();
    }

    this.cache.add(key);
    return true;
  }

  /**
   * Clear the oldest entries when cache is full
   */
  private clearOldest(): void {
    const keysToDelete = Array.from(this.cache).slice(
      0,
      Math.floor(this.maxCacheSize * 0.2),
    );
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Check if a specific tool call is cached
   */
  isCached(toolName: string, params: any): boolean {
    const key = this.generateKey(toolName, params);
    return this.cache.has(key);
  }

  /**
   * Remove a specific tool call from cache
   */
  remove(toolName: string, params: any): boolean {
    const key = this.generateKey(toolName, params);
    return this.cache.delete(key);
  }
}
