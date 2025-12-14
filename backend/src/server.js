import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import solpedRoutes from './routes/solpeds.js';
import commentRoutes from './routes/comments.js';
import todoRoutes from './routes/todos.js';
import notificationRoutes from './routes/notifications.js';
import configRoutes from './routes/config.js';
import attachmentRoutes from './routes/attachments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/solpeds', solpedRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/config', configRoutes);
app.use('/api/attachments', attachmentRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SolPed API funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}/api`);
});
