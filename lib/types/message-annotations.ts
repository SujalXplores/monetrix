import type { Message } from 'ai';

export interface MessageAnnotationWithServer {
  messageIdFromServer?: string;
  [key: string]: any;
}

export interface MessageWithServerAnnotation extends Message {
  annotations?: MessageAnnotationWithServer[];
}
