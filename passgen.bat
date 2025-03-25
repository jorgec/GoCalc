@echo off
REM
REM Hash a supplied password using SHA-256 and save it to a file named "password".
REM
REM Usage: passgen.bat '<password>'
REM

if "%~1"=="" (
    echo Usage: %~0 ^<password^>
    exit /b 1
)

:: Write the password to a temporary file
echo %~1> tmpfile.txt

:: Use certutil to compute the SHA-256 of the file, then filter out extra lines.
:: The second and only non-empty line in the output (after filtering) is the hash.
certutil -hashfile tmpfile.txt SHA256 | find /i /v "SHA256" | find /i /v "certutil" > tmp.txt

:: Read the filtered hash line into a variable
set /p hashed=< tmp.txt

:: Clean up temporary files
del tmpfile.txt >nul 2>&1
del tmp.txt >nul 2>&1

:: Write the hash to "password" file
echo %hashed%> password

echo Hash saved to 'password' file.