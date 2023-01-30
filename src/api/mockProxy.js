import service from './api.js'

export function getslink(url = '', data = {}) {
    return new Promise((resolve, reject) => {
        console.log(data)
        service.request({
            url,
            method: 'GET',
            data
        }).then((ok) => {
            console.log(ok)
            resolve(ok)
        }).catch((err) => {
            reject(err)
        })
    })
}