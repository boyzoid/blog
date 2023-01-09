---
title: Better Tests Part 2 - Test Every Condition
date: 2022-04-29T06:00:00
image: /assets/images/2022/fahrul-razi-BR6lrzCPYPk-unsplash.jpg
tags: [ "TDD", "Better-Tests" ]
related:
    -/posts/2022/april/better-tests-01
---
This is the second part of a series of posts that will help us write better tests...and this one should seem kind of obvious - making sure we test every logical condition in our code.

## Umm....duh...

You might be thinking that this is something that might not need to be covered, but, when you have some complex logic inside the methods you are testing, things can get missed. This is also more likely to happen when you are writing tests for existing code.

## Some Rules of Thumb

There are some rules of thumb I like to follow when dealing with complex/nested logic and writing more easily testable code.

### If() Statements

For every `if()` statement, you should have at least 2 tests. One for when the logic is `true` and one for when it is `false`. Here is an example of a simple function with some basic logic.
```javascript
testFunction = ( val ) => {
   let someValue = ''
   if( val > 0 ){
      someValue = 'greaterThan0'
   }
   return someValue
}
```
In this example, we are setting the value of `someValue` based on the value of the variable `val`. Since there are only 2 possible conditions, `val` is greater than zero, or it is not, we would want to write 2 tests. One to verify the result when `val` is greater than 0 and one to verify the result when it is not. This is what our tests might look like:
```javascript
it( 'Value is greater than 0', () => {
   //get a random number between 1 and 10000
   let testVal = Math.floor( Math.random() * 10000 ) + 1 
   let result = testFunction( testVal );
   expect( result ).toEqual( 'greaterThan0' )
})
it( 'Value is not greater than 0', () => {
   //get a random number between 0 and -10000
   let testVal = Math.floor( Math.random() * 10000 ) * -1 
   let result = testFunction( testVal );
   expect( result ).toEqual( '' )
})
```
In these tests, we are using dynamic numbers, but make sure to limit what can be used to fit our test condition. In the first test, we are generating a random number between 1 and 10000. In the second, we are generating a number between 0 and -10000 For this simple example, it would have been acceptable to pass `1` and `0` respectively, but if our code was going to get more complex, these values may not verify the code works as expected all the time.

### Ternary Operators

Ternary operators need to be tested just like `if()` statements do. Let's refactor our code example to use a ternary operator.

```javascript
testFunction = ( val ) => {
   return val > 0 ? 'greaterThan0' : ''
}
```

Even though we streamlined the code with a 'one-liner' (I love one-liners ), we still need to have the same test coverage. In this example, our tests would not change.

```javascript
it( 'Value is greater than 0', () => {
   //get a random number between 1 and 10000
   let testVal = Math.floor( Math.random() * 10000 ) + 1 
   let result = testFunction( testVal );
   expect( result ).toEqual( 'greaterThan0' )
})
it( 'Value is not greater than 0', () => {
   //get a random number between 0 and -10000
   let testVal = Math.floor( Math.random() * 10000 ) * -1 
   let result = testFunction( testVal );
   expect( result ).toEqual( '' )
})
```

### Multiple Conditions

You may have noticed I said that for each `if()` we should have "at least 2 tests". If we have logic that contains one or more `&&` or `||`, we will need tests for each unique combination. This is where I have seen people get tripped up. They will test the overall `true`/`false` of an `if()` but not the unique conditions that make up that overall value. Here is an example:
```javascript
testFunction = ( val ) => {
   let someValue = ''
   if( val > 0 && val < 100 ){
      someValue = 'between0And100'
   }
   return someValue
}
```
Now our basic example has gotten a bit more complex. Because I added a new condition, our tests need to be updated. These tests would look like this:

```javascript
it( 'Value is greater than 0', () => {
   //get a random number between 1 and 99
   let testVal = Math.floor( Math.random() * ( 99 ) + 1)
   let result = testFunction( testVal )
   expect( result ).toEqual( 'between0And100' )
})
it( 'Value is not greater than 0', () => {
   //get a random number between 0 and -10000
   let testVal = Math.floor( Math.random() * 10000 ) * -1 
   let result = testFunction( testVal )
   expect( result ).toEqual( '' )
})
it( 'Value is greater than or equal to 100', () => {
   //get a random number between 100 and 10000
   let testVal = Math.floor( Math.random() * ( 10000 - 100 + 1 ) + 100 )
   let result = testFunction( testVal )
   expect( result ).toEqual( '' )
})
```
First, we needed to update our first test to make sure we are passing a value between 1 and 99.
We did not need to change our second test because we already had coverage for that condition.
Lastly, we needed to add a third test where we pass a value of `100` or greater to cover the new condition, `val < 100`.

### Else If() Statements

If we have a simple `if/else` statement, we would follow the same rules as if there was no `else`. However, if we add an `else if()` to our logic, we now need to add more tests depending on the conditions that we have. Let's look at an example.

