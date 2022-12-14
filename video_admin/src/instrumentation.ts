import { NodeSDK, resources, metrics } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { ExpressInstrumentationConfig, ExpressLayerType } from "@opentelemetry/instrumentation-express";
import { AmqplibInstrumentationConfig } from "@opentelemetry/instrumentation-amqplib";
import { PgInstrumentationConfig } from "@opentelemetry/instrumentation-pg";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';


const meticsProvider = new metrics.PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    hostname: 'collector',
  }),
  exportIntervalMillis: 1000,
  exportTimeoutMillis: 1000,
})

// const aggregation = new metrics.Aggregation({})

const expressInstrumentationConfig: ExpressInstrumentationConfig = {
  enabled: true,
  ignoreLayersType: [ExpressLayerType.MIDDLEWARE, ExpressLayerType.ROUTER],
  ignoreLayers: ['cors'],
  requestHook: (span, req) => {
    metrics.Aggregation
    span.setAttribute('http.headers', JSON.stringify(req.request.headers));
    span.setAttribute('http.body', JSON.stringify(req.request.body));
    req.request.span = span;
  }
};

const amqplibInstrumentationConfig: AmqplibInstrumentationConfig = {
  enabled: true,
  publishHook: (span, msg) => {
    span.setAttributes({
      MESSAGING_MESSAGE_ID: msg.routingKey,
      MESSAGING_OPERATION: 'publish',
      MESSAGING_DESTINATION: msg.exchange,
      MESSAGE_CONTENT: msg.content.toString(),
      MESSAGING_RABBITMQ_ROUTING_KEY: msg.routingKey,
    });
  }
};

const pgInstrumentationConfig: PgInstrumentationConfig = {
  enabled: true,
  responseHook: (span, res) => {
    span.setAttribute('db.command', res.data.command);
    span.setAttribute('db.response', JSON.stringify(res.data.rows));
    span.addEvent('db.query', { command: res.data.command });
  }
};

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const instrumentations = getNodeAutoInstrumentations({
  "@opentelemetry/instrumentation-express": expressInstrumentationConfig,
  "@opentelemetry/instrumentation-amqplib": amqplibInstrumentationConfig,
  "@opentelemetry/instrumentation-generic-pool": {
    enabled: false,
  },
  "@opentelemetry/instrumentation-grpc": {
    enabled: false,
  },
  "@opentelemetry/instrumentation-http": {
    enabled: true,
    serverName: 'video_admin',
    ignoreIncomingPaths: ['/health'],
  },
  "@opentelemetry/instrumentation-fs": {
    enabled: false,
  },
  "@opentelemetry/instrumentation-pg": pgInstrumentationConfig,
  "@opentelemetry/instrumentation-winston": {
    enabled: true,
    logHook: (span, record) => {
      span.setAttribute('log.level', record.level);
      span.setAttribute('log.message', record.message);
      span.setAttribute('log.meta', JSON.stringify(record.meta));
      record['resource.service.name'] = 'video_admin';
    },
  },
});



const tracingExporter = new OTLPTraceExporter({
  hostname: 'collector',
});

const opentelemetrySdk = new NodeSDK({
  traceExporter: tracingExporter,
  metricReader: meticsProvider,
  resource: new resources.Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'video_admin',
  }),
  instrumentations: [instrumentations],
});

opentelemetrySdk.start();
