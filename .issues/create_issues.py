#!/usr/bin/env python3
import json
import requests
import time
import os

API_KEY = os.getenv("LINEAR_API_KEY")
TEAM_ID = "fcbc0918-e222-4064-bf18-c8953761ac30"
PARENT_ISSUE_ID = "7e85d165-61c9-4536-85b6-5b81744a8944"  # BET-5
API_URL = "https://api.linear.app/graphql"

headers = {
    "Content-Type": "application/json",
    "Authorization": API_KEY
}

# Cargar fases
with open('create_roadmap_issues.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

created_issues = []

print("Creando issues en Linear para BET-5 Roadmap...\n")

for phase in data['phases']:
    title = phase['title']
    description = phase['description']
    priority = phase['priority']

    query = """
    mutation CreateIssue($teamId: String!, $title: String!, $description: String!, $priority: Int!, $parentId: String!) {
      issueCreate(input: {
        teamId: $teamId
        title: $title
        description: $description
        priority: $priority
        parentId: $parentId
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
    """

    variables = {
        "teamId": TEAM_ID,
        "title": title,
        "description": description,
        "priority": priority,
        "parentId": PARENT_ISSUE_ID
    }

    payload = {
        "query": query,
        "variables": variables
    }

    print(f"Creando: {title}...")

    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()

        if 'errors' in result:
            print(f"[ERROR] {result['errors']}")
            continue

        issue = result['data']['issueCreate']['issue']
        created_issues.append(issue)

        print(f"[OK] Creado: {issue['identifier']} - {issue['title']}")
        print(f"   URL: {issue['url']}\n")

        # Esperar 500ms para evitar rate limiting
        time.sleep(0.5)

    except Exception as e:
        print(f"[ERROR] {str(e)}\n")

print(f"\nResumen:")
print(f"Total de issues creados: {len(created_issues)}/{len(data['phases'])}\n")

# Guardar resultados
with open('created-issues.json', 'w', encoding='utf-8') as f:
    json.dump(created_issues, f, indent=2, ensure_ascii=False)

print("Resultados guardados en created-issues.json")
