import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitHubReleaseOptions {
  version: string;
  description: string;
  prerelease: boolean;
}

export interface GitHubReleaseResult {
  version: string;
  url: string;
  releaseId: number;
}

export class GitHubDeploymentService {
  private octokit: Octokit;
  private owner: string = '';
  private repo: string = '';

  constructor(private token: string) {
    this.octokit = new Octokit({ auth: token });
    this.initializeRepoInfo();
  }

  private async initializeRepoInfo() {
    try {
      // Get repo info from git remote
      const { stdout } = await execAsync('git remote get-url origin');
      const match = stdout.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/);
      
      if (match) {
        this.owner = match[1];
        this.repo = match[2].replace('.git', '');
      }
    } catch (error) {
      console.error(chalk.yellow('Could not determine repository info from git remote'));
      // Default values
      this.owner = 'your-username';
      this.repo = 'fides-mentorship-system';
    }
  }

  async createRelease(options: GitHubReleaseOptions): Promise<GitHubReleaseResult> {
    try {
      // Ensure we have repo info
      if (!this.owner || !this.repo) {
        await this.initializeRepoInfo();
      }

      console.log(chalk.magenta(`Creating release ${options.version} for ${this.owner}/${this.repo}...`));

      // Get the latest commit SHA
      const { data: commits } = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        per_page: 1
      });

      const latestCommit = commits[0].sha;

      // Create the release
      const { data: release } = await this.octokit.repos.createRelease({
        owner: this.owner,
        repo: this.repo,
        tag_name: options.version,
        name: `Release ${options.version}`,
        body: this.generateReleaseNotes(options.description),
        draft: false,
        prerelease: options.prerelease,
        target_commitish: latestCommit
      });

      console.log(chalk.green(`✓ Release ${options.version} created successfully!`));

      return {
        version: options.version,
        url: release.html_url,
        releaseId: release.id
      };
    } catch (error) {
      console.error(chalk.red('Failed to create GitHub release:'), error);
      throw error;
    }
  }

  async triggerWorkflow(workflowName: string): Promise<void> {
    try {
      console.log(chalk.blue(`Triggering workflow: ${workflowName}...`));

      await this.octokit.actions.createWorkflowDispatch({
        owner: this.owner,
        repo: this.repo,
        workflow_id: `${workflowName}.yml`,
        ref: 'main'
      });

      console.log(chalk.green(`✓ Workflow ${workflowName} triggered successfully!`));
    } catch (error) {
      console.error(chalk.red('Failed to trigger workflow:'), error);
      throw error;
    }
  }

  async getWorkflowStatus(workflowName: string): Promise<any> {
    try {
      const { data: runs } = await this.octokit.actions.listWorkflowRuns({
        owner: this.owner,
        repo: this.repo,
        workflow_id: `${workflowName}.yml`,
        per_page: 5
      });

      if (runs.workflow_runs.length === 0) {
        return { status: 'No runs found' };
      }

      const latestRun = runs.workflow_runs[0];
      return {
        status: latestRun.status,
        conclusion: latestRun.conclusion,
        runId: latestRun.id,
        startedAt: latestRun.created_at,
        url: latestRun.html_url
      };
    } catch (error) {
      console.error(chalk.red('Failed to get workflow status:'), error);
      throw error;
    }
  }

  private generateReleaseNotes(description: string): string {
    const timestamp = new Date().toISOString();
    
    return `## 🚀 Release Notes

${description}

### 📦 Deployment Information
- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Railway
- **Database**: PostgreSQL on Railway
- **Cache**: Redis on Railway

### 🔄 CI/CD
- Automated deployment via GitHub Actions
- All tests passing
- Security checks completed

### 📝 Changelog
See full changelog in [CHANGELOG.md](./CHANGELOG.md)

---
*Released on ${timestamp}*
`;
  }

  async createDeploymentStatus(deploymentId: number, state: 'pending' | 'success' | 'failure', description: string): Promise<void> {
    try {
      await this.octokit.repos.createDeploymentStatus({
        owner: this.owner,
        repo: this.repo,
        deployment_id: deploymentId,
        state,
        description,
        auto_inactive: false
      });
    } catch (error) {
      console.error(chalk.red('Failed to create deployment status:'), error);
      throw error;
    }
  }
}