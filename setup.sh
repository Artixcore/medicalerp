#!/bin/bash

# EHRMS Localhost Setup Script
# This script automates the complete setup process for localhost development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_WAIT_TIME=120  # Maximum wait time for services in seconds
RETRY_INTERVAL=2   # Retry interval in seconds

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Check if a command exists
check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Check version requirement
# Returns 0 (success) if current_version >= required_version, 1 (failure) otherwise
check_version() {
    local current_version=$1
    local required_version=$2
    
    # Use sort -V to compare versions
    # Sort both versions and check which comes first
    # If current comes first (and they're not equal), then current < required
    local first_sorted=$(printf '%s\n' "$current_version" "$required_version" | sort -V | head -n1)
    
    if [ "$first_sorted" = "$current_version" ] && [ "$current_version" != "$required_version" ]; then
        # Current version comes first, meaning current < required
        return 1
    else
        # Current version is >= required version
        return 0
    fi
}

# Wait for a service to be ready
wait_for_service() {
    local service_name=$1
    local check_command=$2
    local max_attempts=$((MAX_WAIT_TIME / RETRY_INTERVAL))
    local attempt=0
    
    print_info "Waiting for $service_name to be ready..."
    
    while [ $attempt -lt $max_attempts ]; do
        if eval "$check_command" &> /dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        if [ $((attempt % 5)) -eq 0 ]; then
            echo -n "."
        fi
        sleep $RETRY_INTERVAL
    done
    
    print_error "$service_name failed to start within ${MAX_WAIT_TIME} seconds"
    return 1
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_deps=()
    
    # Check Node.js
    if check_command node; then
        NODE_VERSION=$(node -v | sed 's/v//')
        if check_version "$NODE_VERSION" "18.0.0"; then
            print_success "Node.js $NODE_VERSION found"
        else
            print_error "Node.js version $NODE_VERSION found, but >=18.0.0 is required"
            missing_deps+=("Node.js >=18.0.0")
        fi
    else
        print_error "Node.js is not installed"
        missing_deps+=("Node.js >=18.0.0")
    fi
    
    # Check npm
    if check_command npm; then
        NPM_VERSION=$(npm -v)
        if check_version "$NPM_VERSION" "9.0.0"; then
            print_success "npm $NPM_VERSION found"
        else
            print_error "npm version $NPM_VERSION found, but >=9.0.0 is required"
            missing_deps+=("npm >=9.0.0")
        fi
    else
        print_error "npm is not installed"
        missing_deps+=("npm >=9.0.0")
    fi
    
    # Check Docker
    if check_command docker; then
        DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
        print_success "Docker $DOCKER_VERSION found"
    else
        print_error "Docker is not installed"
        missing_deps+=("Docker")
    fi
    
    # Check Docker Compose
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version --short)
        print_success "Docker Compose $COMPOSE_VERSION found"
    elif check_command docker-compose; then
        COMPOSE_VERSION=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
        print_success "Docker Compose $COMPOSE_VERSION found"
    else
        print_error "Docker Compose is not installed"
        missing_deps+=("Docker Compose")
    fi
    
    # Check psql (optional but recommended for migrations)
    if check_command psql; then
        PSQL_VERSION=$(psql --version | awk '{print $3}')
        print_success "PostgreSQL client (psql) $PSQL_VERSION found"
    else
        print_warning "PostgreSQL client (psql) not found. Migrations may fail."
        print_info "Install PostgreSQL client or use Docker exec to run migrations"
    fi
    
    # Exit if dependencies are missing
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    if [ -d "node_modules" ]; then
        print_info "node_modules directory exists, skipping npm install"
        print_info "Run 'npm install' manually if you need to update dependencies"
    else
        print_info "Installing npm dependencies..."
        if npm install; then
            print_success "Dependencies installed successfully"
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
    fi
    
    # Run npm audit and fix vulnerabilities
    print_info "Checking for security vulnerabilities..."
    
    # Check if there are vulnerabilities (moderate or higher)
    local audit_output
    audit_output=$(npm audit --audit-level=moderate 2>&1)
    local audit_exit_code=$?
    
    if [ $audit_exit_code -eq 0 ]; then
        # No vulnerabilities found or only low severity
        print_success "No critical vulnerabilities found"
    else
        # Vulnerabilities found, try to fix them
        print_warning "Security vulnerabilities detected. Attempting to fix..."
        
        if npm audit fix; then
            print_success "Vulnerabilities fixed automatically"
            
            # Verify if vulnerabilities are resolved
            if npm audit --audit-level=moderate &> /dev/null; then
                print_success "All vulnerabilities resolved"
            else
                print_warning "Some vulnerabilities remain after automatic fix"
                print_info "Review remaining issues with: ${BLUE}npm audit${NC}"
                print_info "For breaking changes, you may need: ${BLUE}npm audit fix --force${NC}"
                print_warning "Note: --force may break dependencies, use with caution"
            fi
        else
            print_warning "Could not automatically fix all vulnerabilities"
            print_info "Review vulnerabilities with: ${BLUE}npm audit${NC}"
            print_info "Try manual fix with: ${BLUE}npm audit fix${NC}"
            print_info "For breaking changes: ${BLUE}npm audit fix --force${NC} (may break dependencies)"
        fi
    fi
}

