# Minimal AWS deployment: EC2 + RDS

The complete walkthrough is in the [root README](../README.md#minimal-aws-deployment-ec2--rds).

Terraform provisions EC2 with encrypted disk and Elastic IP, private RDS MySQL, and the required VPC networking. Docker images upload directly over SSH using `scripts/deploy-ec2.sh`; no ECR or other managed application services are needed. Caddy runs on EC2 for HTTP or optional domain-based HTTPS. Uploads and logs stay on EC2.

The previous managed-services deployment is replaced, not migrated. If it was already applied, retain its state and make a separate data/infrastructure migration plan before applying this configuration.
