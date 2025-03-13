# Code Coverage for Derakht-e-Kherad

## Current Status

We have successfully implemented:

1. Cypress end-to-end tests that verify core functionality:
   - Admin login (3 tests)
   - Blog post management (3 tests) 
   - Category management (4 tests)

2. Configuration for code coverage collection:
   - NYC configuration file (`.nycrc.json`)
   - Cypress code coverage plugin setup in `cypress.config.ts`
   - Scripts in `package.json` for running tests with coverage

## Current Limitations

The code coverage reporting is not yet fully functional. While we can run the tests and see test results, the code coverage metrics show 0% coverage. This is due to several challenges:

1. Next.js uses a complex bundling and transpilation process, which makes traditional instrumentation challenging
2. The application needs additional instrumentation to properly track coverage
3. Server-side components and API routes need special handling for coverage

## Next Steps for Improving Coverage

To fully implement code coverage reporting, we need to:

1. **Instrument the application code:** Add Babel plugin `babel-plugin-istanbul` for client-side code

2. **Configure Next.js for coverage:** We need to modify the Next.js configuration to support the instrumentation

3. **Implement specialized handling for API routes:** Since API routes run on the server, they require different instrumentation

4. **Set up comprehensive Jest unit testing:** Add more unit tests with Jest for component and hook testing, which can be more easily instrumented

5. **Integrate coverage reports:** Combine the coverage reports from Cypress E2E tests and Jest unit tests

## Usage

Currently, you can run the tests with:

```bash
# Run Cypress tests in headless mode
npm run test:e2e:headless

# Run Jest unit tests
npm run test

# Attempt to run with coverage (incomplete)
npm run test:e2e:coverage
```

## Resources for Future Implementation

- [Next.js with istanbul](https://github.com/colinhacks/next-with-istanbul)
- [Cypress Code Coverage Documentation](https://docs.cypress.io/guides/tooling/code-coverage)
- [Istanbul.js Coverage](https://istanbul.js.org/)
- [NYC Command Line](https://github.com/istanbuljs/nyc) 