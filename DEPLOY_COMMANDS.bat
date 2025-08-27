@echo off
echo Deploying karmakazi.org website to GitHub...

REM Navigate to project directory
cd /d "C:\Users\Kaztro\Documents\GitHub\karmakazi-website"

REM Check current status
echo Checking git status...
git status

REM Add all changes
echo Adding all changes to git...
git add .

REM Show what will be committed
git status

REM Commit with descriptive message
echo Committing changes...
git commit -m "SECURITY FIX: Remove exposed Facebook token and fix navigation paths

CRITICAL SECURITY UPDATES:
- Removed publicly exposed Facebook access token from facebook-feed.js
- Fixed broken CSS/JS paths in about.html (missing ../ prefixes)
- Added proper token configuration placeholders
- Enhanced error handling and fallback content for Facebook integration
- Fixed navigation between pages folder and root directory

DEPLOYMENT READY:
- All files properly organized for GitHub Pages
- Nebula texture and MP4 videos in correct locations
- CNAME file configured for karmakazi.org domain
- Service worker ready for caching optimization"

REM Push to GitHub
echo Pushing to GitHub...
git push origin main

echo.
echo Deployment complete!
echo Your website will be live at https://karmakazi.org in 5-10 minutes.
echo.
echo IMPORTANT: To enable Facebook feed, add your credentials to facebook-feed.js:
echo - Replace 'YOUR_FACEBOOK_APP_ID' with your actual App ID
echo - Add your access token to the accessToken field
echo.
pause