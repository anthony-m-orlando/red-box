#!/bin/bash
# Red Box RPG v0.1.0 - Build Verification Script

echo "================================================"
echo "  Red Box RPG v0.1.0 - Build Verification"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm version
echo "🔍 Checking npm version..."
NPM_VERSION=$(npm -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}!${NC} node_modules not found. Running npm install..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Dependencies installed"
    else
        echo -e "${RED}✗${NC} Failed to install dependencies"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Dependencies installed"
fi

echo ""

# Check package.json version
echo "🔍 Checking version..."
PKG_VERSION=$(node -p "require('./package.json').version")
if [ "$PKG_VERSION" = "0.1.0" ]; then
    echo -e "${GREEN}✓${NC} Package version: $PKG_VERSION"
else
    echo -e "${YELLOW}!${NC} Package version: $PKG_VERSION (expected 0.1.0)"
fi

echo ""

# Check critical files
echo "🔍 Checking critical files..."
CRITICAL_FILES=(
    "package.json"
    "vite.config.js"
    "index.html"
    "src/main.jsx"
    "src/App.jsx"
    "VERSION"
    "README.md"
    "LICENSE"
    "CHANGELOG.md"
    ".gitignore"
)

ALL_FILES_EXIST=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file MISSING"
        ALL_FILES_EXIST=false
    fi
done

echo ""

# Check documentation
echo "🔍 Checking documentation..."
DOC_FILES=(
    "docs/USER_REQUIREMENTS_v0.1.0.md"
    "docs/SYSTEM_DESIGN_v0.1.0.md"
    "docs/TECHNICAL_ARCHITECTURE_v0.1.0.md"
    "docs/TESTING_DOCUMENTATION_v0.1.0.md"
    "docs/IMPLEMENTATION_ROADMAP_v0.1.0.md"
    "docs/VERSION_MANIFEST_v0.1.0.md"
)

DOCS_COMPLETE=true
for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${YELLOW}!${NC} $file missing"
        DOCS_COMPLETE=false
    fi
done

echo ""

# Check source structure
echo "🔍 Checking source structure..."
SRC_DIRS=(
    "src/components/adventure"
    "src/components/character"
    "src/components/combat"
    "src/components/common"
    "src/components/layout"
    "src/components/tools"
    "src/contexts"
    "src/data"
    "src/utils"
    "src/styles"
)

SRC_COMPLETE=true
for dir in "${SRC_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir"
    else
        echo -e "${RED}✗${NC} $dir MISSING"
        SRC_COMPLETE=false
    fi
done

echo ""
echo "================================================"
echo "  Build Verification Summary"
echo "================================================"

if [ "$ALL_FILES_EXIST" = true ] && [ "$SRC_COMPLETE" = true ]; then
    echo -e "${GREEN}✓ All critical files present${NC}"
    echo -e "${GREEN}✓ Source structure complete${NC}"
    if [ "$DOCS_COMPLETE" = true ]; then
        echo -e "${GREEN}✓ Documentation complete${NC}"
    else
        echo -e "${YELLOW}! Some documentation missing${NC}"
    fi
    echo ""
    echo -e "${GREEN}✓ BUILD VERIFICATION PASSED${NC}"
    echo ""
    echo "Ready to:"
    echo "  - Run development server: npm run dev"
    echo "  - Build for production: npm run build"
    echo "  - Run tests: npm test"
    echo ""
    echo "Version 0.1.0 'Red Box Edition' verified! 🎲"
    exit 0
else
    echo -e "${RED}✗ BUILD VERIFICATION FAILED${NC}"
    echo "Please check missing files above."
    exit 1
fi
