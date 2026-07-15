import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Helper: Read DB
const readDB = () => JSON.parse(readFileSync(DB_PATH, 'utf-8'));

// Helper: Write DB
const writeDB = (data) => writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ============ AUTH ROUTES ============

// Customer Login/Register (phone + name)
app.post('/api/auth/customer', (req, res) => {
  const { phone, name } = req.body;
  if (!phone || !name) return res.status(400).json({ error: 'Phone and name required' });
  
  const db = readDB();
  let user = db.users.find(u => u.phone === phone && u.role === 'customer');
  
  if (!user) {
    user = { id: uuidv4(), phone, name, role: 'customer', createdAt: new Date().toISOString() };
    db.users.push(user);
    writeDB(db);
  }
  
  res.json({ id: user.id, phone: user.phone, name: user.name, role: user.role });
});

// Technician Login (phone only - must be approved)
app.post('/api/auth/technician', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  
  const db = readDB();
  const tech = db.technicians.find(t => t.phone === phone && t.status === 'approved');
  
  if (!tech) return res.status(401).json({ error: 'Technician not found or not approved' });
  
  res.json({ id: tech.id, phone: tech.phone, name: tech.name, role: 'technician' });
});

// Technician Apply (new application)
app.post('/api/technician/apply', (req, res) => {
  const { phone, name, categories, experience, bio } = req.body;
  if (!phone || !name || !categories || !experience) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  const db = readDB();
  const existing = db.technicians.find(t => t.phone === phone);
  if (existing) return res.status(400).json({ error: 'Phone already registered' });
  
  const tech = {
    id: uuidv4(),
    phone,
    name,
    categories,
    experience,
    bio: bio || '',
    rating: 0,
    jobsCompleted: 0,
    verified: false,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  db.technicians.push(tech);
  writeDB(db);
  res.json({ message: 'Application submitted, awaiting admin approval' });
});

// Admin Login
app.post('/api/auth/admin', (req, res) => {
  const { accessCode } = req.body;
  const db = readDB();
  
  if (accessCode !== db.admin.accessCode) {
    return res.status(401).json({ error: 'Invalid access code' });
  }
  
  res.json({ id: 'admin', name: 'Administrator', role: 'admin' });
});

// ============ CATEGORIES ROUTES ============

app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json(db.categories);
});

// ============ TECHNICIANS ROUTES ============

// Get all verified technicians
app.get('/api/technicians', (req, res) => {
  const db = readDB();
  const verified = db.technicians.filter(t => t.status === 'approved');
  res.json(verified);
});

// Get technicians by category
app.get('/api/technicians/category/:categoryId', (req, res) => {
  const db = readDB();
  const technicians = db.technicians.filter(
    t => t.status === 'approved' && t.categories.includes(req.params.categoryId)
  );
  res.json(technicians);
});

// Get technician by ID
app.get('/api/technicians/:id', (req, res) => {
  const db = readDB();
  const tech = db.technicians.find(t => t.id === req.params.id);
  if (!tech) return res.status(404).json({ error: 'Technician not found' });
  res.json(tech);
});

// Get technician bookings
app.get('/api/technicians/:id/bookings', (req, res) => {
  const db = readDB();
  const bookings = db.bookings.filter(b => b.technicianId === req.params.id);
  res.json(bookings);
});

// ============ BOOKINGS ROUTES ============

