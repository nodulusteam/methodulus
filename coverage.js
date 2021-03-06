/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Because we have a build step, sometimes we can test files from both
 * `packages/jest-whatever/build/*` and `packages/jest-whatever/src/*`
 *
 * If we require file by its relative path like:
 *    // inside `jest-whatever/src/__tests__/index.js`
 *    require('../index.js'); // this will require `jest-whatever/src/index.js`
 *
 * But if we require it by a package name, this will go through node_modules
 * and lerna index.js link. So the actual file will be required from `build/`
 *    // inside another packages
 *    // this will go through lerna and require `jest-whatever/build/index.js
 *    require('jest-whatever')
 *
 * these files are identical (one is preprocessed, another is transformed on
 * the fly), but the coverage paths are different.
 * This script will map coverage results from both locations to one and
 * produce a full coverage report.
 */
const createReporter = require('istanbul-api').createReporter;
const istanbulCoverage = require('istanbul-lib-coverage');

const map = istanbulCoverage.createCoverageMap();
const reporter = createReporter();

const projects = [
  'decorators',
  'commons',
  'injection',
  'express',
  'rest',
  'testing',
  'server',
  //'integrations',
  'cli',
  'contracts'
];

projects.forEach(project => {
  const coverage = require(`./coverage/coverage-${project}.json`);
  Object.keys(coverage).forEach(
    (filename) => {
      try {
        return map.addFileCoverage(coverage[filename]);
      } catch (error) {
        console.error(project, filename);
        console.error(coverage[filename]);
        console.error(error);
      }
    }
  );
});

reporter.addAll(['json', 'lcov', 'text']);
reporter.write(map);