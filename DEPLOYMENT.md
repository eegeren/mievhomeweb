# Miev Home Deployment

## Mimari

- Vercel: Next.js web arayüzü ve API route'ları
- Railway: PostgreSQL veritabanı
- Vercel `DATABASE_URL` env değişkeni Railway Postgres bağlantısını kullanır.

Bu kurulumda ürünler, kullanıcılar, siparişler ve sipariş kalemleri Railway PostgreSQL içinde tutulur.

## Railway

1. Railway'de yeni proje oluştur.
2. PostgreSQL servisi ekle.
3. PostgreSQL servisindeki `DATABASE_URL` değerini kopyala.
4. Yerelde veya Railway/Vercel terminalinde şemayı uygula:

```bash
npm run db:push
npm run db:seed
```

İleride migration dosyası oluşturmak için:

```bash
npx prisma migrate dev --name init
```

Canlı ortamda migration uygulamak için:

```bash
npm run db:migrate
```

## Vercel

Vercel proje ayarlarında Environment Variables bölümüne ekle:

```bash
DATABASE_URL=railway_postgres_database_url
```

Bu değişkeni ekledikten sonra Vercel'de yeni deploy tetikle.

Sonra deploy:

```bash
npm install
npm run build
vercel --prod
```

## API

- `GET /api/products`: Ürünleri Railway PostgreSQL'den okur. `DATABASE_URL` yoksa demo ürünleri döner.
- `POST /api/auth/register`: Kullanıcıyı Railway PostgreSQL'e kaydeder.
- `POST /api/auth/login`: Kullanıcı girişini kontrol eder.
- `POST /api/orders`: Sepetteki ürünlerden sipariş oluşturur.

## Canlı DB Aktivasyon Sırası

Railway PostgreSQL `DATABASE_URL` hazır olduktan sonra:

```bash
DATABASE_URL="railway_postgres_database_url" npm run db:migrate
DATABASE_URL="railway_postgres_database_url" npm run db:seed
```

Ardından aynı `DATABASE_URL` değerini Vercel Production Environment Variables içine ekleyip redeploy et.

## Notlar

- Şu an ödeme entegrasyonu demo akıştır.
- Giriş/kayıt ve sipariş oluşturma API'leri Railway DB'ye bağlanır.
- Kalıcı oturum için sonraki adımda NextAuth/Auth.js veya JWT tabanlı session eklenebilir.
- Ürün yönetimi için admin paneli sonraki aşamada eklenmelidir.
