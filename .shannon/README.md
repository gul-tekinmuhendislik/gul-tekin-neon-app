# Shannon Workflows - Gül-Tekin Test Suite

**Production URL:** https://shannon-production.up.railway.app/namespaces/default/workflows

---

## 📋 Workflows

### 1. gul-tekin-tests.yaml
**Purpose:** Automated testing & validation pipeline  
**Triggers:** Push to `main` branch (configure in Railway)

**Tasks:**
```
checkout
├─ neon-check (Database health)
├─ blog-check (Blog system)
├─ cloudinary-check (Image storage)
├─ product-images-check (Product-image mapping)
├─ markdown-validate (Documentation)
└─ report (Final summary)
```

---

## 🚀 Deployment

### Step 1: Create Secret in Railway
```bash
# In Shannon UI: Settings → Secrets
# Add:
NEON_DATABASE_URL=postgresql://neondb_owner:...
CLOUDINARY_NAME=dgfdk0l8j
CLOUDINARY_KEY=782682811169167
CLOUDINARY_SECRET=g0ojrhN_9uoubWmiVKz0f396KOo
```

### Step 2: Upload Workflow
```bash
# Copy gul-tekin-tests.yaml to Shannon UI
# Or deploy via CLI:
argo submit gul-tekin-tests.yaml \
  --watch \
  --namespace=default
```

### Step 3: Configure GitHub Integration
```
Repository Settings:
  - Add Webhook: https://shannon-production.up.railway.app/webhooks/github
  - Trigger on: Push to main branch
  - Select events: Push
```

---

## 📊 Workflow Stages

### Stage 1: Checkout
- Clones repository
- Checkouts specified branch
- Prepares workspace

### Stage 2: Database Tests
**Task:** `neon-check`
- Connects to Neon PostgreSQL
- Verifies 31 tables exist
- Checks table row counts (399 products, 13 services, etc.)
- Validates schema integrity
- ✅ PASS: All tables healthy  
- ❌ FAIL: Stops workflow

### Stage 3: Blog Validation
**Task:** `blog-check`
- Checks BLOG_POSTS table
- Validates 35 columns
- Tests SEO fields
- Checks image references
- ✅ PASS: Blog structure OK  
- ❌ FAIL: Alerts content issues

### Stage 4: Image Storage Check
**Task:** `cloudinary-check`
- Verifies API connection
- Checks account usage stats
- Lists storage breakdown by folder
- Validates 4000+ images indexed
- ✅ PASS: Storage healthy  
- ❌ FAIL: Issues with CDN

### Stage 5: Product-Image Integrity
**Task:** `product-images-check`
- Maps 399 products to Cloudinary URLs
- Checks 398 have valid cloudinary_url
- Detects orphaned images
- Validates public_id references
- ✅ PASS: All products linked  
- ❌ FAIL: Broken image links

### Stage 6: Documentation
**Task:** `markdown-validate`
- Verifies all .md files exist
- Checks required sections
- Validates content references
- ✅ PASS: Docs complete  
- ❌ FAIL: Missing documentation

### Stage 7: Report
**Task:** `generate-report`
- Aggregates all test results
- Creates final summary
- Outputs to logs/artifacts
- Sends notification (configurable)

---

## 🔧 Configuration

### Secrets (in Railway)
```yaml
gul-tekin-secrets:
  database-url: "postgresql://..."
  cloudinary-name: "dgfdk0l8j"
  cloudinary-key: "..."
  cloudinary-secret: "..."
```

### GitHub Integration
```
Webhooks:
  URL: https://shannon-production.up.railway.app/webhooks/github
  Events: Push, Pull Request
  Branches: main
```

### Slack Notifications (Optional)
```yaml
# In Shannon settings:
Notifications:
  Success: #deployments channel
  Failure: #alerts channel
```

---

## 📈 Running Locally (Testing)

### Prerequisites
```bash
# Install Argo Workflows
brew install argo

# Configure kubeconfig
# (Requires Railway k8s access)
```

### Submit Workflow
```bash
argo submit gul-tekin-tests.yaml \
  -p repo-url="https://github.com/gul-tekinmuhendislik/gul-tekin-neon-app" \
  -p branch="main" \
  --watch
```

### View Logs
```bash
argo logs <workflow-name> -f
argo logs <workflow-name> <task-name>
```

### Delete Workflow
```bash
argo delete <workflow-name>
```

---

## 📊 Expected Outputs

### Success Case
```
==================================
GÜL-TEKİN TEST REPORT
==================================
Timestamp: Sun 2026-03-08 15:00:00 GMT+3

=== DATABASE HEALTH ===
[OK] Neon Database baglantisi kuruldu
[OK] 31 tables found
[OK] 399 products verified

=== BLOG SYSTEM ===
[OK] 1 blog post found
[OK] Blog structure valid

=== IMAGE STORAGE ===
[OK] Cloudinary connected
[OK] 4000+ images indexed

=== PRODUCT IMAGES INTEGRITY ===
[OK] 398/399 products with images
[!] 1 product missing image (YELKENCİ...)

==================================
TEST SUITE COMPLETED SUCCESSFULLY
==================================
```

### Failure Case
```
[FAIL] Database connection error
Workflow stopped at: neon-check
Error: Connection refused
Recommendation: Check DATABASE_URL secret
```

---

## 🚨 Troubleshooting

### Database Connection Fails
**Check:**
- [ ] DATABASE_URL secret is set correctly
- [ ] Neon database is online
- [ ] IP whitelist includes Railway
- [ ] Credentials haven't expired

### Cloudinary Check Fails
**Check:**
- [ ] CLOUDINARY_* secrets are correct
- [ ] API key hasn't been rotated
- [ ] Storage quota not exceeded

### Workflow Never Starts
**Check:**
- [ ] GitHub webhook is configured
- [ ] Branch name matches (main vs master)
- [ ] Railway pipeline permissions
- [ ] Argo RBAC configured

### Tests Pass But Report Empty
**Check:**
- [ ] Output artifacts path is correct
- [ ] Container logs are captured
- [ ] Artifact storage is mounted

---

## 📝 Best Practices

1. **Run after every commit** to main
2. **Monitor execution time** (should be < 5 min)
3. **Archive reports** for audit trail
4. **Alert on failures** (email/Slack)
5. **Test locally** before pushing to Railway

---

## 🔗 Related

- **GitHub Repo:** https://github.com/gul-tekinmuhendislik/gul-tekin-neon-app
- **Neon Console:** https://console.neon.tech
- **Cloudinary:** https://cloudinary.com/console
- **Argo Docs:** https://argoproj.github.io/argo-workflows/

---

**Last Updated:** 2026-03-08  
**Status:** ✅ Ready for deployment
