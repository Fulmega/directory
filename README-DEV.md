# Fulmega – Entorno de Desarrollo


## 🧱 Configuración inicial


1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```


2. Crea tu archivo `.env.local` basado en `.env.example` y completa tus claves reales:
```bash
cp .env.example .env.local
```


3. Abre en VS Code y usa **Dev Containers**:
- Instala la extensión “Dev Containers”.
- Abre el comando `F1 → Dev Containers: Reopen in Container`.
- El contenedor incluye Node 20 + pnpm.


4. Inicia el entorno:
```bash
pnpm dev
```


5. Accede a la app desde el navegador en [http://localhost:5173](http://localhost:5173)


## 🪄 Alternativa sin Docker


Si no usas Dev Containers:
```bash
npm install -g pnpm
pnpm install
pnpm dev
```


## 🧩 Notas


- No subas `.env` reales, usa `.env.example` como plantilla.
- Los cambios en el código deben hacerse desde ramas (`feat/...`, `fix/...`).
- Puedes usar **GitHub Codespaces** para trabajar 100% en la nube.
