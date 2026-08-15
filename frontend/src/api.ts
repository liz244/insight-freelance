
import axios from "axios";

// En local : rien ne change, ça reste sur ton backend en localhost.
// En production (Vercel/Netlify) : on définit VITE_API_URL avec l'URL
// publique du backend déployé (Render/Railway), et le site s'y connecte
// automatiquement, sans changer une ligne de code.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

export default API;