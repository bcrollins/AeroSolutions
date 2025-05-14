/**
 * Run subscription plans update script
 */

const { execSync } = require('child_process');

console.log('Running subscription plans update script...');

try {
  execSync('npx tsx server/scripts/update-subscription-plans.ts', { stdio: 'inherit' });
  console.log('Subscription plans update completed successfully');
} catch (error) {
  console.error('Error running subscription plans update script:', error);
  process.exit(1);
}