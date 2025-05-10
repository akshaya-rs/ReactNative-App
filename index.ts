import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose, { Document, Schema } from 'mongoose';
import admin from 'firebase-admin';
//import admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin with the service account key
const serviceAccount = path.resolve(__dirname, 'C:\Users\Lenovo\Downloads\todo-project-556f0-firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://todo-project-556f0.firebaseio.com',
});

/** To install dependencies, give the following commands
 * npm init -y
 * npm install express mongoose cors firebase-admin
 * npm install --save-dev typescript ts-node-dev @types/express @types/node @types/mongoose @types/firebase-admin
 */

// Define a custom type for the task document



interface Task extends Document {
  title: string;
  completed: boolean;
  userId: string;
}

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/todoApp')
  .then(() => console.log('MongoDB connected'))
  .catch((err: any) => console.log('MongoDB connection error:', err));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-service-account.json')),
});

// Define Mongoose schema and model
const taskSchema = new Schema<Task>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true }
});
const TaskModel = mongoose.model<Task>('Task', taskSchema);

// Define types for Express Request that includes user information
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

// Authentication middleware

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/tasks', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const tasks = await TaskModel.find({ userId: req.user.uid });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching tasks' });
  }
});
/**
app.get('/tasks', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const tasks = await TaskModel.find({ userId: req.user.uid });
  res.json(tasks);
});
**/
app.post('/tasks', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const task = new TaskModel({ title: req.body.title, userId: req.user.uid });
  await task.save();
  res.json(task);
});

app.put('/tasks/:id', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const updated = await TaskModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.uid },
    req.body,
    { new: true }
  );
  if (!updated) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(updated);
});

app.delete('/tasks/:id', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const result = await TaskModel.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
  if (!result) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ message: 'Task deleted' });
});

// Start server
app.listen(3000, () => console.log('API running on http://localhost:3000'));
