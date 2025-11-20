// UNN Shuttle Route Seeder
require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Route = require('./src/v2/models/route.model');

const MONGODB_URI = process.env.MONGO_ATLAS_URI || 'mongodb://localhost:27017/shuttleunn';

const unnRoutes = [
  {
    routeName: 'Main Gate - Faculty of Arts',
    routeCode: 'MG-ARTS',
    description: 'Main Gate to Faculty of Arts',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Arts', order: 1 },
    ],
    distance: 2.1,
    estimatedDuration: 8,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Engineering',
    routeCode: 'MG-ENG',
    description: 'Main Gate to Faculty of Engineering',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Engineering', order: 1 },
    ],
    distance: 2.5,
    estimatedDuration: 10,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Agriculture',
    routeCode: 'MG-AGRIC',
    description: 'Main Gate to Faculty of Agriculture',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Agriculture', order: 1 },
    ],
    distance: 2.3,
    estimatedDuration: 9,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Education',
    routeCode: 'MG-EDU',
    description: 'Main Gate to Faculty of Education',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Education', order: 1 },
    ],
    distance: 2.0,
    estimatedDuration: 8,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Biological Sciences',
    routeCode: 'MG-BIO',
    description: 'Main Gate to Faculty of Biological Sciences',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Biological Sciences', order: 1 },
    ],
    distance: 2.2,
    estimatedDuration: 9,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Physical Sciences',
    routeCode: 'MG-PHY',
    description: 'Main Gate to Faculty of Physical Sciences',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Physical Sciences', order: 1 },
    ],
    distance: 2.4,
    estimatedDuration: 10,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Social Sciences',
    routeCode: 'MG-SOC',
    description: 'Main Gate to Faculty of Social Sciences',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Social Sciences', order: 1 },
    ],
    distance: 2.6,
    estimatedDuration: 11,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Law',
    routeCode: 'MG-LAW',
    description: 'Main Gate to Faculty of Law',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Law', order: 1 },
    ],
    distance: 2.7,
    estimatedDuration: 11,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Medical Sciences',
    routeCode: 'MG-MED',
    description: 'Main Gate to Faculty of Medical Sciences',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Medical Sciences', order: 1 },
    ],
    distance: 2.8,
    estimatedDuration: 12,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Pharmaceutical Sciences',
    routeCode: 'MG-PHAR',
    description: 'Main Gate to Faculty of Pharmaceutical Sciences',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Pharmaceutical Sciences', order: 1 },
    ],
    distance: 2.9,
    estimatedDuration: 12,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - Faculty of Veterinary Medicine',
    routeCode: 'MG-VET',
    description: 'Main Gate to Faculty of Veterinary Medicine',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'Faculty of Veterinary Medicine', order: 1 },
    ],
    distance: 3.0,
    estimatedDuration: 13,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
  {
    routeName: 'Main Gate - UNN Library',
    routeCode: 'MG-LIB',
    description: 'Main Gate to UNN Library',
    stops: [
      { stopName: 'Main Gate', order: 0 },
      { stopName: 'UNN Library', order: 1 },
    ],
    distance: 2.5,
    estimatedDuration: 10,
    operatingHours: { startTime: '06:00', endTime: '20:00' },
    fare: 100,
    status: 'active',
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Remove all existing routes
  await Route.deleteMany({});
  console.log('Cleared existing routes');

  // Insert new routes
  for (const r of unnRoutes) {
    const route = new Route({
      ...r,
      route_id: uuidv4(),
      stops: r.stops.map((stop, i) => ({
        stop_id: uuidv4(),
        stopName: stop.stopName,
        order: i,
      })),
    });
    await route.save();
    console.log(`Added route: ${r.routeName}`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
