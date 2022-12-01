import process from 'process';
import { NodeSDK, resources, tracing } from "@opentelemetry/sdk-node";

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { ExpressInstrumentationConfig, ExpressLayerType } from "@opentelemetry/instrumentation-express";
import { AmqplibInstrumentationConfig } from "@opentelemetry/instrumentation-amqplib";
import { PgInstrumentationConfig } from "@opentelemetry/instrumentation-pg";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const expressInstrumentationConfig: ExpressInstrumentationConfig = {
  enabled: true,
  ignoreLayersType: [ExpressLayerType.MIDDLEWARE, ExpressLayerType.ROUTER],
  ignoreLayers: ['cors'],
};

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

const opentelemetrySdk = new NodeSDK({
  traceExporter: otlpExporter,
  resource: new resources.Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'video_admin',
  }),
  instrumentations: [nodeAutoInstrumentations],
});



opentelemetrySdk.start();