
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env first
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    console.log('Loading .env');
    const result = dotenv.config({ path: envPath });
    if (result.error) console.error(result.error);
}

// Load .env.local (overrides)
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    console.log('Loading .env.local');
    const envLocal = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envLocal) {
        process.env[k] = envLocal[k];
    }
}

// Load .env.development (overrides if dev)
const envDevPath = path.resolve(process.cwd(), '.env.development');
if (fs.existsSync(envDevPath)) {
    console.log('Loading .env.development');
    const envDev = dotenv.parse(fs.readFileSync(envDevPath));
    for (const k in envDev) {
        process.env[k] = envDev[k];
    }
}

console.log('--- ENV VARS ---');
console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
