import { Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { query } from '../../shared/database';

const logger = new Logger({ serviceName: 'rollup' });

interface RollupEvent {
  rollupType: 'hourly' | 'daily';
}

export async function handler(event: RollupEvent, context: Context): Promise<void> {
  logger.addContext(context);
  logger.info('Rollup processor triggered', { rollupType: event.rollupType });

  try {
    if (event.rollupType === 'hourly') {
      await processHourlyRollups();
    } else if (event.rollupType === 'daily') {
      await processDailyRollups();
    }
  } catch (error) {
    logger.error('Rollup processing failed', { error, rollupType: event.rollupType });
    throw error;
  }
}

async function processHourlyRollups(): Promise<void> {
  const startTime = Date.now();

  const result = await query(`
    INSERT INTO usage_rollups_hourly (
      hour_start, property_id, building_id, unit_id, metric_type,
      sum_value, avg_value, min_value, max_value, reading_count
    )
    SELECT 
      date_trunc('hour', timestamp) as hour_start,
      property_id,
      building_id,
      unit_id,
      metric_type,
      SUM(value) as sum_value,
      AVG(value) as avg_value,
      MIN(value) as min_value,
      MAX(value) as max_value,
      COUNT(*) as reading_count
    FROM sensor_readings
    WHERE timestamp >= date_trunc('hour', NOW() - INTERVAL '2 hours')
      AND timestamp < date_trunc('hour', NOW() - INTERVAL '1 hour')
      AND metric_type IN ('electric_kwh', 'electric_kw', 'water_gallons', 'water_flow_rate')
    GROUP BY date_trunc('hour', timestamp), property_id, building_id, unit_id, metric_type
    ON CONFLICT (hour_start, property_id, COALESCE(building_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(unit_id, '00000000-0000-0000-0000-000000000000'::UUID), metric_type)
    DO UPDATE SET
      sum_value = EXCLUDED.sum_value,
      avg_value = EXCLUDED.avg_value,
      min_value = EXCLUDED.min_value,
      max_value = EXCLUDED.max_value,
      reading_count = EXCLUDED.reading_count
  `);

  const duration = Date.now() - startTime;
  logger.info('Hourly rollups complete', { 
    rowsAffected: result.rowCount,
    durationMs: duration 
  });
}

async function processDailyRollups(): Promise<void> {
  const startTime = Date.now();

  const result = await query(`
    INSERT INTO usage_rollups_daily (
      date, property_id, building_id, unit_id, metric_type,
      sum_value, avg_value, min_value, max_value, peak_hour, peak_value, reading_count
    )
    SELECT 
      date_trunc('day', hour_start)::DATE as date,
      property_id,
      building_id,
      unit_id,
      metric_type,
      SUM(sum_value) as sum_value,
      AVG(avg_value) as avg_value,
      MIN(min_value) as min_value,
      MAX(max_value) as max_value,
      (ARRAY_AGG(EXTRACT(HOUR FROM hour_start) ORDER BY max_value DESC))[1]::INTEGER as peak_hour,
      MAX(max_value) as peak_value,
      SUM(reading_count) as reading_count
    FROM usage_rollups_hourly
    WHERE hour_start >= CURRENT_DATE - INTERVAL '2 days'
      AND hour_start < CURRENT_DATE - INTERVAL '1 day'
    GROUP BY date_trunc('day', hour_start)::DATE, property_id, building_id, unit_id, metric_type
    ON CONFLICT (date, property_id, COALESCE(building_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(unit_id, '00000000-0000-0000-0000-000000000000'::UUID), metric_type)
    DO UPDATE SET
      sum_value = EXCLUDED.sum_value,
      avg_value = EXCLUDED.avg_value,
      min_value = EXCLUDED.min_value,
      max_value = EXCLUDED.max_value,
      peak_hour = EXCLUDED.peak_hour,
      peak_value = EXCLUDED.peak_value,
      reading_count = EXCLUDED.reading_count
  `);

  const duration = Date.now() - startTime;
  logger.info('Daily rollups complete', { 
    rowsAffected: result.rowCount,
    durationMs: duration 
  });

  await updateBaselines();
}

async function updateBaselines(): Promise<void> {
  const startTime = Date.now();

  await query(`
    INSERT INTO baselines (
      property_id, building_id, unit_id, metric_type, hour_of_day, day_of_week,
      baseline_value, std_deviation, sample_count, valid_from
    )
    SELECT 
      property_id,
      building_id,
      unit_id,
      metric_type,
      EXTRACT(HOUR FROM hour_start)::INTEGER as hour_of_day,
      EXTRACT(DOW FROM hour_start)::INTEGER as day_of_week,
      AVG(avg_value) as baseline_value,
      STDDEV(avg_value) as std_deviation,
      COUNT(*) as sample_count,
      CURRENT_DATE as valid_from
    FROM usage_rollups_hourly
    WHERE hour_start >= CURRENT_DATE - INTERVAL '30 days'
      AND hour_start < CURRENT_DATE
      AND metric_type IN ('electric_kw', 'water_flow_rate')
    GROUP BY property_id, building_id, unit_id, metric_type, 
             EXTRACT(HOUR FROM hour_start), EXTRACT(DOW FROM hour_start)
    HAVING COUNT(*) >= 7
    ON CONFLICT DO NOTHING
  `);

  await query(`
    UPDATE baselines
    SET valid_to = CURRENT_DATE - INTERVAL '1 day'
    WHERE valid_to IS NULL
      AND valid_from < CURRENT_DATE - INTERVAL '60 days'
  `);

  const duration = Date.now() - startTime;
  logger.info('Baselines updated', { durationMs: duration });
}
