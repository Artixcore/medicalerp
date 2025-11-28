# Cloudflare SSL/TLS Configuration

# Cloudflare Origin Certificate
# This certificate is used for secure communication between Cloudflare and origin servers
resource "cloudflare_origin_ca_certificate" "ehrms_origin_cert" {
  csr                = tls_cert_request.origin_cert_request.cert_request_pem
  hostnames          = [var.cloudflare_domain, "*.${var.cloudflare_domain}"]
  requested_type     = "origin-rsa"
  requested_validity = var.cloudflare_cert_validity_days
}

# Generate CSR for Origin Certificate
resource "tls_cert_request" "origin_cert_request" {
  key_algorithm   = "RSA"
  private_key_pem = tls_private_key.origin_cert_key.private_key_pem

  subject {
    common_name  = var.cloudflare_domain
    organization = "EHRMS"
  }
}

# Generate private key for Origin Certificate
resource "tls_private_key" "origin_cert_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

# Store certificate and private key in AWS Systems Manager Parameter Store
resource "aws_ssm_parameter" "cloudflare_origin_cert" {
  name        = "/ehrms/${var.environment}/cloudflare/origin-cert"
  description = "Cloudflare Origin Certificate"
  type        = "SecureString"
  value       = cloudflare_origin_ca_certificate.ehrms_origin_cert.certificate

  tags = {
    Name        = "cloudflare-origin-cert-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_ssm_parameter" "cloudflare_origin_key" {
  name        = "/ehrms/${var.environment}/cloudflare/origin-key"
  description = "Cloudflare Origin Certificate Private Key"
  type        = "SecureString"
  value       = tls_private_key.origin_cert_key.private_key_pem

  tags = {
    Name        = "cloudflare-origin-key-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Cloudflare DNS Record - A record pointing to ALB
# Note: For proxied records, Cloudflare will resolve the ALB DNS name automatically
# If you need to use IP addresses directly, use data source to resolve ALB IPs
resource "cloudflare_record" "ehrms_api" {
  zone_id = var.cloudflare_zone_id
  name    = var.cloudflare_domain
  type    = "CNAME"
  content = aws_lb.ehrms_alb.dns_name
  proxied = true
  comment = "EHRMS API Gateway - ${var.environment}"
}

# Cloudflare DNS Record - CNAME for www subdomain (optional)
resource "cloudflare_record" "ehrms_www" {
  count   = var.cloudflare_enable_www ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "www"
  type    = "CNAME"
  content = var.cloudflare_domain
  proxied = true
  comment = "EHRMS www redirect - ${var.environment}"
}

# Cloudflare SSL/TLS Settings
# Note: SSL/TLS mode is typically set to "full" or "full_strict" via Cloudflare dashboard
# This resource manages SSL/TLS settings programmatically
resource "cloudflare_zone_settings_override" "ehrms_ssl_settings" {
  zone_id = var.cloudflare_zone_id

  settings {
    ssl = "full" # Options: off, flexible, full, strict
    # Use "full" for Cloudflare Origin Certificate, "strict" requires valid certificate on origin
    min_tls_version = "1.2"
    tls_1_3         = "on"
    automatic_https_rewrites = "on"
    always_use_https = "on"
  }
}

