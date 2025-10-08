import "@app/css/main.css"

const API_URL = import.meta.env.VITE_API_URL

// Health check
const check = await ( await fetch( `${ API_URL }/health` ) ).json()
console.table( check )
