/*
 *******************************************************************************
 * Copyright © 2024-present Jonathan Barronville <jonathanmarvens@proton.me>   *
 *                                                                             *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not *
 * use this file except in compliance with the License.                        *
 * You may obtain a copy of the License at                                     *
 *                                                                             *
 *     http://www.apache.org/licenses/LICENSE-2.0                              *
 *                                                                             *
 * Unless required by applicable law or agreed to in writing, software         *
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT   *
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.            *
 * See the License for the specific language governing permissions and         *
 * limitations under the License.                                              *
 *******************************************************************************
 */

import { expect } from 'chai'
import ExpectationError from './error/expectation'
import { failure } from './result'
import ImproperUnwrapError from './error/improper-unwrap'
import { isResult } from './result'
import { spy } from 'sinon'
import { success } from './result'
import { suite } from 'mocha'
import { test } from 'mocha'

test('`isResult()`: Checks if the provided `value` is a `Result`', async () => {
  const value0 = null
  expect(isResult(value0)).to.be.false
  const value1 = 42
  expect(isResult(value1)).to.be.false
  const error = new Error('Test error')
  const value2 = failure(error)
  expect(isResult(value2)).to.be.true
  const value3 = success(42)
  expect(isResult(value3)).to.be.true
})

test('`failure()`: Creates and returns a new `Failure` `Result` containing the provided `error`', async () => {
  const error = new Error('Test error')
  const value = failure(error)
  expect(value.isFailure()).to.be.true
  expect(value.isSuccess()).to.be.false
})

test('`success()`: Creates and returns a new `Success` `Result` containing the provided `value`', async () => {
  const value = success(42)
  expect(value.isFailure()).to.be.false
  expect(value.isSuccess()).to.be.true
})

