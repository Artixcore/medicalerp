variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-gov-west-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

# Cloudflare Configuration Variables
variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS and SSL permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for the domain"
  type        = string
}

variable "cloudflare_domain" {
  description = "Domain name managed by Cloudflare (e.g., example.com)"
  type        = string
}

variable "cloudflare_cert_validity_days" {
  description = "Validity period for Cloudflare Origin Certificate in days"
  type        = number
  default     = 5475 # 15 years (maximum)
}

variable "cloudflare_enable_www" {
  description = "Enable www subdomain CNAME record"
  type        = bool
  default     = false
}

