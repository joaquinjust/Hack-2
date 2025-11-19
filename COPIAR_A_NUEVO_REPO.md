# 📦 Copiar Proyecto a un Nuevo Repositorio de GitHub

## Opción 1: Desde Cero (Recomendado)

### Paso 1: Crea el nuevo repositorio en GitHub
1. Ve a https://github.com/new
2. Crea un nuevo repositorio (puede estar vacío)
3. **NO inicialices con README, .gitignore o licencia**

### Paso 2: Copia todos los archivos a una nueva carpeta

```bash
# Navega a donde quieras el nuevo proyecto
cd C:\Users\Mateo\OneDrive\Desktop\hac2

# Crea una nueva carpeta (cambia el nombre por el que quieras)
mkdir mi-techflow-app
cd mi-techflow-app

# Copia todos los archivos del proyecto actual
# (Desde el explorador de archivos o con PowerShell)
```

### Paso 3: Inicializa Git en la nueva carpeta

```bash
# Inicializa git
git init

# Agrega todos los archivos
git add .

# Haz el primer commit
git commit -m "Initial commit: TechFlow Task Management App"

# Conecta con tu nuevo repositorio
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Sube todo
git branch -M main
git push -u origin main
```

## Opción 2: Cambiar el Remote del Repo Actual

Si quieres cambiar el remote del proyecto actual:

```bash
# Ver el remote actual
git remote -v

# Remover el remote actual
git remote remove origin

# Agregar tu nuevo repositorio
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Agregar todos los archivos
git add .

# Commit
git commit -m "Initial commit: TechFlow Task Management App"

# Subir
git branch -M main
git push -u origin main
```

## ⚠️ Importante

- Asegúrate de que el archivo `.env` NO se suba (ya está en .gitignore)
- El archivo `env.example` SÍ se sube (es la plantilla)

