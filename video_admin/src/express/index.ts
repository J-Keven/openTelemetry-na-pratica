import "express-async-errors";
import express from 'express';
import appRoutes from './routes';
import cors from "cors";
import Logger from '../logger'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(appRoutes);
app.use((err, req, res, next) => {
  Logger.error(err.message, err?.status || 500, err);
  return res.status(err?.status || 500).json({ message: err.message });
});


export default app;