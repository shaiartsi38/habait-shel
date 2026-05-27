#!/usr/bin/env bash
# Push to GitHub with a Personal Access Token — token never appears in logs
set -e

printf "הדבק את ה-Token (הקלדה לא מוצגת): "
read -rs GIT_TOKEN
echo

REMOTE="https://shaiartsi38:${GIT_TOKEN}@github.com/shaiartsi38/habait-shel.git"

git remote set-url origin "$REMOTE"
git push origin main

# מנקה את הטוקן מה-remote מיד אחרי ה-push
git remote set-url origin "https://github.com/shaiartsi38/habait-shel.git"

echo "✓ Push הצליח. הטוקן נוקה מה-remote."
unset GIT_TOKEN
