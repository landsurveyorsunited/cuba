const concat = require('concat-stream')
const test = require('tape')
const cuba = require('..')

const id = '1InLekepCq4XgInfMueA2E2bqDqICVHHTXd_QZab0AOU'

test('throws if no `id` specified', async function (t) {
  t.plan(1)
  try {
    cuba()
  } catch (error) {
    t.true(/^Error: Need a spreadsheet ID/.test(error.toString()))
  }
})

test('returns the entire contents of the first sheet', async function (t) {
  t.plan(1)
  const query = cuba(id)
  const stream = await query()
  const expected = [
    { id: 1, name: 'foo' },
    { id: 2, name: 'bar' },
    { id: 3, name: 'baz' }
  ]
  stream.pipe(
    concat(function (actual) {
      t.deepEqual(actual, expected)
    })
  )
})

test('runs a query, defaulting to the first sheet', async function (t) {
  t.plan(1)
  const query = cuba(id)
  const stream = await query('select * where A > 1')
  const expected = [{ id: 2, name: 'bar' }, { id: 3, name: 'baz' }]
  stream.pipe(
    concat(function (actual) {
      t.deepEqual(actual, expected)
    })
  )
})

test('throws if the query is invalid', async function (t) {
  t.plan(1)
  const query = cuba(id)
  const stream = await query('qux')
  stream.on('error', function (error) {
    t.true(/^Error: Invalid query/.test(error.toString()))
  })
})

test('runs the query on the sheet with the specified sheet name', async function (t) {
  t.plan(1)
  const query = cuba(id)
  const stream = await query('select *', { sheetName: 'Sheet2' })
  const expected = [{ A: 1, B: 42 }, { A: 2, B: 3142 }]
  stream.pipe(
    concat(function (actual) {
      t.deepEqual(actual, expected)
    })
  )
})

test('runs the query on the sheet with the specified sheet ID', async function (t) {
  t.plan(1)
  const query = cuba(id)
  const stream = await query('select *', { sheetId: '224335590' })
  const expected = [{ id: 1, sum: 31 }, { id: 2, sum: 4215 }, { id: 3, sum: 1 }]
  stream.pipe(
    concat(function (actual) {
      t.deepEqual(actual, expected)
    })
  )
})
