@echo off
echo.
echo  =======================================
echo    PIXLIFT -- Image Enhancer (Windows)
echo  =======================================
echo.

echo [1/3] Installing Python dependencies...
pip install -r model\requirements.txt

echo.
echo [2/3] Installing backend dependencies...
cd backend
npm install
cd ..

echo.
echo [3/3] Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo  All dependencies installed!
echo  Starting servers in separate windows...
echo.

start "PIXLIFT Backend"  cmd /k "cd backend && node server.js"
start "PIXLIFT Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo  Backend  -^> http://localhost:5000
echo  Frontend -^> http://localhost:3000
echo.
echo  Open http://localhost:3000 in your browser.
pause
