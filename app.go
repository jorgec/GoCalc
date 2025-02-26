package main

import (
	"context"
	"encoding/json"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"io/ioutil"
	"os"
	"path/filepath"
)

// App struct
type App struct {
	ctx   context.Context
	isDev bool
}

func checkDevMode() bool {
	args := os.Args // Get command-line arguments
	for _, arg := range args {
		if arg == "--dev" {
			return true
		}
	}
	return false
}

// NewApp creates a new App application struct
func NewApp() *App {

	app := &App{
		isDev: checkDevMode(), // ✅ Check if the app is in dev mode
	}
	return app
}

// startup is called when the app starts.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// LoadJSONFile opens a file dialog and returns the file contents.
func (a *App) LoadJSONFile() (string, error) {
	// OpenFileDialog returns the selected file path (or an empty string if cancelled).
	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select a File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON Files (*.json)",
				Pattern:     "*.json",
			},
		},
	})
	if err != nil {
		return "", err
	}

	// If no file was selected, just return an empty string.
	if filePath == "" {
		return "", nil
	}

	// Read the selected file.
	bytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		return "", err
	}

	return string(bytes), nil
}

func (a *App) SaveFile(content string) (string, error) {
	// Open a "Save File" dialog
	savePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Your File",
		DefaultFilename: "",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "All Files",
				Pattern:     "",
			},
		},
	})
	if err != nil {
		return "", err
	}

	// If the user cancels, savePath will be empty
	if savePath == "" {
		return "", nil
	}

	// Overwrite (or create) the file with the given content
	err = os.WriteFile(savePath, []byte(content), 0644)
	if err != nil {
		return "", err
	}

	return savePath, nil
}

func (a *App) LoadConstants() (map[string]interface{}, error) {
	var filePath string

	// ✅ Use the --dev flag to determine load location
	if a.isDev {
		filePath = filepath.Join("frontend", "public", "constants.json")
	} else {
		execPath, err := os.Executable()
		if err != nil {
			return nil, err
		}
		filePath = filepath.Join(filepath.Dir(execPath), "constants.json")
	}

	// ✅ Check if the file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, nil // No file yet, return nil
	}

	// ✅ Read the file
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	// ✅ Unmarshal JSON
	var constants map[string]interface{}
	err = json.Unmarshal(data, &constants)
	if err != nil {
		return nil, err
	}

	return constants, nil
}
func (a *App) SaveConstants(content interface{}) (string, error) {
	data, err := json.MarshalIndent(content, "", "  ")
	if err != nil {
		return "", err
	}

	if err != nil {
		return "", err
	}
	var savePath string

	if a.isDev {
		// Development: Save to frontend/public/constants.json
		savePath = filepath.Join("frontend", "public", "constants.json")
	} else {
		// Production: Save in the same directory as the app binary
		execPath, err := os.Executable()
		if err != nil {
			return "", err
		}
		savePath = filepath.Join(filepath.Dir(execPath), "constants.json")
	}

	// ✅ Ensure the directory exists
	err = os.MkdirAll(filepath.Dir(savePath), 0755)
	if err != nil {
		return "", err
	}

	// ✅ Write the file
	err = os.WriteFile(savePath, data, 0644)
	if err != nil {
		return "", err
	}

	return savePath, nil
}
