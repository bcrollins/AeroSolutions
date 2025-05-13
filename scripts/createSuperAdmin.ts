import { pool } from '../server/db';
import { hashPassword } from '../server/utils/auth';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function createSuperAdmin() {
  try {
    console.log('Creating super admin account...');
    
    // Check if the admin user already exists
    const [existingAdmin] = await db.select().from(users).where(eq(users.email, 'brollins565@gmail.com'));
    
    if (existingAdmin) {
      console.log('Super admin account already exists, updating role to admin...');
      await db
        .update(users)
        .set({
          role: 'admin',
          verified: true,
          onboardingComplete: true,
          updatedAt: new Date()
        })
        .where(eq(users.email, 'brollins565@gmail.com'));
      
      console.log('Super admin account updated successfully.');
      return;
    }
    
    // Create the admin user
    const hashedPassword = hashPassword('*Rosie2010');
    
    await db.insert(users).values({
      username: 'brollins',
      email: 'brollins565@gmail.com',
      password: hashedPassword,
      firstName: 'Brett',
      lastName: 'Rollins',
      role: 'admin',
      verified: true,
      onboardingComplete: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Super admin account created successfully.');
  } catch (error) {
    console.error('Error creating super admin account:', error);
  } finally {
    await pool.end();
  }
}

createSuperAdmin();