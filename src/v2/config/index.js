const config = {
    APP_NAME: "backend",
    JWT_SECRET: process.env.JWT_SECRET || "000-xxxxx-000",
    SCHEDULE_SECRET: process.env.SCHEDULE_SECRET || "",
    MONGODB_URI: process.env.MONGO_ATLAS_URI || "mongodb://localhost:27017",
    BCRYPT_SALT: process.env.BCRYPT_SALT || 10,
    role: {
        USER: ["user", "admin"],
        ADMIN: ["admin"]
    },
    URL: {
        LANDING_URL: process.env.LANDING_URL || "https://backend-frontend.vercel.app",
        DASHBOARD_URL: process.env.DASHBOARD_URL || "https://backend-frontend.vercel.app/dashboard"
    },
    mailer: {
        HOST: process.env.MAILER_HOST || "smtp.gmail.com",
        USER: process.env.MAILER_USER || "username@gmail.com",
        PASSWORD: process.env.MAILER_PASSWORD || "password",
        PORT: process.env.MAILER_PORT || 465,
        SECURE: process.env.MAILER_SECURE || true,
        DOMAIN: "https://backend.axgura.com"
    },
    GeminiAI: {
        PROJECT_ID: process.env.GENERATIVE_AI_PROJECT_ID,
        LOCATION: process.env.GENERATIVE_AI_LOCATION,
        API_KEY: process.env.GENERATIVE_AI_API_KEY,
    },
    BUCKET: {
        projectId: process.env.BUCKET_PROJECT_ID,
        BUCKET_NAME: process.env.BUCKET_NAME,
        KEYFILENAME: process.env.KEYFILENAME
    }       
};

module.exports = config;
