const EOS = require('@jafri/eosjs')

export default class KeepAlive {
  endpointIndex: number = -1

  constructor(private endpoints: string[] = [], private config: any) {
    this.nextEndpoint()
  }

  nextEndpoint() {
    if (this.endpoints.length > 0) {
      this.endpointIndex++
      this.config.httpEndpoint = this.endpoints[this.endpointIndex]
      this.endpointIndex %= this.endpoints.length
    }
  }

  createEosjs1Object() {
    const eosObject = EOS(this.config)
    for (const key in eosObject) {
      if (
        typeof eosObject[key] === 'function' &&
        key !== 'fc' &&
        key !== 'modules' &&
        key !== 'config'
      ) {
        const fn_key = key
        const fn = eosObject[fn_key]
        eosObject[fn_key] = function() {
          const args = arguments
          const _endpointIndex = this.endpointIndex

          let res = null

          try {
            res = fn.apply(null, args).catch((err: any) => {
              if (err) {
                if (
                  err.status === 502 ||
                  err.status === 429 ||
                  (err.name === 'TypeError' && err.message === 'Failed to fetch') ||
                  err.code === 'ENOTFOUND' ||
                  err.code === 'ECONNREFUSED' ||
                  err.code === 'ECONNREFUSED'
                ) {
                  if (this.endpoints.length > 1 && _endpointIndex === _endpointIndex) {
                    this.nextEndpoint(_endpointIndex)
                  }
                  const newEosObject = this.createEosjs1Object()
                  for (const key2 in eosObject) {
                    if (
                      typeof eosObject[key2] === 'function' &&
                      key2 !== 'fc' &&
                      key2 !== 'modules' &&
                      key2 !== 'config'
                    ) {
                      eosObject[key2] = newEosObject[key2]
                    }
                  }

                  return newEosObject[fn_key].apply(null, args)
                }
              }

              throw Error(err)
            })
          } catch (e) {}

          return res
        }
      }
    }

    eosObject.nextEndpoint = () => {
      this.nextEndpoint()

      const newEosObject: any = this.createEosjs1Object()
      for (const key2 in eosObject) {
        if (
          typeof eosObject[key2] === 'function' &&
          key2 !== 'fc' &&
          key2 !== 'modules' &&
          key2 !== 'config'
        ) {
          eosObject[key2] = newEosObject[key2]
        }
      }
    }

    return eosObject
  }
}
