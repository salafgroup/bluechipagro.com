#!/usr/bin/env node

/**
 * Reserva Varde Goa - Staff User Management CLI
 * Supports interactive password entry to prevent credentials from being logged in shell history.
 *
 * Usage:
 *   node scripts/manage-staff.js create --email=<email> --name="<Name>" [--role=admin|sales_agent]
 *   node scripts/manage-staff.js list
 *   node scripts/manage-staff.js revoke --email=<email>
 *   node scripts/manage-staff.js reactivate --email=<email>
 *   node scripts/manage-staff.js reset-password --email=<email>
 */

const readline = require('readline');
const crypto = require('crypto');
const db = require('../lib/db');
const auth = require('../lib/auth');

function promptPassword(promptText = 'Enter password: ') {
  return new Promise((resolve) => {
    process.stdout.write(promptText);
    const stdin = process.stdin;

    // Fallback for non-interactive / piped input
    if (!stdin.isTTY) {
      const rl = readline.createInterface({ input: stdin, output: null });
      rl.question('', (answer) => {
        rl.close();
        process.stdout.write('\n');
        resolve(answer.trim());
      });
      return;
    }

    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          // Enter or EOF
          stdin.setRawMode(wasRaw || false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password.trim());
          return;
        } else if (char === '\u0003') {
          // Ctrl+C
          stdin.setRawMode(wasRaw || false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          process.exit(130);
        } else if (char === '\u0008' || char === '\x7f') {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          password += char;
          process.stdout.write('*'); // Masked echo
        }
      }
    };

    stdin.on('data', onData);
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const params = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx);
        const val = arg.slice(eqIdx + 1);
        params[key] = val;
      } else {
        params[arg.slice(2)] = true;
      }
    }
  }

  return { command, params };
}

async function main() {
  const { command, params } = parseArgs();

  switch (command) {
    case 'create': {
      const { email, name, role = 'sales_agent' } = params;
      if (!email || !name) {
        console.error('Error: --email and --name are required.');
        process.exit(1);
      }
      const normEmail = email.trim().toLowerCase();
      const existing = await db.get('SELECT id FROM staff_users WHERE email = ?', [normEmail]);
      if (existing) {
        console.error(`Error: User with email "${normEmail}" already exists.`);
        process.exit(1);
      }

      if (params.password) {
        console.error('Security error: Passing passwords via command-line flags (--password) is prohibited to prevent exposure in process tables and shell history. Please omit the flag to enter your password interactively via the masked prompt.');
        process.exit(1);
      }

      // Secure masked prompt with confirmation
      const password = await promptPassword(`Enter secure password for ${normEmail}: `);
      const confirm = await promptPassword(`Confirm password for ${normEmail}: `);
      if (password !== confirm) {
        console.error('Error: Passwords do not match.');
        process.exit(1);
      }
      if (!password || password.length < 8) {
        console.error('Error: Password must be at least 8 characters long.');
        process.exit(1);
      }

      const { salt, hash } = auth.hashPassword(password);
      const userId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      await db.run(
        `INSERT INTO staff_users (id, email, full_name, role, password_hash, salt, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [userId, normEmail, name.trim(), role, hash, salt]
      );
      console.log(`Success: Staff user "${normEmail}" (${name}) created with role [${role}]. ID: ${userId}`);
      break;
    }

    case 'list': {
      const users = await db.query(
        `SELECT id, email, full_name, role, is_active, created_at, updated_at
         FROM staff_users
         ORDER BY created_at DESC`
      );
      console.log('\n--- Authorized Staff Accounts (Passwords Excluded) ---');
      if (users.length === 0) {
        console.log('No staff accounts found. Create one using "create" command.');
      } else {
        console.table(users);
      }
      break;
    }

    case 'revoke': {
      const { email } = params;
      if (!email) {
        console.error('Error: --email is required.');
        process.exit(1);
      }
      const normEmail = email.trim().toLowerCase();
      const user = await db.get('SELECT id FROM staff_users WHERE email = ?', [normEmail]);
      if (!user) {
        console.error(`Error: User "${normEmail}" not found.`);
        process.exit(1);
      }
      await db.run('UPDATE staff_users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
      await auth.revokeAllUserSessions(user.id);
      console.log(`Success: Staff user "${normEmail}" access REVOKED and all active sessions terminated.`);
      break;
    }

    case 'reactivate': {
      const { email } = params;
      if (!email) {
        console.error('Error: --email is required.');
        process.exit(1);
      }
      const normEmail = email.trim().toLowerCase();
      const user = await db.get('SELECT id FROM staff_users WHERE email = ?', [normEmail]);
      if (!user) {
        console.error(`Error: User "${normEmail}" not found.`);
        process.exit(1);
      }
      await db.run('UPDATE staff_users SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
      console.log(`Success: Staff user "${normEmail}" access REACTIVATED.`);
      break;
    }

    case 'reset-password': {
      const { email } = params;
      if (!email) {
        console.error('Error: --email is required.');
        process.exit(1);
      }
      const normEmail = email.trim().toLowerCase();
      const user = await db.get('SELECT id FROM staff_users WHERE email = ?', [normEmail]);
      if (!user) {
        console.error(`Error: User "${normEmail}" not found.`);
        process.exit(1);
      }

      if (params.password) {
        console.error('Security error: Passing passwords via command-line flags (--password) is prohibited to prevent exposure in process tables and shell history. Please omit the flag to enter your password interactively via the masked prompt.');
        process.exit(1);
      }

      const password = await promptPassword(`Enter new secure password for ${normEmail}: `);
      const confirm = await promptPassword(`Confirm new password for ${normEmail}: `);
      if (password !== confirm) {
        console.error('Error: Passwords do not match.');
        process.exit(1);
      }
      if (!password || password.length < 8) {
        console.error('Error: Password must be at least 8 characters long.');
        process.exit(1);
      }

      const { salt, hash } = auth.hashPassword(password);
      await db.run(
        'UPDATE staff_users SET password_hash = ?, salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hash, salt, user.id]
      );
      await auth.revokeAllUserSessions(user.id);
      console.log(`Success: Password updated for "${normEmail}". Existing sessions terminated.`);
      break;
    }

    default:
      console.log(`
Reserva Varde Goa Staff Management CLI
Commands:
  create --email=<email> --name="<Name>" [--role=admin|sales_agent]
  list
  revoke --email=<email>
  reactivate --email=<email>
  reset-password --email=<email>
      `);
      break;
  }
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
