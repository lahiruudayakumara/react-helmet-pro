export const injectLocale = (head: any, locale = 'en') => {
    return {
        ...head,
        meta: [...(head.meta || []), { name: 'language', content: locale }],
    };
};