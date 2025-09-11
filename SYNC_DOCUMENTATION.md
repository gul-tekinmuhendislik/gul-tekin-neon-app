# Airtable-Neon Sync Documentation

## Cron Schedule (Inngest)

### Weekly Sync Schedule (All on Mondays)
- **3:00 AM** → Markalar (Brands) Sync
- **3:30 AM** → Hizmetler (Services) Sync  
- **4:00 AM** → Projeler (Projects) Sync
- **4:30 AM** → Ürünler (Products) Sync (if configured)

### Additional Automated Functions
- **Every 6 hours** → Data Sync, Content Generation
- **Daily 3:00 AM** → Facebook Token Refresh
- **9:00 AM & 9:00 PM** → Token Expiry Monitoring

## Cloudinary Field Protection

### Protected Fields (Never Updated During Re-sync)
All sync operations are configured to preserve Cloudinary data:

#### projeler_gul_tekin Table
- `cloudinary_url`
- `cloudinary_public_id`
- `cloudinary_galeri_urls`
- `cloudinary_galeri_public_ids`

#### Other Tables (markalar, hizmetler, urunler)
- `cloudinary_url`
- `cloudinary_public_id`

### Protection Implementation

#### 1. SQL Update Strategy
```sql
ON CONFLICT (airtable_id)
DO UPDATE SET
  -- Only update Airtable-sourced fields
  proje_adi = EXCLUDED.proje_adi,
  aciklama = EXCLUDED.aciklama,
  mahalle = EXCLUDED.mahalle,
  -- Use COALESCE to preserve existing Cloudinary data
  cloudinary_url = COALESCE(EXCLUDED.cloudinary_url, projeler_gul_tekin.cloudinary_url),
  cloudinary_public_id = COALESCE(EXCLUDED.cloudinary_public_id, projeler_gul_tekin.cloudinary_public_id)
```

#### 2. Sync Function Comments
All sync files include Turkish comments explicitly stating:
```typescript
// cloudinary_url ve cloudinary_public_id alanlarına dokunmuyoruz
```

#### 3. Manual Sync API
For projeler_gul_tekin, use the sync API with upload parameter:
- **With Cloudinary upload**: `/api/sync-projeler-gul-tekin?limit=10&upload=true`
- **Without Cloudinary upload**: `/api/sync-projeler-gul-tekin?limit=10&upload=false`

## Manual Sync Commands

### Single Project Sync
```bash
node sync-with-cloudinary.js
```

### Bulk Sync (25 at a time)
```bash
node complete-sync-projeler.js
```

### Check Sync Status
```bash
node check-neon-table.js
```

### Count Remaining Projects
```bash
node count-airtable-projects.js
```

## Inngest Functions

### Trigger Manual Sync
You can trigger manual syncs via Inngest events:
- `markalar/sync.requested`
- `hizmetler/sync.requested`  
- `projeler/sync.requested`
- `projeler/single.sync`

### Check Inngest Dashboard
Access the Inngest dashboard to monitor sync jobs:
- Local: http://localhost:8288
- Production: Check your Inngest dashboard URL

## Database Statistics

### Current Status (projeler_gul_tekin)
- Total Records: 236
- With Cloudinary URLs: 235
- With Airtable Images: 236
- Remaining to sync: ~34 (out of 270 total in Airtable)

## Important Notes

1. **Never manually update Cloudinary fields** in the database unless you're uploading new images
2. **Cloudinary upload is resource-intensive** - Use batch limits (25-50 records at a time)
3. **Gallery images** are limited to first 3 images per project for performance
4. **Sync order matters** - Projeler depends on Ana Faaliyet data being synced first
5. **Use COALESCE pattern** when updating records to preserve Cloudinary data

## Troubleshooting

### If Cloudinary fields are empty:
1. Check if images exist in Airtable
2. Run single project sync to debug: `node sync-with-cloudinary.js`
3. Check Cloudinary console for upload errors
4. Verify environment variables are set correctly

### If sync fails:
1. Check Inngest logs for errors
2. Verify Airtable API key is valid
3. Check database connection
4. Review rate limits (Airtable: 5 requests/second)

## Environment Variables Required
```env
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_ID_PROJELER=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
DATABASE_URL=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```