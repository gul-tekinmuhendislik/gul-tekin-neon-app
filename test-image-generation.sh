#!/bin/bash

echo "================================"
echo "FAL.AI IMAGE GENERATION TEST"
echo "================================"
echo ""

# Renklendirme
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Mevcut prompt durumunu göster
echo -e "${YELLOW}1. Mevcut Prompt Durumu:${NC}"
curl -s http://localhost:3001/api/process-prompts | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  Toplam Prompt: {data[\"totalPrompts\"]}')
print(f'  İşlenecek: {data[\"toGenerate\"]}')
print()
for p in data['prompts']:
    status = '✅' if p['generate'] else '⏸️'
    print(f'  {status} ID {p[\"id\"]}: {p[\"prompt\"][:50]}...')
"
echo ""

# 2. İşleme sor
echo -e "${YELLOW}2. Promptları işlemek istiyor musunuz? (y/n)${NC}"
read -r answer

if [ "$answer" = "y" ]; then
    echo -e "${GREEN}İşleniyor...${NC}"
    echo ""
    
    # API çağrısı yap
    response=$(curl -s -X POST http://localhost:3001/api/process-prompts)
    
    # Sonucu göster
    echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    print('✅ İşlem Başarılı!')
    print(f'  İşlenen: {data[\"processed\"]} prompt')
    for r in data.get('results', []):
        if r['success']:
            print(f'  ✅ Prompt {r[\"promptId\"]}: {r[\"images\"]} resim üretildi')
            for url in r.get('cloudinaryUrls', []):
                print(f'     📸 {url[:80]}...')
        else:
            print(f'  ❌ Prompt {r[\"promptId\"]}: {r.get(\"error\", \"Hata\")}')
else:
    print('❌ İşlem Başarısız:', data.get('error', 'Bilinmeyen hata'))
"
    echo ""
    
    # 3. Veritabanı kontrolü
    echo -e "${YELLOW}3. Veritabanı Kontrolü:${NC}"
    curl -s http://localhost:3001/api/check-generated-images | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  Toplam Resim: {data[\"count\"]}')
if data['count'] > 0:
    latest = data['images'][0]
    print(f'  Son Resim:')
    print(f'    - Prompt: {latest[\"original_prompt\"][:50]}...')
    print(f'    - Cloudinary: {\"✅\" if latest.get(\"cloudinary_url\") else \"❌\"}')
"
else
    echo -e "${RED}İşlem iptal edildi.${NC}"
fi

echo ""
echo "================================"
echo "TEST TAMAMLANDI"
echo "================================"
echo ""
echo "📝 Not: test-prompts.json dosyasını düzenleyerek:"
echo "   - Yeni prompt ekleyebilirsiniz"
echo "   - 'generate: true' yaparak işleme alabilirsiniz"
echo "   - Model değiştirebilirsiniz (imagen4-fast, flux-schnell, vb.)"