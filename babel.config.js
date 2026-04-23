module.exports = {
  presets: ['babel-preset-granite'],
  plugins: [
    ['transform-inline-environment-variables', {
      include: [
        'EXPO_PUBLIC_SUPABASE_URL',
        'EXPO_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'AIT_AD_R1',
        'AIT_AD_R2',
        'AIT_AD_R3',
      ],
    }],
  ],
};
