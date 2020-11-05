declare namespace NodeJS {
  export interface ProcessEnv {
    REDIS_URL: string;
    PORT: string;
    SESSION_SECRET: string;
    CORS_ORIGIN: string;
    DATABASE_URL: string;
    CLIET_ID: string;
    CLIENT_SECRET: string;
    callbackUrl: string;
    redirectUrl: string;
    BOT_TOKEN: string;
    API_URI: string;
  }
}
