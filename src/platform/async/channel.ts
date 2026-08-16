export interface AsyncEnvelope<TPayload = unknown> {
  readonly type: string;
  readonly payload: TPayload;
  readonly occurredAt: string;
}

export interface AsyncSubscription {
  unsubscribe(): void;
}

export interface AsyncChannelAdapter {
  subscribe<TPayload>(
    channel: string,
    onMessage: (message: AsyncEnvelope<TPayload>) => void,
  ): AsyncSubscription;
}

/** No websocket, SSE, push, queue, or external async carrier is selected here. */
