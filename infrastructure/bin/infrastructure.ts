#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EnergyDashboardStack } from '../lib/energy-dashboard-stack';

const app = new cdk.App();

new EnergyDashboardStack(app, 'EnergyDashboardStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Utility Monitoring Dashboard Infrastructure',
  tags: {
    Project: 'EnergyDashboard',
    Environment: process.env.ENVIRONMENT || 'dev',
  },
});

app.synth();
