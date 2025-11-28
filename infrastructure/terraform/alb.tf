# Application Load Balancer HTTPS Configuration

# Import Cloudflare Origin Certificate to AWS Certificate Manager
# Note: Cloudflare Origin Certificates don't require a certificate chain for ACM import
resource "aws_acm_certificate" "cloudflare_origin_cert" {
  certificate_body = cloudflare_origin_ca_certificate.ehrms_origin_cert.certificate
  private_key      = tls_private_key.origin_cert_key.private_key_pem
  # certificate_chain is not required for Cloudflare Origin Certificates

  tags = {
    Name        = "cloudflare-origin-cert-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Source      = "Cloudflare"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ALB Target Group for Kong API Gateway
resource "aws_lb_target_group" "kong_api" {
  name     = "ehrms-kong-api-${var.environment}"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = aws_vpc.ehrms_vpc.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/status"
    protocol            = "HTTP"
    matcher             = "200"
  }

  tags = {
    Name        = "ehrms-kong-api-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# ALB HTTPS Listener (Port 443)
resource "aws_lb_listener" "kong_https" {
  load_balancer_arn = aws_lb.ehrms_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.cloudflare_origin_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.kong_api.arn
  }

  tags = {
    Name        = "ehrms-kong-https-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# ALB HTTP Listener (Port 80) - Redirect to HTTPS
resource "aws_lb_listener" "kong_http" {
  load_balancer_arn = aws_lb.ehrms_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = {
    Name        = "ehrms-kong-http-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Security Group Rule for HTTPS (Port 443)
resource "aws_security_group_rule" "alb_https_ingress" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"] # Cloudflare will proxy, but ALB needs to accept from anywhere
  security_group_id = aws_security_group.alb.id
  description       = "HTTPS traffic from Cloudflare"
}

# Security Group Rule for HTTP (Port 80) - for redirects
resource "aws_security_group_rule" "alb_http_ingress" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
  description       = "HTTP traffic (redirects to HTTPS)"
}

# Optional: Restrict ALB access to Cloudflare IP ranges only
# Uncomment and configure if you want to restrict access to Cloudflare IPs
# data "http" "cloudflare_ipv4" {
#   url = "https://www.cloudflare.com/ips-v4"
# }
#
# resource "aws_security_group_rule" "alb_https_cloudflare_only" {
#   type              = "ingress"
#   from_port         = 443
#   to_port           = 443
#   protocol          = "tcp"
#   cidr_blocks       = split("\n", chomp(data.http.cloudflare_ipv4.response_body))
#   security_group_id = aws_security_group.alb.id
#   description       = "HTTPS traffic from Cloudflare IP ranges only"
# }

