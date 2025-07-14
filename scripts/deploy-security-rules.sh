#!/bin/bash

# ADHD Skill Journey - Firestore Security Rules Deployment Script
# This script safely deploys Firestore security rules with validation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    print_success "Firebase CLI is installed"
}

# Check if user is logged in to Firebase
check_firebase_auth() {
    if ! firebase projects:list &> /dev/null; then
        print_error "You are not logged in to Firebase. Please login first:"
        echo "firebase login"
        exit 1
    fi
    print_success "Firebase authentication verified"
}

# Check if Firebase project is initialized
check_firebase_project() {
    if [ ! -f "firebase.json" ]; then
        print_error "Firebase project not initialized. Please run:"
        echo "firebase init firestore"
        exit 1
    fi
    print_success "Firebase project configuration found"
}

# Validate security rules syntax
validate_rules() {
    print_status "Validating Firestore security rules syntax..."
    
    if firebase firestore:rules:validate firestore.rules; then
        print_success "Security rules syntax is valid"
    else
        print_error "Security rules syntax validation failed"
        exit 1
    fi
}

# Show current project
show_project_info() {
    local project_id=$(firebase use --current 2>/dev/null || echo "No project selected")
    print_status "Current Firebase project: $project_id"
    
    if [ "$project_id" = "No project selected" ]; then
        print_error "No Firebase project selected. Please run:"
        echo "firebase use <project-id>"
        exit 1
    fi
}

# Backup current rules (if any)
backup_current_rules() {
    print_status "Creating backup of current rules..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="firestore.rules.backup.$timestamp"
    
    # Try to get current rules from Firebase
    if firebase firestore:rules:get > "$backup_file" 2>/dev/null; then
        print_success "Current rules backed up to: $backup_file"
    else
        print_warning "Could not backup current rules (may be first deployment)"
        rm -f "$backup_file"
    fi
}

# Deploy rules with confirmation
deploy_rules() {
    print_warning "This will deploy new security rules to your Firebase project."
    print_warning "This action will immediately affect all users of your application."
    
    echo
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled by user"
        exit 0
    fi
    
    print_status "Deploying Firestore security rules..."
    
    if firebase deploy --only firestore:rules; then
        print_success "Security rules deployed successfully!"
    else
        print_error "Failed to deploy security rules"
        exit 1
    fi
}

# Test rules in emulator (optional)
test_rules_emulator() {
    read -p "Would you like to test the rules in the local emulator first? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Starting Firestore emulator for testing..."
        print_status "You can test the rules at: http://localhost:4000/firestore"
        print_status "Press Ctrl+C to stop the emulator and continue with deployment"
        
        firebase emulators:start --only firestore --import=./emulator-data --export-on-exit=./emulator-data || true
        
        echo
        read -p "Continue with deployment to production? (y/N): " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Deployment cancelled after emulator testing"
            exit 0
        fi
    fi
}

# Main deployment process
main() {
    echo "=========================================="
    echo "  ADHD Skill Journey Security Rules"
    echo "  Firestore Deployment Script"
    echo "=========================================="
    echo
    
    # Pre-deployment checks
    print_status "Running pre-deployment checks..."
    check_firebase_cli
    check_firebase_auth
    check_firebase_project
    show_project_info
    validate_rules
    
    echo
    print_status "Pre-deployment checks completed successfully!"
    echo
    
    # Optional emulator testing
    test_rules_emulator
    
    # Backup and deploy
    backup_current_rules
    deploy_rules
    
    echo
    print_success "Deployment completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Monitor the Firebase Console for any access denied errors"
    echo "2. Test your application thoroughly to ensure all features work"
    echo "3. Check the Firestore usage logs for any unexpected rule violations"
    echo
    print_warning "If you encounter issues, you can restore from backup or check the troubleshooting guide in docs/FIRESTORE_SECURITY_RULES.md"
}

# Run the main function
main "$@"