import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import chalk from 'chalk';

const execAsync = promisify(exec);

export interface VercelDeploymentOptions {
  environment: 'preview' | 'production';
  branch?: string;
}

export interface VercelDeploymentResult {
  url: string;
  deploymentId: string;
  environment: string;
}

export class VercelDeploymentService {
  private apiUrl = 'https://api.vercel.com';
  private projectPath: string;

  constructor(private token: string) {
    this.projectPath = path.resolve(process.cwd(), '../../frontend');
  }

  async deploy(options: VercelDeploymentOptions): Promise<VercelDeploymentResult> {
    try {
      // Change to frontend directory
      process.chdir(this.projectPath);

      // Build the project
      console.log(chalk.blue('Building frontend...'));
      await execAsync('npm run build');

      // Deploy using Vercel CLI
      console.log(chalk.blue(`Deploying to ${options.environment}...`));
      const deployCommand = options.environment === 'production' 
        ? `vercel --token=${this.token} --prod --yes`
        : `vercel --token=${this.token} --yes`;

      const { stdout } = await execAsync(deployCommand);
      
      // Extract URL from output
      const urlMatch = stdout.match(/https:\/\/[^\s]+/);
      const url = urlMatch ? urlMatch[0] : 'deployment-url-not-found';

      // Get deployment info via API
      const deployments = await this.getDeployments();
      const latestDeployment = deployments[0];

      return {
        url,
        deploymentId: latestDeployment?.uid || 'deployment-id-not-found',
        environment: options.environment
      };
    } catch (error) {
      console.error(chalk.red('Vercel deployment failed:'), error);
      throw error;
    }
  }

  async getStatus(): Promise<any> {
    try {
      const deployments = await this.getDeployments();
      const latestDeployment = deployments[0];

      if (!latestDeployment) {
        return { status: 'No deployments found' };
      }

      return {
        status: latestDeployment.state,
        url: latestDeployment.url,
        createdAt: new Date(latestDeployment.created).toISOString(),
        environment: latestDeployment.target || 'preview',
        deploymentId: latestDeployment.uid
      };
    } catch (error) {
      console.error(chalk.red('Failed to get Vercel status:'), error);
      throw error;
    }
  }

  async rollback(deploymentId?: string): Promise<{ activeDeployment: string }> {
    try {
      // If no specific deployment ID, get the second-to-last deployment
      if (!deploymentId) {
        const deployments = await this.getDeployments();
        if (deployments.length < 2) {
          throw new Error('No previous deployment to rollback to');
        }
        deploymentId = deployments[1].uid;
      }

      // Promote the deployment
      const response = await axios.post(
        `${this.apiUrl}/v9/deployments/${deploymentId}/promote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        activeDeployment: deploymentId
      };
    } catch (error) {
      console.error(chalk.red('Vercel rollback failed:'), error);
      throw error;
    }
  }

  private async getDeployments(): Promise<any[]> {
    try {
      // First, get project info
      const projectResponse = await axios.get(
        `${this.apiUrl}/v8/projects`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      const project = projectResponse.data.projects.find((p: any) => 
        p.name === 'fides-frontend' || p.name === 'fides-mentorship-system'
      );

      if (!project) {
        return [];
      }

      // Get deployments for the project
      const response = await axios.get(
        `${this.apiUrl}/v6/deployments?projectId=${project.id}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      return response.data.deployments || [];
    } catch (error) {
      console.error(chalk.red('Failed to get deployments:'), error);
      return [];
    }
  }
}