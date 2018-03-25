#! /usr/bin/env node

var args = process.argv.slice(2);

if (args.length < 1 || args.length > 4) {
  console.log(
    "Usage: node ./path/to/qunit-puppeteer.js <URL> [<all_tests_timeout>] [<single_test_timeout>] [<chrome_executable_path>] [<sprace_separated_chrome_arguments>] \n" +
    "eg. node ./node_modules/qunit-puppeteer/bin/qunit-puppeteer.js 'http://localhost/tests' 30000 /usr/bin/chromium-browser '--headless --no-sandbox' \n" +
    "Hint: if you have `qunit-puppeteer` installed globally, you can run it with `qunit-puppeteer` instead of `node ./path/to/qunit-puppeteer.js`" +
    "\n" +
    "<URL> - url address where qunit test page is served \n" +
    "<all_tests_timeout> - server response timeout (default: 300000) \n" +
    "<single_test_timeout> - single test timeout (default: 10000)" +
    "<chrome_executable_path> - optional path where you have your chrome executable installed (default to env var $CHROME_BIN or you can leave both blank so the puppeteer will try to resolve path on its own) \n" +
    "<sprace_separated_chrome_arguments> - optional, space separated list of arguments to pass to Chrome executable (default: '--no-sandbox --headless --disable-gpu') \n" +
    "\n" +
    "The puppeteer will try to use its own Chrome build stored in `.local-chromium` directory, which won't run on minimalistic Linux builds like `Alpine` \n" +
    "On such systems you can point your own Chrome build, by passing its path by <chrome_executable_path> or by setting $CHROME_BIN enviornament variable."
  );
  process.exit(1);
}

const targetURL = args[0];
const serverTimeout = parseInt(args[1] || 300000, 10);
const singleTestTimeout = parseInt(args[2] || 10000, 10);
const chromeExecutable = args[3];
const chromeArguments = typeof args[4] == 'string' ? args[3].split(' ') : null;

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: chromeArguments || ['--no-sandbox','--headless','--disable-gpu'],
    executablePath: chromeExecutable || process.env['CHROME_BIN']
  });
  const page = await browser.newPage();

  // Attach to browser console log events, and log to node console
  await page.on('console', (...params) => {
    for (let i = 0; i < params.length; ++i)
      console.log(`${params[i]}`);
  });

  var moduleErrors = [];
  var testErrors = [];
  var assertionErrors = [];

  await page.exposeFunction('harness_moduleDone', context => {
    if (context.failed) {
      var msg = "Module Failed: " + context.name + "\n" + testErrors.join("\n");
      moduleErrors.push(msg);
      testErrors = [];
    }
  });

  await page.exposeFunction('harness_testDone', context => {
    if (context.failed) {
      var msg = "  Test Failed: " + context.name + assertionErrors.join("    ");
      testErrors.push(msg);
      assertionErrors = [];
      process.stdout.write("F");
    } else {
      process.stdout.write(".");
    }
  });

  await page.exposeFunction('harness_log', context => {
    if (context.result) { return; } // If success don't log

    var msg = "\n    Assertion Failed:";
    if (context.message) {
      msg += " " + context.message;
    }

    if (context.expected) {
      msg += "\n      Expected: " + context.expected + ", Actual: " + context.actual;
    }

    assertionErrors.push(msg);
  });

  await page.exposeFunction('harness_done', context => {
    console.log("\n");

    if (moduleErrors.length > 0) {
      for (var idx=0; idx<moduleErrors.length; idx++) {
        console.error(moduleErrors[idx]+"\n");
      }
    }

    var stats = [
      "Time: " + context.runtime + "ms",
      "Total: " + context.total,
      "Passed: " + context.passed,
      "Failed: " + context.failed
    ];
    console.log(stats.join(", "));
    
    browser.close();
    if (context.failed > 0){
      process.exit(1);
    }else{
      process.exit();
    }
  });

  await page.goto(targetURL);

  await page.evaluate((singleTestTimeout) => {
    QUnit.config.testTimeout = singleTestTimeout;

    // Cannot pass the window.harness_blah methods directly, because they are
    // automatically defined as async methods, which QUnit does not support
    QUnit.moduleDone((context) => { window.harness_moduleDone(context); });
    QUnit.testDone((context) => { window.harness_testDone(context); });
    QUnit.log((context) => { window.harness_log(context); });
    QUnit.done((context) => { window.harness_done(context); });

    console.log("\nRunning: " + JSON.stringify(QUnit.urlParams) + "\n");
  }, singleTestTimeout);

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  await wait(serverTimeout);

  console.error("Tests timed out");
  browser.close();
  process.exit(124);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
