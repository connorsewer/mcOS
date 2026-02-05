#!/usr/bin/env npx tsx
/**
 * Migration Script: Migrate existing deliverables from ops/drafts/ to Convex
 * 
 * Run from mcos-frontend/my-app directory:
 *   npx tsx scripts/migrate-deliverables.ts
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRAFTS_DIR = path.resolve(__dirname, '../../../ops/drafts');
const DRY_RUN = process.argv.includes('--dry-run');

type DeliverableType = 'research' | 'blog_draft' | 'email_copy' | 'white_paper' | 'presentation' | 'image' | 'spreadsheet' | 'brief' | 'other';
type Squad = 'oceans-11' | 'dune';

interface MigrationFile {
  path: string;
  filename: string;
  title: string;
  type: DeliverableType;
  squad: Squad;
  content: string;
}

const FILE_MAPPINGS: Array<{
  pattern: RegExp;
  type: DeliverableType;
  squad: Squad;
  titleExtractor?: (filename: string) => string;
}> = [
  { pattern: /TSI.*Competitive.*Audit/i, type: 'research', squad: 'oceans-11', titleExtractor: () => 'TSI Q1 Competitive Audit 2026 - Executive Brief' },
  { pattern: /tsi-competitive-analysis/i, type: 'research', squad: 'oceans-11', titleExtractor: () => 'TSI Competitive Analysis Phase 2' },
  { pattern: /tsi-competitive-research/i, type: 'research', squad: 'oceans-11', titleExtractor: () => 'TSI Competitive Research Phase 1' },
  { pattern: /portfolio-proof-points/i, type: 'brief', squad: 'dune', titleExtractor: () => 'TSI Portfolio Proof Points' },
  { pattern: /portfolio-integration/i, type: 'brief', squad: 'dune', titleExtractor: () => 'Portfolio Integration Summary' },
  { pattern: /outreach.*xai/i, type: 'email_copy', squad: 'dune', titleExtractor: () => 'xAI Head of GTM Systems Outreach Package' },
  { pattern: /outreach.*spring.*health/i, type: 'email_copy', squad: 'dune', titleExtractor: () => 'Spring Health VP RevOps Outreach Package' },
  { pattern: /outreach.*panopto/i, type: 'email_copy', squad: 'dune', titleExtractor: () => 'Panopto VP GTM Ops Outreach Package' },
  { pattern: /outreach.*productiv/i, type: 'email_copy', squad: 'dune', titleExtractor: () => 'Productiv Outreach Package' },
  { pattern: /linkedin_reply/i, type: 'email_copy', squad: 'dune', titleExtractor: (f) => {
    const match = f.match(/linkedin_reply_stub_(.+)\.md$/);
    return match ? `LinkedIn Reply - ${match[1].replace(/_/g, ' ')}` : 'LinkedIn Reply Draft';
  }},
  { pattern: /tsi-brief-delivery-email/i, type: 'email_copy', squad: 'oceans-11', titleExtractor: () => 'TSI Brief Delivery Email' },
  { pattern: /tsi_ga4.*checklist/i, type: 'brief', squad: 'oceans-11', titleExtractor: () => 'TSI GA4 DebugView Checklist for Jeremiah' },
  { pattern: /.*/, type: 'other', squad: 'oceans-11' },
];

function classifyFile(filename: string): { type: DeliverableType; squad: Squad; title: string } {
  for (const mapping of FILE_MAPPINGS) {
    if (mapping.pattern.test(filename)) {
      return {
        type: mapping.type,
        squad: mapping.squad,
        title: mapping.titleExtractor?.(filename) ?? filename.replace(/\.md$/, '').replace(/[-_]/g, ' '),
      };
    }
  }
  return { type: 'other', squad: 'oceans-11', title: filename.replace(/\.md$/, '') };
}

function findMarkdownFiles(dir: string, files: MigrationFile[] = []): MigrationFile[] {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const classification = classifyFile(entry.name);
      files.push({ path: fullPath, filename: entry.name, ...classification, content });
    }
  }
  return files;
}

async function migrate() {
  console.log('='.repeat(60));
  console.log('MCOS Deliverables Migration Script');
  console.log('='.repeat(60) + '\n');
  
  if (DRY_RUN) console.log('🔍 DRY RUN MODE - No changes will be made\n');
  
  const files = findMarkdownFiles(DRAFTS_DIR);
  console.log(`Found ${files.length} files to migrate:\n`);
  
  const byType: Record<DeliverableType, MigrationFile[]> = {
    research: [], blog_draft: [], email_copy: [], white_paper: [],
    presentation: [], image: [], spreadsheet: [], brief: [], other: [],
  };
  
  for (const file of files) byType[file.type].push(file);
  
  for (const [type, typeFiles] of Object.entries(byType)) {
    if (typeFiles.length > 0) {
      console.log(`📁 ${type.toUpperCase()} (${typeFiles.length}):`);
      for (const f of typeFiles) console.log(`   - ${f.title} [${f.squad}]`);
      console.log();
    }
  }
  
  if (DRY_RUN) {
    console.log('='.repeat(60));
    console.log('Dry run complete. Run without --dry-run to execute migration.');
    return;
  }
  
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error('❌ NEXT_PUBLIC_CONVEX_URL not set in .env.local');
    process.exit(1);
  }
  
  console.log(`Connecting to Convex: ${convexUrl}`);
  const client = new ConvexHttpClient(convexUrl);
  
  let success = 0, failed = 0;
  const migrated: string[] = [], errors: string[] = [];
  
  for (const file of files) {
    try {
      console.log(`\nMigrating: ${file.title}...`);
      const id = await client.mutation(api.deliverables.create, {
        title: file.title,
        type: file.type,
        squad: file.squad,
        content: file.content,
        contentFormat: 'markdown' as const,
      });
      console.log(`  ✅ Created with ID: ${id}`);
      migrated.push(`${file.title} (${file.type}) → ${id}`);
      success++;
    } catch (error: any) {
      console.error(`  ❌ Failed:`, error?.message || error);
      errors.push(`${file.title}: ${error?.message || error}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\n✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (migrated.length > 0) {
    console.log('\nMigrated deliverables:');
    for (const m of migrated) console.log(`  - ${m}`);
  }
  if (errors.length > 0) {
    console.log('\nErrors:');
    for (const e of errors) console.log(`  - ${e}`);
  }
}

migrate().catch(console.error);
