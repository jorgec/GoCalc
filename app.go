package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

func (a *App) SaveJSON(filename string, data interface{}) error {
	// Marshal the data to JSON bytes.
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}

	// Ensure the filename has the .json extension.
	if !strings.HasSuffix(filename, ".json") {
		filename += ".json"
	}

	// Write JSON bytes to the file.
	return os.WriteFile(filename, jsonData, 0644)
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