```javascript
testFunction = ( val ) => {
   let someValue = ''
   if( val > 0 && val <= 10 ){
      someValue = 'Top10'
   }
   else if( val > 10 && val <= 20  ){
      someValue = '11To20'
   }
   else if( val > 20 && val <= 30 ){
      someValue = '21To30'
   }
   return someValue
}
```
In the above code, we add 2 `else if()` blocks, but each of them has multiple conditions. Here is what the tests for this might look like.

```javascript
it( 'Value is greater than 0 and less than or equal to 10', () => {
   //get a random number between 1 and 10
   let testVal = Math.floor( Math.random() * ( 10 ) + 1)
   let result = testFunction( testVal )
   expect( result ).toEqual( 'Top10' )
})
it( 'Value is greater than 10 and less than or equal to 20', () => {
   //get a random number between 1 and 10
   let testVal = Math.floor( Math.random() * ( 20 - 10 + 1 ) + 10)
   let result = testFunction( testVal )
   expect( result ).toEqual( '11To20' )
})
it( 'Value is greater than 20 and less than or equal to 30', () => {
   //get a random number between 1 and 10
   let testVal = Math.floor( Math.random() * ( 30 - 20 + 1 ) + 20)
   let result = testFunction( testVal )
   expect( result ).toEqual( '20To30' )
})
it( 'Value is not greater than 0', () => {
   //get a random number between 0 and -10000
   let testVal = Math.floor( Math.random() * 10000 ) * -1 
   let result = testFunction( testVal )
   expect( result ).toEqual( '' )
})
```
You can see we added 2 tests, one for each of the `else if()` statements. If we had more conditions inside each `else if()` we would, naturally, need to write more tests to make sure those conditions are covered.

### Switch/Case Statements

When we use `switch/case` statements, we need to verify that each `case` has proper test coverage. Remember, even if you do not have a `default` case defined, we need to test what the code does when none of the cases match. So, for each `case` we need at least one test, and then one test for the default - whether it is explicit or implicit. Here is an example
```javascript
testFunction = ( val ) => {
   var someValue
   switch( val ){
      case 1:
          someValue = 'itIsOne'
           break
      case 2:
         someValue = 'itIsTwo'
         break
      case 3:
         someValue = 'itIsThree'
         break;
      default:
         someValue = 'Error'
         break
   }
   return someValue
}
```
In this example, we have a `switch` statement with 3 different `case` statements and one `default`. This means that we will need 4 tests.

```javascript
it( 'Value is 1', () => {
   let result = testFunction( 1 )
   expect( result ).toEqual( 'itIsOne' )
})
it( 'Value is 2', () => {
   let result = testFunction( 2 )
   expect( result ).toEqual( 'itIsTwo' )
})
it( 'Value is 3', () => {
   let result = testFunction( 1 )
   expect( result ).toEqual( 'itIsThree' )
})
it( 'Value is not 1, 2 or 3', () => {
   let result = testFunction( 4 )
   expect( result ).toEqual( 'Error' )
})
```
If you read my post about [static data](/posts/2022/april/better-tests-01/) you might be saying, "Hey...you are using static data!" And, you would be correct. The reason I deviated from this is that in our `switch/case` we perform certain actions based on specific values. The only way to verify that our logic is covered for each potential value in the `case` statements is to pass that specific value in our tests. If we had other logic inside our `case` statements, we would add tests to cover that logic as well.

## Let Test Coverage Be Your Friend

As you can see, adding additional conditions to your code logic can increase the number of tests we need to write very quickly. It is possible (maybe even likely because we are human) that some code snippets will be missed in our tests. This is when we need to use code coverage tools to make sure we are testing every combination of conditions in our code. As our code becomes more complex, coverage tools are invaluable. I talked about coverage in [this post](/posts/2022/march/karma-coverage/) a while back.

On a recent project, I was tasked with developing a process that determined the visibility of UI elements on a page based on the different states of data and the roles assigned to the user. The state of the data was determined by which one of six workflows was in use and which step in that workflow - some of them had more than 20 steps. While I tried to break out my code into easily testable blocks, some of this logic became very complex, with several levels of nested `if` statements and/or `switch/case` blocks. Even writing the tests first some logic was missed. Thankfully, by using the Karma coverage tool, I was able to quickly and easily identify code that was missed.

For this process, I added over 6000 lines of code (most of that in my test files ) and over 550 tests.

## Wrap Up

Even the simplest bits of code can quickly grow too complex beasts as we add logical conditions through `if()`, `else if()`, and `switch/case` statements. This complexity grows even faster when we start adding nested logic or even adding multiple conditions to a single `if()` statement.

The best way to tackle this complexity is to start with the outermost bit of logic and work your way down. We should break down our tests to be as granular as possible. It is a lot easier to test each condition or block of logic individually, in its own test, than to try and cover multiple conditions in a single test. I will cover how we can break things down easier in a future post.


Finally, make use of code coverage tools. They will find code that needs test coverage much quicker than we can.

Photo by [Fahrul Razi](https://unsplash.com/@mfrazi?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/code?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
