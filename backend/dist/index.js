import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
// Load environment variables
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', process.env.CORS_ORIGIN].filter(Boolean),
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'SaaS Page Builder API is running',
        version: '1.0.0',
    });
});
// API routes
app.use('/api', routes);
// Error handling
app.use(notFoundHandler);
app.use(errorHandler);
// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on port: ${port}`);
    console.log(`📍 API available at: http://localhost:${port}/api`);
});
//# sourceMappingURL=index.js.map