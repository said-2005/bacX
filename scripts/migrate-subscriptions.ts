/**
 * Legacy User Migration Script
 * Migrates users from isSubscribed:true to subscriptionEnd timestamp
 * 
 * Run with: npx ts-node scripts/migrate-subscriptions.ts
 * Or via Cloud Function trigger
 */

import * as admin from 'firebase-admin';

// Initialize if running as standalone script
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const db = admin.firestore();

interface MigrationResult {
    total: number;
    migrated: number;
    skipped: number;
    errors: number;
    details: string[];
}

/**
 * Migrate all legacy subscribed users to use subscriptionEnd
 * @param durationDays - How many days of subscription to grant (default 365)
 */
export async function migrateSubscriptions(durationDays: number = 365): Promise<MigrationResult> {
    const result: MigrationResult = {
        total: 0,
        migrated: 0,
        skipped: 0,
        errors: 0,
        details: []
    };

    try {
        // Find all users with isSubscribed=true but no subscriptionEnd
        const usersRef = db.collection('users');
        const snapshot = await usersRef
            .where('isSubscribed', '==', true)
            .get();

        result.total = snapshot.size;
        console.log(`Found ${result.total} subscribed users to check`);

        const batch = db.batch();
        let batchCount = 0;
        const MAX_BATCH = 500;

        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Skip if already has subscriptionEnd
            if (data.subscriptionEnd) {
                result.skipped++;
                result.details.push(`SKIP: ${doc.id} - already has subscriptionEnd`);
                continue;
            }

            // Calculate new subscription end date
            const subscriptionEnd = new Date();
            subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);

            batch.update(doc.ref, {
                subscriptionEnd: admin.firestore.Timestamp.fromDate(subscriptionEnd),
                migratedAt: admin.firestore.FieldValue.serverTimestamp(),
                migrationNote: `Legacy isSubscribed migrated on ${new Date().toISOString()}`
            });

            result.migrated++;
            result.details.push(`MIGRATE: ${doc.id} -> expires ${subscriptionEnd.toISOString()}`);
            batchCount++;

            // Commit in batches of 500
            if (batchCount >= MAX_BATCH) {
                await batch.commit();
                console.log(`Committed batch of ${batchCount} updates`);
                batchCount = 0;
            }
        }

        // Commit remaining
        if (batchCount > 0) {
            await batch.commit();
            console.log(`Committed final batch of ${batchCount} updates`);
        }

        console.log('\n=== MIGRATION COMPLETE ===');
        console.log(`Total: ${result.total}`);
        console.log(`Migrated: ${result.migrated}`);
        console.log(`Skipped: ${result.skipped}`);
        console.log(`Errors: ${result.errors}`);

    } catch (error) {
        console.error('Migration failed:', error);
        result.errors++;
        result.details.push(`ERROR: ${(error as Error).message}`);
    }

    return result;
}

/**
 * Dry run - shows what would be migrated without making changes
 */
export async function dryRunMigration(): Promise<void> {
    console.log('\n=== DRY RUN MODE ===\n');

    const usersRef = db.collection('users');
    const snapshot = await usersRef
        .where('isSubscribed', '==', true)
        .get();

    let needsMigration = 0;
    let alreadyMigrated = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.subscriptionEnd) {
            alreadyMigrated++;
            console.log(`✓ ${doc.id} - already has subscriptionEnd`);
        } else {
            needsMigration++;
            console.log(`→ ${doc.id} - NEEDS MIGRATION (email: ${data.email})`);
        }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total subscribed users: ${snapshot.size}`);
    console.log(`Already migrated: ${alreadyMigrated}`);
    console.log(`Needs migration: ${needsMigration}`);
}

// Run if executed directly
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--dry-run')) {
        dryRunMigration()
            .then(() => process.exit(0))
            .catch((e) => {
                console.error(e);
                process.exit(1);
            });
    } else {
        const days = parseInt(args[0]) || 365;
        console.log(`Migrating with ${days} days subscription...`);

        migrateSubscriptions(days)
            .then(() => process.exit(0))
            .catch((e) => {
                console.error(e);
                process.exit(1);
            });
    }
}
