import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import prefixSelector from 'postcss-prefix-selector'
import {preflightScopeOptions} from './src/preflightScope.js'

export default {
  plugins: [
    tailwindcss,
    // after tailwindcss (so @tailwind base is expanded), before autoprefixer (per its README)
    prefixSelector(preflightScopeOptions),
    autoprefixer,
  ],
}