suite('`Result`', () => {
  test('`Result#and()`: If this is a `Failure` `Result`, returns this `Result`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    const other = success(42)
    expect(value.and(other)).to.equal(value)
  })

  test('`Result#and()`: If this is a `Success` `Result`, returns `other`', async () => {
    const value = success('foo')
    const other = success('bar')
    expect(value.and(other)).to.equal(other)
  })

  test('`Result#andThen()`: If this is a `Failure` `Result`, returns this `Result`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    expect(value.andThen((value) => {
      return success(value)
    })).to.equal(value)
  })

  test('`Result#andThen()`: If this is a `Success` `Result`, returns the result of applying `f` to the contained value', async () => {
    const value0 = success(42)
    const value1 = value0.andThen((value) => {
      return success(value * 2)
    })
    expect(value1.isSuccess()).to.be.true
    expect(value1.unwrap()).to.equal(84)
  })

  test('`Result#expect()`: If this is a `Failure` `Result`, throws an `ExpectationError` with the provided `message`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    expect(function () {
      value.expect('Test expectation message')
    }).to.throw(ExpectationError).with.property('message', 'Test expectation message')
  })

  test('`Result#expect()`: If this is a `Success` `Result`, returns the contained value', async () => {
    const value = success(42)
    expect(value.expect('Test expectation message')).to.equal(42)
  })

  test('`Result#expectFailure()`: If this is a `Failure` `Result`, returns the contained error', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    expect(value.expectFailure('Test expectation message')).to.equal(error)
  })

  test('`Result#expectFailure()`: If this is a `Success` `Result`, throws an `ExpectationError` with the provided `message`', async () => {
    const value = success(42)
    expect(function () {
      value.expectFailure('Test expectation message')
    }).to.throw(ExpectationError).with.property('message', 'Test expectation message')
  })

  test('`Result#getFailure()`: If this is a `Failure` `Result`, returns a `Something` `Maybe` containing the contained error', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    const maybe = value.getFailure()
    expect(maybe.isSomething()).to.be.true
    expect(maybe.unwrap()).to.equal(error)
  })

  test('`Result#getFailure()`: If this is a `Success` `Result`, returns a `Nothing` `Maybe`', async () => {
    const value = success(42)
    const maybe = value.getFailure()
    expect(maybe.isNothing()).to.be.true
  })

  test('`Result#getSuccess()`: If this is a `Failure` `Result`, returns a `Nothing` `Maybe`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    const maybe = value.getSuccess()
    expect(maybe.isNothing()).to.be.true
  })

  test('`Result#getSuccess()`: If this is a `Success` `Result`, returns a `Something` `Maybe` containing the contained value', async () => {
    const value = success(42)
    const maybe = value.getSuccess()
    expect(maybe.isSomething()).to.be.true
    expect(maybe.unwrap()).to.equal(42)
  })

  test('`Result#inspect()`: If this is a `Failure` `Result`, returns this `Result`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    const spy0 = spy()
    expect(value.inspect(spy0)).to.equal(value)
    expect(spy0.called).to.be.false
  })

  test('`Result#inspect()`: If this is a `Success` `Result`, applies `f` to the contained value and returns this `Result`', async () => {
    const value = success(42)
    const spy0 = spy()
    expect(value.inspect(spy0)).to.equal(value)
    expect(spy0.calledOnceWithExactly(42)).to.be.true
  })

  test('`Result#inspectFailure()`: If this is a `Failure` `Result`, applies `f` to the contained error and returns this `Result`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    const spy0 = spy()
    expect(value.inspectFailure(spy0)).to.equal(value)
    expect(spy0.calledOnceWithExactly(error)).to.be.true
  })

  test('`Result#inspectFailure()`: If this is a `Success` `Result`, returns this `Result`', async () => {
    const value = success(42)
    const spy0 = spy()
    expect(value.inspectFailure(spy0)).to.equal(value)
    expect(spy0.called).to.be.false
  })

  test('`Result#isFailure()`: If this is a `Failure` `Result`, returns `true`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    expect(value.isFailure()).to.be.true
  })

  test('`Result#isFailure()`: If this is a `Success` `Result`, returns `false`', async () => {
    const value = success(42)
    expect(value.isFailure()).to.be.false
  })

  test('`Result#isFailureAnd()`: If this is a `Failure` `Result`, returns the result of applying `predicate` to the contained error', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    expect(value.isFailureAnd((error) => {
      return (error.message === 'Test error')
    })).to.be.true
  })

  test('`Result#isFailureAnd()`: If this is a `Success` `Result`, returns `false`', async () => {
    const value = success(42)
    expect(value.isFailureAnd((error) => {
      return (error.message === 'Test error')
    })).to.be.false
  })

  test('`Result#isSuccess()`: If this is a `Failure` `Result`, returns `false`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    expect(value.isSuccess()).to.be.false
  })

  test('`Result#isSuccess()`: If this is a `Success` `Result`, returns `true`', async () => {
    const value = success(42)
    expect(value.isSuccess()).to.be.true
  })

  test('`Result#isSuccessAnd()`: If this is a `Failure` `Result`, returns `false`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    expect(value.isSuccessAnd((value) => {
      return (value === 42)
    })).to.be.false
  })

  test('`Result#isSuccessAnd()`: If this is a `Success` `Result`, returns the result of applying `predicate` to the contained value', async () => {
    const value = success(42)
    expect(value.isSuccessAnd((value) => {
      return (value === 42)
    })).to.be.true
  })

  test('`Result#map()`: If this is a `Failure` `Result`, returns this `Result`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    const spy0 = spy()
    expect(value.map(spy0)).to.equal(value)
    expect(spy0.called).to.be.false
  })

  test('`Result#map()`: If this is a `Success` `Result`, returns a `Success` `Result` containing the result of applying `f` to the contained value', async () => {
    const value0 = success(42)
    const value1 = value0.map((value) => {
      return (value * 2)
    })
    expect(value1.isSuccess()).to.be.true
    expect(value1.unwrap()).to.equal(84)
  })

  test('`Result#mapFailure()`: If this is a `Failure` `Result`, returns a `Failure` `Result` containing the result of applying `f` to the contained error', async () => {
    const error0 = new Error('Test error')
    const value0 = failure(error0)
    const value1 = value0.mapFailure((error) => {
      return new Error(`${error.message} (mapped)`)
    })
    expect(value1.isFailure()).to.be.true
    const error1 = value1.unwrapFailure()
    expect(error1).to.be.an.instanceOf(Error)
    expect(error1.message).to.equal('Test error (mapped)')
  })

  test('`Result#mapFailure()`: If this is a `Success` `Result`, returns this `Result`', async () => {
    const value = success(42)
    const spy0 = spy()
    expect(value.mapFailure(spy0)).to.equal(value)
    expect(spy0.called).to.be.false
  })

  test('`Result#or()`: If this is a `Failure` `Result`, returns `other`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    const other = success('foo')
    expect(value.or(other)).to.equal(other)
  })

  test('`Result#or()`: If this is a `Success` `Result`, returns this `Result`', async () => {
    const value = success('foo')
    const other = success('bar')
    expect(value.or(other)).to.equal(value)
  })

  test('`Result#unwrap()`: If this is a `Failure` `Result`, throws an `ImproperUnwrapError`', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    expect(function () {
      value.unwrap()
    }).to.throw(ImproperUnwrapError)
  })

  test('`Result#unwrap()`: If this is a `Success` `Result`, returns the contained value', async () => {
    const value = success(42)
    expect(value.unwrap()).to.equal(42)
  })

  test('`Result#unwrapFailure()`: If this is a `Failure` `Result`, returns the contained error', async () => {
    const error = new Error('Test error')
    const value = failure(error)
    expect(value.unwrapFailure()).to.equal(error)
  })

  test('`Result#unwrapFailure()`: If this is a `Success` `Result`, throws an `ImproperUnwrapError`', async () => {
    const value = success(42)
    expect(function () {
      value.unwrapFailure()
    }).to.throw(ImproperUnwrapError)
  })
})
