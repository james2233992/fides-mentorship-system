import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import chalk from 'chalk';

const execAsync = promisify(exec);

export interface RailwayDeploymentOptions {
  service: string;
  runMigrations: boolean;
}

export interface RailwayDeploymentResult {
  service: string;
  deploymentId: string;
  migrationsRun: boolean;
}

export class RailwayDeploymentService {
  private apiUrl = 'https://api.railway.app/graphql/v2';
  private projectPath: string;

  constructor(private token: string) {
    this.projectPath = path.resolve(process.cwd(), '../../backend');
  }

  async deploy(options: RailwayDeploymentOptions): Promise<RailwayDeploymentResult> {
    try {
      // Change to backend directory
      process.chdir(this.projectPath);

      // Deploy using Railway CLI
      console.log(chalk.green(`Deploying ${options.service} to Railway...`));
      const { stdout } = await execAsync(`railway up --service ${options.service}`);

      // Run migrations if requested
      let migrationsRun = false;
      if (options.runMigrations) {
        console.log(chalk.green('Running database migrations...'));
        try {
          await execAsync(`railway run --service ${options.service} npm run prisma:migrate:deploy`);
          migrationsRun = true;
          console.log(chalk.green('✓ Migrations completed successfully'));
        } catch (migrationError) {
          console.error(chalk.yellow('⚠ Migration failed, but deployment continues'));
        }
      }

      // Get deployment info
      const deploymentInfo = await this.getLatestDeployment(options.service);

      return {
        service: options.service,
        deploymentId: deploymentInfo?.id || 'deployment-id-not-found',
        migrationsRun
      };
    } catch (error) {
      console.error(chalk.red('Railway deployment failed:'), error);
      throw error;
    }
  }

  async getStatus(): Promise<any> {
    try {
      // Query Railway GraphQL API for project status
      const query = `
        query GetProjectStatus {
          me {
            projects {
              edges {
                node {
                  id
                  name
                  services {
                    edges {
                      node {
                        id
                        name
                        deployments(first: 1) {
                          edges {
                            node {
                              id
                              status
                              createdAt
                              url
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(
        this.apiUrl,
        { query },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const projects = response.data.data?.me?.projects?.edges || [];
      const fidesProject = projects.find((p: any) => 
        p.node.name === 'fides-backend' || p.node.name === 'fides-mentorship-system'
      );

      if (!fidesProject) {
        return { status: 'No Railway project found' };
      }

      const services = fidesProject.node.services.edges.map((s: any) => {
        const deployment = s.node.deployments.edges[0]?.node;
        return {
          name: s.node.name,
          status: deployment?.status || 'No deployments',
          url: deployment?.url,
          deployedAt: deployment?.createdAt
        };
      });

      return {
        projectName: fidesProject.node.name,
        services
      };
    } catch (error) {
      console.error(chalk.red('Failed to get Railway status:'), error);
      throw error;
    }
  }

  async rollback(deploymentId?: string): Promise<{ activeDeployment: string }> {
    try {
      // Railway doesn't have a direct rollback API, so we'll redeploy from a previous commit
      console.log(chalk.yellow('Railway rollback is performed by redeploying from a previous commit'));
      console.log(chalk.yellow('Please use Railway dashboard or CLI to select a previous deployment'));

      // For now, return a message indicating manual rollback is needed
      return {
        activeDeployment: 'manual-rollback-required'
      };
    } catch (error) {
      console.error(chalk.red('Railway rollback failed:'), error);
      throw error;
    }
  }

  private async getLatestDeployment(serviceName: string): Promise<any> {
    try {
      const query = `
        query GetServiceDeployments($serviceName: String!) {
          me {
            projects {
              edges {
                node {
                  services {
                    edges {
                      node {
                        name
                        deployments(first: 1) {
                          edges {
                            node {
                              id
                              status
                              createdAt
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(
        this.apiUrl,
        { 
          query,
          variables: { serviceName }
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const projects = response.data.data?.me?.projects?.edges || [];
      for (const project of projects) {
        const services = project.node.services.edges || [];
        const service = services.find((s: any) => s.node.name === serviceName);
        if (service) {
          return service.node.deployments.edges[0]?.node;
        }
      }

      return null;
    } catch (error) {
      console.error(chalk.red('Failed to get deployment info:'), error);
      return null;
    }
  }
}