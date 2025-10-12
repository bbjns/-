import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  const lc = locale ?? 'zh';
  return {
    locale: lc,
    messages: (await import(`./messages/${lc}.json`)).default,
  };
});
