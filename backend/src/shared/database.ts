import { Pool, PoolClient, QueryResult } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'database' });

let pool: Pool | null = null;
let dbCredentials: any = null;

interface DBCredentials {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
}

async function getDBCredentials(): Promise<DBCredentials> {
  if (dbCredentials) {
    return dbCredentials;
  }

  const secretsManager = new SecretsManagerClient({});
  const secretArn = process.env.DB_SECRET_ARN!;

  try {
    const response = await secretsManager.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );

    const secret = JSON.parse(response.SecretString!);
    
    dbCredentials = {
      username: secret.username,
      password: secret.password,
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT || '5432'),
      dbname: process.env.DB_NAME || 'energydashboard',
    };

    return dbCredentials;
  } catch (error) {
    logger.error('Failed to retrieve database credentials', { error });
    throw error;
  }
}

export async function getPool(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  const credentials = await getDBCredentials();

  pool = new Pool({
    user: credentials.username,
    password: credentials.password,
    host: credentials.host,
    port: credentials.port,
    database: credentials.dbname,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  pool.on('error', (err) => {
    logger.error('Unexpected database error', { error: err });
  });

  logger.info('Database pool created');
  return pool;
}

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = await getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Query executed', {
      duration,
      rows: result.rowCount,
      query: text.substring(0, 100),
    });

    return result;
  } catch (error) {
    logger.error('Query failed', {
      error,
      query: text.substring(0, 100),
      params,
    });
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  const pool = await getPool();
  return pool.connect();
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction failed', { error });
    throw error;
  } finally {
    client.release();
  }
}
