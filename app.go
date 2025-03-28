package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"io/ioutil"
	"os"
	"path/filepath"
	gruntime "runtime"
)

// App struct
type App struct {
	ctx        context.Context
	isDev      bool
	allowClose bool
}

func (a *App) AllowClose() {
	a.allowClose = true
	fmt.Println("App is now allowed to close.")
	wruntime.Quit(a.ctx)
}

func (a *App) OnBeforeClose(ctx context.Context) (prevent bool) {
	if a.allowClose {
		return false // Allow closing
	}
	fmt.Println("Close prevented! Show a dialog here.")
	return true // Prevent closing
}

func checkDevMode() bool {
	return true
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
	filePath, err := wruntime.OpenFileDialog(a.ctx, wruntime.OpenDialogOptions{
		Title: "Select a File",
		Filters: []wruntime.FileFilter{
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
	savePath, err := wruntime.SaveFileDialog(a.ctx, wruntime.SaveDialogOptions{
		Title:           "Save Your File",
		DefaultFilename: "",
		Filters: []wruntime.FileFilter{
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

	if a.isDev {
		filePath = filepath.Join("frontend", "public", "constants.json")
	} else {
		execPath, err := os.Executable()
		if err != nil {
			return nil, err
		}
		filePath = filepath.Join(filepath.Dir(execPath), "constants.json")
	}

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, err // No file yet, return nil
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

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

	err = os.MkdirAll(filepath.Dir(savePath), 0755)
	if err != nil {
		return "", err
	}

	err = os.WriteFile(savePath, data, 0644)
	if err != nil {
		return "", err
	}

	return savePath, nil
}

func isDev() bool {
	// Check if a file called "dev" exists in the current working dir
	cwd, err := os.Getwd()
	if err != nil {
		return false
	}
	devFile := filepath.Join(cwd, "dev")
	if _, err := os.Stat(devFile); err == nil {
		return true
	}
	return false
}

func (a *App) ExposePath(filename string) (string, error) {
	savePath, err := getSavePath(filename)
	if err != nil {
		return "", err
	}
	return savePath, nil
}

func getSavePath(filename string) (string, error) {
	var basePath string

	if isDev() {
		// In dev mode, use current working dir (project root)
		cwd, err := os.Getwd()
		if err != nil {
			return "", err
		}
		basePath = filepath.Join(cwd, "release")
	} else {
		// In production mode
		execPath, err := os.Executable()
		if err != nil {
			return "", err
		}

		switch gruntime.GOOS {
		case "windows":
			basePath = filepath.Dir(execPath)
		case "darwin":
			appPath := filepath.Dir(execPath)           // /MacOS
			contentsPath := filepath.Dir(appPath)       // /Contents
			appBundlePath := filepath.Dir(contentsPath) // /MyApp.app
			basePath = filepath.Dir(appBundlePath)
		default:
			// Fallback for other OSes
			basePath = filepath.Dir(execPath)
		}
	}

	return filepath.Join(basePath, filename), nil
}

func (a *App) SaveMaterialInventory(content interface{}) (string, error) {
	data, err := json.MarshalIndent(content, "", "  ")
	if err != nil {
		return "", err
	}

	baseDir, err := os.UserConfigDir() // or os.UserHomeDir()
	if err != nil {
		return "", err
	}

	appDir := filepath.Join(baseDir, "")
	err = os.MkdirAll(appDir, 0755)
	if err != nil {
		return "", err
	}

	savePath, err := getSavePath("material_dictionary.json")

	err = os.WriteFile(savePath, data, 0644)
	if err != nil {
		return "", err
	}

	return savePath, nil
}
func (a *App) LoadMaterialInventory() (map[string]interface{}, error) {
	filePath, err := getSavePath("material_dictionary.json")

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, err // No file yet, return nil
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var constants map[string]interface{}
	err = json.Unmarshal(data, &constants)
	if err != nil {
		return nil, err
	}

	return constants, nil
}

func (a *App) GetStoredHash() (string, error) {
	exePath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("could not find executable path: %w", err)
	}

	exeDir := filepath.Dir(exePath)
	passwordFilePath := filepath.Join(exeDir, "password")

	file, err := os.Open(passwordFilePath)
	if err != nil {
		return "", fmt.Errorf("failed to open 'password' file: %w", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	if scanner.Scan() {
		return scanner.Text(), nil
	}
	if err := scanner.Err(); err != nil {
		return "", fmt.Errorf("failed to read 'password' file: %w", err)
	}

	return "", fmt.Errorf("password file is empty")
}

func (a *App) __GetStoredHash() (string, error) {
	file, err := os.Open("password")
	if err != nil {
		return "", fmt.Errorf("failed to open 'password' file: %w", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	if scanner.Scan() {
		return scanner.Text(), nil
	}
	if err := scanner.Err(); err != nil {
		return "", fmt.Errorf("failed to read 'password' file: %w", err)
	}

	return "", fmt.Errorf("password file is empty")
}
