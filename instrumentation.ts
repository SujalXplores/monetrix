import { registerOTel } from '@vercel/otel';
import { AISDKExporter } from 'langsmith/vercel';

export function register() {
  registerOTel({
    serviceName: 'monetrix',
    traceExporter: new AISDKExporter(),
  });
}
