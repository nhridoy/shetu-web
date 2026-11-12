// Fictional demo data for the coded app mockups. No real hosts or users.
export interface DemoHost {
  name: string;
  color: string;
}

export const DEMO_GROUPS: { name: string; hosts: DemoHost[] }[] = [
  {
    name: 'Production',
    hosts: [
      {
        name: 'prod-api',
        color: '#8b7cff',
      },
      {
        name: 'prod-db-01',
        color: '#5b8cff',
      },
      {
        name: 'edge-sg',
        color: '#f5a524',
      },
    ],
  },
  {
    name: 'Staging',
    hosts: [
      {
        name: 'staging-web',
        color: '#7ee2a8',
      },
      {
        name: 'ci-runner',
        color: '#f472b6',
      },
    ],
  },
  {
    name: 'Homelab',
    hosts: [
      {
        name: 'nas',
        color: '#e5484d',
      },
      {
        name: 'mac-mini',
        color: '#9a9aae',
      },
    ],
  },
];

export interface SessionStep {
  prompt: string;
  cmd: string;
  out: string[];
}

export const HERO_SESSION: SessionStep[] = [
  {
    prompt: 'deploy@prod-api:~$',
    cmd: 'uptime',
    out: [
      ' 14:02:11 up 41 days,  3:12,  1 user,  load average: 0.18, 0.22, 0.19',
    ],
  },
  {
    prompt: 'deploy@prod-api:~$',
    cmd: 'docker ps --format "{{.Names}}  {{.Status}}"',
    out: [
      'api        Up 6 days (healthy)',
      'worker     Up 6 days',
      'caddy      Up 13 days',
    ],
  },
  {
    prompt: 'deploy@prod-api:~$',
    cmd: 'tail -n 3 /var/log/caddy/access.log',
    out: [
      'GET /v1/health 200 2ms',
      'POST /v1/sync 200 41ms',
      'GET /v1/hosts 200 9ms',
    ],
  },
];
