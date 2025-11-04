/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  // Use ts-jest to transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        // Override verbatimModuleSyntax for tests
        verbatimModuleSyntax: false,
        // Ensure ESM syntax is transformed to CommonJS
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        // Keep other important settings
        jsx: 'react-jsx',
        resolveJsonModule: true,
        isolatedModules: true,
      },
      useESM: false,
    }],
  },
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    // Plasmo tilde aliases
    '^~(.*)$': '<rootDir>/src/$1',
    
    // Plasmo special imports (data-base64, data-text, url, etc.)
    '^data-base64:~(.*)$': '<rootDir>/tests/__mocks__/plasmo-assets.js',
    '^data-text:~(.*)$': '<rootDir>/tests/__mocks__/plasmo-assets.js',
    '^url:~(.*)$': '<rootDir>/tests/__mocks__/plasmo-assets.js',
    '^raw:~(.*)$': '<rootDir>/tests/__mocks__/plasmo-assets.js',
    
    // Style imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Asset imports (images, fonts, etc.)
    '\\.(jpg|jpeg|png|gif|svg|woff|woff2|ttf|eot)$': '<rootDir>/tests/__mocks__/file-mock.js',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/.plasmo/'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Globals (if needed)
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};