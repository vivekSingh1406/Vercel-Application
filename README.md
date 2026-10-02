# Gautiyan Tola — Spring Boot / JSP / MySQL

Java 17+, Spring Boot 3.5.16, Spring MVC, JSP/JSTL, Spring Data JPA/Hibernate, Flyway and **MySQL**. The Angular project, dependencies and build configuration have been removed. The existing UI, navigation, SVG icons, styles and media are preserved.

## Configured database and startup

The application is directly in `Vercel-Application`: `pom.xml`, `src/`, and these documents are at the repository root.

The workspace uses the supplied MySQL configuration:

```properties
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/appdb
spring.datasource.username=appuser
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

The supplied password is saved only in root-level `application-local.properties`, which is excluded from Git and restricted to the local user. Spring imports it automatically when launched from this directory. `DB_PASSWORD` overrides it. Do not commit that file. On a fresh checkout, copy `application-local.properties.example` to `application-local.properties` and fill in your own password, or supply `DB_PASSWORD` through the environment.

Keep the password in `application-local.properties` paired with the configured database user. This imported file takes precedence over `src/main/resources/application.properties`; a stale local password can cause `Access denied` even after editing the main configuration. `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` override the defaults. To verify the account interactively:

```sh
mysql -h 127.0.0.1 -P 3306 -u appuser -p appdb
```

Use MySQL 8.4+ and an empty application schema (or one already initialized by these migrations). If `appdb` does not yet exist, create it using a valid database administrator account:

```sql
CREATE DATABASE IF NOT EXISTS appdb CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs;
```

From `Vercel-Application`, once the credentials are accepted:

```sh
mvn spring-boot:run

# Or build and run the executable WAR:
mvn -DskipTests clean package
java -jar target/gautiyan-tola.war
```

Open http://127.0.0.1:8080. MySQL is required; there is no embedded-database fallback. Flyway's MySQL migrations under `src/main/resources/db/mysql` create the schema and seed the three original stories and three editorial welcome notes once. Flyway tracks applied migrations; restarting does not reinsert deleted records.

The executable WAR includes Tomcat and JSP support. Deploy at root context (`/`), matching the original asset URLs. Requirements are JDK 17+ and Maven 3.6.3+. The configured UTC connection properties preserve timestamps without changing the supplied JDBC URL.

## Exam Center

Open `/exam-center` to sign up or log in, take the 100-question General Knowledge Exam, resume saved progress, and view your results and answer review. Learner accounts and attempts use the existing MySQL database and Spring Security session authentication. Flyway migration V3 adds the required tables without replacing existing content.

See [EXAM_CENTER.md](EXAM_CENTER.md) for the complete architecture analysis, file inventory, routes, APIs, marking rules, configuration, security behavior, and test instructions. `EXAM_CATALOG` optionally selects a server-only question JSON file; `SESSION_TIMEOUT` defaults to `30m`.

## Where images and videos live

| Content | Location | Database storage |
|---|---|---|
| Original videos and original gallery photo | `src/main/resources/static/images/` | None |
| Gallery photos, video posters, hero/about photos | `src/main/resources/static/media/` | None |
| Gallery/video titles, categories, captions, paths, credits, durations and ordering | `src/main/resources/static/data/media.json` | None |
| Site/page copy and theme labels | `src/main/resources/site.json` | None |
| Visitor-uploaded story photos | `UPLOAD_DIR` (default `./uploads/`), served at `/uploads/...` | URL and original filename only, never image bytes/base64 |

To add a gallery photo or video, copy the file into the relevant static directory and add its entry to `static/data/media.json`. Array order determines display order. The homepage uses the first four photos and first three videos; `/gallery` shows all. Keep the existing `v2` entry for the hero's film and IDs `v5`/`v6` for the existing rotate controls. Rebuild/restart after static catalog changes.

Uploaded photos are validated as JPEG/PNG/WebP up to 1,500,000 bytes, assigned server-generated filenames and written atomically. Legacy data-image values entered in the story editor are converted to files before saving. Back up `UPLOAD_DIR` together with MySQL, and mount it as persistent storage when deploying. Story deletion does not automatically delete image files because URLs may be reused; remove unreferenced uploads only after checking references/backups.

The original CSS remains in `static/css/site.css`; `jsp.css` contains only host/hidden-state and Spring form adaptations. No Angular runtime is loaded. The remaining `app-*` HTML wrappers are inert elements used by the original CSS.

## Configuration

| Environment variable | Default / purpose |
|---|---|
| `DB_URL` | `jdbc:mysql://127.0.0.1:3306/appdb` |
| `DB_USERNAME` | appuser |
| `DB_PASSWORD` | Overrides the password in ignored `application-local.properties`; required when no local file exists |
| `UPLOAD_DIR` | `./uploads/`; use an absolute path or persistent volume for deployment |
| `PORT` | 8080 |
| `SERVER_ADDRESS` | 127.0.0.1; production profile defaults to 0.0.0.0 |
| `WHATSAPP_NUMBER` | Original configured number, 919755752534; blank/invalid disables the handoff |
| `ADMIN_USERNAME` | admin |
| `ADMIN_PASSWORD` | Overrides the configured local admin password; all `/admin` routes require ADMIN authentication; an empty password disables admin login |
| `SPRING_PROFILES_ACTIVE` | Set `production` for deployment; MySQL is already the default |

