import process from 'process';
import { NodeSDK, resources, metrics } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel, } from '@opentelemetry/api';
import { ExpressInstrumentationConfig, ExpressLayerType } from "@opentelemetry/instrumentation-express";
import { AmqplibInstrumentationConfig } from "@opentelemetry/instrumentation-amqplib";
import { PgInstrumentationConfig } from "@opentelemetry/instrumentation-pg";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
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
}

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const nodeAutoInstrumentations = getNodeAutoInstrumentations({
  "@opentelemetry/instrumentation-express": expressInstrumentationConfig,
  "@opentelemetry/instrumentation-amqplib": amqplibInstrumentationConfig,
  "@opentelemetry/instrumentation-pg": pgInstrumentationConfig,
  "@opentelemetry/instrumentation-winston": {
    enabled: true,
  }
});

// const jaegerExporter = new JaegerExporter({
//   host: 'jeager',
// });

// const metricReader = metrics.;

const otlpExporter = new OTLPTraceExporter({
  url: 'http://otel-collector:4317',
});

const opentelemetrySdk = new NodeSDK({
  traceExporter: otlpExporter,
  resource: new resources.Resource({
    serviceName: 'video_admin',
    serviceNamespace: 'video_admin',
  }),
  instrumentations: [nodeAutoInstrumentations],
  // metricReader: new metrics.MetricReader({
  //   ExpressLayerType: metrics.AggregationTemporality.CUMULATIVE,
  // }),
});


export default async (logger: Logger) => {
  await opentelemetrySdk.start();
  logger.info('OpenTelemetry started');

  process.on('SIGTERM', async () => {
    try {
      await opentelemetrySdk.shutdown()
      logger.info('OpenTelemetry SDK shutdown');
    } catch (error) {
      logger.error('Error on OpenTelemetry SDK shutdown', error);
    } finally {
      process.exit(0);
    }
  });
}