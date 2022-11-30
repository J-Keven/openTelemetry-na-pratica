import 'dotenv/config';
import Instrumentation from './instrumentation';
import logger from './logger';

const instrumentation = Instrumentation.build();
instrumentation.init(logger.logger);

import express from 'express';
import appRoutes from './routes';
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(appRoutes);

app.listen(3333, () => console.log('Server is running!'));
