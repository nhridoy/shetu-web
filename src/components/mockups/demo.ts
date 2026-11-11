// Fictional demo data for the coded app mockups. No real hosts or users.
export interface DemoHost {
  name: string;
  user: string;
  os: 'ubuntu' | 'debian' | 'alpine' | 'macos' | 'freebsd';
  color: string;
  online: boolean;
}

export const DEMO_GROUPS: { name: string; hosts: DemoHost[] }[] = [
  {
    name: 'Production',
    hosts: [
      {
        name: 'prod-api',
        user: 'deploy',
        os: 'ubuntu',
        color: '#8b7cff',
        online: true,
      },
      {
        name: 'prod-db-01',
        user: 'postgres',
        os: 'debian',
        color: '#5b8cff',
        online: true,
      },
      {
        name: 'edge-sg',
        user: 'root',
        os: 'alpine',
        color: '#f5a524',
        online: true,
      },
    ],
  },
  {
    name: 'Staging',
    hosts: [
      {
        name: 'staging-web',
        user: 'deploy',
        os: 'ubuntu',
        color: '#7ee2a8',
        online: true,
      },
      {
        name: 'ci-runner',
        user: 'ci',
        os: 'debian',
        color: '#f472b6',
        online: false,
      },
    ],
  },
  {
    name: 'Homelab',
    hosts: [
      {
        name: 'nas',
        user: 'admin',
        os: 'freebsd',
        color: '#e5484d',
        online: true,
      },
      {
        name: 'mac-mini',
        user: 'me',
        os: 'macos',
        color: '#9a9aae',
        online: true,
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
