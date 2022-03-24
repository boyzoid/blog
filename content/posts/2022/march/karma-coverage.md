---
title: Verifying Code Coverage With Karma
date: 2022-03-24T06:00:00
image: /assets/images/2022/medena-rosa-OhH_xOExaGk-unsplash.jpg
tags: ["JavaScript", "TDD", "Karma", "Jasmine", "BetterTests"]
---

This is the first in a [series of posts](/tags/bettertests) that will help ease the transition to TDD and how we can make sure we write tests that actually verify the code we write is correct.

## What is coverage?

In this post, we are going to talk about something that is probably more useful if you already have code that you want to write tests for - 'coverage'. Put simply, checking 'coverage' means we analyze our code and verify that every bit of it is covered by tests. That may seem like a daunting task, but many test runners offer this feature and make it easier to accomplish.

The sample code for this post can be found on [GitHub](https://github.com/boyzoid/karma-coverage) and uses the [Karma](https://karma-runner.github.io/6.3/index.html) test runner and [Jasmine](https://jasmine.github.io/) testing framework. I will assume you already executed `npm install`.

## Inspecting the Configuration File

When starting fresh, Karma can get you started with setting up a configuration file. Simply execute the following command:

```bash
karma init { filename }
```

Follow the prompts, provide the requested information (or don't - you can always edit the file later), and Karma will generate a configuration file for you with the name you provide. We already have a configuration file named `my.conf.js`. Let's look at some parts of that file.

The first important bit of information is the `framework` property. In our file it looks like this:

```javascript
frameworks: ["jasmine"];
```

This simply tells Karma we are using the Jasmine testing framework. Support for this was added to your project when you ran `npm install`.

Next, we tell Karma where to find our files.

```javascript
files: ["js/*.js", "tests/*.js"];
```

This tells Karma where to find the files we need. This should include paths to all the JavaScript files we want to test as well as all of our test files. We are telling Karma to include all JavaScript files in the `/js` directory and the `/tests` directory. You can view more information about the `files` property in the [documentation](https://karma-runner.github.io/6.3/config/files.html).

Further down the file, we see a property named `preprocessors`.

```javascript
preprocessors: {
  'js/*.js' : [ 'coverage' ]
}
```

With Karma we can use preprocessors to do something with files before they are served to the browser (more on that in a bit). Here we are using the `coverage` preprocessor. For more information on preprocessors, checkout the [Karma documentation](https://karma-runner.github.io/6.3/config/preprocessors.html).

The next block of code serves a few purposes.

```javascript
reporters: ['progress', 'coverage'],
coverageReporter: {
  type: 'text'
}
```

The `reporters` property tells Karma how to report the results on the tests. In our example we are using `progress` and `coverage`. By using `progress` Karma will show the number of tests that are executed, how many that fail.

The `coverageReporter` property tells Karma how to prepare the results of the coverage report. In our case, we are using `text` as the type, so we will see the results in the command window when we run our tests. For more information on configuring the Coverage preprocessor, check out the [documentation](https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md).

The last bit of configuration that is of interest is the `browsers` property.

```javascript
browsers: ["ChromeHeadless"];
```

Karma runs our tests in a browser and this is simply telling Karma what browser to run them in. I prefer using headless Chrome so that my desktop is not cluttered with more windows. You can find out more information about what browsers are supported by checking out the [docs](https://karma-runner.github.io/6.3/config/browsers.html) for the `browsers` property.

## Running The Tests

Now that we have our configuration file and understand what some parts represent, let's run the tests and see what happens.

In your command window, execute the following command:

```bash
karma start my.conf.js
```

Karma will start up and run the tests we have set up in the `/tests` directory. When the tests are done, you should see something that looks like the following image.

![Coverage results 1](/assets/images/2022/karma-coverage/coverage-1.png "Coverage Results 1")

That shows a lot of red, but this was by design. Let's break down what we are looking at.

## Dissecting the Results

The red arrow shows us how many tests were run and how many passed. A failure means that we received an unexpected result or there was an error.

Here are what the headers for the table represent:

- `File` - shows the files that were analyzed, and we also see an aggregate for all files in the top row
- `% Stmts` - tells us what percentage of statements are covered by tests.
- `% Branch` - indicates the percentage of test coverage in the current branch of VCS (In our example, in this branch of Git)
- `% Funcs` - displays the percentage of functions that are covered by our tests
- `% Lines` - represents the percentage of lines of code that are covered by our tests
- `Uncovered Line #s` - reveals specific lines that are not covered by our tests.

The difference between `statements` and `lines` of code can be summed up with a very simple example:

```javascript
let i = 0; console.log(i);
```

This is 2 statements but only 1 line.

## Getting the Tests to Behave

As you can see, we currently do not have a lot of coverage for our existing code. Let's change that. Open up the file named `my-code-spec.js` and take a peak.

The second test we are running looks like this:

```javascript
it("testing doubleNumber()", function () {
  let testNumber = Math.floor(Math.random()) * 10000;
  //let testResult = demo.doubleNumber( testNumber )
  //expect( testResult ).toEqual( testNumber * 2 )
});
```

As you can probably guess, the reason why the `doubleNumber()` function does not have any test coverage is because the call to that method is commented out. If we remove those comments, we should see different results in our coverage report.

```javascript
it("testing doubleNumber()", function () {
  let testNumber = Math.floor(Math.random()) * 10000;
  let testResult = demo.doubleNumber(testNumber);
  expect(testResult).toEqual(testNumber * 2);
});
```

Karma should re-run the tests automatically, and you should see something similar to the image below.

![Coverage results 2](/assets/images/2022/karma-coverage/coverage-2.png "Coverage Results 2")

w00t!! We now have some better coverage on our tests as 50% of our statements, functions, and lines are covered by our tests. If you uncomment other lines of code that call methods on the `demo` object, you will see the results of the coverage report change.

Let's uncomment all of these except the last test, so our test file looks like this:

```javascript
describe("My Code tests", function () {
  var demo;
  beforeEach(function () {
    demo = new TestDemo();
  });
  it("was initiated", function () {
    expect(demo).not.toBeNull();
  });
  it("testing doubleNumber()", function () {
    let testNumber = Math.floor(Math.random()) * 10000;
    let testResult = demo.doubleNumber(testNumber);
    expect(testResult).toEqual(testNumber * 2);
  });
  it("testing multiplyNumbers()", function () {
    let number1 = Math.floor(Math.random()) * 10000;
    let number2 = Math.floor(Math.random()) * 10000;
    let testResult = demo.multiplyNumbers(number1, number2);
    expect(testResult).toEqual(number1 * number2);
  });
  describe("testing divideNumbers()", function () {
    it("Can divide valid numbers", function () {
      let number1 = Math.floor(Math.random()) * 10000;
      let number2 = Math.floor(Math.random()) * 10000;
      let testResult = demo.divideNumbers(number1, number2);
      expect(testResult).toEqual(number1 / number2);
    });
    it("Cannot divide by 0", function () {
      let number1 = Math.floor(Math.random()) * 10000;
      //let testResult = demo.divideNumbers( number1, 0 );
      //expect( testResult ).toEqual( NaN );
    });
  });
});
```

When the test are run again, we should see this result.

![Coverage results 3](/assets/images/2022/karma-coverage/coverage-3.png "Coverage Results 3")

You may be asking, how can we have 100% coverage of function, but not lines or statements? The answer is because in one of our methods, `divideNumbers()`, we have an `if()` statement and none of our tests trigger the `else` portion of that statement.

```javascript
this.divideNumbers = (a, b) => {
  if (b !== 0) {
    return a / b;
  } else {
    return NaN;
  }
};
```

This feature of coverage is extremely helpful when you have complex nested logic inside a function as it helps you easily identify some conditions you may have missed.

Uncomment out those last 2 lines of code, and you should see the following indicating we have full test coverage.

![Coverage results 4](/assets/images/2022/karma-coverage/coverage-4.png "Coverage Results 4")

## Wrapping Up

The concept of 'coverage' is not unique to Karma. Other test runners, such as [Jest](https://jestjs.io/), also have this functionality. Using this feature is a great way to help you start to testing your code. It is also invaluable when you need to test code that is complex and/or has several layers of nested logic.

If you did not fully understand the syntax of some test code, fear not, I will have more on that in the near future.

Photo by [Medena Rosa](https://unsplash.com/@daisy66?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/covered?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
