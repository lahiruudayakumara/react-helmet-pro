export const buildSchema = (type: string, data: object) => {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
};