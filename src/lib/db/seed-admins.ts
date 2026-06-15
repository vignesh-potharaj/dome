import bcrypt from 'bcryptjs';
import { db } from './index';
import { branches, admins } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting admin database seeding...');

  try {
    // 1. Ensure branches exist (Foreign Key constraint requirements)
    const kokapetExists = await db.select().from(branches).where(eq(branches.id, 'kokapet'));
    const sainikpuriExists = await db.select().from(branches).where(eq(branches.id, 'sainikpuri'));

    if (kokapetExists.length === 0) {
      console.log('Inserting default Kokapet branch...');
      await db.insert(branches).values({
        id: 'kokapet',
        name: 'Kokapet Branch',
        status: 'active',
        capacity: 6,
      });
    }

    if (sainikpuriExists.length === 0) {
      console.log('Inserting default Sainikpuri branch...');
      await db.insert(branches).values({
        id: 'sainikpuri',
        name: 'Sainikpuri Branch',
        status: 'active',
        capacity: 6,
      });
    }

    // 2. Generate secure bcrypt hashes for default passwords
    console.log('Hashing passwords...');
    const superAdminPasswordHash = await bcrypt.hash('SuperAdminSecure123!', 10);
    const kokapetAdminPasswordHash = await bcrypt.hash('KokapetAdmin123!', 10);
    const sainikpuriAdminPasswordHash = await bcrypt.hash('SainikpuriAdmin123!', 10);

    // 3. Seed administrators
    console.log('Seeding admin accounts...');

    // Seed Super Admin
    const existingSuper = await db.select().from(admins).where(eq(admins.email, 'superadmin@domecafe.in'));
    if (existingSuper.length === 0) {
      await db.insert(admins).values({
        email: 'superadmin@domecafe.in',
        passwordHash: superAdminPasswordHash,
        role: 'super_admin',
        branchId: null, // Global access
      });
      console.log('✓ Seeded: superadmin@domecafe.in');
    } else {
      console.log('- Skip: superadmin@domecafe.in already exists');
    }

    // Seed Kokapet Admin
    const existingKokapet = await db.select().from(admins).where(eq(admins.email, 'kokapet@domecafe.in'));
    if (existingKokapet.length === 0) {
      await db.insert(admins).values({
        email: 'kokapet@domecafe.in',
        passwordHash: kokapetAdminPasswordHash,
        role: 'branch_admin',
        branchId: 'kokapet',
      });
      console.log('✓ Seeded: kokapet@domecafe.in');
    } else {
      console.log('- Skip: kokapet@domecafe.in already exists');
    }

    // Seed Sainikpuri Admin
    const existingSainikpuri = await db.select().from(admins).where(eq(admins.email, 'sainikpuri@domecafe.in'));
    if (existingSainikpuri.length === 0) {
      await db.insert(admins).values({
        email: 'sainikpuri@domecafe.in',
        passwordHash: sainikpuriAdminPasswordHash,
        role: 'branch_admin',
        branchId: 'sainikpuri',
      });
      console.log('✓ Seeded: sainikpuri@domecafe.in');
    } else {
      console.log('- Skip: sainikpuri@domecafe.in already exists');
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
