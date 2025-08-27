@echo off
echo Updating karmakazi.org with navigation and Facebook diagnostic fixes...

REM Navigate to project directory
cd /d "C:\Users\Kaztro\Documents\GitHub\karmakazi-website"

REM Add all changes
echo Adding changes to git...
git add .

REM Commit with detailed message about fixes
git commit -m "Fix navigation errors and enhance Facebook diagnostics

NAVIGATION FIXES:
- Fixed sphere.js TypeError: Cannot read properties of null 
- Added detection for sidebar vs carousel layouts
- Enhanced touch navigation for mobile devices
- Proper event listener handling for both page types

FACEBOOK DIAGNOSTIC ENHANCEMENTS:
- Added comprehensive Facebook widget diagnostic logging
- Enhanced error detection and fallback triggers
- Better status indicator updates
- Timeout checks for failed SDK loading
- Detailed console logging for troubleshooting

READY TO TEST:
- Navigation errors should be resolved
- Facebook issues will be clearly logged in console
- Fallback content will show if Facebook fails to load"

REM Push to GitHub
git push origin main

echo.
echo Deployment complete! 
echo.
echo Next steps to diagnose Facebook:
echo 1. Visit https://karmakazi.org/pages/blog.html
echo 2. Open F12 Developer Tools
echo 3. Check Console tab for detailed Facebook diagnostic logs
echo 4. Look for specific error messages about why Facebook isn't loading
echo.
echo Expected console messages:
echo - "Loading Facebook SDK..."
echo - "Facebook SDK loaded successfully"
echo - "Facebook XFBML render event"
echo - Widget height and status information
echo.
pause