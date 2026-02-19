@echo off
echo.
echo ========================================
echo   Museo de Pacho - Hub World Server
echo ========================================
echo.
echo Abriendo en: http://localhost:8080
echo Presiona Ctrl+C para detener
echo.
start http://localhost:8080
python -m http.server 8080
