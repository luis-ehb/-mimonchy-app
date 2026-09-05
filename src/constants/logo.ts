// Este archivo quedó en desuso. El logo real ahora vive como archivo normal
// en assets/images/logo.png (el dueño del proyecto lo copió ahí manualmente)
// y se usa con require('@/assets/images/logo.png') en index.tsx.
// Antes este archivo tenía el logo embebido como texto base64 porque el
// conector Filesystem solo podía escribir texto — pero escribir ese string
// gigante en una sola llamada trababa el conector. Usar el archivo binario
// real es más simple, más liviano y evita ese problema por completo.