// Create booking
app.post('/api/bookings', (req, res) => {
  const { customerId, customerName, customerPhone, technicianId, technicianName, categoryId, categoryName, address, problem, scheduledDate, scheduledTime, estimatedPrice } = req.body;
  
  if (!customerId || !technicianId || !address || !problem) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  
  const db = readDB();
  const booking = {
    id: uuidv4(),
    customerId,
    customerName,
    customerPhone,
    technicianId,
    technicianName,
    categoryId,
    categoryName,
    status: 'requested',
    address,
    problem,
    scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
    scheduledTime: scheduledTime || '10:00 AM',
    estimatedPrice,
    finalPrice: null,
    priceBreakdown: null,
    rating: null,
    review: null,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  
  db.bookings.push(booking);
  writeDB(db);
  res.json(booking);
});

// Get bookings by customer
app.get('/api/bookings/customer/:customerId', (req, res) => {
  const db = readDB();
  const bookings = db.bookings.filter(b => b.customerId === req.params.customerId);
  res.json(bookings);
});

// Get single booking
app.get('/api/bookings/:id', (req, res) => {
  const db = readDB();
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

// Update booking status
app.patch('/api/bookings/:id/status', (req, res) => {
  const { status, finalPrice, priceBreakdown } = req.body;
  const db = readDB();
  const idx = db.bookings.findIndex(b => b.id === req.params.id);
  
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  
  const ALLOWED_TRANSITIONS = {
    requested: ['accepted', 'cancelled'],
    accepted: ['en_route', 'cancelled'],
    en_route: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: []
  };
  
  const currentStatus = db.bookings[idx].status;
  if (!ALLOWED_TRANSITIONS[currentStatus].includes(status)) {
    return res.status(400).json({ error: `Cannot transition from ${currentStatus} to ${status}` });
  }
  
  db.bookings[idx].status = status;
  if (status === 'completed') {
    db.bookings[idx].completedAt = new Date().toISOString();
    db.bookings[idx].finalPrice = finalPrice;
    db.bookings[idx].priceBreakdown = priceBreakdown;
    
    // Update technician jobs count
    const techIdx = db.technicians.findIndex(t => t.id === db.bookings[idx].technicianId);
    if (techIdx !== -1) {
      db.technicians[techIdx].jobsCompleted++;
    }
  }
  
  writeDB(db);
  res.json(db.bookings[idx]);
});

// Add review
app.patch('/api/bookings/:id/review', (req, res) => {
  const { rating, review } = req.body;
  const db = readDB();
  const idx = db.bookings.findIndex(b => b.id === req.params.id);
  
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  
  db.bookings[idx].rating = rating;
  db.bookings[idx].review = review;
  
  // Update technician rating
  const techIdx = db.technicians.findIndex(t => t.id === db.bookings[idx].technicianId);
  if (techIdx !== -1) {
    const techBookings = db.bookings.filter(b => b.technicianId === db.technicians[techIdx].id && b.rating);
    const avgRating = techBookings.reduce((sum, b) => sum + b.rating, 0) / techBookings.length;
    db.technicians[techIdx].rating = Math.round(avgRating * 10) / 10;
  }
  
  writeDB(db);
  res.json(db.bookings[idx]);
});

// ============ ADMIN ROUTES ============

// Get all pending technicians
app.get('/api/admin/pending-technicians', (req, res) => {
  const db = readDB();
  const pending = db.technicians.filter(t => t.status === 'pending');
  res.json(pending);
});

// Approve/Reject technician
app.patch('/api/admin/technician/:id', (req, res) => {
  const { status, verified } = req.body;
  const db = readDB();
  const idx = db.technicians.findIndex(t => t.id === req.params.id);
  
  if (idx === -1) return res.status(404).json({ error: 'Technician not found' });
  
  if (status) db.technicians[idx].status = status;
  if (typeof verified === 'boolean') db.technicians[idx].verified = verified;
  
  writeDB(db);
  res.json(db.technicians[idx]);
});

// Get platform stats
app.get('/api/admin/stats', (req, res) => {
  const db = readDB();
  const stats = {
    totalCustomers: db.users.filter(u => u.role === 'customer').length,
    totalTechnicians: db.technicians.filter(t => t.status === 'approved').length,
    totalBookings: db.bookings.length,
    completedBookings: db.bookings.filter(b => b.status === 'completed').length,
    pendingApplications: db.technicians.filter(t => t.status === 'pending').length,
    avgRating: db.technicians.filter(t => t.rating > 0).reduce((sum, t, _, arr) => sum + t.rating / arr.length, 0)
  };
  res.json(stats);
});

// Get all bookings (admin)
app.get('/api/admin/bookings', (req, res) => {
  const db = readDB();
  res.json(db.bookings);
});

app.listen(PORT, () => {
  console.log(`RepairIt API running on http://localhost:${PORT}`);
});
