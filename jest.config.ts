export default {
    testEnvironment: 'node',
    maxWorkers: 4,
    bail: true,
    verbose: false,
    detectOpenHandles: true,
    forceExit: true,
    testTimeout: 60000,
    transform: {
        '^.+\\.(t|j)s$': [
            'ts-jest',
            {
                tsconfig: './tsconfig.json',
                isolatedModules: true,
            },
        ],
    },
    collectCoverage: false,
    testPathIgnorePatterns: ['<rootDir>/dist/'],
    moduleNameMapper: {
        '^common/(.*)$': '<rootDir>/common/$1',
        '^apps/(.*)$': '<rootDir>/apps/$1',
        '^tests/(.*)$': '<rootDir>/tests/$1',
        '^database/(.*)$': '<rootDir>/database/$1',
    },
};
