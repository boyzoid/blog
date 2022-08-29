---
title: Better Tests Part 1 - Static Data
date: 2022-04-05T06:00:00
image: /assets/images/2022/zach-vessels-ZNTPlG050tk-unsplash.jpg
tags: [ "TDD", "Better-Tests" ]
---
This is the first part in a series of posts that will help us write better tests...and this is a big one for me - the use of static data in our tests. Keep in mind that while the sample code below is written in JavaScript, the concept would be the same in any language.

## Avoid Static Data Where You Can

There may be some people who would state we should never use static data in our tests, but, I think it is safe to assume there are use cases where we would need to use static data in some of our tests. I can't think of any at the moment, but I am sure they exist.

Before we move on, let's talk about what we mean by 'static data'. When I say 'static data' when referring to tests, I mean hardcoded values that will be the same every time the test is run. Here is an example:

```javascript
it( 'testing doubleNumber()', function (){
   let testResult = demo.doubleNumber( 5 )
   expect( testResult ).toEqual( 10 )
})
```

In this test, we are using 2 static (hardcoded) values: `5` on line 2 and `10` on line 3. If it is not obvious, we expect the function `doubleNumber()` to return the number that is passed multiplied by 2. Every time this test runs, it passes the value `5` to `doubleNumber()` and expects `10` to be returned.

If we are doing test-driven development (TDD) then this test would be written first, then we would write the code to make the tests pass. 

With the test written the way it is, the following code would cause the test to pass:

```javascript
doubleNumber = ( a ) => { return 10 }
```

The test above will pass every time it is run, but, is it really how we expect our code to behave? Of course not.

I will admit, this is a very simple example, but I think it shows the problem with our test very clearly. We want our test to verify that every time we pass a number, regardless of what that number is,  to `doubleNumber()` the value that is returned is the number we passed in multiplied by 2. Our current test is not comprehensive enough to verify that the code is working as expected in all cases. Yes, the test will pass every time, but it is unlikely that in the real world `5` will be the only value ever passed to `doubleNumber()`.

## Use Dynamic Data Whenever You Can

If our test was written to use dynamic data, then the code, as written, would fail most of the time.
```javascript
it( 'testing doubleNumber()', function (){
   let testNumber = Math.floor( Math.random() * 10000 ) ;
   let testResult = demo.doubleNumber( testNumber )
   expect( testResult ).toEqual( testNumber * 2 )
})
```
Every time we run this test, it generates a random integer to pass to `doubleNumber()`. We also use this dynamic value in our `expect()` statement to verify the result.

You may be asking why I said our code, as written, would fail most of the time. Well, that is because using a random integer, it is possible the value of `5` would occasionally be passed to `doubleNumber()`.

## Refactoring Our Code

So, now that we have a test that more accurately reflects what we expect our code to do, we need to refactor our code.

```javascript
doubleNumber = ( a ) => { return a * 2 }
```

With this refactored code, our test will pass every time it is run, regardless of what dynamic integer is used in the test.

## Generating Dynamic Data
There are a variety of ways to generate dynamic data of certain data types. In JavaScript, here is what I use to create dynamic values.

I use the following to generate dynamic simple values.
```javascript
let randomInteger = Math.floor( Math.random() * 10000 ); 
let randomFloat = Math.random() * 10000; 
let randomString = Math.random().toString( 36 ).substring( 2 );
```

I use a combination of the above to generate random values in an object with known properties.
```javascript
let testObject = {
   id: Math.floor( Math.random() * 10000 ),
   description: Math.random().toString( 36 ).substring( 2 )
}
```

When I need an array, I make sure in my tests that I use a variable length array to make sure my code can handle an array of any length.
```javascript
// Generate an array of random length where each element is a random string
let count = Math.random() * (100 - 1) + 1 //get an integer between 1 and 100
let testArray = []
for( let i = 0; i<=count; i++  ){
   testArray.push( Math.random().toString( 36 ).substring( 2 ) )
}

// Generate an array of random length where each element is an object containing random data
let count = Math.random() * (100 - 1) + 1 //get an integer between 1 and 100
let testArray = []
for( let i = 0; i<=count; i++  ){
   let testItem = {
      id: Math.floor( Math.random() * 10000 ),
      description: Math.random().toString( 36 ).substring( 2 )
   }
   testArray.push( testItem )
}
```

## Wrap Up

As we can see, using dynamic data in our tests gives us an easy-to-use method to give us comprehensive coverage of our coded without adding a lot of overhead. With code that has more complex logic surrounding the operations we are expecting to occur, using static data in our tests can lull us into a false sense of security. 

Photo by [Zach Vessels](https://unsplash.com/@zvessels55?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/static?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
