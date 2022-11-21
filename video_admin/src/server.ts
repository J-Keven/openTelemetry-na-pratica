
import { NodeSDK, resources, metrics } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel, } from '@opentelemetry/api';
import { ExpressInstrumentationConfig, ExpressLayerType } from "@opentelemetry/instrumentation-express";
import { AmqplibInstrumentationConfig } from "@opentelemetry/instrumentation-amqplib";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const expressInstrumentationConfig: ExpressInstrumentationConfig = {
  enabled: true,
  ignoreLayersType: [ExpressLayerType.MIDDLEWARE, ExpressLayerType.ROUTER],
  ignoreLayers: ['cors'],
};

const amqplibInstrumentationConfig: AmqplibInstrumentationConfig = {
  enabled: true,
};

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const nodeAutoInstrumentations = getNodeAutoInstrumentations({
  "@opentelemetry/instrumentation-express": expressInstrumentationConfig,
  "@opentelemetry/instrumentation-amqplib": amqplibInstrumentationConfig
});

const jaegerExporter = new JaegerExporter({
  host: 'jeager',
});

const opentelemetrySdk = new NodeSDK({
  traceExporter: jaegerExporter,
  resource: new resources.Resource({
    serviceName: 'video_admin',
    serviceNamespace: 'video_admin',
  }),
  instrumentations: [nodeAutoInstrumentations],
});

opentelemetrySdk.start();

import express from 'express';
import appRoutes from './routes';
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(appRoutes);

app.listen(3333, () => console.log('Server is running!'));