Production requires a nonempty `ADMIN_PASSWORD` and uses Secure session cookies. Use HTTPS at the reverse proxy. Credentials belong in environment variables or a secret manager. CSRF protection is enabled in all modes. Public pages/submission forms remain public; configured admin authentication protects editing, review, deletion and export.

## Workflows

- `/`: validated community messages, newest-five retention, original gallery/video/story previews.
- `/gallery`: static catalog, category filters, keyboard lightbox, all six original video players and rotation.
- `/blog` and `/blog/{slug}`: searchable MySQL-backed stories, reading time, share actions and metadata.
- `/submit-blog`: save a draft to MySQL with an optional filesystem photo; drafts remain unpublished until reviewed.
- `/admin`: add/edit/delete messages and stories, review/publish drafts, generate unique slugs, preview and export JSON. Atomic publication and record versions protect edits.
- WhatsApp remains a separate user-confirmed action. Images must be attached manually; the application sends no external messages automatically.

## Tests

Tests use **real MySQL**, not an in-memory substitute. Create a separate empty `village_test` database and grant your test account schema privileges on it. Never point tests at a live database.

```sh
export TEST_DB_URL='jdbc:mysql://127.0.0.1:3306/village_test?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true'
export TEST_DB_USERNAME=village
export TEST_DB_PASSWORD='your-test-database-password'
mvn clean verify
```

`TEST_UPLOAD_DIR` defaults to `./target/test-uploads`. The test profile overrides the application database settings. Integration writes are rolled back; seed/count tests expect the original seed dataset.

Optional Chrome browser tests are in `browser-tests/`; their package files contain Playwright only. Start the WAR against another disposable MySQL database with the seed content, then:

```sh
cd browser-tests
npm ci
npm test
```

