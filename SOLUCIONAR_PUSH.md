# 🔐 Solucionar Error de Push a GitHub

## El problema:
Estás autenticado como `jorgepena-cacacaca` pero el repo es de `joaquinjust`.

## Solución Rápida:

### Opción 1: Usar Personal Access Token (Recomendado)

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token (classic)"
3. Dale un nombre (ej: "Hack-2")
4. Selecciona el scope `repo` (todos los permisos de repositorio)
5. Click en "Generate token"
6. **COPIA EL TOKEN** (solo lo verás una vez)

7. Luego ejecuta:
```bash
git push -u origin main
```

8. Cuando pida credenciales:
   - **Username:** joaquinjust
   - **Password:** Pega el token (NO tu contraseña de GitHub)

### Opción 2: Cambiar credenciales en Windows

1. Ve a: Panel de Control → Credenciales de Windows
2. Busca "git:https://github.com"
3. Elimínalas
4. Intenta hacer push de nuevo
5. Ingresa las credenciales correctas de `joaquinjust`

### Opción 3: Usar SSH (si tienes configurado)

```bash
git remote set-url origin git@github.com:joaquinjust/Hack-2.git
git push -u origin main
```

## Verificar que funcionó:

Después del push, ve a: https://github.com/joaquinjust/Hack-2
Deberías ver todos tus archivos.

