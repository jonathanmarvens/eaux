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
import ImproperUnwrapError from './error/improper-unwrap'
import { isMaybe } from './maybe'
import { nothing } from './maybe'
import { something } from './maybe'
import { spy } from 'sinon'
import { suite } from 'mocha'
import { test } from 'mocha'

test('`isMaybe()`: Checks if the provided `value` is a `Maybe`', async () => {
  const value0 = null
  expect(isMaybe(value0)).to.be.false
  const value1 = 42
  expect(isMaybe(value1)).to.be.false
  const value2 = nothing()
  expect(isMaybe(value2)).to.be.true
  const value3 = something(42)
  expect(isMaybe(value3)).to.be.true
})

test('`nothing()`: Creates and returns a new `Nothing` `Maybe`', async () => {
  const value = nothing()
  expect(value.isNothing()).to.be.true
  expect(value.isSomething()).to.be.false
})

test('`something()`: Creates and returns a new `Something` `Maybe` containing the provided `value`', async () => {
  const value = something(42)
  expect(value.isNothing()).to.be.false
  expect(value.isSomething()).to.be.true
})

suite('`Maybe`', () => {
  test('`Maybe#and()`: If this is a `Nothing` `Maybe`, returns this `Maybe`', async () => {
    const value = nothing()
    const other = something(42)
    expect(value.and(other)).to.equal(value)
  })

  test('`Maybe#and()`: If this is a `Something` `Maybe`, returns `other`', async () => {
    const value = something('foo')
    const other = something('bar')
    expect(value.and(other)).to.equal(other)
  })

  test('`Maybe#andThen()`: If this is a `Nothing` `Maybe`, returns this `Maybe`', async () => {
    const value = nothing()
    expect(value.andThen((value) => {
      return something(value)
    })).to.equal(value)
  })

  test('`Maybe#andThen()`: If this is a `Something` `Maybe`, returns the result of applying `f` to the contained value', async () => {
    const value0 = something(42)
    const value1 = value0.andThen((value) => {
      return something(value * 2)
    })
    expect(value1.isSomething()).to.be.true
    expect(value1.unwrap()).to.equal(84)
  })

  test('`Maybe#expect()`: If this is a `Nothing` `Maybe`, throws an `ExpectationError` with the provided `message`', async () => {
    const value = nothing()
    expect(function () {
      value.expect('Test expectation message')
    }).to.throw(ExpectationError).with.property('message', 'Test expectation message')
  })

  test('`Maybe#expect()`: If this is a `Something` `Maybe`, returns the contained value', async () => {
    const value = something(42)
    expect(value.expect('Test expectation message')).to.equal(42)
  })

  test('`Maybe#filter()`: If this is a `Nothing` `Maybe`, returns this `Maybe`', async () => {
    const value = nothing()
    expect(value.filter((value) => {
      return (value === 42)
    })).to.equal(value)
  })

  test('`Maybe#filter()`: If this is a `Something` `Maybe`, returns this `Maybe` if the contained value satisfies the provided `predicate`', async () => {
    const value0 = something(42)
    expect(value0.filter((value) => {
      return (value === 42)
    })).to.equal(value0)
    const value1 = something(42)
    const value2 = value1.filter((value) => {
      return (value === 1)
    })
    expect(value2.isNothing()).to.be.true
  })

  test('`Maybe#getSuccessOr()`: If this is a `Nothing` `Maybe`, returns a `Failure` `Result` containing the provided `error`', async () => {
    const value0 = nothing()
    const error = new Error('Test error')
    const value1 = value0.getSuccessOr(error)
    expect(value1.isFailure()).to.be.true
    expect(value1.unwrapFailure()).to.equal(error)
  })

  test('`Maybe#getSuccessOr()`: If this is a `Something` `Maybe`, returns a `Success` `Result` containing the contained value', async () => {
    const value0 = something(42)
    const error = new Error('Test error')
    const value1 = value0.getSuccessOr(error)
    expect(value1.isSuccess()).to.be.true
    expect(value1.unwrap()).to.equal(42)
  })

  test('`Maybe#inspect()`: If this is a `Nothing` `Maybe`, returns this `Maybe`', async () => {
    const value = nothing()
    const spy0 = spy()
    expect(value.inspect(spy0)).to.equal(value)
    expect(spy0.called).to.be.false
  })

  test('`Maybe#inspect()`: If this is a `Something` `Maybe`, applies `f` to the contained value and returns this `Maybe`', async () => {
    const value = something(42)
    const spy0 = spy()
    expect(value.inspect(spy0)).to.equal(value)
    expect(spy0.calledOnceWithExactly(42)).to.be.true
  })

  test('`Maybe#isNothing()`: If this is a `Nothing` `Maybe`, returns `true`', async () => {
    const value = nothing()
    expect(value.isNothing()).to.be.true
  })

  test('`Maybe#isNothing()`: If this is a `Something` `Maybe`, returns `false`', async () => {
    const value = something(42)
    expect(value.isNothing()).to.be.false
  })

  test('`Maybe#isNothingOr()`: If this is a `Nothing` `Maybe`, returns `true`', async () => {
    const value = nothing()
    expect(value.isNothingOr((value) => {
      return (value === 42)
    })).to.be.true
  })

  test('`Maybe#isNothingOr()`: If this is a `Something` `Maybe`, returns the result of applying `predicate` to the contained value', async () => {
    const value = something(42)
    expect(value.isNothingOr((value) => {
      return (value === 42)
    })).to.be.true
  })

  test('`Maybe#isSomething()`: If this is a `Nothing` `Maybe`, returns `false`', async () => {
    const value = nothing()
    expect(value.isSomething()).to.be.false
  })

  test('`Maybe#isSomething()`: If this is a `Something` `Maybe`, returns `true`', async () => {
    const value = something(42)
    expect(value.isSomething()).to.be.true
  })

  test('`Maybe#isSomethingAnd()`: If this is a `Nothing` `Maybe`, returns `false`', async () => {
    const value = nothing()
    expect(value.isSomethingAnd((value) => {
      return (value === 42)
    })).to.be.false
  })

  test('`Maybe#isSomethingAnd()`: If this is a `Something` `Maybe`, returns the result of applying `predicate` to the contained value', async () => {
    const value = something(42)
    expect(value.isSomethingAnd((value) => {
      return (value === 42)
    })).to.be.true
  })

  test('`Maybe#map()`: If this is a `Nothing` `Maybe`, returns this `Maybe`', async () => {
    const value = nothing()
    const spy0 = spy()
    expect(value.map(spy0)).to.equal(value)
    expect(spy0.called).to.be.false
  })

  test('`Maybe#map()`: If this is a `Something` `Maybe`, returns a `Something` `Maybe` containing the result of applying `f` to the contained value', async () => {
    const value0 = something(42)
    const value1 = value0.map((value) => {
      return (value * 2)
    })
    expect(value1.isSomething()).to.be.true
    expect(value1.unwrap()).to.equal(84)
  })

  test('`Maybe#or()`: If this is a `Nothing` `Maybe`, returns `other`', async () => {
    const value = nothing()
    const other = something('foo')
    expect(value.or(other)).to.equal(other)
  })

  test('`Maybe#or()`: If this is a `Something` `Maybe`, returns this `Maybe`', async () => {
    const value = something('foo')
    const other = something('bar')
    expect(value.or(other)).to.equal(value)
  })

  test('`Maybe#unwrap()`: If this is a `Nothing` `Maybe`, throws an `ImproperUnwrapError`', async () => {
    const value = nothing()
    expect(function () {
      value.unwrap()
    }).to.throw(ImproperUnwrapError)
  })

  test('`Maybe#unwrap()`: If this is a `Something` `Maybe`, returns the contained value', async () => {
    const value = something(42)
    expect(value.unwrap()).to.equal(42)
  })
})
