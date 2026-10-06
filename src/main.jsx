import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import appStore from './utils/appStore'
import { installResourceInvalidation, setResourceScope } from './utils/resourceCache'

installResourceInvalidation();
setResourceScope(appStore.getState().user?._id || null);
appStore.subscribe(() => setResourceScope(appStore.getState().user?._id || null));

// Web fonts enhance the page after loading; the system font can paint immediately.
const fonts = document.getElementById('devmesh-fonts');
if (fonts) {
  const applyFonts = () => { fonts.media = 'all'; };
  if (fonts.sheet) applyFonts();
  else fonts.addEventListener('load', applyFonts, { once: true });
}

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
)
