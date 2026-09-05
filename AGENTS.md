# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Flujo de Git / GitHub

Este proyecto NO tiene suscripción de Claude Code activa (se usa el conector Filesystem, que es gratis, para leer/escribir archivos). Filesystem NO puede ejecutar comandos de terminal (no puede hacer git add, git commit, git push).

Por lo tanto:
- Si estás operando como Filesystem (sin acceso a bash/terminal): edita los archivos que se te pidan, pero NO intentes ejecutar comandos git. Debes indicarle al usuario los comandos exactos de git que tiene que correr él mismo en su terminal (PowerShell), y esperar su confirmación de que los corrió.
- Si estás operando como Claude Code con acceso real a terminal (bash) porque el usuario decidió pagar por uso vía API key: en ese caso sí puedes ejecutar git add, git commit y git push directamente.

Repositorio: https://github.com/luis-ehb/-mimonchy-app (rama main)

# Recordatorio obligatorio

Cada vez que se edite, cree o modifique cualquier archivo del proyecto (incluyendo archivos .md), se debe informar inmediatamente después al usuario los comandos exactos de git que debe correr en su terminal para subir ese cambio a GitHub (git add, git commit -m "...", git push). No asumir que el usuario ya sabe que debe hacerlo: decirlo siempre, de forma explícita, después de cada cambio de archivo.

