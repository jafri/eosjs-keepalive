import KeepAlive from '../src/eosjs-keepalive'

/**
 * Initialize test
 */
describe('Initialize test', () => {
  const kp = new KeepAlive(
    [
      'https://eos.greymass.com',
      'https://api.eossweden.org',
      'https://api.eostribe.io',
      'https://api.eosrio.io'
    ],
    {
      chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
    }
  )
  const eos = kp.createEosjs1Object()

  it('Creates EOSJS1 Object', () => {
    expect(eos).toBeTruthy()
  })

  it('Fetches table (EOSJS1)', async () => {
    const { rows } = await eos.getTableRows({
      json: true,
      code: 'eosio',
      scope: 'eosio',
      table: 'rammarket',
      table_key: '',
      limit: 10
    })
    expect(rows).toBeTruthy()
  })
})
