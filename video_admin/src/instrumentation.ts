import process from 'process';
import { NodeSDK, resources, tracing } from "@opentelemetry/sdk-node";

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { ExpressInstrumentationConfig, ExpressLayerType } from "@opentelemetry/instrumentation-express";
import { AmqplibInstrumentationConfig } from "@opentelemetry/instrumentation-amqplib";
import { PgInstrumentationConfig } from "@opentelemetry/instrumentation-pg";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { Logger } from 'winston';

// Express instrumentation config 
const expressInstrumentationConfig: ExpressInstrumentationConfig = {
  enabled: true,
  ignoreLayersType: [ExpressLayerType.MIDDLEWARE, ExpressLayerType.ROUTER],
  ignoreLayers: ['cors'],
};

// AMQP instrumentation config
const amqplibInstrumentationConfig: AmqplibInstrumentationConfig = {
  enabled: true,
};

const pgInstrumentationConfig: PgInstrumentationConfig = {
  enabled: true,
  enhancedDatabaseReporting: true,
};

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const nodeAutoInstrumentations = getNodeAutoInstrumentations({
  "@opentelemetry/instrumentation-express": expressInstrumentationConfig,
  "@opentelemetry/instrumentation-amqplib": amqplibInstrumentationConfig,
  "@opentelemetry/instrumentation-pg": pgInstrumentationConfig,
  "@opentelemetry/instrumentation-winston": {
    enabled: true,
    logHook: (span, record) => {
      record['resource.service.name'] = 'video_admin';
    },
  },
});

const otlpExporter = new OTLPTraceExporter(
  {
    hostname: 'collector'
  }
);

const provider = new tracing.BasicTracerProvider();
const opentelemetrySdk = new NodeSDK({
  traceExporter: otlpExporter,
  resource: new resources.Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'video_admin',
  }),
  instrumentations: [nodeAutoInstrumentations],
  spanProcessor: provider.getActiveSpanProcessor(),
});



export default class Instrumentation {
  static opentelemetrySdk = opentelemetrySdk;
  static object: Instrumentation;
  static provider = provider;

  static build() {
    if (Instrumentation.object) {
      return Instrumentation.object;
    }
    return new Instrumentation();
  }

  async init(logger: Logger) {
    await Instrumentation.opentelemetrySdk.start();

    process.on('SIGTERM', async () => {
      try {
        await Instrumentation.opentelemetrySdk.shutdown();
        logger.info('OpenTelemetry SDK shutdown');
      } catch (error) {
        logger.error('Error on OpenTelemetry SDK shutdown', error);
      } finally {
        process.exit(0);
      }
    });
  }
}