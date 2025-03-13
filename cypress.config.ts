import { defineConfig } from "cypress";
import codeCoverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    screenshotOnRunFailure: true,
    video: true,
    videoCompression: 32,
    setupNodeEvents(on, config) {
      // Add code coverage collection
      codeCoverageTask(on, config);
      
      // Add custom tasks for enhanced test reliability
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
      });
      
      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    setupNodeEvents(on, config) {
      // Add code coverage collection for component testing
      codeCoverageTask(on, config);
      
      // Add custom tasks for enhanced test reliability
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
      });
      
      return config;
    },
  },
  
  // Configure code coverage
  env: {
    codeCoverage: {
      exclude: [
        'cypress/**/*.*',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/__tests__/**/*.*',
        '**/__mocks__/**/*.*',
        '**/node_modules/**/*.*'
      ],
      include: [
        'src/**/*.{js,ts,jsx,tsx}',
      ],
    }
  }
});
