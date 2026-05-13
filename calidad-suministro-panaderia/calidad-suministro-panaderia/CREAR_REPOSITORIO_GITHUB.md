# Cómo subir este entregable a GitHub

## Opción A · Subir desde la web de GitHub

1. Entra en <https://github.com>.
2. Pulsa **New repository**.
3. Nombre recomendado: `calidad-suministro-panaderia`.
4. Descripción recomendada: `Peritaje de calidad del suministro eléctrico aplicado a un obrador de panadería industrial`.
5. Marca el repositorio como **Public** o **Private**, según indique el profesor.
6. No añadas README desde GitHub, porque este repositorio ya lo incluye.
7. Crea el repositorio.
8. Pulsa **Add file → Upload files**.
9. Sube todo el contenido de esta carpeta.
10. Commit: `Primer entregable proyecto calidad del suministro`.

## Opción B · Subir desde terminal

Desde la carpeta del repositorio:

```bash
git init
git add .
git commit -m "Primer entregable del proyecto C5"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/calidad-suministro-panaderia.git
git push -u origin main
```

## Recomendación

No subas `node_modules/`. El archivo `.gitignore` ya está preparado para excluirlo. Los datos originales de PicoScope se guardan en `data/raw/ArchivosPicoScope.rar` para conservar la trazabilidad de las medidas.
