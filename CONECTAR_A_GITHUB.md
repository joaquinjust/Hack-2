# 🚀 Conectar a tu Repositorio de GitHub

## Pasos para conectar este proyecto a tu nuevo repo de GitHub:

### 1. Crea el repositorio en GitHub
- Ve a https://github.com/new
- Crea un nuevo repositorio (puede estar vacío)
- **NO inicialices con README, .gitignore o licencia** (ya los tenemos)

### 2. Ejecuta estos comandos en la terminal:

```bash
# Remover el remote actual (si existe)
git remote remove origin

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: TechFlow Task Management App"

# Agregar tu nuevo repositorio como remote
# REEMPLAZA con tu URL de GitHub:
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Cambiar a branch main (si es necesario)
git branch -M main

# Subir todo
git push -u origin main
```

### 3. Si tienes problemas de autenticación:

**Opción A: Usar Personal Access Token**
```bash
# Cuando pida usuario/contraseña:
# Usuario: tu_usuario_de_github
# Contraseña: tu_personal_access_token
```

**Opción B: Usar SSH (si tienes configurado)**
```bash
# Cambia la URL del remote a SSH:
git remote set-url origin git@github.com:TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 4. Verificar que funcionó:
- Ve a tu repositorio en GitHub
- Deberías ver todos los archivos subidos

