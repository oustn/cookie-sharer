import process from 'node:process';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'url';
import _ from 'lodash';

import Manifest from '../manifest.json';

export const isDev = process.env.NODE_ENV !== 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function resolveEntries(contentScript = false) {
  const entries: { key: string, value: string, name: string, path: string, withCss: boolean }[] = [];

  const names = new Set<string>();

  function walk(value: unknown, path = '') {
    if (_.isPlainObject(value)) {
      _.forOwn(value, (value, key) => {
        walk(value, path ? `${path}.${key}` : key);
      });
    } else if (_.isString(value) && (_.endsWith(value, '.html') || _.endsWith(value, '.ts'))) {
      if (contentScript && !path.includes('content_scripts') && !path.includes('web_accessible_resources')) {
        return;
      }
      let name = basename(value).replace(/\.(html|ts)$/, '');
      if (name === 'index') {
        name = basename(dirname(value));
      }
      if (names.has(name)) {
        name = path.replace(/\./g, '_');
      }
      names.add(name);
      entries.push({
        key: path,
        value,
        name,
        path: resolve(__dirname, '..', value),
        withCss: path.includes('content_scripts') && _.get(Manifest, path.replace('js', 'css')),
      });
    } else if (_.isArray(value)) {
      value.forEach((value, index) => {
        walk(value, path ? `${path}.${index}` : `${index}`);
      });
    }
  }

  walk(Manifest);

  return entries;
}

export function cleanArray(object: unknown) {
  if (!_.isPlainObject(object)) return;
  Object.entries(object).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      object[key] = value.filter(d => d);
      object[key].forEach((d: unknown) => cleanArray(d));
    } else {
      cleanArray(value);
    }
  });
}
