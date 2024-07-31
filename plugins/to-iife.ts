import type {Plugin} from 'vite';

export function toIife(files = ['inject']): Plugin {
  return {
    apply: 'build',

    name: 'to-iife',

    enforce: 'post',

    generateBundle(__, bundle) {
      for (const file in bundle) {
        const chunk = bundle[file];
        if (chunk.type === 'chunk' && chunk.isEntry && files.includes(chunk.name)) {
          chunk.code = `(function(){${chunk.code}})();`;
        }
      }
    }
  }
}