# Start Docker infrastructure
start_docker_infrastructure() {
    print_header "Starting Docker Infrastructure"
    
    print_info "Starting Docker services..."
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Start services
    if docker compose up -d 2>/dev/null || docker-compose up -d 2>/dev/null; then
        print_success "Docker services started"
    else
        print_error "Failed to start Docker services"
        exit 1
    fi
    
    # Wait for PostgreSQL
    wait_for_service "PostgreSQL" "docker exec ehrms-postgres pg_isready -U ehrms"
    
    # Wait for Redis
    wait_for_service "Redis" "docker exec ehrms-redis redis-cli ping"
    
    # Wait for MongoDB
    wait_for_service "MongoDB" "docker exec ehrms-mongodb mongosh --eval 'db.adminCommand(\"ping\")' --quiet"
    
    # Wait for RabbitMQ
    wait_for_service "RabbitMQ" "docker exec ehrms-rabbitmq rabbitmq-diagnostics ping"
    
    # Wait for Kong
    wait_for_service "Kong API Gateway" "curl -s http://localhost:8001/status"
    
    # Wait for Prometheus
    wait_for_service "Prometheus" "curl -s http://localhost:9090/-/healthy"
    
    print_success "All infrastructure services are ready!"
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    print_info "Waiting for PostgreSQL to be fully ready..."
    sleep 3
    
    print_info "Running database migrations..."
    
    # Set environment variables for migrations
    export DB_HOST=${DB_HOST:-localhost}
    export DB_PORT=${DB_PORT:-5432}
    export DB_USERNAME=${DB_USERNAME:-ehrms}
    export DB_PASSWORD=${DB_PASSWORD:-ehrms_dev_password}
    export DB_NAME=${DB_NAME:-ehrms}
    export PGPASSWORD=$DB_PASSWORD
    
    if npm run migrate; then
        print_success "Database migrations completed successfully"
    else
        print_error "Database migrations failed"
        print_warning "You may need to run migrations manually: npm run migrate"
        print_info "Or use Docker exec: docker exec -it ehrms-postgres psql -U ehrms -d ehrms"
    fi
}

# Create optional .env files
create_env_files() {
    print_header "Checking Environment Files"
    
    local services=(
        "user-service:3001"
        "client-service:3002"
        "case-service:3003"
        "scheduling-service:3004"
        "billing-service:3005"
        "provider-service:3006"
        "document-service:3007"
        "reporting-service:3008"
        "integration-service:3009"
        "notification-service:3010"
        "audit-service:3011"
    )
    
    local env_created=false
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r service_name port <<< "$service_info"
        local env_file="services/$service_name/.env"
        
        if [ ! -f "$env_file" ]; then
            print_info "Creating .env file for $service_name..."
            cat > "$env_file" << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=ehrms
DB_PASSWORD=ehrms_dev_password
DB_NAME=ehrms

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# MongoDB Configuration
MONGODB_URI=mongodb://ehrms:ehrms_dev_password@localhost:27017/ehrms?authSource=admin

# RabbitMQ Configuration
RABBITMQ_URL=amqp://ehrms:ehrms_dev_password@localhost:5672

# JWT Configuration
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Service Configuration
PORT=$port
NODE_ENV=development
EOF
            env_created=true
        else
            print_info ".env file already exists for $service_name"
        fi
    done
    
    if [ "$env_created" = true ]; then
        print_warning "Created .env files with default development values"
        print_warning "JWT_SECRET uses default value - change this in production!"
    else
        print_success "All environment files are present"
    fi
}