`MIGRATION_URL` selects the running server (default http://127.0.0.1:8080), and `CHROME_PATH` overrides the installed Chrome path. Tests mutate disposable content and save screenshots under `artifacts/mysql-review/`. Node is used only for these optional tests, never to build/run the Java application.

## Migration notes

The previous development version's embedded/PostgreSQL configuration and gallery/video persistence have been removed. These MySQL migrations initialize a new MySQL schema; they do not convert an existing database in place. No existing external database was modified during this revision. Export any content from an earlier running version before retiring it. Original browser-local records were never available in the source repository and are not silently imported.

See [DATABASE_DESIGN.md](DATABASE_DESIGN.md), [MIGRATION_MAPPING.md](MIGRATION_MAPPING.md), and [MIGRATION_REPORT.md](MIGRATION_REPORT.md). [APPLICATION_INVENTORY.md](APPLICATION_INVENTORY.md) records the original pre-migration source inventory; its referenced Angular paths are historical, not files required by this application.

Technical references: [Flyway MySQL support](https://documentation.red-gate.com/fd/mysql-277579322.html), [Connector/J timezone configuration](https://dev.mysql.com/doc/connector-j/en/connector-j-connp-props-datetime-types-processing.html).


### Exam Center student and result management

Open `/admin`, then **Student Management** or **Results Management**. Create a student with a unique username and password; email is optional. The form can generate credentials, which are shown for secure handoff and never stored as plaintext. Students log in at `/login`. Public self-registration is disabled; `/signup` displays the login page.

Students can retake exams. Each attempt has its own UUID, sequential number per student/exam, student-name snapshot, timestamps, answers, question snapshot and stored server-calculated score. Starting another attempt hides the previous result immediately, including direct API access. Admins retain every attempt in student profiles and Results Management, with search, exam/date filters, sorting and answer review. Deactivation preserves records and blocks existing sessions. No pass/fail threshold is invented: the existing catalog supports numeric scores only.

Flyway migration `V4__student_management.sql` backfills usernames from existing email addresses and numbers existing attempts chronologically. Existing accounts keep their passwords. Apply it through normal application startup with Flyway enabled; take your normal database backup before deployment. Admin exam content continues to use the existing server-side catalog configured with `EXAM_CATALOG`.

Run `mvn test` against a disposable MySQL database using `TEST_DB_URL`, `TEST_DB_USERNAME`, and `TEST_DB_PASSWORD`. Browser coverage: `cd browser-tests` and `EXAM_TEST_URL=http://127.0.0.1:8082 TEST_ADMIN_PASSWORD=... npm run test:students`. The browser test creates test students and attempts; run against a test instance.

## Minimal AWS deployment: EC2 + RDS

This setup uses **one EC2 instance and one RDS MySQL database**. EC2 includes an encrypted EBS disk and an Elastic IP; a VPC, subnets, internet gateway and security groups provide the required networking. It does not provision ECR, a load balancer, EFS, Secrets Manager, CloudWatch, Systems Manager, ACM, Route 53 or AWS Backup.

```text
Your computer → Docker image uploaded over SSH → EC2
Browser → Caddy proxy on EC2 → Spring Boot container → private RDS MySQL
                                  └→ uploads on EC2 disk
```

Caddy runs on the same EC2 instance. It serves HTTP for IP-based testing or automatically manages HTTPS when you supply a domain. Logs stay on EC2. MySQL backups use RDS's built-in backup feature. EC2, its disk, public IPv4 and RDS incur AWS charges.

### 1. Install tools and configure AWS

You need Terraform >= 1.10, AWS CLI v2, Docker with Buildx, and SSH/SCP. Start Docker Desktop. Local Java and Maven are unnecessary because Docker builds the WAR.

Run commands from the project root. The password prompt examples below use **Bash**; run `bash` first if your terminal uses another shell.

```sh
bash
terraform version
aws --version
docker info
docker buildx version

```

Put your AWS keys in **`infra/terraform/credentials.auto.tfvars`**. A local placeholder file is provided in this workspace. On a fresh checkout, create it from the example:

```sh
cp infra/terraform/credentials.auto.tfvars.example infra/terraform/credentials.auto.tfvars
chmod 600 infra/terraform/credentials.auto.tfvars
```

Do not run the copy command over a file you have already filled in. Open the local file in your editor and replace the placeholders:

```hcl
aws_access_key_id     = "YOUR_ACCESS_KEY"
aws_secret_access_key = "YOUR_SECRET_KEY"
aws_session_token    = null
```

For temporary credentials, also set `aws_session_token` to the supplied token. Terraform automatically loads this file when running with `-chdir=infra/terraform`; no `aws configure` or profile selection is needed for this method. These values authenticate Terraform's AWS provider, not the AWS CLI.

The local credentials file is explicitly ignored by Git and restricted to your user. The `.example` file contains placeholders only and may be committed. Credential variables are sensitive and ephemeral, keeping these provider credentials out of Terraform plans and state; the database password remains in state as described below. Never force-add the credentials file to Git.

If you prefer an existing AWS profile instead, remove the local credentials file or set its three values to `null`, then export `AWS_PROFILE` as usual. The deployment identity needs permission to manage EC2/VPC resources and RDS. No EC2 IAM role is created, and the instance does not need AWS credentials.

### 2. Create an SSH key and configure Terraform

Create a dedicated key; choose a passphrase when prompted. Do not overwrite an existing key you need.

```sh
ssh-keygen -t ed25519 -f ~/.ssh/village -C village-deploy
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
```

Edit `infra/terraform/terraform.tfvars`:

```hcl
aws_region          = "ap-south-1"
name                = "gautiyan-tola"
public_key_path     = "~/.ssh/village.pub"
ssh_cidr            = "YOUR_PUBLIC_IPV4/32"
web_cidr            = "YOUR_PUBLIC_IPV4/32"
instance_type       = "t3.small"
db_instance_class   = "db.t4g.micro"
deletion_protection = true
```

Replace `YOUR_PUBLIC_IPV4` with your current internet-facing IPv4 address. `ssh_cidr` permits SSH only from that address. Keep `web_cidr` restricted to your IP for initial HTTP testing. Set it to `0.0.0.0/0` when making the HTTPS site public. If your public IP changes, update these values and apply again.

Choose and save a database password in your password manager. Use 20–64 letters, digits, underscores or hyphens. Supply it without writing it into a command or tfvars file:

```sh
read -r -s -p 'RDS password: ' TF_VAR_db_password
printf '\n'
export TF_VAR_db_password
```

Keep this terminal open: Terraform and the deployment script use the same variable. In a new terminal, enter the same password again. **The database password is stored in Terraform state and saved plans**, even though output is marked sensitive. Protect those files, keep them out of Git and retain the state for future changes. This minimal setup intentionally does not use a secret-manager service.

### 3. Create EC2 and RDS

```sh
terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform fmt -check
terraform -chdir=infra/terraform validate
terraform -chdir=infra/terraform plan -out=deploy.tfplan
terraform -chdir=infra/terraform apply deploy.tfplan
terraform -chdir=infra/terraform output
```

Review the plan before applying. RDS provisioning can take several minutes. Terraform creates a private MySQL 8.4 database named `appdb`, with username `appadmin`. Only EC2 can reach its database port. The database is single-AZ; two private subnets satisfy the RDS subnet-group requirement.

EC2 bootstraps Docker and its upload directory. You do not need to create EC2 manually. The Elastic IP remains stable across stop/start. No application is running until the next step.

**If you previously deployed the larger stack:** do not apply this configuration to its state without a migration plan. Removing managed resources can delete data. Back up and migrate the old database/uploads and review every proposed destruction. This walkthrough assumes a fresh deployment; it does not migrate existing infrastructure automatically.

### 4. Build and deploy directly to EC2

For IP-based HTTP testing:

```sh
./scripts/deploy-ec2.sh initial ~/.ssh/village
```

Enter an admin password when prompted: 20–128 letters, digits, underscores or hyphens. Store it securely. The admin username is `admin`. SSH will ask you to verify/trust the host on your first connection; normal host-key checks remain enabled.

The script builds an `linux/amd64` Docker image, uploads it using SCP, loads it into Docker on EC2, and starts the app and Caddy. It waits for `/login` to respond successfully. There is no container registry. It keeps the database and admin credentials in a root-only environment file at `/opt/village/app.env`; they are not embedded in the image or Terraform user data.

The build skips tests because integration tests need a disposable MySQL database. Run the [Tests](#tests) workflow before a production release. Flyway initializes the RDS schema on first app startup. Existing local MySQL records and uploads are not imported automatically.

### 5. Open the application; optionally enable HTTPS

For HTTP testing, get the address and verify the login page:

```sh
terraform -chdir=infra/terraform output -raw application_url
APP_URL="$(terraform -chdir=infra/terraform output -raw application_url)"
curl --fail "$APP_URL/login"
```

Open that URL, visit `/admin`, and use `admin` with the password you supplied. Verify student login and a test upload. HTTP mode explicitly disables secure-only session cookies so login works on the IP address. HTTP does not encrypt credentials; use this mode for restricted testing, and enable HTTPS before using real accounts on the public internet.

For HTTPS with your own domain:

1. At your existing DNS provider, create an **A record** for your hostname pointing to Terraform's `public_ip` output. No Route 53 service is needed.
2. Set `web_cidr = "0.0.0.0/0"` in tfvars and run a normal Terraform plan/apply so certificate authorities can reach ports 80/443.
3. Once DNS resolves correctly, redeploy with your hostname:

```sh
./scripts/deploy-ec2.sh https-v1 ~/.ssh/village village.example.com
curl --fail https://village.example.com/login
```

Caddy obtains and renews the certificate on EC2, and the app uses secure session cookies. No ACM certificate or load balancer is needed. Always pass the domain on subsequent deployments to retain HTTPS mode. The Terraform `application_url` output remains the IP-based HTTP URL; use your domain for HTTPS. See [Caddy automatic HTTPS](https://caddyserver.com/docs/quick-starts/https).

### 6. Inspect logs, restart and troubleshoot

Connect from your computer:

```sh
EC2_IP="$(terraform -chdir=infra/terraform output -raw public_ip)"
ssh -i ~/.ssh/village "ec2-user@$EC2_IP"
```

Inside EC2:

```sh
sudo docker ps -a
sudo docker logs --tail 100 village-app
sudo docker logs --tail 100 village-proxy
sudo tail -n 100 /var/log/cloud-init-output.log
sudo docker restart village-app
```

Docker restarts containers after an EC2 reboot. Logs rotate at 10 MB per file, keeping three files per container. Application port 8080 is not published to the host; only Caddy exposes ports 80/443. No SSH port is open to the whole internet.

| Problem | Check |
|---|---|
| SSH timeout | Correct key, Elastic IP, current public IP in `ssh_cidr`, and instance status checks. |
| Bootstrap failure | Cloud-init log and outbound internet/package access. Do not replace EC2 before backing up uploads. |
| App cannot connect to MySQL | RDS is available, password matches `TF_VAR_db_password`, and app logs show no migration errors. |
| HTTP 502 | Inspect app logs; Java startup and migrations may still be running. |
| HTTPS unavailable | Domain resolves to the Elastic IP, ports 80/443 allow public access, and Caddy logs show successful issuance. |
| Disk filling up | Check `df -h` and `sudo docker system df`; remove only unused release images after deciding which rollback versions to retain. |

### 7. Update the application or roll back

Publish a new local image tag directly to the same EC2 instance:

```sh
./scripts/deploy-ec2.sh release-2 ~/.ssh/village
# With HTTPS, always include the domain:
# ./scripts/deploy-ec2.sh release-2 ~/.ssh/village village.example.com
```

Enter your intended admin password again. Use the same database password as RDS. Deployment briefly stops the app and proxy, but does not replace EC2, RDS or uploaded files. No Terraform apply is needed for application-only changes.

For rollback, check out the previous source revision and deploy it under a new tag using the same command. Confirm that existing database migrations remain compatible; redeploying old code does not undo migrations. Failed health checks do not automatically roll back: inspect logs and deploy a known-good revision.

If you change the RDS password through Terraform, wait until RDS has applied it, then redeploy with the new `TF_VAR_db_password`. Existing containers do not reload changed passwords automatically.

### 8. Backups, storage and cleanup

- RDS retains seven days of automated backups and requires a final snapshot at deletion. It uses the RDS master account for application queries and migrations in this minimal baseline.
- Uploads live at `/opt/village/uploads` on EC2's encrypted root disk. They survive application redeployment and instance stop/start, but **not instance termination or disk loss**. Copy uploads to another machine regularly, or take EBS snapshots through EC2. There is no EFS or automatic upload backup service.
- Back up the root-only `/opt/village/app.env` securely, along with Terraform state and SSH keys. Docker certificates/configuration live in the `village-caddy-data` and `village-caddy-config` volumes.
- `prevent_destroy` on EC2 blocks accidental replacement, including replacement caused by a newly selected AMI. Review a Terraform plan after initialization or code changes; back up uploads before intentionally allowing replacement. Application deployment does not require a new instance.

Example upload backup, run from your computer while uploads are paused for consistency:

```sh
EC2_IP="$(terraform -chdir=infra/terraform output -raw public_ip)"
ssh -i ~/.ssh/village "ec2-user@$EC2_IP" \
  'sudo tar -C /opt/village -czf - uploads' > uploads-backup.tar.gz
```

To remove the deployment, first verify backups. Set `deletion_protection = false` and apply that change. Intentionally remove EC2's `lifecycle { prevent_destroy = true }` from `infra/terraform/main.tf` only after protecting its uploads. Ensure `final_snapshot_identifier` is unique if a snapshot with that name already exists. Then review and apply:

```sh
terraform -chdir=infra/terraform plan -destroy -out=destroy.tfplan
terraform -chdir=infra/terraform apply destroy.tfplan
```

The final RDS snapshot remains and may incur storage charges. Remove any manual DNS A record when retiring the site. Keep Terraform state until cleanup is complete.

Files: [Dockerfile](Dockerfile), [Terraform](infra/terraform/main.tf), [example inputs](infra/terraform/terraform.tfvars.example), [deployment script](scripts/deploy-ec2.sh).
