# Running the TouchDesigner + p5.js Interactive Installation

This project uses:

* **TouchDesigner** for MediaPipe hand tracking
* **Node.js** to serve the p5 sketch and relay WebSocket messages
* **p5.js** for rendering the interactive logo animation

---

# Folder Structure

```text
MediaPipe/
├── mp_handtracking.toe
└── p5particle/
    ├── index.html
    ├── sketch.js
    ├── logo.png
    ├── p5.js
    ├── p5.sound.min.js
    ├── server.js
    ├── package.json
    ├── package-lock.json
    └── node_modules/
```

---

# First Time Setup (Mac / Windows)

Install **Node.js LTS**

https://nodejs.org/

Open Terminal (or Command Prompt) inside the `p5particle` folder.

Install the WebSocket package once:

```bash
npm install ws
```

No other packages are required.

---

# Starting the Installation

Open Terminal inside:

```text
MediaPipe/p5particle
```

Run:

```bash
node server.js
```

You should see:

```text
p5 server running at http://localhost:8000
WebSocket running at ws://localhost:8000
```

Leave this terminal running.

---

# TouchDesigner Settings

## Web Render TOP

URL:

```text
http://localhost:8000/index.html
```

Resolution:

```text
896 × 192
```

---

## WebSocket DAT

Address:

```text
ws://localhost:8000
```

---

## Execute DAT

The Execute DAT sends the MediaPipe hand coordinates to the WebSocket.

Hand CHOPs:

```text
select1
select2
```

Channels:

```text
h1:middle_finger_mcp:x
h1:middle_finger_mcp:y

h2:middle_finger_mcp:x
h2:middle_finger_mcp:y
```

---

# Launch Order

1. Start Node server

```bash
node server.js
```

2. Open the `.toe` file

3. Ensure the Web Render TOP loads:

```text
http://localhost:8000/index.html
```

4. Begin MediaPipe hand tracking

---

# Windows Deployment

Only **Node.js** needs to be installed on the target computer.

Copy the entire project folder.

Inside `p5particle`, run:

```bash
node server.js
```

Everything else is contained within the project folder.

---

# Optional: Windows Launcher

Create a file named:

```text
start_server.bat
```

Contents:

```bat
@echo off
cd /d "%~dp0"
node server.js
pause
```

Double-clicking this file starts the Node server automatically.

---

# Troubleshooting

## Browser page doesn't load

Check that the Node server is running:

```bash
node server.js
```

Visit:

```text
http://localhost:8000/index.html
```

in a browser.

---

## No hand tracking

Verify:

* Node server is running.
* TouchDesigner WebSocket DAT is connected.
* `execute1` is sending data.
* `select1` and `select2` contain valid MediaPipe coordinates.

---

## Coordinate System

MediaPipe uses a top-left origin.

The p5 sketch flips the Y coordinate using:

```javascript
(1.0 - h.y) * height
```

so that hand movement matches the screen.

---

# Notes

This architecture was chosen because it separates responsibilities:

* **TouchDesigner** → MediaPipe hand tracking
* **Node.js** → Local web server + WebSocket relay
* **p5.js** → Interactive logo animation

This keeps the rendering simple, efficient, and suitable for long-running installations.
