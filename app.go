package main

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"io/ioutil"
	"os"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
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
