Instructions to create and push a Prisma migration to your Supabase DB

1) Install dependencies (in your frontend project):

```bash
npm install -D prisma
npm install @prisma/client
```

2) Copy the example env and set your Supabase DB URL (get from Supabase Dashboard → Settings → Database → Connection string):

```bash
cp prisma/.env.example prisma/.env
# Edit prisma/.env and set DATABASE_URL
```

3) Generate the Prisma Client and push schema to the database (non-migration):

```bash
npx prisma generate
npx prisma db push
```

4) (Optional) Create a migration folder and apply migrations (recommended for tracked changes):

```bash
npx prisma migrate dev --name init
```

Notes:
- The `prisma/schema.prisma` file maps to your existing `profiles` and `contact_messages` tables created by your SQL migrations. If you have other tables (e.g., `contacts`), add them to the schema before running `prisma db push` or use `npx prisma db pull` to introspect an existing database.
- If your DB uses `gen_random_uuid()` (pgcrypto), ensure the extension is enabled on Supabase (your migration already includes `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`).
- Because Supabase manages `auth` in a separate schema, Prisma won't manage `auth.users` here; we model `user_id` fields as `String @db.Uuid`.

If you want, I can also:
- Add a `contacts` model if you paste that table schema.
- Run `npx prisma db pull` output for you if you paste your `DATABASE_URL` (don’t paste secrets here; instead run locally and paste results).
