@echo off
echo Deploying Facebook Page ID corrections for karmakazi.org...

REM Navigate to project directory
cd /d "C:\Users\Kaztro\Documents\GitHub\karmakazi-website"

REM Add all changes
echo Adding Facebook Page ID corrections...
git add .

REM Commit with specific message
git commit -m "Update Facebook integration with correct Page ID

FACEBOOK CORRECTIONS:
- Updated Page ID from 61579899121583 to 742275432308734
- Corrected all Facebook URLs in blog.html
- Updated facebook-feed.js with proper Page ID
- Enhanced diagnostic logging should now work properly

FIXES APPLIED:
- Navigation TypeError resolved 
- Facebook Page Plugin now uses actual Facebook Page
- Diagnostic logs will show detailed loading status
- Fallback content properly configured

The Facebook feed should now load correctly with the proper Page ID."

REM Push to GitHub
git push origin main

echo.
echo Deployment complete!
echo.
echo Facebook Integration Status:
echo - Page ID updated to: 742275432308734
echo - All URLs corrected in blog.html
echo - Enhanced diagnostics active
echo.
echo Test the Facebook integration:
echo 1. Visit https://karmakazi.org/pages/blog.html
echo 2. Open F12 Developer Tools
echo 3. Check Console for Facebook diagnostic messages
echo 4. The widget should now load with your actual Page content
echo.
echo If it still doesn't work, the diagnostic will show:
echo - Facebook SDK loading status
echo - Widget render attempts  
echo - Page access permissions
echo - Exact error causes
echo.
pause