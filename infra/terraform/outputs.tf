output "aws_region" { value = var.aws_region }
output "public_ip" { value = aws_eip.app.public_ip }
output "application_url" { value = "http://${aws_eip.app.public_ip}" }
output "instance_id" { value = aws_instance.app.id }
output "database_host" { value = aws_db_instance.app.address }
