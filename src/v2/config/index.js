const config = {
    APP_NAME: "ShuttleUNN Backend",
    JWT_SECRET: process.env.JWT_SECRET || "shuttleunn-secret-key-2025",
    SCHEDULE_SECRET: process.env.SCHEDULE_SECRET || "shuttleunn-schedule-secret",
    MONGODB_URI: process.env.MONGO_ATLAS_URI || "mongodb://localhost:27017/shuttleUNN",
    BCRYPT_SALT: parseInt(process.env.BCRYPT_SALT, 10) || 10,
    role: {
        STUDENT: ["student"],
        DRIVER: ["driver"],
        ADMIN: ["admin"]
    },
    URL: {
        LANDING_URL: process.env.LANDING_URL || "https://shuttleunn.vercel.app",
        STUDENT_DASHBOARD_URL: process.env.STUDENT_DASHBOARD_URL || "https://shuttleunn.vercel.app/student/dashboard",
        DRIVER_DASHBOARD_URL: process.env.DRIVER_DASHBOARD_URL || "https://shuttleunn.vercel.app/driver/dashboard"
    },
    mailer: {
        HOST: process.env.MAILER_HOST || "smtp.gmail.com",
        USER: process.env.MAILER_USER || "noreply@shuttleunn.com",
        PASSWORD: process.env.MAILER_PASSWORD || "password",
        PORT: process.env.MAILER_PORT || 465,
        SECURE: process.env.MAILER_SECURE || true,
        DOMAIN: "https://shuttleunn.com"
    }
};

module.exports = config;
