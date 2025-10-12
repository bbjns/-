import {createNavigation} from 'next-intl/navigation';

export const locales = ['zh','en','ko'] as const;
export const localePrefix = 'always';

export const {Link, redirect, usePathname, useRouter} = createNavigation({
  locales,
  localePrefix,
});
