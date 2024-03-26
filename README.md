# README

## About

Go (Golang) is a performant, statically typed language designed for simplicity and efficiency, ideal for backend
development. Go was designed by Google in 2006 with modern computing in mind, including multicore processors, cloud-based infrastructure,
and networked systems. Its features cater to the needs of developers building scalable and efficient software in today's
distributed computing environments.

For developers, Go offers a blend of performance, efficiency, and developer-friendly features, making it a compelling
choice for a wide range of applications, from command-line tools and APIs to large-scale web services.

When used with Wails, a framework that allows Go to communicate with a frontend built in JavaScript (or web
technologies like Svelte, React), it enables the creation of cross-platform desktop applications. This combination
leverages Go's speed and robustness, JavaScript's versatility, and Wails' seamless bridge between them, making it an
excellent stack for developers looking to build fast, native, cross-platform desktop apps with web technology frontends.

## Installation Instructions

Follow these steps to clone the project repository and install the necessary dependencies

### Prerequisites

Ensure you have the following installed:

- Git
- Go (1.18 or newer recommended)
- Node.js (LTS version recommended)
- npm (comes with Node.js)

### Step 1: Clone the Project

1. Open a terminal or command prompt.
2. Clone the project repository by running:

```bash
git clone https://github.com/jorgec/GoCalc
```

### Step 2: Install Go dependencies

Navigate to the project directory

```bash
cd GoCalc
```

Install the Go dependencies by running:

```bash
go mod tidy
```

Install Wails CLI by running:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

Navigate to the `frontend` directory and install node

```bash
cd frontend
npm install
```

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.
