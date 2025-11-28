# Terraform Outputs

# Cloudflare Certificate Information
output "cloudflare_origin_certificate_id" {
  description = "Cloudflare Origin Certificate ID"
  value       = cloudflare_origin_ca_certificate.ehrms_origin_cert.id
}

output "cloudflare_origin_certificate_arn" {
  description = "AWS ACM Certificate ARN for Cloudflare Origin Certificate"
  value       = aws_acm_certificate.cloudflare_origin_cert.arn
}

output "cloudflare_origin_certificate_ssm_path" {
  description = "SSM Parameter Store path for Cloudflare Origin Certificate"
  value       = aws_ssm_parameter.cloudflare_origin_cert.name
}

output "cloudflare_origin_key_ssm_path" {
  description = "SSM Parameter Store path for Cloudflare Origin Certificate Private Key"
  value       = aws_ssm_parameter.cloudflare_origin_key.name
}

# Cloudflare DNS Information
output "cloudflare_dns_record_id" {
  description = "Cloudflare DNS Record ID for API domain"
  value       = cloudflare_record.ehrms_api.id
}

output "cloudflare_dns_record_name" {
  description = "Cloudflare DNS Record name"
  value       = cloudflare_record.ehrms_api.name
}

# ALB Information
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.ehrms_alb.dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.ehrms_alb.arn
}

output "alb_https_listener_arn" {
  description = "ARN of the HTTPS listener"
  value       = aws_lb_listener.kong_https.arn
}

output "alb_target_group_arn" {
  description = "ARN of the Kong API target group"
  value       = aws_lb_target_group.kong_api.arn
}

# Cloudflare Zone Information
output "cloudflare_zone_id" {
  description = "Cloudflare Zone ID"
  value       = var.cloudflare_zone_id
}

output "cloudflare_domain" {
  description = "Cloudflare managed domain"
  value       = var.cloudflare_domain
}

