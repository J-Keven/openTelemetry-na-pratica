import express from 'express';
import appRoutes from './routes';
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(appRoutes);

export default app;