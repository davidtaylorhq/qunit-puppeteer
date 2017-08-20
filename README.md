# qunit-puppeteer
A test harness for running QUnit tests in headless Chromium

## Usage
```
npm install -g qunit-puppeteer
qunit-puppeteer http://localhost:3000/qunit
```
where `http://localhost:3000/qunit` is the address of the qunit test page on your server.

The output will look something like this:

```
Running: {}

............................................................................................................................................................................

Time: 27157ms, Total: 173, Passed: 173, Failed: 0
```

The exit code of the process will be 1 for fail, 0 for success