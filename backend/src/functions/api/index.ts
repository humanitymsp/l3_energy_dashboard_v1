import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { Logger } from '@aws-lambda-powertools/logger';
import { query } from '../../shared/database';
import { Property, Building, Unit, Alert, Anomaly } from '../../shared/types';

const logger = new Logger({ serviceName: 'api' });

async function baseHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  logger.addContext(context);

  const { httpMethod, path, pathParameters, queryStringParameters } = event;
  const route = `${httpMethod} ${path}`;

  logger.info('API request', { route, pathParameters, queryStringParameters });

  try {
    switch (route) {
      case 'GET /properties':
        return await getProperties(queryStringParameters);
      
      case 'GET /properties/{propertyId}':
        return await getProperty(pathParameters?.propertyId!);
      
      case 'GET /properties/{propertyId}/buildings':
        return await getBuildings(pathParameters?.propertyId!);
      
      case 'GET /properties/{propertyId}/units':
        return await getUnits(pathParameters?.propertyId!, queryStringParameters);
      
      case 'GET /usage':
        return await getUsage(queryStringParameters);
      
      case 'GET /anomalies':
        return await getAnomalies(queryStringParameters);
      
      case 'GET /alerts':
        return await getAlerts(queryStringParameters);
      
      case 'PUT /alerts/{alertId}':
        return await updateAlert(pathParameters?.alertId!, JSON.parse(event.body || '{}'));
      
      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Route not found' }),
        };
    }
  } catch (error) {
    logger.error('API error', { error, route });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function getProperties(params: any): Promise<APIGatewayProxyResult> {
  const result = await query<Property>(`
    SELECT p.*, 
           COUNT(DISTINCT b.id) as building_count,
           COUNT(DISTINCT u.id) as unit_count
    FROM properties p
    LEFT JOIN buildings b ON p.id = b.property_id
    LEFT JOIN units u ON p.id = u.property_id
    GROUP BY p.id
    ORDER BY p.name
  `);

  return {
    statusCode: 200,
    body: JSON.stringify({ properties: result.rows }),
  };
}

async function getProperty(propertyId: string): Promise<APIGatewayProxyResult> {
  const propertyResult = await query<Property>(
    'SELECT * FROM properties WHERE id = $1',
    [propertyId]
  );

  if (propertyResult.rows.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Property not found' }),
    };
  }

  const statsResult = await query(`
    SELECT 
      COUNT(DISTINCT b.id) as building_count,
      COUNT(DISTINCT u.id) as unit_count,
      COUNT(DISTINCT d.id) as device_count,
      COUNT(DISTINCT CASE WHEN a.status IN ('active', 'acknowledged') THEN a.id END) as active_alerts,
      COUNT(DISTINCT CASE WHEN an.resolved = false THEN an.id END) as active_anomalies
    FROM properties p
    LEFT JOIN buildings b ON p.id = b.property_id
    LEFT JOIN units u ON p.id = u.property_id
    LEFT JOIN devices d ON p.id = d.property_id
    LEFT JOIN alerts a ON p.id = a.property_id
    LEFT JOIN anomalies an ON p.id = an.property_id
    WHERE p.id = $1
    GROUP BY p.id
  `, [propertyId]);

  return {
    statusCode: 200,
    body: JSON.stringify({
      property: propertyResult.rows[0],
      stats: statsResult.rows[0],
    }),
  };
}

async function getBuildings(propertyId: string): Promise<APIGatewayProxyResult> {
  const result = await query<Building>(`
    SELECT b.*,
           COUNT(DISTINCT u.id) as unit_count,
           COUNT(DISTINCT d.id) as device_count
    FROM buildings b
    LEFT JOIN units u ON b.id = u.building_id
    LEFT JOIN devices d ON b.id = d.building_id
    WHERE b.property_id = $1
    GROUP BY b.id
    ORDER BY b.name
  `, [propertyId]);

  return {
    statusCode: 200,
    body: JSON.stringify({ buildings: result.rows }),
  };
}

async function getUnits(propertyId: string, params: any): Promise<APIGatewayProxyResult> {
  const buildingId = params?.buildingId;
  
  let queryText = `
    SELECT u.*,
           b.name as building_name,
           COUNT(DISTINCT d.id) as device_count
    FROM units u
    JOIN buildings b ON u.building_id = b.id
    LEFT JOIN devices d ON u.id = d.unit_id
    WHERE u.property_id = $1
  `;
  
  const queryParams: any[] = [propertyId];
  
  if (buildingId) {
    queryText += ' AND u.building_id = $2';
    queryParams.push(buildingId);
  }
  
  queryText += ' GROUP BY u.id, b.name ORDER BY u.unit_number';

  const result = await query<Unit>(queryText, queryParams);

  return {
    statusCode: 200,
    body: JSON.stringify({ units: result.rows }),
  };
}

