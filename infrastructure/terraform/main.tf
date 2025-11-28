# Terraform configuration for AWS GovCloud deployment
# This is a template - customize for your specific AWS account

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "ehrms-terraform-state"
    key    = "terraform.tfstate"
    region = "us-gov-west-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "EHRMS"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Configuration
resource "aws_vpc" "ehrms_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "ehrms-vpc-${var.environment}"
  }
}

# RDS PostgreSQL Database
resource "aws_db_instance" "ehrms_postgres" {
  identifier             = "ehrms-postgres-${var.environment}"
  engine                 = "postgres"
  engine_version         = "14.9"
  instance_class         = var.db_instance_class
  allocated_storage      = 100
  storage_encrypted      = true
  db_name                = "ehrms"
  username               = var.db_username
  password               = var.db_password
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.ehrms.name
  backup_retention_period = 30
  multi_az               = true

  tags = {
    Name = "ehrms-postgres-${var.environment}"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "ehrms_redis" {
  cluster_id           = "ehrms-redis-${var.environment}"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.ehrms.name
  security_group_ids   = [aws_security_group.redis.id]
}

# ECS Cluster for microservices
resource "aws_ecs_cluster" "ehrms_cluster" {
  name = "ehrms-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "ehrms_alb" {
  name               = "ehrms-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production"
}

