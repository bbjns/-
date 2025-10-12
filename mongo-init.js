// MongoDB initialization script
db = db.getSiblingDB('speculation-calculator');

// Create collections
db.createCollection('users');
db.createCollection('tradingcalculations');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 });
db.users.createIndex({ "createdAt": -1 });

db.tradingcalculations.createIndex({ "userId": 1, "createdAt": -1 });
db.tradingcalculations.createIndex({ "calculationType": 1 });
db.tradingcalculations.createIndex({ "createdAt": -1 });

// Create admin user
db.users.insertOne({
  email: "admin@speculation-calculator.com",
  username: "admin",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7", // password: admin123
  isEmailVerified: true,
  membership: {
    type: "vip",
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    isActive: true
  },
  preferences: {
    language: "zh",
    theme: "classic"
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Database initialized successfully!");