# Display service status
display_status() {
    print_header "Setup Complete!"
    
    echo ""
    echo -e "${GREEN}All services are running and ready for development.${NC}"
    echo ""
    echo "Service Access URLs:"
    echo ""
    echo "  Backend Services:"
    echo "    • User Service:        http://localhost:3001"
    echo "    • Client Service:      http://localhost:3002"
    echo "    • Case Service:        http://localhost:3003"
    echo "    • Scheduling Service:  http://localhost:3004"
    echo "    • Billing Service:     http://localhost:3005"
    echo "    • Provider Service:   http://localhost:3006"
    echo "    • Document Service:    http://localhost:3007"
    echo "    • Reporting Service:   http://localhost:3008"
    echo "    • Integration Service: http://localhost:3009"
    echo "    • Notification Service: http://localhost:3010"
    echo "    • Audit Service:       http://localhost:3011"
    echo ""
    echo "  Infrastructure:"
    echo "    • API Gateway (Kong):  http://localhost:8000"
    echo "    • Kong Admin API:       http://localhost:8001"
    echo "    • Kong Admin GUI:       http://localhost:8002"
    echo "    • RabbitMQ Management:  http://localhost:15672"
    echo "    • Prometheus:           http://localhost:9090"
    echo ""
    echo "  Database:"
    echo "    • PostgreSQL:          localhost:5432"
    echo "    • Redis:                localhost:6379"
    echo "    • MongoDB:              localhost:27017"
    echo ""
    echo "Credentials (Development):"
    echo "  • PostgreSQL:  ehrms / ehrms_dev_password"
    echo "  • MongoDB:     ehrms / ehrms_dev_password"
    echo "  • RabbitMQ:    ehrms / ehrms_dev_password"
    echo ""
    echo "Next Steps:"
    echo ""
    echo "  1. Start development servers:"
    echo "     ${BLUE}npm run dev${NC}"
    echo ""
    echo "  2. Create your first admin user:"
    echo "     ${BLUE}curl -X POST http://localhost:3001/api/v1/users \\${NC}"
    echo "     ${BLUE}  -H 'Content-Type: application/json' \\${NC}"
    echo "     ${BLUE}  -d '{\"email\":\"admin@example.com\",\"password\":\"SecurePassword123!\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"roles\":[\"admin\"]}'${NC}"
    echo ""
    echo "  3. Login to get JWT token:"
    echo "     ${BLUE}curl -X POST http://localhost:8000/api/v1/auth/login \\${NC}"
    echo "     ${BLUE}  -H 'Content-Type: application/json' \\${NC}"
    echo "     ${BLUE}  -d '{\"email\":\"admin@example.com\",\"password\":\"SecurePassword123!\"}'${NC}"
    echo ""
    echo "  4. Access the web application:"
    echo "     ${BLUE}http://localhost:3000${NC}"
    echo ""
    echo "Useful Commands:"
    echo "  • View logs:              ${BLUE}docker-compose logs -f${NC}"
    echo "  • Stop services:          ${BLUE}docker-compose down${NC}"
    echo "  • Restart services:       ${BLUE}docker-compose restart${NC}"
    echo "  • Check Kong status:      ${BLUE}curl http://localhost:8001/status${NC}"
    echo ""
    echo -e "${YELLOW}Note: This is a development setup. For production, see MANUAL_SETUP_REQUIRED.md${NC}"
    echo ""
}

# Main execution
main() {
    print_header "EHRMS Localhost Setup"
    
    print_info "Starting setup process..."
    echo ""
    
    check_prerequisites
    install_dependencies
    start_docker_infrastructure
    run_migrations
    create_env_files
    display_status
    
    print_success "Setup completed successfully!"
}

# Run main function
main "$@"

