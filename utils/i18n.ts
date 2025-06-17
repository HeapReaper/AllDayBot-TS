import fs from 'fs';
import path from 'path';
// @ts-ignore
import Gettext from 'node-gettext';
// @ts-ignore
import gettextParser from 'gettext-parser';

const gt = new Gettext();

const loadedLocales = new Set<string>();

export const loadLocale = (locale: string) => {
    if (loadedLocales.has(locale)) return;

    const poPath = path.join(__dirname, `../locales/${locale}/LC_MESSAGES/messages.po`);
    if (!fs.existsSync(poPath)) {
        throw new Error(`PO file not found for locale: ${locale}`);
    }

    const poRaw = fs.readFileSync(poPath);
    const parsed = gettextParser.po.parse(poRaw);

    gt.addTranslations(locale, 'messages', parsed);
    loadedLocales.add(locale);
};

export const setLocale = (locale: string) => {
    if (!loadedLocales.has(locale)) {
        throw new Error(`Locale '${locale}' not loaded. Call loadLocale first.`);
    }
    gt.setLocale(locale);
    gt.textdomain('messages');
};

export const getText = (msgid: string) => gt.gettext(msgid);
