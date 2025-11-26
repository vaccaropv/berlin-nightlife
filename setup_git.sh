#!/bin/bash

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed."
    exit 1
fi

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    # Rename master to main if it's the default
    git branch -M main
else
    echo "Git repository already initialized."
fi

# Add all files
echo "Adding files to staging..."
git add .

# Commit
echo "Committing files..."
git commit -m "Initial commit: Berlin Nightlife App"

echo ""
echo "----------------------------------------------------------------"
echo "Git repository initialized and files committed locally."
echo "----------------------------------------------------------------"
echo ""
# Add remote and push
if ! git remote | grep -q origin; then
    echo "Adding remote origin..."
    git remote add origin https://github.com/vaccaropv/berlin-nightlife.git
else
    echo "Remote origin already exists. Updating URL..."
    git remote set-url origin https://github.com/vaccaropv/berlin-nightlife.git
fi

echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "----------------------------------------------------------------"
echo "Done! Your code has been pushed to GitHub."
echo "----------------------------------------------------------------"
