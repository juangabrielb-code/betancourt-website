#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

const API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = 'fcbc0918-e222-4064-bf18-c8953761ac30';
const PARENT_ISSUE_ID = '7e85d165-61c9-4536-85b6-5b81744a8944'; // BET-5

// Read phases from JSON
const phasesData = JSON.parse(fs.readFileSync('create_roadmap_issues.json', 'utf8'));

function makeGraphQLRequest(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.linear.app',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.errors) {
            reject(new Error(JSON.stringify(response.errors, null, 2)));
          } else {
            resolve(response.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function escapeGraphQL(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

async function createIssue(phase) {
  const escapedTitle = escapeGraphQL(phase.title);
  const escapedDescription = escapeGraphQL(phase.description);

  const query = `
    mutation {
      issueCreate(input: {
        teamId: "${TEAM_ID}"
        title: "${escapedTitle}"
        description: "${escapedDescription}"
        priority: ${phase.priority}
        parentId: "${PARENT_ISSUE_ID}"
      }) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }
  `;

  try {
    const result = await makeGraphQLRequest(query);
    return result.issueCreate.issue;
  } catch (error) {
    console.error(`Error creating issue "${phase.title}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Creando issues en Linear para BET-5 Roadmap...\n');

  const createdIssues = [];

  for (const phase of phasesData.phases) {
    try {
      console.log(`Creando: ${phase.title}...`);
      const issue = await createIssue(phase);
      createdIssues.push(issue);
      console.log(`✅ Creado: ${issue.identifier} - ${issue.title}`);
      console.log(`   URL: ${issue.url}\n`);

      // Esperar 500ms entre requests para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }

  console.log('\n📋 Resumen:');
  console.log(`Total de issues creados: ${createdIssues.length}/${phasesData.phases.length}\n`);

  // Guardar resultado
  fs.writeFileSync(
    'created-issues.json',
    JSON.stringify(createdIssues, null, 2)
  );

  console.log('✅ Resultados guardados en .issues/created-issues.json');
}

main().catch(console.error);
