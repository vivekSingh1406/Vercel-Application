variable "aws_region" {
  type    = string
  default = "ap-south-1"
}
variable "name" {
  type    = string
  default = "gautiyan-tola"
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,19}$", var.name))
    error_message = "Use 3–20 lowercase letters, digits or hyphens, starting with a letter."
  }
}
variable "public_key_path" {
  type        = string
  description = "Local path to your SSH public key, e.g. ~/.ssh/village.pub."
}
variable "ssh_cidr" {
  type        = string
  description = "Your public IPv4 address with /32; only this address may connect over SSH."
  validation {
    condition     = can(cidrnetmask(var.ssh_cidr)) && can(regex("/32$", var.ssh_cidr))
    error_message = "Supply your public IPv4 address with /32."
  }
}
variable "web_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "Allowed web clients. Set your IP/32 for private HTTP testing."
  validation {
    condition     = can(cidrnetmask(var.web_cidr))
    error_message = "Use a valid IPv4 CIDR."
  }
}
variable "instance_type" {
  type    = string
  default = "t3.small"
  validation {
    condition     = contains(["t3.small", "t3.medium", "t3.large"], var.instance_type)
    error_message = "Choose t3.small, t3.medium or t3.large for the amd64 image."
  }
}
variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}
variable "db_password" {
  type        = string
  sensitive   = true
  description = "RDS password. Supply using TF_VAR_db_password; persisted in Terraform state."
  validation {
    condition     = can(regex("^[A-Za-z0-9_-]{20,64}$", var.db_password))
    error_message = "Use 20–64 letters, digits, underscores or hyphens."
  }
}
variable "deletion_protection" {
  type    = bool
  default = true
}

variable "aws_access_key_id" {
  type        = string
  default     = null
  sensitive   = true
  ephemeral   = true
  description = "Optional AWS access key from the ignored credentials.auto.tfvars file."
}
variable "aws_secret_access_key" {
  type        = string
  default     = null
  sensitive   = true
  ephemeral   = true
  description = "Optional AWS secret key from the ignored credentials.auto.tfvars file."
}
variable "aws_session_token" {
  type        = string
  default     = null
  sensitive   = true
  ephemeral   = true
  description = "Session token for temporary AWS credentials; leave null for long-lived keys."
}
