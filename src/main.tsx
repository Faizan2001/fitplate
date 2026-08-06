import { createRoot } from 'react-dom/client'
import '@fontsource/bricolage-grotesque/500.css'
import '@fontsource/bricolage-grotesque/600.css'
import '@fontsource/public-sans/400.css'
import '@fontsource/public-sans/500.css'
import '@fontsource/public-sans/600.css'
import './styles.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(<App />)