async function getUsage(params: any): Promise<APIGatewayProxyResult> {
  const { propertyId, buildingId, unitId, metricType, startDate, endDate, granularity = 'hourly' } = params || {};

  if (!propertyId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'propertyId is required' }),
    };
  }

  const table = granularity === 'daily' ? 'usage_rollups_daily' : 'usage_rollups_hourly';
  const timeColumn = granularity === 'daily' ? 'date' : 'hour_start';

  let queryText = `
    SELECT *
    FROM ${table}
    WHERE property_id = $1
  `;
  
  const queryParams: any[] = [propertyId];
  let paramIndex = 2;

  if (buildingId) {
    queryText += ` AND building_id = $${paramIndex}`;
    queryParams.push(buildingId);
    paramIndex++;
  }

  if (unitId) {
    queryText += ` AND unit_id = $${paramIndex}`;
    queryParams.push(unitId);
    paramIndex++;
  }

  if (metricType) {
    queryText += ` AND metric_type = $${paramIndex}`;
    queryParams.push(metricType);
    paramIndex++;
  }

  if (startDate) {
    queryText += ` AND ${timeColumn} >= $${paramIndex}`;
    queryParams.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    queryText += ` AND ${timeColumn} <= $${paramIndex}`;
    queryParams.push(endDate);
    paramIndex++;
  }

  queryText += ` ORDER BY ${timeColumn} DESC LIMIT 1000`;

  const result = await query(queryText, queryParams);

  return {
    statusCode: 200,
    body: JSON.stringify({ usage: result.rows }),
  };
}

async function getAnomalies(params: any): Promise<APIGatewayProxyResult> {
  const { propertyId, buildingId, unitId, severity, resolved, limit = 100 } = params || {};

  let queryText = `
    SELECT a.*,
           p.name as property_name,
           b.name as building_name,
           u.unit_number
    FROM anomalies a
    JOIN properties p ON a.property_id = p.id
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN units u ON a.unit_id = u.id
    WHERE 1=1
  `;

  const queryParams: any[] = [];
  let paramIndex = 1;

  if (propertyId) {
    queryText += ` AND a.property_id = $${paramIndex}`;
    queryParams.push(propertyId);
    paramIndex++;
  }

  if (buildingId) {
    queryText += ` AND a.building_id = $${paramIndex}`;
    queryParams.push(buildingId);
    paramIndex++;
  }

  if (unitId) {
    queryText += ` AND a.unit_id = $${paramIndex}`;
    queryParams.push(unitId);
    paramIndex++;
  }

  if (severity) {
    queryText += ` AND a.severity = $${paramIndex}`;
    queryParams.push(severity);
    paramIndex++;
  }

  if (resolved !== undefined) {
    queryText += ` AND a.resolved = $${paramIndex}`;
    queryParams.push(resolved === 'true');
    paramIndex++;
  }

  queryText += ` ORDER BY a.timestamp DESC LIMIT $${paramIndex}`;
  queryParams.push(parseInt(limit));

  const result = await query<Anomaly>(queryText, queryParams);

  return {
    statusCode: 200,
    body: JSON.stringify({ anomalies: result.rows }),
  };
}

async function getAlerts(params: any): Promise<APIGatewayProxyResult> {
  const { propertyId, status, severity, limit = 100 } = params || {};

  let queryText = `
    SELECT a.*,
           p.name as property_name,
           b.name as building_name,
           u.unit_number,
           ar.name as rule_name
    FROM alerts a
    JOIN properties p ON a.property_id = p.id
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN units u ON a.unit_id = u.id
    LEFT JOIN alert_rules ar ON a.alert_rule_id = ar.id
    WHERE 1=1
  `;

  const queryParams: any[] = [];
  let paramIndex = 1;

  if (propertyId) {
    queryText += ` AND a.property_id = $${paramIndex}`;
    queryParams.push(propertyId);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND a.status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  if (severity) {
    queryText += ` AND a.severity = $${paramIndex}`;
    queryParams.push(severity);
    paramIndex++;
  }

  queryText += ` ORDER BY a.created_at DESC LIMIT $${paramIndex}`;
  queryParams.push(parseInt(limit));

  const result = await query<Alert>(queryText, queryParams);

  return {
    statusCode: 200,
    body: JSON.stringify({ alerts: result.rows }),
  };
}

async function updateAlert(alertId: string, body: any): Promise<APIGatewayProxyResult> {
  const { status, acknowledged_by, resolved_by, resolution_notes } = body;

  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (status) {
    updates.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  if (status === 'acknowledged' && acknowledged_by) {
    updates.push(`acknowledged_at = NOW(), acknowledged_by = $${paramIndex}`);
    params.push(acknowledged_by);
    paramIndex++;
  }

  if (status === 'resolved' && resolved_by) {
    updates.push(`resolved_at = NOW(), resolved_by = $${paramIndex}`);
    params.push(resolved_by);
    paramIndex++;
  }

  if (resolution_notes) {
    updates.push(`resolution_notes = $${paramIndex}`);
    params.push(resolution_notes);
    paramIndex++;
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No valid updates provided' }),
    };
  }

  params.push(alertId);
  const queryText = `
    UPDATE alerts
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await query(queryText, params);

  if (result.rows.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Alert not found' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ alert: result.rows[0] }),
  };
}

export const handler = middy(baseHandler)
  .use(httpJsonBodyParser())
  .use(httpCors())
  .use(httpErrorHandler());
