import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    groqApiKey: process.env.GROQ_API_KEY,
  },
});
