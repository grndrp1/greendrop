/**
 * Migration: body → serviceDetails on serviceLocation docs
 *
 * Runs once. Idempotent: safe to re-run (uses setIfMissing + unset).
 *
 * Usage:
 *   npx sanity exec migrations/2026-04-15-svc-loc-body-to-serviceDetails.ts --with-user-token
 *
 * Requires SANITY_AUTH_TOKEN (or --with-user-token flag) with Editor role.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

async function run() {
  const docs = await client.fetch<{_id: string; body: unknown}[]>(
    `*[_type == "serviceLocation" && defined(body)]{_id, body}`,
  )
  console.log(`Found ${docs.length} serviceLocation docs with legacy 'body' field`)

  if (docs.length === 0) {
    console.log('Nothing to migrate. Exiting.')
    return
  }

  const tx = client.transaction()
  for (const doc of docs) {
    tx.patch(doc._id, (p) => p.setIfMissing({serviceDetails: doc.body}).unset(['body']))
  }

  const result = await tx.commit()
  console.log(`Migrated ${result.results.length} docs`)

  // Verify
  const remaining = await client.fetch<number>(
    `count(*[_type == "serviceLocation" && defined(body)])`,
  )
  console.log(`Remaining docs with 'body': ${remaining} (expected 0)`)
  if (remaining !== 0) {
    console.error('Migration did not clear all body fields')
    process.exit(1)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
