#!/bin/bash
# deploy.sh - Simplified deployment with single database

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Local development commands
if [ "$1" = "reset" ]; then
  echo -e "${YELLOW}Resetting local database...${NC}"
  supabase db reset
  echo -e "${GREEN}✓ Local database reset complete${NC}"
  exit 0
fi

if [ "$1" = "migrate" ]; then
  echo -e "${YELLOW}Creating new migration...${NC}"
  supabase migration new $2
  echo -e "${GREEN}✓ Migration file created${NC}"
  exit 0
fi

if [ "$1" = "local" ]; then
  echo -e "${YELLOW}Starting local development...${NC}"
  supabase start
  npm run dev
  exit 0
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}✗ Uncommitted changes detected${NC}"
  echo "Please commit or stash changes before deploying"
  exit 1
fi

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm test
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Tests failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Tests passed${NC}"

# Handle deployment based on branch
if [ "$CURRENT_BRANCH" = "main" ]; then
  echo -e "${YELLOW}🚀 PRODUCTION DEPLOYMENT${NC}"
  
  # Apply any pending migrations to production
  echo -e "${YELLOW}Applying production migrations...${NC}"
  supabase db push --linked
  
  # Push to main (triggers Vercel production deployment)
  git push origin main
  
  echo -e "${GREEN}✓ Production deployment complete!${NC}"
  echo -e "URL: https://app.plumberpro.com"
  
else
  echo -e "${YELLOW}📝 PREVIEW DEPLOYMENT${NC}"
  echo -e "Branch: $CURRENT_BRANCH"
  
  # Push to branch (triggers Vercel preview deployment)
  git push origin $CURRENT_BRANCH
  
  echo -e "${GREEN}✓ Preview deployment initiated!${NC}"
  echo -e "URL will be: https://plumberpro-git-${CURRENT_BRANCH}.vercel.app"
  echo -e "${YELLOW}Note: Using production database with TEST payment keys${NC}"
fi

echo -e "\n${YELLOW}Check deployment status:${NC}"
echo "https://vercel.com/dashboard"
