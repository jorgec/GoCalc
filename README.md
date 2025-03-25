# GoCalc - Electrical Load Calculator and Material Cost Estimator

## About

### Why JavaScript and Svelte?
JavaScript is one of the most widely used programming languages for creating interactive web interfaces. Svelte is a modern, reactive JavaScript framework that compiles your code into highly efficient, minimal runtime JavaScript. It allows you to build powerful and fast web applications with less overhead compared to other frameworks.

### Why Go?
Go (Golang) is a performant, statically typed language designed for simplicity and efficiency, ideal for backend development. It was created by Google in 2006 with modern computing in mind, including multicore processors, cloud-based infrastructure, and networked systems. Go’s concurrency model (goroutines and channels) and its straightforward syntax make it an excellent choice for building scalable, high-performance software.

### Why Wails?
Wails allows you to build desktop applications for Windows, macOS, and Linux using Go for the backend logic and modern web technologies (like Svelte, React, Vue, or plain JavaScript/HTML/CSS) for the frontend. It essentially bridges Go to the frontend, so your Go code can directly interact with your web UI. This makes Wails ideal for developers who prefer Go for server-side or business logic, but want the convenience and flexibility of a JavaScript-based frontend.

---

## Installation Instructions

Below are instructions for installing from scratch on Windows and macOS, ensuring you have all prerequisites to work with Wails 2.10.

### Prerequisites

You will need the following:

1. **Git**
    - **Windows**: [Download Git for Windows](https://git-scm.com/download/win) and run the installer.
    - **macOS**: Git is typically installed by default on macOS. If not, install [Xcode Command Line Tools](https://developer.apple.com/download/all/) or use [Homebrew](https://brew.sh/) (`brew install git`).

2. **Go (1.18 or newer recommended)**
    - **Windows**: [Download Go](https://go.dev/dl/) for Windows and run the installer. Follow the prompts.
    - **macOS**: [Download Go](https://go.dev/dl/) for macOS and run the installer, or use Homebrew (`brew install go`).

3. **Node.js (LTS version recommended) & npm**
    - **Windows**: [Download Node.js](https://nodejs.org/) for Windows and run the installer.
    - **macOS**: [Download Node.js](https://nodejs.org/) for macOS and run the installer, or use Homebrew (`brew install node`).

4. **Wails CLI (2.10 or newer)**  
   You can install Wails via:
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```
   Make sure your `GOPATH/bin` (or the equivalent Go bin directory) is in your `PATH`.

#### Verifying your installations

- **Git**: `git --version`
- **Go**: `go version`
- **Node**: `node -v`
- **npm**: `npm -v`
- **Wails**: `wails version`

---

## Step-by-Step Installation

1. **Clone the Project**

   ```bash
   git clone https://github.com/jorgec/GoCalc
   ```
   Then navigate into the project directory:
   ```bash
   cd GoCalc
   ```

2. **Install Go Dependencies**

   In the `GoCalc` folder (the root of the project), run:
   ```bash
   go mod tidy
   ```

3. **Install Wails CLI**

   Ensure you have Wails (2.10 or newer) installed:
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```

4. **Install Frontend Dependencies**

   Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```

5. **(Optional) Return to Project Root**
   ```bash
   cd ..
   ```

### Notes for Windows Users

- Make sure the folder where Go installs executables (usually `%USERPROFILE%\go\bin`) is in your `PATH`.
- If `wails` is not recognized as a command, open a new terminal or command prompt after adjusting your system `PATH`.

### Notes for macOS Users

- Ensure you have a recent Go version installed (1.18 or above).
- If `wails` is not recognized, ensure `$(go env GOPATH)/bin` is in your `PATH`.
- You can manage installations easily using [Homebrew](https://brew.sh/).

### Notes for Linux Users
- I'm assuming that if you're on Linux, it would be pretty condescending for me to give you any instructions :)

---

## Live Development

From the project root directory (where your `main.go` and `go.mod` reside), run:

```bash
wails dev
```

This does two things:
1. Spins up a Vite development server that automatically hot-reloads frontend changes.
2. Provides a dev server on [http://localhost:34115](http://localhost:34115), where you can open your browser and access Go methods from devtools if desired.

---

## Password
You can generate a `password` file using the bundled `bash` script:
```bash
 ./passgen.sh 'password'
```
Note that the password parameter should be enclosed by single quotes.

For Windows, you can use the PowerShell script `passgen.ps1` or the batch file `passgen.bat`

## Building for Production

To build a redistributable, production-mode package, run:

```bash
wails build
```

After the build completes, you will have a cross-platform desktop application in the `build/bin` folder (depending on your configuration and OS). Distribute it to users just like any other native application.

For MacOS, copy the generated password file to the `App` package, for example:
```
cp password "build/bin/GoCalc.app/Contents/MacOS/"
```
For Windows, just make sure the password file is in the same location as the executable

---
