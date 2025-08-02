import type {
  DataStreamDelta,
  QueryLoadingContent,
  ToolLoadingContent,
} from '@/lib/types/data-stream';

/**
 * Data Stream Service
 * Manages real-time data streaming for UI updates
 */
export class DataStreamService {
  private stream: any; // Type this based on your actual stream implementation

  constructor(stream: any) {
    this.stream = stream;
  }

  /**
   * Write data to the stream
   */
  writeData(delta: DataStreamDelta): void {
    if (!this.stream || !this.stream.writeData) {
      console.warn('Stream not available for writing data:', delta);
      return;
    }

    this.stream.writeData(delta);
  }

  /**
   * Update tool loading state
   */
  setToolLoading(tool: string, isLoading: boolean, message?: string): void {
    const content: ToolLoadingContent = {
      tool,
      isLoading,
      message,
    };

    this.writeData({
      type: 'tool-loading',
      content,
    });
  }

  /**
   * Update query loading state
   */
  setQueryLoading(
    isLoading: boolean,
    taskNames: string[] = [],
    message?: string,
  ): void {
    const content: QueryLoadingContent = {
      isLoading,
      taskNames,
      message,
    };

    this.writeData({
      type: 'query-loading',
      content,
    });
  }

  /**
   * Send text delta update
   */
  sendTextDelta(content: string): void {
    this.writeData({
      type: 'text-delta',
      content,
    });
  }

  /**
   * Send code delta update
   */
  sendCodeDelta(content: string): void {
    this.writeData({
      type: 'code-delta',
      content,
    });
  }

  /**
   * Send title update
   */
  sendTitle(title: string): void {
    this.writeData({
      type: 'title',
      content: title,
    });
  }

  /**
   * Send user message ID
   */
  sendUserMessageId(id: string): void {
    this.writeData({
      type: 'user-message-id',
      content: id,
    });
  }

  /**
   * Send block ID
   */
  sendBlockId(id: string): void {
    this.writeData({
      type: 'id',
      content: id,
    });
  }

  /**
   * Send kind update
   */
  sendKind(kind: string): void {
    this.writeData({
      type: 'kind',
      content: kind,
    });
  }

  /**
   * Send suggestion
   */
  sendSuggestion(suggestion: any): void {
    this.writeData({
      type: 'suggestion',
      content: suggestion,
    });
  }

  /**
   * Clear stream
   */
  clear(): void {
    this.writeData({
      type: 'clear',
      content: '',
    });
  }

  /**
   * Finish stream
   */
  finish(): void {
    this.writeData({
      type: 'finish',
      content: '',
    });
  }
}
