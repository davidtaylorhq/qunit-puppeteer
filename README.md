# qunit-puppeteer
A test harness for running QUnit tests in headless Chromium

## Usage
### To install locally
```
npm install qunit-puppeteer
node ./node_modules/qunit-puppeteer/bin/qunit-puppeteer.js http://localhost:3000/qunit
```
or
```
yarn add qunit-puppeteer
node ./node_modules/qunit-puppeteer/bin/qunit-puppeteer.js http://localhost:3000/qunit
```

### To install globally
```
npm install -g qunit-puppeteer
qunit-puppeteer http://localhost:3000/qunit
```
or 
```
yarn global qunit-puppeteer
qunit-puppeteer http://localhost:3000/qunit
```

where `http://localhost:3000/qunit` is the address of the qunit test page on your server.

The output will look something like this:

```
Running: {}

............................................................................................................................................................................

Time: 27157ms, Total: 173, Passed: 173, Failed: 0
```
The exit code of the process will be 1 for fail

## Optional arguments
Usage:
```
node ./path/to/qunit-puppeteer.js <URL> [<timeout>] [<single_test_timeout>] [<chrome_executable_path>] [<sprace_separated_chrome_arguments>]
```

- `<URL>` - url address where qunit test page is served  
- `<all_tests_timeout>` - server response timeout (default: 300000) 
- `<single_test_timeout>` - single test timeout (default: 10000)
- `<chrome_executable_path>` - optional path where you have your chrome executable installed (default to env var `$CHROME_BIN` or you can leave both blank so the puppeteer will try to resolve path on its own)  
- `<sprace_separated_chrome_arguments>` - optional, space separated list of arguments to pass to Chrome executable (default: `'--no-sandbox --headless --disable-gpu --hide-scrollbars'`)  
  
## Running on Alpine and other minimal systems  
  
The puppeteer will try to use its own Chrome build stored in `.local-chromium` directory, which won't run on minimalistic Linux builds like `Alpine`.
On such systems you can point your own Chrome build, by passing its path by <chrome_executable_path> or by setting $CHROME_BIN enviornament variable.
